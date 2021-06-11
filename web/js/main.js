console.log('ml5 version:', ml5.version);
console.log('p5 version:', p5.prototype.VERSION);

// export to module shared between server and client
const SERVER_URL = 'http://localhost', SERVER_PORT = 8080;

var socket;
var room, players = {};
$(function () {
	// TODO deal dev & prod envs
	socket = io.connect(SERVER_URL + ':' + SERVER_PORT);

	socket.on('general:com', function (msg) {
		console.log(msg);
	});

	socket.on('general:servertime', function (msg) {
		console.log('Servertime: ' + msg);
	});

	socket.on('room:join:success', function (joinedRoom) {
		l("Room joined: " + joinedRoom['id']);
		room = joinedRoom;
		mgr.joinRoomDelegate(room['id']);
	});

	socket.on('room:join:player', function (player) {
		if (socket.id !== player['id']) {
			l("New Player joined: " + player['id']);
		}
		players[player['id']] = player;

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
		room['admin'] = player['id']
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

	socket.on('game:final:winScreen', function (room) {
		l("The game is over");
		l(room['scores']);
	});

	socket.on('game:notEnoughPlayers', function () {
		l("The game has does not have enough players!");
	});

	socket.on('game:started', function () {
		l("The game has started!");
	});
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

function changeIcon(iconNr) {
	socket.emit('settings:update:icon', iconNr);
}

function changeName(name) {
	socket.emit('settings:update:name', name);
}

function getPlayersForRoom(){
	socket.emit('room:info:players');
}

function changeRoundsForGame(winsNr) {
	socket.emit('settings:update:wins', winsNr);
}

function startGame() {
	socket.emit('game:start');
}

const duration = 30;
var sections = 16, section = 2*Math.PI  / sections;
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

function l(msg) {
	console.log(msg);
}