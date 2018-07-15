var Player = function() {
	var self = this;
	this.clearUp = function() {
		if(self.videoElement) {
			self.videoElement.remove();
			delete self.mediaSource;
			delete self.sourceBuffer;
		}
	}
	this.init = function(sourceFile){
		if(!window.MediaSource)){
			self.log("Your browser not support MSE");
		}
		self.clearUp();
		self.sourceFile = sourceFile;
		self.log("create media source");
		self.videoElement = document.getElementById('myPlayer');
	}

	this.log = function(){

	}
}

var m3u8Player = new Player();
