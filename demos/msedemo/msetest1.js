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
  mime = 'video/webm; codecs="vorbis, vp9"';

  	console.log(MediaSource.isTypeSupported(mime));
   mediaSource = e.target;
   // mediaSource.duration = 6;
   sourceBuffer = mediaSource.addSourceBuffer(mime);
   // sourceBuffer.mode = 'sequence';
   sourceBuffer.appendWindowStart = 0;

   sourceBuffer.appendWindowEnd = 10;
   videoUrl = '../../assets/cg.webm';
   videoUrl1 = '../../assets/avegers3.webm';
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
        // doNext();
        // sourceBuffer.timestampOffset = 10;
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
    });
}
function doNext() {
  mime1 = 'video/webm; codecs="vorbis, vp8"'; 
  // sourceBuffer1 = mediaSource.addSourceBuffer(mime);
  // sourceBuffer1.appendWindowEnd = 10;

  fetch(videoUrl)
  .then(function(response) {
    // console.log('res', response);
    return response.arrayBuffer();
  })
  .then(function(arrayBuffer) {
    console.log('buffer', arrayBuffer);

      sourceBuffer.addEventListener('updateend', function(e) {
        console.log('end');
        // console.log('end1',sourceBuffer1);
        console.log('end2',mediaSource);

        // sourceBuffer.timestampOffset = 10;
         if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
           mediaSource.endOfStream();
         }
      });
      sourceBuffer.appendBuffer(arrayBuffer);
  });
}