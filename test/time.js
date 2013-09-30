var timeDump = function(){
	console.log(new Date());
};

setInterval(timeDump, 1000);
timeDump();

setTimeout(function(){
	process.exit();
}, 3000);