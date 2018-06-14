var worker = new Worker('./work.js');
worker.postMessage("Hello World");
worker.postMessage({method: 'echo', args: ['Work']});

worker.addEventListener('message', function(e) {
	console.log(e.data);
	worker.terminate();
}, false);