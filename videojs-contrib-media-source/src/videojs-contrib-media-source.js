
/**
 * @file videojs-contrib-media-sources.js
 */
import window from 'global/window';
import FlashMediaSource from './flash-media-source';
import HtmlMediaSource from './html-media-source';
import videojs from 'video.js';
let urlCount = 0;

const defaults = {
	mode: 'auto'
};

//store references to the media sources so they can be connected 
//to a video element

videojs.mediaSources = {};

const open = function(msObjectURL, swfId) {
	let mediaSource = videojs.mediaSources[msObjectURL];

	if(mediaSource) {
		mediaSource.trigger({type: 'sourceopen', swfId});
	} else {
		throw new Error('Media Source not found(Video.js)');
	}
};

/**
* check to see if the native MediaSource object exists and supports
   an MP4 container with both H.264 video and AAC-LC audio
*/
const supportsNativeMediaSources = function() {
	return (!!window.MediaSource && !!window.MediaSource.isTypeSupported &&
		window.MediaSource.isTypeSupported('video/mp4;codecs="avc1.4d400d,mp4a.40.2"'))
};
/**
 * An emulation of the MediaSource API so that we can support
 * native and non-native functionality such as flash and
 * video/mp2t videos. returns an instance of HtmlMediaSource or
 * FlashMediaSource depending on what is supported and what options
 * are passed in.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/MediaSource
 * @param {Object} options options to use during setup.
 */

 export const MediaSource = function(options) {
 	let settings = videojs.mergeOptions(defaults, options);

 	this.MediaSource = {
 		open,
 		supportsNativeMediaSources
 	};

 	if(settings.mode === 'html5' || 
 		settings.mode === 'auto' && supportsNativeMediaSources()){
 		return new HtmlMediaSource();
 	} else if(videojs.getTech('Flash')) {
 		return new FlashMediaSource();
 	}

 	throw new Error('Cannot use flash or html5 to create a MediaSource for this video');
 };
MediaSource.open = open ;
MediaSource.supportsNativeMediaSources = supportsNativeMediaSources;

export const URL = {
 /**
   * A wrapper around the native createObjectURL for our objects.
   * This function maps a native or emulated mediaSource to a blob
   * url so that it can be loaded into video.js
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
   * @param {MediaSource} object the object to create a blob url to
   */
   createObjectURL(object) {
   	let objectUrlPrefix = 'blob:vjs-media-source/';
   	let url;

   	if(object instanceof HtmlMediaSource) {
   		url = window.URL.createObjectURL(object.nativeMediaSource_);
   		object.url_ = url;
   		return url;
   	}

   	url = objectUrlPrefix + urlCount;
   	urlCount++;

   	videojs.mediaSources[url] = object;
   	return url;
   }
};

videojs.MediaSource = MediaSource;
videojs.URL = URL;



