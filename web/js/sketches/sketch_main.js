const FRAME_RATE = 30;

var c, mgr;

var logo;

var scenes = {};

this.preload = function () {
	logo = loadImage('/img/logo.png');
}

function setup() {
	c = createCanvas(windowWidth, windowHeight);
	frameRate(FRAME_RATE);
	mgr = new SceneManager();
	mgr.wire();
	
	exportMgrAttributes();
	setAllMgrs(this);

	scenes['intro'] = mgr.addScene(Intro);
	scenes['lobby'] = mgr.addScene(Lobby);
	
	mgr.showNextScene();
}

// sets the mgr (callback) for each scene
function setAllMgrs(mngr){
	Object.keys(scenes).forEach(k => print(scenes[k].oScene.setMgr(mngr)));
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	Object.keys(scenes).forEach(k => print(scenes[k].oScene.resize()));
}

// add functions the manager shall expose here
function exportMgrAttributes(){
	mgr.logo = logo;
	mgr.joinRoomDelegate = joinRoomDelegate;
}

function joinRoomDelegate(){
	//scenes['lobby'].oScene.setRoom(room) 
	mgr.showScene(Lobby);
}
