/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-09 14:21:35
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-09 21:43:07
*/

import VideoNode from "./SourceNodes/videonode.js"
import AudioNode from "./SourceNodes/audionode.js"
import ImageNode from "./SourceNodes/imagenode.js"
import CanvasNode from "./SourceNodes/canvasnode.js"
import { SOURNODESTATE } from "./SourceNodes/sourcenode.js"
import CompositingNode from "./ProcessingNodes/compositingnode.js"
import DestinationNode from "./DestinationNode/destinationnode.js"
import EffectNode from "./ProcessingNodes/effectnode.js"
import TransitionNode from "./ProcessingNodes/transitionnode.js"
import RenderGraph from "./rendergraph.js"
import VideoElementCache from "./videoelementcache.js"

import {
	createSigmaGraphDataFromRenderGraph,
	visualiseVideoContextTimeline,
	visualiseVideoContextGraph,
	createControlFormForNode,
	UpdateablesManager,
	exportToJSON,
	importSimpleEDL,
	snapshot,
	generateRandomId
} from './utils.js'
import DEFINITIONS from "./Definitions/definations.js";

let updateablesManager = new UpdateablesManager();

export default class VideoContext {
	/**
	 * Initialise the VideoContext and render to the specific canvas.
	 * A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
	 * @param {Canvas} canvas - the canvas element to render the output to.
   * @param {function} initErrorCallback - a callback for if initialising the canvas failed.
   * @param {Object} options - a number of custom options which can be set on the VideoContext, generally best left as default.
   *
   * @example
   * var ctx = new VideoContext(canvasElement, function() { console.error("Sorry, your browser doesn\'t support WebGL");});
	 * 
	 */
	constructor(
		canvas,
		initErrorCallback,
		options = {
			preserveDrawingBuffer: true,
			manualUpdate: false,
			endOnLastSourceEnd: true,
			useVideoElementCache: true,
			videoElementCacheSize: 6,
			webglContextAttributes: {
				preserveDrawingBuffer: true,
				alpha: false
			}
		}
	){
		this.canvas = canvas;
		let manualUpdate = false;
		this.endOnLastSourceEnd = true;
		let webglContextAttributes = {
			preserveDrawingBuffer: true,
			alpha: false
		};

		if("manualUpdate" in options) manualUpdate = options.manualUpdate;
		if("endOnLastSourceEnd" in options) this._endOnLastSourceEnd = options.endOnLastSourceEnd;
		if("webglContextAttributes" in options)
			webglContextAttributes = options.webglContextAttributes;

		if(webglContextAttributes.alpha === undefined) 
			webglContextAttributes.alpha = false;
		if(webglContextAttributes.alpha === true) {
			console.error("webglContextAttributes.alpha must be false for correct operation");
		}

		this._gl = canvas.getContext("experimental-webgl", webglContextAttributes);
		if(this._gl === null) {
			console.error("Failed to initialise WebGL");
			if(initErrorCallback) initErrorCallback();
			return;
		}

		//Initialise the video element cache
		if(options.useVideoElementCache === undefined)
			options.useVideoElementCache = true;
		this._useVideoElementCache = options.useVideoElementCache;
		if(this._useVideoElementCache) {
			if(!options.videoElementCacheSize) options.videoElementCacheSize = 5;
			this._videoElementCache = new VideoElementCache(options.videoElementCacheSize);
		}

		//Create a unique ID for this VideoContext which can be used in the debugger.
		if(this._canvas.id) {
			if(typeof this._canvas.id === "string" || this._canvas.id instanceof String) {
				this._id = canvas.id;
			}
		}
		if(this._id === undefined) this._id = generateRandomId();
		if(window.__VIDEOCONTEXT_REFS__ === undefined) window.__VIDEOCONTEXT_REFS__ = {};
		window.__VIDEOCONTEXT_REFS__[this.id] = this;

		this._renderGraph = new RenderGraph();
		this._sourceNodes = [];
		this._processingNodes = [];
		this._timeline = [];
		this._currentTime = 0;
		this._state = VideoContext.STATE.PAUSED;
		this._playbackRate = 1.0;
		this._volume = 1.0;
		this._sourcesPlaying = undefined;
		this._destinationNode = new DestinationNode(this._gl, this._renderGraph);

		this._callbacks = new Map();
		this._callbacks.set("stalled", []);
		this._callbacks.set("update", []);
		this._callbacks.set("ended", []);
		this._callbacks.set("content", []);
		this._callbacks.set("nocontent", []);

		this._timelineCallbacks = [];

		if(!manualUpdate) {
			updateablesManager.register(this);
		}

	}

