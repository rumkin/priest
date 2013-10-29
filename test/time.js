var lifetime = ((process.argv[2]|0) *1000) || 3000;

var timeDump = function(){
	console.log(new Date());
};

setInterval(timeDump, 1000);
timeDump();

setTimeout(function(){
	process.exit();
}, lifetime);