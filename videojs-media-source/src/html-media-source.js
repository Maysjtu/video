/*
* @Author: Mayde
* @Email:  pengmei@yunxi.tv
* @Date:   2018-04-27 07:47:47
* @Last Modified by:   Mayde
* @Last Modified time: 2018-04-27 08:40:14
*/

import window from 'global/window'
import document from 'global/document'
import videojs from 'video.js'
import VirtualSourceBuffer from './virtual-source-buffer'
import { durationOfVideo } from './add-text-track-data'
import {
	isAudioCodec,
	isVideoCodec,
	parseContentType,
	translateLegacyCodecs
} from './codec-utils';

/**
 * mimics native MediaSource 
 */
export default class HtmlMediaSource extends videojs.EventTarget {
	constructor() {
		super();
		let property;

		this.nativeMediaSource_ = new window.MediaSource();
		for(property in this.nativeMediaSource_){
			if(!(property in HtmlMediaSource.prototype)&& typeof this.nativeMediaSource_[property] === 'function'){
				this[property] = this.nativeMediaSource_[property].bind(this.nativeMediaSource_);
			}
		}
		this.duration = NaN;
		Object.defineProperty(this, 'duration', {
			get(){
				if(this.duration_ === Infinity){
					return this.duration_;
				}
			},
			set(duration) {
				this.duration_ = duration;
				if(duration !== Infinity) {
					this.nativeMediaSource_.duration = duration;
				}
			}
		});

		Object.defineProperty(this, 'seekable', {
			get(){
				if(this.duration_ === Infinity) {
					return videojs.createTimeRanges([[0, this.nativeMediaSource_.duration]])
				}
				return this.nativeMediaSource_.seekable;
			}
		});

		Object.defineProperty(this, 'readyState', {
			get() {
				return this.nativeMediaSource_.readyState;
			}
		});

		Object.defineProperty(this, 'activeSourceBuffers', {
			get() {
				return this.activeSourceBuffers_;
			}
		});

	
		this.sourceBuffers = [];

		this.activeSourceBuffers_ = [];

		this.updateActiveSourceBuffers_ = () => {
			this.activeSourceBuffers_.length = 0;
			if(this.sourceBuffers.length === 1) {
				let sourceBuffer = this.sourcebuffers[0];
				sourceBuffer.appendAudioInitSegment_ = true;
				sourceBuffer.audioDisabled_ =!sourceBuffer.audioCodec_;
				this.activeSourceBuffers_.push(sourceBuffer);
				return;
			}
			//There are 2 source buffers, a combined virtual source buffer and an audio only source buffer.
			//By default, the audio in the combined virtual source buffer is enabled and the audio-only source buffer is disabled 
			let disableCombined = false;
			let disableAudioOnly = true;

			for(let i = 0; i < this.player_.audioTracks().length; i++) {
				let track = this.player_.audioTracks()[i];
				if(track.enabled && track.kind !== 'main') {
					disableCombined = true;
					disableAudioOnly = false;
					break;
				}

			}
		}

		this.sourceBuffers.forEach((sourceBuffer) => {
			sourceBuffer.appendAudioInitSegment_ = true;
			if(sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
				sourceBuffer.audioDisabled_ = disableCombined;
			} else if(sourceBuffer.videoCodec_ && !sourceBuffer.audioCodec_) {
				//If the 'combined' source buffer is video only, then we do not want disable the audio-only source buffer (this is mostly for demuxed audio and video hls)
				sourceBuffer.audioDisabled_ = true;
				diableAudioOnly = false;
			} else if(!sourceBuffer.videoCodec_ && sourceBuffer.audioCodec_) {
				//audio only 
				sourceBuffer.audioDisabled_ = disableAudioOnly;
				if(disableAudioOnly) {
					return;
				}
			}
			this.activeSourceBuffers_.push(sourceBuffer);
		})


	}
}