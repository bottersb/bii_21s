const MIN_WIDTH = 460, MIN_HEIGHT = 680;
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

var gIcon_sketch,
	gIcon_pose,
	gIcon_sound,
	gIcon_random;

var icons = {}, gameIcons = {}, animalIcons = {};

var scenes = {};

var modelURL = 'http://localhost:8080/data/';

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

	barn['barn'] = loadImage('/img/barn-yard.jpg');
	barn['Cat'] = loadImage('/img/cat.png');
	barn['Dog'] = loadImage('/img/dog.png');
	barn['Cow'] = loadImage('/img/cow.png');
	barn['Duck'] = loadImage('/img/duck.png');
	barn['Frog'] = loadImage('/img/frog.png');
	barn['Goat'] = loadImage('/img/goat.png');
	barn['Owl'] = loadImage('/img/owl.png');

	gIcon_sketch = loadImage('/img/sketch_game.png');
	gIcon_pose = loadImage('/img/pose_game.png');
	gIcon_sound = loadImage('/img/sound_game.png');
	gIcon_random = loadImage('/img/random_game.png');

	imgYMCA = loadImage('/img/ymca.png');

	icons['1'] = icon_1;
	icons['2'] = icon_2;
	icons['3'] = icon_3;
	icons['4'] = icon_4;
	icons['5'] = icon_5;
	icons['6'] = icon_6;
	icons['7'] = icon_7;
	icons['8'] = icon_8;

	gameIcons['sketch'] = gIcon_sketch;
	gameIcons['pose'] = gIcon_pose;
	gameIcons['sound'] = gIcon_sound;
	gameIcons['random'] = gIcon_random;
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
	inp_roomCode.position(windowWidth / 2, windowHeight / 2);

	inp_playerName = createInput('');
	inp_playerName.style('visibility', 'hidden');
	inp_playerName.style('text-align', 'center');
	inp_playerName.style('text-transform', 'uppercase');
	inp_playerName.attribute('placeholder', 'Player Name');
	inp_playerName.attribute('maxlength', 10);
	inp_playerName.size(100);
	inp_playerName.position(windowWidth / 2, windowHeight / 2);

	scenes['intro'] = mgr.addScene(Intro);
	scenes['lobby'] = mgr.addScene(Lobby);
	scenes['gameSelect'] = mgr.addScene(GameSelect);
	scenes['win'] = mgr.addScene(WinScreen);
	scenes['scene'] = mgr.addScene(Scene);

	scenes['sketch'] = mgr.addScene(Sketch);
	scenes['pose'] = mgr.addScene(Pose);
	scenes['sound'] = mgr.addScene(Sound);
	
	exportMgrAttributes();
	setAllMgrs(this);

	mgr.showNextScene();
}

// sets the mgr (callback) for each scene
function setAllMgrs(mngr) {
	Object.keys(scenes).forEach(k => scenes[k].oScene.setMgr(mngr));
}

function windowResized() {
	// TODO do not resize horizontally when windowWidth < MIN_WIDTH, vert. when wH < M_H
	resizeCanvas(windowWidth, windowHeight);
	Object.keys(scenes).forEach(function (k) {
		if (mgr.isCurrent(scenes[k].fnScene)) {
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
	mgr.gotoGameSelect = gotoGameSelect;
	mgr.gotoGame = gotoGame;
	mgr.gotoWin = gotoWin;
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

function gotoGame() {
	let sVote = scenes['gameSelect'];
	if (mgr.isCurrent(sVote.fnScene)) {
		sVote.oScene.leave();
	}

	let game = scenes[room['currentGame']];
	mgr.showScene(game.fnScene, room['currentGame']);
}

function gotoWin(final) {
	/*let sVote = scenes['gameSelect'];
	if (mgr.isCurrent(sVote.fnScene)) {
		sVote.oScene.leave();
	}*/
	mgr.showScene(scenes['win'].fnScene, final);
}

function joinRoomErrorDelegate(msg) {
	scenes['intro'].oScene.joinRoomError(msg);
}

function gameStartErrorDelegate(msg) {
	scenes['lobby'].oScene.startGameError(msg);
}
