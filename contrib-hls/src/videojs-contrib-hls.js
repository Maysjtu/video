/**
 * @file videojs-contrib-hls.js
 *
 * The main file for the HLS project.
 * License: https://github.com/videojs/videojs-contrib-hls/blob/master/LICENSE
 */
import document from 'global/document';
import PlaylistLoader from './playlist-loader';
import Playlist from './playlist';
import xhrFactory from './xhr';

import {Decrypter, AsyncStream, decrypt} from 'aes-decrypter';

import utils from './bin-utils';
import {MediaSource, URL} from 'videojs-contrib-media-sources';
import m3u8 from 'm3u8-parser';
import videojs from 'video.js';
import { MasterPlaylistController } from './master-playlist-controller';
import Config from './config';
import renditionSelectionMixin from './rendition-mixin';
import window from 'global/window';
import PlaybackWatcher from './playback-watcher';
import reloadSourceOnError from './reload-source-on-error';
import {
  lastBandwidthSelector,
  lowestBitrateCompatibleVariantSelector,
  comparePlaylistBandwidth,
  comparePlaylistResolution
} from './playlist-selectors.js';

const Hls = {
	PlaylistLoader,
	PlayList,
	Decrypter,
	AsyncStream,
	decrypt,
	utils,

	STANDARD_PLAYLIST_SELECTOR: lastBandwidthSelector,
	INITIAL_PLAYLIST_SELECTOR: lowestBitrateCompatibleVariantSelector,
	comparePlaylistBandwidth,
	comparePlaylistResolution,

	xhr: xhrFactory()
};

// 0.5 MB/s
const INITIAL_BANDWIDTH = 4194304;

// Define getter/setters for config properties
[
	'GOAL_BUFFER_LENGTH',
	'MAX_GOAL_BUFFER_LENGTH',
	'GOAL_BUFFER_LENGTH_RATE',
	'BUFFER_LOW_WATER_LINE',
	'MAX_BUFFER_LOW_WATER_LINE',
	'BUFFER_LOW_WATER_LINE_RATE',
	'BANDWIDTH_VARIANCE'
].forEach((prop) => {
	Object.defineProperty(Hls, prop, {
		get() {
			videojs.log.warn(`using Hls.${prop} is UNSAFE be sure you know what you are doing`);
			return Config[prop];
		},
		set(value) {
			videojs.log.warn(`using Hls.${prop} is UNSAFE be sure you know what you are doing`);
			if (typeof value !== 'number' || value < 0) {
				videojs.log.warn(`value of Hls.${prop} must be greater than or equal to 0`);
				return;
			}
			Config[prop] = value;
		}
	});
});

/**
 * Updates the selectedIndex of the QualityLevelList when a mediachange happens in hls.
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to update.
 * @param {PlaylistLoader} playlistLoader PlaylistLoader containing the new media info.
 * @function handleHlsMediaChange
 */
const handleHlsMediaChange = function(qualityLevels, playListLoader) {
	let newPlayList = playListLoader.media();
	let selectedIndex = -1;

	for(let i = 0; i < qualityLevels.length; i++) {
		if(qualityLevels[i].id === newPlayList.uri) {
			selectedIndex = i;
			break;
		}
	}
	qualityLevels.selectedIndex_ = selectedIndex;
	qualityLevels.trigger({
		selectedIndex,
		type: 'change'
	});
};

/**
 * Adds quality levels to list once playlist metadata is available
 *
 * @param {QualityLevelList} qualityLevels The QualityLevelList to attach events to.
 * @param {Object} hls Hls object to listen to for media events.
 * @function handleHlsLoadedMetadata
 */
const handleHlsLoadedMetadata = function(qualityLevels, hls) {
	hls.representations().forEach((rep) => {
		qualityLevels.addQualityLevel(rep);
	});
	handleHlsMediaChange(qualityLevels, hls.playlists);
};

// HLS is a source handler, not a tech. Make sure attempts to use it
// as one do not cause exceptions.
Hls.canPlaySource = function() {
	return videojs.log.warn('HLS is no longer a tech. Please remove it from ' +
		'your player\'s techOrder.');
};

/**
 * Whether the browser has built-in HLS support.
 */
