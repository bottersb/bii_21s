// basic scene template
function SCENE(){

	initialized = false;

	this.setup = function () {
		initialized = true;
	}
	this.draw = function () {
	}
	this.enter = function () {}
	this.leave = function () {}
	this.resize = function () {}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	this.isInitialized = function() {
		return initialized;
	}
}