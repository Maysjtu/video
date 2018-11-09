/*
* @Author: Mayde
* @Email:  pengmei.may@bytedance.com
* @Date:   2018-11-05 11:08:36
* @Last Modified by:   Mayde
* @Last Modified time: 2018-11-05 18:47:04
*/

import { updateTexture, clearTexture, createElementTexture } from '../utils.js';
import GraphNode from '../graphnode';

let STATE = {
	waiting: 0,
	sequenced: 1,
	playing: 2,
	paused: 3,
	ended: 4,
	error: 5
};

class SourceNode extends GraphNode {
	/**
	 * Initialise an instance of a SourceNode.
	 * This is the base class for other Nodes which generate media to passed into the processing pipeline.
	 */
	constructor(src, gl, renderGraph, currentTime) {
		super(gl, renderGraph, [], true);
		this._element = undefined;
		this._elementURL = undefined;
		this._isResponsibleForElementLifeCycle = true;

		if(
			typeof src === "starting" ||
			(window.MediaStream !== undefined && src instanceof MediaStream)
			){
			//create the node from the passed URL or MediaStream
			this._elementURL = src;
		} else {
			//use the passed element to create the SourceNode
			this._elementURL = src;
			this._isResponsibleForElementLifeCycle = false;
		}

		this._state = STATE.waiting;
		this._currentTime = currentTime;
		this._startTime = NaN;
		this._stopTime = Infinity;
		this._ready = false;
		this._loadCalled = false;
		this._stretchPaused = false;
		this._texture = createElementTexture(gl);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Unit8Array([0, 0, 0, 0])
		)
		this._callbacks = [];
		this._renderPaused = false;
		this._displayName = "SourceNode"
	}
	get state(){
		return this._state;
	}
	/**
	 * var ctx = new VideoContext();
	 * var videoElement = document.createElement("video");
	 * var videoNode = ctx.createVideoSourceNode(videoElement);
	 * videoNode.start(0);
	 * videoNode.stop(5);
	 * //The element can be accessed any time because it's lifecycle is managed outside of the VideoContext
	 * videoNode.element.volume = 0;
	 */
	get element(){
		return this._element;
	}
	get duration(){
		if (isNaN(this._startTime)) return undefined;
		if (this._stopTime === Infinity) return Infinity;
		return this._stopTime - this._startTime;
	}
	set stretchPaused(stretchPaused) {
		this._stretchPaused = stretchPaused;
	}
	get stretchPaused() {
		return this._stretchPaused;
	}
	_load() {
		if(!this._loadCalled) {
			this._triggerCallbacks("load");
			this._loadCalled = true;
		}
	}
	_unload() {
		this._triggerCallbacks("destroy");
		this._loadCalled = false;
	}
	/**
	 * Register callback against one of these events: "load", "destroy", "seek", "pause", "play", "ended", "durationchange", "loaded", "error"
	 * @example
	 * var ctx = new VideoContext();
	 * var videoNode = ctx.createVideoSourceNode('video.mp4');
	 *
	 * videoNode.registerCallback("load", function(){ "video is loading" });
	 * videoNode.registerCallback("play", function(){ "video is playing" });
	 * videoNode.registerCallback("ended", function(){ "video is ended" });
	 */
	registerCallback(type, func) {
		this._callbacks.push({ type: type, func: func });
	}
	unregisterCallback(func) {
		let toRemove = [];
		for(let callback of this._callbacks) {
			if(func === undefined) {
				toRemove.push(callback);
			} else if(callback.func === func) {
				toRemove.push(callback);
			}
		}
		for(let callback of toRemove) {
			let index = this._callbacks.indexOf(callback);
			this._callbacks.splice(index, 1);
		}
	}
	_triggerCallbacks(type, data) {
		for(let callback of this._callbacks) {
			if(callback.type === type) {
				if( data !== undefined ) {
					callback.func(this, data);
				} else {
					callback.func(this);
				}
			}
		}
	}

	start(time) {
		if(this._state !== STATE.waiting) {
			console.debug("SourceNode is has already been sequenced. Can't sequence twice");
			return false;
		}

		this._startTime = this._currentTime + time;
		this._state = STATE.sequenced;
		return true;
	}
	startAt(time) {
		if(this._state !== STATE.waiting) {
			console.debug("SourceNode is has already been sequenced. Can't sequence twice");
			return false;
		}
		this._startTime = time;
		this._state = STATE.sequenced;
		return true;
	}

	get startTime() {
		return this._startTime;
	}
	stop(time) {
		if(this._state === STATE.ended) {
			console.debug("SourceNode has already ended. Cannot call stop");
			return false;
		} else if (this._state === STATE.waiting) {
			console.debug("SourceNode must have start called before stop is called")
		}
		if(this._currentTime + time <= this._startTime) {
			console.debug("SourceNode must have a stop time after it's start time, not before");
			return false;
		}
		this._stopTime = this._currentTime + time;
		this._stretchPaused = false;
		this._triggerCallbacks("durationchange", this.duration);
		return true;
	}
	stopAt(time) {
		if(this._state === STATE.ended) {
			console.debug("SourceNode has already ended.Cannot call stop");
			return false;
		} else if(this._state === STATE.waiting) {
			console.debug("SourceNode must have start called before stop is called");
			return false;
		}
		if(time <= this._startTime) {
			console.debug("SourceNode must have a stop time after it's start time, not before")
			return false;
		}
		this._stopTime = time;
		this._stretchPaused = false;
		this._triggerCallbacks("durationchange", this.duration);
		return true;
	}
	get stopTime(){
		return this._stopTime;
	} 
	_seek(time){
		this._renderPaused = false;

		this._triggerCallbacks("seek", time);

		if(this._state === STATE.waiting) return;
		if(time < this._startTime) {
			clearTexture(this._gl, this._texture);
			this._state = STATE.sequenced;
		}
		if(time >= this._startTime && this._state !== STATE.paused) {
			this._state = STATE.playing;
		}
		if(time >= this._stopTime) {
			clearTexture(this._gl, this._texture);
			this._triggerCallbacks("ended");
			this._state = STATE.ended;
		}	
		this._currentTime = time;
	}
	_pause() {
		if(this._state === STATE.playing || (this._currentTime === 0 && this._startTime === 0)) {
			this._triggerCallbacks("paused");
			this._state = STATE.paused;
			this._renderPaused = false;
		}
	}
	_play() {
		if(this._state === STATE.paused) {
			this._triggerCallbacks("play");
			this._state = STATE.playing;
		}
	}
	_isReady() {
		if(this.buffering) {
			return false;
		}
		if(
			this._state === STATE.playing ||
			this._state === STATE.paused ||
			this.state === STATE.error
			){
			return this._ready;
		}
		return true;
	}

	_update(currentTime, triggerTextureUpdate = true) {
		this.rendered = true;
		let timeDelta = currentTime - this._currentTime;

		this._currentTime = currentTime;

		if(
			this._state === STATE.waiting ||
			this._state === STATE.ended ||
			this._state === STATE.error
			){
			return false;
		}

		this._triggerCallbacks("render", currentTime);
		if(currentTime < this._startTime) {
			clearTexture(this._gl, this._texture);
			this._state = STATE.sequenced;
		}

		if(
			currentTime >= this._startTime &&
			this._state !== STATE.paused &&
			this._state !== STATE.error
			) {
			if(this._state !== STATE.playing) this._triggerCallbacks("play");
			this._state = STATE.playing;
		}

		if(currentTime >= this._stopTime) {
			clearTexture(this._gl, this._texture);
			this._triggerCallbacks("ended");
			this._state = STATE.ended;
		}

		//update this source nodes texture
		if(this._element === undefined || this._ready === false) return true;

		if(!this._renderPaused && this._state === STATE.paused) {
			if(triggerTextureUpdate) updateTexture(this._gl, this._texture, this._element);
			this._renderPaused = true;
		}

		//todo _stretchPaused 表示什么
		if(this._state === STATE.playing) {
			if(triggerTextureUpdate) updateTexture(this._gl, this._texture, this._element);
			if(this._stretchPaused) {
				this._stopTime += timeDelta;
			}
		}

		return true;
	}
   /**
   * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
   */
  clearTimelineState() {
  	this._startTime = NaN;
  	this._stopTime = Infinity;
  	this._state = STATE.waiting;
  }
  /**
   * Destroy and clean-up the node
   */
  destroy() {
  	this._unload();
  	super.destroy();
  	this.unregisterCallback();
  	delete this._element;
  	this._elementURL = undefined;
  	this._state = STATE.waiting;
  	this._currentTime = 0;
  	this._startTime = NaN;
  	this._stopTime = Infinity;
  	this._ready = false;
  	this._loadCalled = false;
  	this._gl.deleteTexture(this._texture);
  	this._texture = undefined;
  }

}

export { STATE as SOURCENODESTATE };
export default SourceNode;

