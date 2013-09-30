var http = require('http');

http.createServer(function(req, res){
	res.end('ok');
}).listen(19090);

setInterval(function(){
	if (Math.random() > 0.9) {
		throw new Error("Error simulation");
	}
});

console.log('Listening 19090');