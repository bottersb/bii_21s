// basic scene template
function GameSelect(){

	var btnW = 100, btnH = 32;

	var btn_gameSound, btn_gamePose, btn_gameSketch, btn_gameRandom,
	btn_leave, btn_start;

	btns = [];

	this.setup = function () {
		btn_gameSound = new Clickable();
		btn_gameSound.image = gameIcons['sound'];
		btn_gameSound.resize(btnW, btnH);
		btns.push(btn_gameSound);

		initialized = true;
	}
	this.draw = function () {

		positionElements();
	}
	this.enter = function () {}
	this.leave = function () {}
	this.resize = function () {}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
	
	function positionElements(){
		btn_gameSound.locate((windowWidth / 2) - imgDim, (3 * windowHeight / 8) - (btnW / 2));
	}

	this.isInitialized = function() {
		return initialized;
	}
}