const FRAME_RATE = 30;

var c, mgr;

var logo, inp_roomCode, inp_playerName;

var icon_1,
	icon_2,
	icon_3,
	icon_4,
	icon_5,
	icon_6,
	icon_7,
	icon_8;

var icons = {}

var scenes = {};

this.preload = function () {
	logo = loadImage('/img/logo.png');
	icon_1 = loadImage('/img/1.png');
	icon_2 = loadImage('/img/2.png');
	icon_3 = loadImage('/img/3.png');
	icon_4 = loadImage('/img/4.png');
	icon_5 = loadImage('/img/5.png');
	icon_6 = loadImage('/img/6.png');
	icon_7 = loadImage('/img/7.png');
	icon_8 = loadImage('/img/8.png');

	icons['1'] = icon_1;
	icons['2'] = icon_2;
	icons['3'] = icon_3;
	icons['4'] = icon_4;
	icons['5'] = icon_5;
	icons['6'] = icon_6;
	icons['7'] = icon_7;
	icons['8'] = icon_8;
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
	inp_roomCode.size(100);
	//inp_roomCode.attribute("readonly", "false");

	inp_playerName = createInput('');
	inp_playerName.style('visibility', 'hidden');
	inp_playerName.style('text-align', 'center');
	inp_playerName.style('text-transform', 'uppercase');
	inp_playerName.attribute('placeholder', 'Player Name');
	inp_playerName.attribute('maxlength', 10);
	inp_playerName.size(100);
	inp_playerName.position(windowWidth/2, windowHeight/2);

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
	Object.keys(scenes).forEach(function(k){ 
		if(mgr.isCurrent(scenes[k].fnScene)) {
			scenes[k].oScene.resize();
		}
	});		
}

// add functions the manager shall expose here
function exportMgrAttributes() {
	mgr.logo = logo;
	mgr.inp_roomCode = inp_roomCode;
	mgr.inp_playerName = inp_playerName;
	mgr.joinRoomDelegate = joinRoomDelegate;
	mgr.joinRoomErrorDelegate = joinRoomErrorDelegate;
	mgr.gameStartErrorDelegate = gameStartErrorDelegate;
	mgr.leaveLobbyDelegate = leaveLobbyDelegate;
}

function joinRoomDelegate() {
	let sIntro = scenes['intro'];
	if (mgr.isCurrent(sIntro.fnScene)) {
		sIntro.oScene.leave();
	}
	mgr.showScene(Lobby);
}

function leaveLobbyDelegate() {
	let sLobby = scenes['lobby'];
	if (mgr.isCurrent(sLobby.fnScene)) {
		sLobby.oScene.leave();
		players = {};
		room = undefined;
	}
	mgr.showScene(Intro);
}

function gotoGameSelect() {
	let sIntro = scenes['lobby'];
	if (mgr.isCurrent(sIntro.fnScene)) {
		sIntro.oScene.leave();
	}
	mgr.showScene(GameSelect);
}

function joinRoomErrorDelegate(msg) {
	scenes['intro'].oScene.joinRoomError(msg);
}

function gameStartErrorDelegate(msg) {
	scenes['lobby'].oScene.startGameError(msg);
}


