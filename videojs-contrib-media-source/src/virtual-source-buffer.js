import videojs from 'video.js'
import createTextTracksIfNecessary from './create-text-tracks-if-necessary';
import removeCuesFromTrack from './remove-cues-from-track';
import {addTextTrackData} from './add-text-track-data';
import work from 'webwackify';
import transmuxWorker from './transmuxer-worker';
import {isAudioCodec, isVideoCodec} from './codec-utils';


const resolveTransmuxWorker = () => {
    let result;

    try {
        result = require.resolve('./transmuxer-worker');
    } catch (e) {
        // no result
    }

    return result;
};
// We create a wrapper around the SourceBuffer so that we can manage the
// state of the `updating` property manually. We have to do this because
// Firefox changes `updating` to false long before triggering `updateend`
// events and that was causing strange problems in videojs-contrib-hls
const makeWrappedSourceBuffer = function(mediaSource, mimeType) {
    const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
    const wrapper = Object.create(null);

    wrapper.updating = false;
    wrapper.realBuffer_ = sourceBuffer;

    for (let key in sourceBuffer) {
        if (typeof sourceBuffer[key] === 'function') {
            wrapper[key] = (...params) => sourceBuffer[key](...params);
        } else if (typeof wrapper[key] === 'undefined') {
            Object.defineProperty(wrapper, key, {
                get: () => sourceBuffer[key],
                set: (v) => sourceBuffer[key] = v
            });
        }
    }

    return wrapper;
};
/**
 * Returns a list of gops in the buffer that have a pts value of 3 seconds or more in
 * front of current time.
 *
 * @param {Array} buffer
 *        The current buffer of gop information
 * @param {Player} player
 *        The player instance
 * @param {Double} mapping
 *        Offset to map display time to stream presentation time
 * @return {Array}
 *         List of gops considered safe to append over
 */
export const gopsSafeToAlignWith = (buffer, player, mapping) => {
    if(!player||!buffer.length) {
        return [];
    }
    // pts value for current time + 3 seconds to give a bit more wiggle room

};



















