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

   mime = 'video/mp4; codecs="avc1.64001F, mp4a.40.2"';
  	console.log(MediaSource.isTypeSupported(mime));
   mediaSource = e.target;
   sourceBuffer = mediaSource.addSourceBuffer(mime);
   videoUrl = '../../assets/fmp4/cg_frag.mp4';
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
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
    });
}