Hls.supportsNativeHls = (function(){
	let video = document.createElement('video');

	// native HLS is definitely not supported if HTML5 video isn't
	if (!videojs.getTech('Html5').isSupported()) {
		return false;
	}

	// HLS manifests can go by many mime-types
	let canPlay = [
		'application/vnd.apple.mpegurl',
		'audio/mpegurl',
		'audio/x-mpegurl',
		'application/x-mpegurl',
		'video/x-mpegurl',
		'video/mpegurl',
		'application/mpegurl'
	];

	return canPlay.some(function(canItPlay) {
		return (/maybe|probably/i).test(video.canPlayType(canItPlay));
	});
}());

/**
 * HLS is a source handler, not a tech. Make sure attempts to use it
 * as one do not cause exceptions.
 */
Hls.isSupported = function() {
	return videojs.log.warn('HLS is no longer a tech. Please remove it from ' +
		'your player\'s techOrder.');
};

const Component = videojs.getComponent('Component');

/**
 * The Hls Handler object, where we orchestrate all of the parts
 * of HLS to interact with video.js
 *
 * @class HlsHandler
 * @extends videojs.Component
 * @param {Object} source the source object
 * @param {Tech} tech the parent tech object
 * @param {Object} options optional and required options
 */
class HlsHandler extends Component {
	constructor(source, tech, options) {
		super(tech, options.hls);
		// tech.player() is deprecated but setup a reference to HLS for
		// backwards-compatibility
		if (tech.options_ && tech.options_.playerId) {
			let _player = videojs(tech.options_.playerId);

			if (!_player.hasOwnProperty('hls')) {
				Object.defineProperty(_player, 'hls', {
					get: () => {
						videojs.log.warn('player.hls is deprecated. Use player.tech_.hls instead.');
						tech.trigger({type: 'usage', name: 'hls-player-access'});
						return this;
					}
				});
			}
		}

		this.tech_ = tech;
		this.source_ = source;
		this.stats = {};
		this.ignoreNextSeekingEvent_ = false;

		this.setOptions_();

		// overriding native HLS only works if audio tracks have been emulated
		// error early if we're misconfigured:
		if (this.options_.overrideNative &&
			(tech.featuresNativeVideoTracks || tech.featuresNativeAudioTracks)) {
			throw new Error('Overriding native HLS requires emulated tracks. ' +
				'See https://git.io/vMpjB');
		}

		// listen for fullscreenchange events for this player so that we
		// can adjust our quality selection quickly
		this.on(document, [
			'fullscreenchange', 'webkitfullscreenchange',
			'mozfullscreenchange', 'MSFullscreenChange'
		], (event) => {
			let fullscreenElement = document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement;

			if (fullscreenElement && fullscreenElement.contains(this.tech_.el())) {
				this.masterPlaylistController_.fastQualityChange_();
			}
		});

		this.on(this.tech_, 'seeking', function() {
			if (this.ignoreNextSeekingEvent_) {
				this.ignoreNextSeekingEvent_ = false;
				return;
			}

			this.setCurrentTime(this.tech_.currentTime());
		});
		this.on(this.tech_, 'error', function() {
			if (this.masterPlaylistController_) {
				this.masterPlaylistController_.pauseLoading();
			}
		});
		this.on(this.tech_, 'play', this.play);
	}
	setOptions_() {
		// defaults
		this.options_.withCredentials = this.options_.withCredentials || false;

		if (typeof this.options_.blacklistDuration !== 'number') {
			this.options_.blacklistDuration = 5 * 60;
		}

		// start playlist selection at a reasonable bandwidth for
		// broadband internet (0.5 MB/s) or mobile (0.0625 MB/s)
		if (typeof this.options_.bandwidth !== 'number') {
			this.options_.bandwidth = INITIAL_BANDWIDTH;
		}


		// If the bandwidth number is unchanged from the initial setting
		// then this takes precedence over the enableLowInitialPlaylist option
		this.options_.enableLowInitialPlaylist =
			this.options_.enableLowInitialPlaylist &&
			this.options_.bandwidth === INITIAL_BANDWIDTH;

		// grab options passed to player.src
		['withCredentials', 'bandwidth', 'handleManifestRedirects'].forEach((option) => {
			if (typeof this.source_[option] !== 'undefined') {
				this.options_[option] = this.source_[option];
			}
		});

		this.bandwidth = this.options_.bandwidth;
	}

}




