	get id() {
		return this._id;
	}

	set id(newID) {
		delete window.__VIDEOCONTEXT_REFS__[this._id];
		if(window.__VIDEOCONTEXT_REFS__[newID] !== undefined) 
			console.warn("Warning; setting id to that of an existing VideoContext instance.")
		window.__VIDEOCONTEXT_REFS__[newID] = this;
		this._id = newID;
	}

	/**
	 * Register a callback to happen at a specific point in time.
	 * @param {number} time - the time at which to trigger the callback.
	 * @param {Function} func - the callback to register.
	 * @param {number} ordering - the order in which to call the callback if more than one is registered for the same time.
	 */
	registerTimelineCallback(time, func, ordering = 0) {
		this._timelineCallbacks.push({
			time: time,
			func: func,
			ordering: ordering
		})
	}

	unregisterTimelineCallback(func) {
		let toRemove = [];
		for(let callback of this._timelineCallbacks) {
			if(callback.func === func) {
				toRemove.push(callback);
			}
		}
		for(let callback of toRemove) {
			let index = this._timelineCallbacks.indexOf(callback);
			this._timelineCallbacks.splice(index, 1);
		}
	}
	registerCallback(type, func) {
		if(!this._callbacks.has(type)) return false;
		this._callbacks.get(type).push(func);
	}

	/**
	 * @example
	 * var updateCallback = function(){ console.log("new frame"); }
	 * ctx.registerCallback("update", updateCallback);
	 * ctx.unregisterCallback(updateCallback);
	 */
	unregisterCallback(func) {
		for(let funcArray of this._callbacks.values()) {
			let index = funcArray.indexOf(func);
			if(index !== -1) {
				funcArray.splice(index, 1);
				return true;
			}
		}
		return false;
	}

	_callCallbacks(type) {
		let funcArray = this._callbacks.get(type);
		for(let func of funcArray) {
			func(this._currentTime);
		}
	}
	get element() {
		return this._canvas;
	}
	get state() {
		return this._state;
	}
	set currentTime(currentTime) {
		if(currentTime < this.duration && this._state === VideoContext.STATE.ENDED) 
			this._state = VideoContext.STATE.PAUSED;

		if(typeof currentTime === "string" || currentTime instanceof String) {
			currentTime = parseFloat(currentTime);
		}

		for(let i = 0; i < this._sourceNodes.length; i++) {
			this._sourceNodes[i]._seek(currentTime);
		}

		for(let i = 0; i < this._processingNodes.length; i++) {
			this._processingNodes[i]._seek(currentTime);
		}

		this._currentTime = currentTime;
	}
	/**
	 * Get how far through the internal timeline has been played
	 */
	get currentTime() {
		return this._currentTime;
	}
	get duration(){
		let maxTime = 0;
		for(let i = 0; i < this._sourceNodes.length; i++) {
			if(
				this._sourceNodes[i].state !== SOURNODESTATE.waiting && 
				this._sourceNodes[i]._stopTime > maxTime
				) {
				maxTime = this._sourceNodes[i]._stopTime;
			}
		}
		return maxTime;
	}

	get destination() {
		return this._destinationNode;
	}
	set playbackRate(rate) {
		if(rate <= 0) {
			throw new RangeError("playbackRate must be greater than 0");
		}
		for(let node of this._sourceNodes) {
			if(node.constructor.name === 'VideoNode') {
				node._globalPlaybackRate = rate;
				node._playbackRateUpdated = true;
			}
		}
		this._playbackRate = rate;
	}

	get playbackRate() {
		return this._playbackRate;
	}

	set volume(vol) {
		for (let node of this._sourceNodes) {
			if(node instanceof VideoNode || node instanceof AudioNode) {
				node.volume = vol;
			}
		}
		this._volume = vol;
	}

	get volume() {
		return this._volume;
	}

	play() {
		console.debug("VideoContext - playing");
		if(this._videoElementCache) this._videoElementCache.init();

		this._state = VideoContext.STATE.PLAYING;
		return true;
	}

	pause() {
		console.debug("VideoContext - pausing");
		this._state = VideoContext.STATE.PAUSED;
		return true;
	}

