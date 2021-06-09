function Lobby(){

	this.setup = function () {}
	this.draw = function () {
		background('slate');
		text(room['id'], windowWidth / 2, windowHeight / 2);
	}
	this.enter = function () {}
	this.resize = function () {}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}