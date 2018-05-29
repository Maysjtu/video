/**
 * Create text tracks on video.js if they exist on a segment.
 *
 * @param {Object} sourceBuffer the VSB or FSB
 * @param {Object} mediaSource the HTML or Flash media source
 * @param {Object} segment the segment that may contain the text track
 * @private
 */
 const createTextTracksIfNecessary = function(sourceBuffer, mediaSource, segment) {
 	const player = mediaSource.player_;
 	if(segment.captions && segment.captions.length) {
 		if(!sourceBuffer.inbandTextTracks_) {
 			sourceBuffer.inbandTextTracks_ = {};
 		}
 		for(let trackId in segment.captionStreams) {
 			if(!sourceBuffer.inbandTextTracks_[trackId]) {
 				player.tech_.trigger({type:'usage', name: 'hls-608'});
 				let track = player.textTracks().getTrackById(trackId);
 				if(track) {
 					sourceBuffer.inbandTextTracks_[trackId] = track;
 				} else {
 					sourceBuffer.inbandTextTracks_[trackId] = player.addRemoteTextTrack({
 						kind: 'captions',
 						id: trackId,
 						label: trackId
 					},false).track;
 				}
 			}
 		}
 	}

  if (segment.metadata &&
      segment.metadata.length &&
      !sourceBuffer.metadataTrack_) {
    sourceBuffer.metadataTrack_ = player.addRemoteTextTrack({
      kind: 'metadata',
      label: 'Timed Metadata'
    }, false).track;
    sourceBuffer.metadataTrack_.inBandMetadataTrackDispatchType =
      segment.metadata.dispatchType;
  }

 };

 export default createTextTracksIfNecessary;