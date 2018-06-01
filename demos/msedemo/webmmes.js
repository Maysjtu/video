var vidElement = document.querySelector('video');

if (window.MediaSource) {
  var mediaSource = new MediaSource();
  vidElement.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen);
} else {
  console.log("The Media Source Extensions API is not supported.")
}

function sourceOpen(e) {
  URL.revokeObjectURL(vidElement.src);
  var mime = 'video/webm; codecs="vorbis, vp8"';
  	console.log(MediaSource.isTypeSupported(mime));
  var mediaSource = e.target;
  var sourceBuffer = mediaSource.addSourceBuffer(mime);
  var videoUrl = '../../assets/avegers3.webm';
  console.log('lalala');
  fetch(videoUrl)
    .then(function(response) {
    	console.log('res', response);
      return response.arrayBuffer();
    })
    .then(function(arrayBuffer) {
    	console.log('buffer', arrayBuffer);
      sourceBuffer.addEventListener('updateend', function(e) {
      	console.log('end');
      	console.log('end1',sourceBuffer);
		console.log('end2',mediaSource);

        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
    });
}