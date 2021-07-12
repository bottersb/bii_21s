console.log('ml5 version:', ml5.version);
console.log('p5 version:', p5.prototype.VERSION);

// get node env var
const SERVER_URL = 'http://localhost', SERVER_PORT = 8080;

var DEBUG = { 'enabled': false };

var socket;
var room, players = {}, gameObjectives = [], currObjective;

var sketch_classifier, sound_classifier, pose_classifier;
var soundLabel, sketchLabel, poseLabel;
var classifyingSketch = false, classifyingPose = false, classifyingSound = false;

var singlePlayer = false;
var sketchMatches = 0, poseMatches = 0, soundMatches = 0;
var outro = false;
var gameDone = false;
var gravity;

var imgYMCA;
var barn = {};
var poses = [];
var poseNet;

let capture;
let constraints = {
	video: {
		mandatory: {
			minWidth: 640,
			minHeight: 360
		},
		optional: [{ maxFrameRate: 30 }]
	},
	audio: false
};

let soundLookUp = {
	"CAT_BO":"Cat",
	"COW_BO":"Cow",
	"DOG_BO":"Dog",
	"DUCK_BO":"Duck",
	"FROG_BO":"Frog",
	"GOAT_BO":"Goat",
	"Hintergrundgeräusche":"Noise",
	"OWL_BO":"Owl"
}

$(function () {
	// TODO deal dev & prod envs
	socket = io.connect(SERVER_URL + ':' + SERVER_PORT);

	socket.on("disconnect", () => {
		l("Disconnected!");
	});

	socket.on('general:com', function (msg) {
		console.log(msg);
	});

	socket.on('general:servertime', function (msg) {
		console.log('Servertime: ' + msg);
	});

	socket.on('room:join:success', function (joinedRoom) {
		l("Room joined: " + joinedRoom['id']);
		room = joinedRoom;
		mgr.joinRoomDelegate();
	});

	socket.on('room:join:player', function (player, roomPlayers) {
		if (socket.id !== player['id']) {
			l("New Player joined: " + player['id']);
		}
		players[player['id']] = player;
		room['players'] = roomPlayers;
	});

	socket.on('room:join:err:404', function (msg) {
		let err = "Room not found: " + msg;
		l(err);
		mgr.joinRoomErrorDelegate(err);
	});

	socket.on('room:join:err:closed', function (msg) {
		let err = "Joining not allowed: " + msg;
		l(err);
		mgr.joinRoomErrorDelegate(err);
	});

	socket.on('room:join:err:full', function (msg) {
		let err = "Room is full: " + msg;
		l(err);
		mgr.joinRoomErrorDelegate(err);
	});

	socket.on('room:update:admin', function (player) {
		let msg = "New Admin is: ";
		if (socket.id !== player['id']) {
			msg += player['id'];
		} else {
			msg += 'me!';
		}
		l(msg);
		room['admin'] = player['id'];
	});

	socket.on('room:update:playerLeft', function (player) {
		l("Player has left: " + player['id']);
		delete players[player['id']];
	});

	socket.on('settings:player:icon', function (player) {
		//if (socket.id !== player['id']) {
		l(player['id'] + " has new icon " + player['icon']);
		//}

		players[player['id']] = player;
	});

	socket.on('settings:player:name', function (player) {
		//if (socket.id !== player['id']) {
		l(player['id'] + " has new name " + player['name']);
		//}

		players[player['id']] = player;
	});

	socket.on('room:players', function (plyrs) {
		players = plyrs;
	});

	socket.on('settings:update:wins', function (winsNr) {
		l("Number of wins updated: " + winsNr);
	});

	socket.on('settings:update:scores', function (scores) {
		l("Scores updated");
		room['scores'] = scores;
	});

	/*socket.on('game:final:winScreen', function (room) {
		l("The game is over");
		l(room['scores']);
	});*/

	socket.on('game:start:notEnoughPlayers', function () {
		let err = "Not enough players!"
		l(err);
		mgr.gameStartErrorDelegate(err);
	});

	socket.on('game:settings:notAdmin', function (err) {
		l(err);
		mgr.gameStartErrorDelegate(err);
	});

	socket.on('room:left', function () {
		l("Left the room, bye");
		mgr.leaveLobbyDelegate();
	});

	socket.on('game:started', function () {
		room['gameStarted'] = true;
		l("The game has started!");
		mgr.gotoGameSelect();
	});

	socket.on('voting:started', function () {
		room["votingStarted"] = true;
		l("Voting has started!");
	});

	socket.on('game:voted', function (votedRoom) {
		room['votes'] = votedRoom['votes'];
	});

	socket.on('game:player:won', function (finishedRoom) {
		// scores intermediary
		room['scores'] = finishedRoom['scores'];
		l("Game was won");
		outro = true;
	});

	socket.on('game:won:done', function (finishedRoom) {
		// scores final
		gameDone = true;
		room['scores'] = finishedRoom['scores'];
		l("Game over!");
		outro = true;
	});

	socket.on('voting:result', function (votedRoom) {
		room['currentGame'] = votedRoom['currentGame'];
		room['votingStarted'] = votedRoom['votingStarted'];
		gameObjectives = votedRoom['objectives'];
		l('Starting game: ' + room['currentGame']);
		mgr.gotoGame();
	});

	/*socket.on('game:selected', function (game) {
		// TODO goto individual game once admin selected one

	});*/
});

