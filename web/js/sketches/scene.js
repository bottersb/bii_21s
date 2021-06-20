// basic scene template
function Scene(){

	initialized = false;

	this.setup = function () {
		
		initialized = true;
	}
	this.draw = function () {
		fill('red');
		circle(100,100,100);
	}
	this.enter = function () {

	}
	this.leave = function () {}
	
	this.resize = function () {
		
	}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	this.isInitialized = function() {
		return initialized;
	}
}