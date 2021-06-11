const SERVER_PORT = 8080;
const IO_SETTINGS = {
	cors: {
		origin: '*' // dev, TODO prod
	},
	cookie: false, 
	pingInterval: 10000,
	pingTimeout: 5000
};

const MAX_PLAYERS = 8; // why not?
const MAX_WINS = 5;
const ICON_COUNT = 8;

var express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, IO_SETTINGS);
//const C = require('./js/constants.js');

app.use(express.static(__dirname));

app.get("/", function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

var rooms = {};
/*rooms[roomId] = {
	"id": roomId,
	"admin": socket.id,
	"open": true, // hotjoin
	"players": [socket.id],
	"wins": 3,
	"gameStarted": false,
	"currentGame":undefined,
	"scores":{ "socket.id":0 }
};*/
var players = {}; // TODO class
// players[socket.id] = { 'id': socket.id, 'room': undefined, 'icon': 0, 'name':''};

io.on('connection', function (socket) {
	l("connected: " + socket.id);
	io.to(socket.id).emit('general:com', 'Successfully connected to socket');

	// TODO constructor
	players[socket.id] = {
		'id': socket.id,
		'room': undefined,
		'icon': getRandomInt(ICON_COUNT),
		'name':''
	};

	socket.on("disconnect", function () {
		l("disconnected: " + socket.id);
		playerLeavesRoom(socket);
		delete players[socket.id];
	});	

	socket.on('general:servertime', function () {
		io.emit('general:servertime', Date.now());
	});

	socket.on("room:new", function () {
		let roomId = createNewRoom(socket);
		l("new room:" + roomId + ", admin: " + socket.id);
		playerJoinsRoom(socket, roomId);
	});

	socket.on("room:join", function (roomId) {
		l(socket.id + " joins " + roomId);
		playerJoinsRoom(socket, roomId);
	});

	socket.on("room:leave", function () {
		l(socket.id + " joins leaves " + roomId);
		playerLeavesRoom(socket);
	});

	socket.on("room:info:players", function () {
		getPlayersForRoom(socket);
	});

	socket.on("settings:update:icon", function (iconNr) {
		playerChangesImage(socket, iconNr);
	});
	
	socket.on("settings:update:name", function (name) {
		playerChangesName(socket, name);
	});

	socket.on("settings:update:wins", function (winsNr) {
		playerChangesWinsPerGame(socket, winsNr);
	});

	socket.on("game:start", function () {
		startGame(socket);
	});
});

function createNewRoom(socket) {
	// only one room at the time
	playerLeavesRoom(socket);

	let roomId;
	// recreate until unused unique room ID is created
	do {
		roomId = createId();
	} while (rooms[roomId] !== undefined);

	// creating player will be made admin and added player
	rooms[roomId] = {
		"id": roomId,
		"admin": socket.id,
		"open": true, // hotjoin
		"players": [socket.id],
		"wins": 3,
		"gameStarted": false,
		"currentGame": undefined,
		"scores": {}
	};
	// init scores
	rooms[roomId]['scores'][socket.id] = 0;
	return roomId;
}

function playerJoinsRoom(socket, roomId) {
	// sanitize room id
	let roomId_ = roomId.toUpperCase();
	// only one room at the time
	playerLeavesRoom(socket);

	let room = rooms[roomId_];
	if (room == undefined) {
		// room does not exists
		l("Room does not exists: " + roomId_);
		io.to(socket.id).emit('room:join:err:404', roomId_);
	} else {
		if (!room["open"]) {
			// room does not allow joining
			l("Room does not allow joining: " + roomId_);
			io.to(socket.id).emit('room:join:err:closed', roomId_);
		} else if (room["players"].length >= MAX_PLAYERS) {
			// room is full
			l("Room is full: " + roomId_);
			io.to(socket.id).emit('room:join:err:full', roomId_);
		} else {
			// player joins the room
			l(socket.id + ' joins ' + roomId_);
			socket.join(roomId_);
			players[socket.id]["room"] = roomId_;
			
			// player might be already part of player list (when creating a room)
			if (!room['players'].includes(socket.id)) {
				// if not then the player has to be added and scores initialized
				rooms[roomId_]['players'].push(socket.id);
				rooms[roomId_]['scores'][socket.id] = 0;
			}

			players[socket.id]['name'] = 'PLAYER_' + rooms[roomId_]['players'].length;

			// give player info about other players
			getPlayersForRoom(socket);
			// give player room info
			io.to(socket.id).emit('room:join:success', rooms[roomId_]);
			// inform all players about new player
			io.to(roomId_).emit('room:join:player', players[socket.id]);
		}
	}
}

function playerLeavesRoom(socket) {
	let roomId = getPlayerRoomId(socket);
	// is player in a room?
	if (roomId !== undefined) {
		// player was in a room
		let room = getPlayerRoom(socket);
		// remove room from player
		players[socket.id]['room'] = undefined;
		// will the room be empty?
		if (room['players'].length <= 1) {
			// room is empty and can be deleted
			delete rooms[roomId];
		} else {
			// room has more players
			// is the leaving player the current admin?
			if (room['admin'] == socket.id) {
				// room admin has to change
				let newAdminId = room['players'].find(playerId => playerId != socket.id);
				room['admin'] = newAdminId;
				// inform all players about new admin
				io.to(roomId).emit('room:update:admin', players[newAdminId]);
			}

			// delete players scores 
			delete room['scores'][socket.id];
			if (room['gameStarted'] == true) {
				// notify room if game has started
				io.to(roomId).emit('room:update:scores', room['scores']);
			}

			// remove player from room
			room['players'] = arrayRemove(room['players'], socket.id);
			// notifiy room
			io.to(roomId).emit('room:update:playerLeft', players[socket.id]);
		}

		// can the game commence?
		if (room['gameStarted'] && room['players'].length < 2) {
			// game has not enough players to keep on playing
			goToWinScreen(roomId);
		}
	}
}

function playerChangesImage(socket, iconNr) {
	// check if valid
	if(!msgIsInteger(socket, iconNr)){
		return;	
	}
	if (iconNr < 1 || iconNr > ICON_COUNT) {
		io.to(socket.id).emit('general:com', 'Not a valid icon number (0-' + ICON_COUNT + '): ' + iconNr);
		return;
	}

	l(socket.id + " has new icon: " + iconNr);
	// set icon
	players[socket.id]['icon'] = iconNr;
	// notify if in room
	if (playerHasRoom(socket)) {
		io.to(getPlayerRoomId(socket)).emit('settings:player:icon', players[socket.id]);
	}
}

function playerChangesName(socket, name) {
	// check if valid
	l(socket.id + " has new name: " + name);
	// set icon
	players[socket.id]['name'] = name;
	// notify if in room
	if (playerHasRoom(socket)) {
		io.to(getPlayerRoomId(socket)).emit('settings:player:name', players[socket.id]);
	}
}

function playerChangesWinsPerGame(socket, winsNr) {
	if (
		!playerIsAdmin(socket) ||
		!playerHasRoom(socket) ||
		!msgIsInteger(socket, winsNr)
	){
		return;
	}

	if (winsNr < 1 || winsNr > MAX_WINS) {
		io.to(socket.id).emit('general:com', 'Not a valid round number (1-' + MAX_WINS + ')');
		return;
	}

	var room = getPlayerRoom(socket);
	// finally update value and notify
	room['wins'] = winsNr;
	io.to(getPlayerRoomId(socket)).emit('settings:update:wins', winsNr);
}

function getPlayersForRoom(socket) {
	if (playerHasRoom(socket)) {
		let plyrs = {};
		getPlayerRoom(socket)['players'].forEach(pId => plyrs[pId] = players[pId]);
		io.to(socket.id).emit('room:players', plyrs);
	}
}

function startGame(socket) {
	if (
		!playerIsAdmin(socket) ||
		!playerHasRoom(socket)
	) {
		return;
	}

	var room = getPlayerRoom(socket);
	// check if enough players
	if (room['players'].length < 2) {
		io.to(socket.id).emit('game:notEnoughPlayers', 'Not enough players play a game!');
		return;
	}

	// update and notify
	room['gameStarted'] = true;
	io.to(getPlayerRoomId(socket)).emit('game:started');
}

function goToWinScreen(roomId) {
	l("game finished in room: " + roomId);
	io.to(roomId).emit('game:final:winScreen', rooms[roomId]);
}

// MISC & UTIL

function getPlayerRoomId(socket){
	return players[socket.id]['room'];
}

function getPlayerRoom(socket){
	return rooms[getPlayerRoomId(socket)];
}

// check if player is part of a room 
function playerHasRoom(socket) {
	let roomId = getPlayerRoomId(socket);
	if (roomId == undefined) {
		io.to(socket.id).emit('general:com', 'Not part of a game');
		return false;
	} else {
		return true;
	}
}

// check if player is admin
function playerIsAdmin(socket) {
	var room = getPlayerRoom(socket);
	let roomAdmin = room['admin'];
	if (socket.id !== roomAdmin) {
		io.to(socket.id).emit('general:com', 'Only room admin is allowed to change settings');
		return false;
	} else {
		return true;
	}
}

// 4 Letter ID -> 1679616 combinations possibilities
function createId() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for (var i = 0; i < 4; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function msgIsInteger(socket, msg) {
	if (!Number.isInteger(msg)) {
		io.to(socket.id).emit('general:com', 'Not an integer: ' + msg);
		return false;
	} else {
		return true;
	}
}

function l(msg) {
	console.log(msg);
}

// remove element from array
function arrayRemove(arr, value) {
	return arr.filter(function (el) {
		return el !== value;
	});
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// LAST

http.listen(SERVER_PORT, function () {
	console.log('listening on port: ' + SERVER_PORT);
});


