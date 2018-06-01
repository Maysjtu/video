var videoEle = document.querySelector('video');

if(window.MediaSource) {
	var mediaSource = new MediaSource();
	videoEle.src = URL.createObjectURL(mediaSource);
	mediaSource.addEventListener('sourceopen',sourceOpen);
} else {
	console.log('mse is not supported');
}
function sourceOpen(e){
	URL.revokeObjectURL(videoEle.src);
	var mime = 'video/mp4;codecs="avc1.64001F,mp4a.40.2"';
	console.log(MediaSource.isTypeSupported(mime));

	var mediaSource = e.target;
	var sourceBuffer = mediaSource.addSourceBuffer(mime);
	var videoUrl = 'http://static.kanhunli.cn/yunxi/yunxi-videoedit/static/cg.mp4';
	fetch(videoUrl)
	.then(function(resp){
		console.log('get',resp);
		return resp.arrayBuffer();
	})
	.then(function(arrayBuffer){
		console.log('buffer',arrayBuffer);
		sourceBuffer.addEventListener('updateend', function(e){
				console.log('end1',sourceBuffer);
				console.log('end2',mediaSource);

			if( !sourceBuffer.updating && mediaSource.readyState === 'open'){
				mediaSource.endOfStream();
				videoEle.play().then(function() {
					console.log('playing');
	          	}).catch(function(err) {
	          		console.log('err');
	          	});
			}
		});
		sourceBuffer.appendBuffer(arrayBuffer);
	})

}
