function Lobby(){

	var btnW = 100, btnH = 32, margin = 4;

	let logoH = 50;
	this.setup = function () {}
	this.draw = function () {
		drawBackground();
		image(this.sceneManager.logo, width / 2, height / 8, 100, logoH);
		
	}
	this.enter = function () {
		inp_roomCode.value(room['id']);
		inp_roomCode.style('visibility', 'visible');
		inp_roomCode.attribute("readonly","true");
		inp_roomCode.position((windowWidth / 2) - (btnW / 2) - 4, (windowHeight / 4) - (btnH / 2));
	}
	this.leave = function () {
		inp_roomCode.value('');
		inp_roomCode.style('visibility', 'hidden');
		inp_roomCode.attribute("readonly","false");
	}

	this.resize = function () {}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}