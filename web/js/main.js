console.log('ml5 version:', ml5.version);
console.log('p5 version:', p5.prototype.VERSION);

// export to module shared between server and client
const SERVER_URL = 'http://localhost', SERVER_PORT = 8080;

var socket;
var room, players = {};
$(function () {
	// TODO deal dev & prod envs
	socket = io.connect(SERVER_URL + ':' + SERVER_PORT);

	socket.on("disconnect", () => {
		l("OUT OF SYNC");
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

	socket.on('game:final:winScreen', function (room) {
		l("The game is over");
		l(room['scores']);
	});

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

	socket.on('voting:result' , function(votedRoom){
		room['currentGame'] = votedRoom['currentGame'];
		room['votingStarted'] = votedRoom['votingStarted'];
		finishVoting(room['currentGame']);
	});

	/*socket.on('game:selected', function (game) {
		// TODO goto individual game once admin selected one

	});*/
});

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

function finishVoting(game){
	l('Voting has finished: ' + game);
}

const duration = 30;
var sections = 16, section = 2 * Math.PI / sections;
function drawBackground() {
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

function getDebugData() {
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
		"gameStarted": false,
		"votingStarted": false,
		"currentGame": undefined,
		"scores": {
			'A4eeetVk9qvDE37OAAAB': 0,
			'cK3PY0WAEMnI4OogAAAA': 0
		},
		"votes": {
			'A4eeetVk9qvDE37OAAAB': 'sound'
		}
	};
	debugRoom['scores'][socket.id] = 0

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

	return {'room': debugRoom, 'players': debugPlayers};
}

function l(msg) {
	console.log(msg);
}