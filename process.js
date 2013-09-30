// Dependencies
var _ = require('blank-js');
var Occur = require('occur');
var spawn = require('child_process').spawn;
var Path  = require('path');
var fs    = require('fs');
var monocle = require('monocle');

// Code
function Process(options) {
	Occur.call(this);
	options = this.options = _.merge({}, this.options, options);

	if ( ! options.command) {
		throw new Error('Command not specified');
	}

	var root = options.root;
	if ( ! root) {
		throw new Error('Root dir not specified');
	}

	if ( ! fs.existsSync(root)) {
		throw new Error('Root dir "' + root + '" not found')
	}

	this.monocle = monocle();

	if (options.autostart) {
		this.start();
	}
};

Process.options = Process.prototype.options = {
	autostart : false,
	respawn   : false,
	timeout   : 1000,
	command   : false,
	args      : [],
	root      : false,
	cwd       : '.',
	env       : {},
	watch     : true,
	watch_filter : ['*.js', '*.json']
};

_.mixin(Process, Occur);

Process.prototype.start = function() {
	var options = this.options;
	var proc = spawn(options.command, options.args, {
		cwd : Path.resolve(options.root, options.cwd),
		env : options.env
	});

	proc.on('error', this.onError.bind(this));
	proc.on('close', this.onClose.bind(this));
	var that = this;
	proc.stdout.on('data', that.trigger.bind(this, 'stdout'));
	proc.stderr.on('data', that.trigger.bind(this, 'stderr'));
	
	this.process = proc;

	if (options.watch) {
		this.monocle.watchPaths({
			path       : options.root,
			fileFilter : options.watch_filter || undefined,
			listener   : this.onFileChange.bind(this)
		});
	}
	this.trigger('started');
	return this;
};

Process.prototype.onError = function(err) {
	this.trigger('error', err);
};

Process.prototype.onClose = function(code) {
	if (code) {
		this.trigger('error', new Error('Closed with exit code ' + code));
		if (this.options.respawn) {
			setTimeout(this.start.bind(this), this.options.timeout);
		}
	}
	this.trigger({type:'close', code:code});
	this.process = undefined;
	this.monocle.unwatchAll();
};

Process.prototype.restart = function() {
	if (this.process) {
		this.process.once('close', this.start.bind(this));
		this.stop();
	} else {
		this.start();
	}
};

Process.prototype.onFileChange = function() {
	if (this.process) {
		this.process.removeAllListeners();
		this.restart();
	}
};

Process.prototype.stop = function() {
	if (this.process) {
		this.process.kill('SIGHUP');
	}
	return this;
};

// Export
module.exports = Process;
module.exports.create = function(options) {
	return new Process(options);
};