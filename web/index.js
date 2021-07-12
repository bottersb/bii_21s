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
const MAX_WINS = 3;
const ICON_COUNT = 8;

var express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, IO_SETTINGS);

app.use(express.static(__dirname));

app.get("/", function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// possible game and the objectives
const objectives = {
	'sound': [
		'Cat',
		'Cow',
		'Dog',
		'Duck',
		'Frog',
		'Goat',
		'Owl'
	],
	'pose': [
		'Y', 
		'M', 
		'C', 
		'A'
	],
	'sketch': [
		"Airplane",
		"Crab",
		"Motorbike",
		"Palm Tree",
		"Spider",
		"Umbrella",
		"Windmill",
		"Eye Glasses"
	]
}

var rooms = {};
/*rooms[roomId] = {
	"id": roomId,
	"admin": socket.id,
	"open": true, // hotjoin
	"players": [socket.id],
	"wins": 3,
	"gameStarted": false,
	"currentGame":undefined,
	"scores":{ "socket.id":0 },
};*/
var players = {}; // TODO class
// players[socket.id] = { 'id': socket.id, 'room': undefined, 'icon': 0, 'name':''};

// bad name, is refering to the voting countdown 
// false if player countdown is not ended yet
var votes = {};
// votes[roomId] = { 'socket.id': false}

io.on('connection', function (socket) {
	l("connected: " + socket.id);
	io.to(socket.id).emit('general:com', 'Successfully connected to socket');

	// TODO constructor
	players[socket.id] = {
		'id': socket.id,
		'room': undefined,
		'icon': getRandomInt(ICON_COUNT),
		'name': ''
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
		playerJoinsRoom(socket, roomId);
	});

	socket.on("room:leave", function () {
		l(socket.id + " leaves");
		playerLeavesRoom(socket);
		io.to(socket.id).emit('room:left');
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

	/*socket.on("settings:update:wins", function (winsNr) {
		playerChangesWinsPerGame(socket, winsNr);
	});*/

	socket.on("game:start", function () {
		startGame(socket);
	});

	socket.on("game:player:vote", function (game) {
		playerVotedGame(socket, game);
	});

	socket.on("voting:countdown:ended", function (game) {
		playerVotingEnded(socket);
	});

	socket.on("game:finished", function () {
		playerWon(socket);
	});

	/*socket.on("game:select", function (game) {
		playerSelectedGame(socket, game);
	});*/
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
	// TODO proper class + constructor
	rooms[roomId] = {
		"id": roomId,
		"admin": socket.id,
		"open": false, // hotjoin
		"players": [socket.id],
		"wins": 3,
		"gameStarted": false,
		"votingStarted": false,
		"currentGame": undefined,
		"objective": undefined,
		"scores": {},
		"votes": {}
	};
	// init scores
	rooms[roomId]['scores'][socket.id] = 0;

	// init vote status tracker
	votes[roomId] = {};
	votes[roomId][socket.id] = false;

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
		if (!room["open"] && room["gameStarted"]) {
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

			// player vote timer hasn't run out
			votes[roomId_][socket.id] = false;
			// give generic name
			players[socket.id]['name'] = 'PLAYER_' + rooms[roomId_]['players'].length;

			// give player info about other players
			getPlayersForRoom(socket);
			// give player room info
			io.to(socket.id).emit('room:join:success', rooms[roomId_]);
			// inform all players about new player
			io.to(roomId_).emit('room:join:player', players[socket.id], rooms[roomId_]['players']);
			// update all scores with new one
			io.to(roomId_).emit('settings:update:scores', rooms[roomId_]['scores']);
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
			// votes deletion as well
			// player vote timer hasn't run out
			delete votes[roomId];
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
			// notify room if game has started
			io.to(roomId).emit('room:update:scores', room['scores']);

			//delete vote
			if (room['votes'][socket.id]) {
				delete room['votes'][socket.id]
				io.to(roomId).emit('game:voted', rooms[roomId]);
			}

			// delete player from the vote countdown list
			delete votes[roomId][socket.id];

			// remove player from room
			room['players'] = arrayRemove(room['players'], socket.id);
			// notifiy room
			io.to(roomId).emit('room:update:playerLeft', players[socket.id]);
		}

		// can the game commence?
		if (room['gameStarted'] && room['players'].length < 2) {
			// game has not enough players to keep on playing
			l("Game only has one player left");
			//goToWinScreen(roomId);
			io.to(roomId).emit('game:won:done', rooms[roomId]);
		}
	}
}

function playerChangesImage(socket, iconNr) {
	// check if valid
	if (!msgIsInteger(socket, iconNr)) {
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
	l(socket.id + " has new name: " + name);
	// set name
	players[socket.id]['name'] = name;
	// notify if in room, will trigger a msg to the player though
	if (playerHasRoom(socket)) {
		io.to(getPlayerRoomId(socket)).emit('settings:player:name', players[socket.id]);
	}
}

// Player claims all objectives are finished 
// which means the scores have to be updated
function playerWon(socket){
	// Are you even playing?
	if (
		!playerHasRoom(socket)
	) {
		return;
	}
	l(socket.id + " has won a game");

	// increase score for player in room
	let roomId = getPlayerRoomId(socket);
	let score = rooms[roomId]['scores'][socket.id] + 1;
	rooms[roomId]['scores'][socket.id] = score;
	// have 3 games been played?
	if(score >= MAX_WINS) {
		// GAME OVER, player has won
		rooms[roomId]['gameStarted'] = false;
		// Inform others
		io.to(roomId).emit('game:won:done', rooms[roomId]);
	} else {
		// Game goes on, inform others
		io.to(roomId).emit('game:player:won', rooms[roomId]);
	}
}

/*function playerChangesWinsPerGame(socket, winsNr) {
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
}*/

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
	/*if (room['players'].length < 2) {
		io.to(socket.id).emit('game:start:notEnoughPlayers', 'Not enough players play a game!');
		return;
	}*/

	// Starting a game will bring to player voting screen
	// update and notify
	room['gameStarted'] = true;
	io.to(getPlayerRoomId(socket)).emit('game:started');
	room['votingStarted'] = true;
	io.to(getPlayerRoomId(socket)).emit('voting:started');
}

// Player can vote until timer has run out
function playerVotedGame(socket, game) {
	// valid vote?
	if(Object.keys(objectives).indexOf(game) === -1 && game !== 'random'){
		// FRAUD
		io.to(socket.id).emit('general:com', 'Not a valid game!');
		return;
	}
	
	// update vote and inform others
	if (playerHasRoom(socket)) {
		l(socket.id + " voted for " + game);
		let roomId = getPlayerRoomId(socket);
		rooms[roomId]['votes'][socket.id] = game;
		io.to(getPlayerRoomId(socket)).emit('game:voted', rooms[roomId]);
	}
}

// a player informs the server that its voting countdown has run out
function playerVotingEnded(socket) {
	// part of a room?
	if (playerHasRoom(socket)) {
		l("countdown ended for " + socket.id);
		// update voting status status for player in room (server side)
		let roomId = getPlayerRoomId(socket);
		votes[roomId][socket.id] = true;
		// has every player finished voting?
		if (Object.values(votes[roomId]).every(playerCountdownDone => playerCountdownDone == true)) {
			l("countdown ended for room: " + roomId);
			
			// count votes
			// can probably be optimized
			let voteCounts = {
				'sound': 0,
				'sketch': 0,
				'pose': 0,
				'random': 0
			}
			
			let playerVotes = Object.values(rooms[roomId]['votes']);
			for (let i = 0; i < playerVotes.length; i++) {
				var gameType = playerVotes[i];
				voteCounts[gameType] = voteCounts[gameType] + 1;
			}

			// get chosen game
			// TODO doesn't random select on draw, implement
			let chosenGame = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b);
			// is chosen game random?
			if(chosenGame == 'random'){
				// select random game
				chosenGame = Object.keys(objectives)[Math.floor(Math.random() * 3)]
			}

			l('chosen game: ' + chosenGame);
			// set chosen game
			rooms[roomId]['currentGame'] = chosenGame;
			// end voting
			rooms[roomId]['votingStarted'] = false;
			// reset votes
			rooms[roomId]['votes'] = {};
			// generate objectives for game
			rooms[roomId]['objectives'] = getObjectives(chosenGame);
			// inform players
			io.to(getPlayerRoomId(socket)).emit('voting:result', rooms[roomId]);

			// reset votes (server side)
			Object.keys(votes[roomId]).forEach(voter => votes[roomId][voter] = false);
		}
	}
}

/*function playerSelectedGame(socket, game){
	// todo validate game param
	
	if (
		!playerIsAdmin(socket) ||
		!playerHasRoom(socket)
	) {
		return;
	}

	let roomId = getPlayerRoomId(socket);
	io.to(getPlayerRoomId(socket)).emit('game:selected', game);
}*/

/*function goToWinScreen(roomId) {
	l("game finished in room: " + roomId);
	io.to(roomId).emit('game:final:winScreen', rooms[roomId]);
}*/

// MISC & UTIL

// Objectives per game. Different games have a different amount of objectives
function getObjectives(game){
	let gameObjectives = objectives[game];
	let indeces = [];
	let count;
	if(game == 'sound') {
		count = 3
	} else if (game == 'pose'){
		count = 2
	} else {
		// sketch
		count = 1;
	}
	while(indeces.length < count){
		let i = Math.floor(Math.random() * gameObjectives.length);
		if(indeces.indexOf(i) === -1) indeces.push(i);
	}
	
	var objs = [];
	indeces.forEach(idx => objs.push(gameObjectives[idx]));
	return objs;
}

function getPlayerRoomId(socket) {
	return players[socket.id]['room'];
}

function getPlayerRoom(socket) {
	return rooms[getPlayerRoomId(socket)];
}

// check if player is part of a room, emits result
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
		io.to(socket.id).emit('game:settings:notAdmin', 'Not admin!');
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

// uses ceil -> numbers range from 1 to max
// floor -> numbers range from 0 to max-1
function getRandomInt(max) {
	return Math.ceil(Math.random() * max);
}

// LAST
http.listen(SERVER_PORT, function () {
	console.log('listening on port: ' + SERVER_PORT);
});