	/**
	 * Create a new node representing a video source
	 *
	 * @param {string|Video} - The URL or video element to create the video from.
	 * @sourceOffset {number} - Offset into the start of the source video to start playing from.
	 * @preloadTime {number} - How many seconds before the video is to be played to start loading it.
	 * @videoElementAttributes {Object} - A dictionary of attributes to map onto the underlying video element.
	 * @return {VideoNode} a new video node
	 * 
	 */
	video(src, sourceOffset = 0, preloadTime = 4, videoElementAttributes = {}) {
		let videoNode = new VideoNode(
			src,
			this._gl,
			this._renderGraph,
			this._currentTime,
			this._playbackRate,
			sourceOffset,
			preloadTime,
			this._videoElementCache,
			videoElementAttributes
		);
		this._sourceNodes.push(videonode);
		return videoNode;
	}
	audio(src, sourceOffset = 0, preloadTime = 4, audioElementAttributes = {}) {
		let audioNode = new AudioNode(
			src,
			this._gl,
			this._renderGraph,
			this._currentTime,
			this._playbackRate,
			sourceOffset,
			preloadTime,
			this._audioElementCache,
			audioElementAttributes
		);
		this._sourceNodes.push(audioNode);
		return audioNode;	
	}
	image(src, preloadTime = 4, imageElementAttributes = {}) {
		let imageNode = new ImageNode(
			src,
			this._gl,
			this._renderGraph,
			this._currentTime,
			preloadTime,
			imageElementAttributes
		);
		this._sourceNodes.push(imageNode);
		return imageNode;
	}
	canvas(canvas) {
		let canvasNode = new CanvasNode(canvas, this._gl, this._renderGraph, this._currentTime);
		this._sourceNodes.push(canvasNode);
		return canvasNode;
	}

