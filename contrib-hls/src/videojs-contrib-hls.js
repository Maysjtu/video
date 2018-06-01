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
}

// 0.5 MB/s
const INITIAL_BANDWIDTH = 4194304;