function nextObjective(){
	if(gameObjectives.length > 0) {
		currObjective = gameObjectives.pop();
		l(currObjective);
	} else {
		gameFinished();
	}
}

function nextScene(){
	if(singlePlayer){
		mgr.gotoGameSelect();
	} else {
		mgr.gotoWin(gameDone);
	}
}

function getServerTime() {
	socket.emit('general:servertime');
}

function newRoom() {
	socket.emit('room:new');
}

function joinRoom(roomId) {
	socket.emit('room:join', roomId);
}

function leaveRoom() {
	socket.emit('room:leave');
}

function changeIcon(iconNr) {
	socket.emit('settings:update:icon', iconNr);
}

function changeName(name) {
	socket.emit('settings:update:name', name);
}

function getPlayersForRoom() {
	socket.emit('room:info:players');
}

function startGame() {
	socket.emit('game:start');
}

function gameFinished() {
	l("game finsihed");
	socket.emit('game:finished');
}

// obsolete, fixed wins
/*function changeRoundsForGame(winsNr) {
	socket.emit('settings:update:wins', winsNr);
}*/

// obsolete, vote instead
/*function selectGame(game) {
	socket.emit('game:select', game);
}*/

function castGameVote(game) {
	socket.emit('game:player:vote', game);
}

function voteCountDownEnd() {
	socket.emit('voting:countdown:ended');
}

const duration = 30;
var sections = 16, section = 2 * Math.PI / sections;
function drawBackground() {
	push(); 
	var rotate = sections * (frameCount / FRAME_RATE) / duration;
	for (let i = 0; i < sections; i++) {
		fill(i % 2 == 0 ? "cyan" : "hotpink");
		arc(
			width / 2,
			height / 2,
			2 * width,
			2 * height,
			i * section + rotate,
			i * section + rotate + section
		);
	}
	pop();
}

// input on type to uppercase
function inputChanged() {
	this.value(this.value().toUpperCase());
}

// default btn on hover
function btnOnHover() {
	this.color = 'paleTurquoise';
}

// default btn not hovering anymore
function btnOnOutside() {
	this.color = 'white';
}

function gotSoundResult(error, results) {
	if (error) {
		console.error(error);
		return;
	}
	soundLabel = soundLookUp[results[0].label];
}

function gotPoseResult(error, results){
	if (error) {
		console.error(error);
		return;
	}
	let res = results[0].label;
	if(res !== undefined) {
		poseLabel = res.toUpperCase();
	}
	classifyingPose = false;
}

function gotSketchResult(error, results){
	if (error) {
		console.error(error);
		return;
	}
	sketchLabel = results[0].label;
	classifyingSketch = false;
}

function setDebugDataSound(){
	setDebugData('sound');
}
function setDebugDataPose(){
	setDebugData('pose');
}
function setDebugDataSketch(){
	setDebugData('sketch');
}

function setDebugData(game) {
	var debugRoom = {
		"id": 'ASDF',
		"admin": socket.id,
		"open": false, // hotjoin
		"players": [
			socket.id,
			'A4eeetVk9qvDE37OAAAB',
			'cK3PY0WAEMnI4OogAAAA'
		],
		"wins": 3,
		"gameStarted": true,
		"votingStarted": false,
		"scores": {
			'A4eeetVk9qvDE37OAAAB': 2,
			'cK3PY0WAEMnI4OogAAAA': 1
		},
		"votes": {
			//'A4eeetVk9qvDE37OAAAB': 'sound'
		}
	};
	debugRoom['scores'][socket.id] = 0
	switch(game){
		case 'audio':
		case 'sound':
			debugRoom['currentGame'] = 'sound';
			debugRoom['objectives'] = ['Cow', 'Owl', 'Cat'];
			break;
		case 'pose':
			debugRoom['currentGame'] = 'pose';
			debugRoom['objectives'] = ['y', 'a'];
			break;
		default:
		case 'draw':
		case 'sketch':
			debugRoom['currentGame'] = 'sketch';
			debugRoom['objectives'] = ['Crab'];
			break;
	}

	var debugPlayers = {
		'A4eeetVk9qvDE37OAAAB': {
			'id': 'A4eeetVk9qvDE37OAAAB',
			'room': 'ASDF',
			'icon': 1,
			'name': 'JOAO'
		},
		'cK3PY0WAEMnI4OogAAAA': {
			'id': 'cK3PY0WAEMnI4OogAAAA',
			'room': 'ASDF',
			'icon': 2,
			'name': 'BENNY'
		}
	};
	debugPlayers[socket.id] = {
		'id': socket.id,
		'room': 'ASDF',
		'icon': 3,
		'name': 'ADMIN'
	}

	room = debugRoom;
	players = debugPlayers;
}

function l(msg) {
	console.log(msg);
}