	effect(defination) {
		let effectNode = new EffectNode(this._gl, this._renderGraph, defination);
		this._processingNodes.push(effectNode);
		return effectNode;
	}
	compositor(defination) {
		let compositingNode = new CompositingNode(this._gl, this._renderGraph, defination);
		this._processingNodes.push(compositingNode);
		return compositingNode;
	}
	transition(defination) {
		let transitionNode = new TransitionNode(this._gl, this._renderGraph, defination);
		this._processingNodes.push(transitionNode);
		return transitionNode;
	}
	_isStalled() {
		for(let i = 0; i < this._sourceNodes.length; i++) {
			let sourceNode = this._sourceNodes[i];
			if(!sourceNode._isReady()) {
				return true;
			}
		}
		return false;
	}
	/**
	 * This allows manual calling of the update loop of the videoContext.
	 * @param  {Number} dt - The difference in seconds between this and the previous calling of update.
	 * var canvasElement = document.getElementById("canvas");
	 * var ctx = new VideoContext(canvasElement, undefined, {"manualUpdate": true});
	 *
	 * var previousTime;
	 * function update(time) {
	 * 	if(previousTime === undefined) previousTime = time;
	 * 	var dt = (time - previousTime)/1000;
	 * 	ctx.update(dt);
	 * 	previousTime = time;
	 * 	requestAnimationFrame(update);
	 * }
	 * update();
	 * 
	 */
	update(dt) {
		this._update(dt);
	}
	_update(dt) {
		//Remove any destroyed nodes
		this._sourceNodes = this._sourceNodes.filter(sourceNode => {
			if(!sourceNode.destroyed) return sourceNode;
		});

		this._processingNodes = this._processingNodes.filter(processingNode => {
			if(!processingNode.destroyed) return processingNode;
		});

		if(
			this._state === VideoContext.STATE.PLAYING ||
			this._state === VideoContext.STATE.STALLED ||
			this._state === VideoContext.STATE.PAUSED
		) {
			this._callCallbacks("update");

			if(this._state !== VideoContext.STATE.PAUSED) {
				if(this._isStalled()) {
					this._callCallbacks("stalled");
					this._state = VideoContext.STATE.STALLED;
				} else {
					this._state = VideoContext.STATE.PLAYING;
				}
			}

			if(this._state === VideoContext.STATE.PLAYING) {
				//Handle timeline callbacks.
				let activeCallbacks = new Map();
				for(let callback of this._timelineCallbacks) {
					if(
						callback.time >= this.currentTime &&
						callback.time < this._currentTime + dt * this._playbackRate
					) {
						//group the callbacks by time
						if(!activeCallbacks.has(callback.time)) {
							activeCallbacks.set(callback.time, []);
						}
						activeCallbacks.get(callback.time).push(callback);
					}
				}

				//Sort the groups of callbacks by the times of the groups
				let timeIntervals = Array.from(activeCallbacks.keys());
				timeIntervals.sort(function(a, b) {
					return a - b;
				});

				for(let t of timeIntervals) {
					let callbacks = activeCallbacks.get(t);
					callbacks.sort(function(a, b) {
						return a.ordering - b.ordering;
					});
					for(let callback of callbacks ) {
						callback.func();
					}
				}

				this._currentTime += dt * this._playbackRate;
				if(this._currentTime > this.duration && this._endOnLastSourceEnd) {
					for(let i = 0; i < this._sourceNodes.length; i++) {
						this._sourceNodes[i]._update(this._currentTime);
					}
					this._state = VideoContext.STATE.ENDED;
					this._callCallbacks("ended");
				}

			}

			let sourcesPlaying = false;

			for(let i = 0; i < this._sourceNodes.length; i++){
				let sourceNode = this._sourceNodes[i];

				if(this._state === VideoContext.STATE.STALLED) {
					if(sourceNode._isReady() && sourceNode._state === SOURCENODESTATE.playing)
						sourceNode._pause();
				}

				if(this._state === VideoContext.STATE.PAUSED) {
					sourceNode._pause();
				}

				if(this._state === VideoContext.STATE.PLAYING) {
					sourceNode._play();
				}
				sourceNode._update(this._currentTime);
				if(
					sourceNode._state === SOURCENODESTATE.paused ||
					sourceNode._state === SOURCENODESTATE.playing
				) {
					sourcesPlaying = true;
				}	
			}

			if(
				sourcesPlaying !== this._sourcesPlaying &&
				this._state === VideoContext.STATE.PLAYING
			) {
				if(sourcesPlaying === true) {
					this._callCallbacks("content");
				} else {
					this._callCallbacks("nocontent");
				}
				this._sourcesPlaying = sourcesPlaying;

			}


			let sortedNodes = [];
			let connections = this._renderGraph.connections.slice();
			let nodes = RenderGraph.getInputlessNodes(connections);

			while(nodes.length > 0) {
				let node = nodes.pop();
				sortedNodes.push(node);
				for(let edge of RenderGraph.outputEdgesFor(node, connections)) {
					let index = connections.indexOf(edge);
					if(index > -1) connections.splice(index, 1);
					if(RenderGraph.inputEdgesFor(edge.destination, connections).length === 0) {
						nodes.push(edge.destination);
					}
				}
			}

			for(let node of sortedNodes) {
				if(this._sourceNodes.indexOf(node) === -1) {
					node._update(this._currentTime);
					node._render();
				}
			}

		}
		
	}

	reset() {
		for(let callbacks of this._callbacks) {
			this.unregisterCallback(callback);
		}
		for(let node of this._sourceNodes) {
			node.destroy();
		}
		for(let node of this._processingNodes){
			node.destroy();
		}
		this._update(0);
		this._sourceNodes = [];
		this._processingNodes = [];
		this._timeline = [];
		this._currentTime = 0;
		this._state = VideoContext.STATE.PAUSED;
		this._playbackRate = 1.0;
		this._sourcesPlaying = undefined;
		this._callbacks.set("stalled", []);
		this._callbacks.set("update", []);
		this._callbacks.set("ended", []);
		this._callbacks.set("content", []);
		this._callbacks.set("nocontent", []);
		this._timelineCallbacks = [];
	}

	_depricate(msg) {
		console.log(msg);
	} 

	static get DEFINITIONS() {
		return DEFINITIONS;
	}

	snapshot() {
		return snapshot(this);
	}
}

VideoContext.STATE = {};
VideoContext.STATE.PLAYING = 0;
VideoContext.STATE.PAUSED = 1;
VideoContext.STATE.STALLED = 2;
VideoContext.STATE.ENDED = 3;
VideoContext.STATE.BROKEN = 4;

VideoContext.visualiseVideoContextTimeline = visualiseVideoContextTimeline;
VideoContext.visualiseVideoContextGraph = visualiseVideoContextGraph;
VideoContext.createControlFormForNode = createControlFormForNode;
VideoContext.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
VideoContext.exportToJSON = exportToJSON;
VideoContext.updateablesManager = updateablesManager;
VideoContext.importSimpleEDL = importSimpleEDL;



