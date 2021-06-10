const FRAME_RATE = 30;

var c, mgr;

var logo, inp_roomCode;

var scenes = {};

this.preload = function () {
	logo = loadImage('/img/logo.png');
}

function setup() {
	c = createCanvas(windowWidth, windowHeight);
	frameRate(FRAME_RATE);
	mgr = new SceneManager();
	mgr.wire();

	inp_roomCode = createInput('');
	inp_roomCode.style('visibility', 'hidden');
	inp_roomCode.style('text-align', 'center');
	inp_roomCode.style('text-transform', 'uppercase');
	inp_roomCode.attribute('placeholder', 'Room Code');
	inp_roomCode.attribute('pattern', '[A-Z0-9]+');
	inp_roomCode.attribute('maxlength', 4);
	inp_roomCode.attribute("readonly","false");
	inp_roomCode.size(100);
	exportMgrAttributes();
	setAllMgrs(this);

	scenes['intro'] = mgr.addScene(Intro);
	scenes['lobby'] = mgr.addScene(Lobby);

	mgr.showNextScene();
}

// sets the mgr (callback) for each scene
function setAllMgrs(mngr) {
	Object.keys(scenes).forEach(k => scenes[k].oScene.setMgr(mngr));
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	Object.keys(scenes).forEach(k => scenes[k].oScene.resize());
}

// add functions the manager shall expose here
function exportMgrAttributes() {
	mgr.logo = logo;
	mgr.inp_roomCode = inp_roomCode;
	mgr.joinRoomDelegate = joinRoomDelegate;
	mgr.joinRoomErrorDelegate = joinRoomErrorDelegate;
}

function joinRoomDelegate() {
	let sIntro = scenes['intro'];
	if (mgr.isCurrent(sIntro.fnScene)) {
		sIntro.oScene.leave();
	}
	mgr.showScene(Lobby);
}

function leaveLobby(){
	let sLobby = scenes['lobby'];
	if (mgr.isCurrent(sLobby.fnScene)) {
		sLobby.oScene.leave();
	}
	mgr.showScene(Intro);
}

function joinRoomErrorDelegate(msg) {
	scenes['intro'].oScene.joinRoomError(msg);
}
