var timeDump = function(){
	console.log(new Date());
};
setInterval(timeDump, 1000);
console.log('Started');
// First run
timeDump();