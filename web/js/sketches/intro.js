function Intro() {

	const duration = 30;
	var sections = 16, section;

	var btnW = 100, btnH = 32, margin = 4;

	var btns = [], btns_join = [], btn_newGame, btn_joinGame, btn_back, btn_enter;

	let inp_roomCode;

	let joinRoomView = false;

	var currError = false, errorMsg = '', fade = 255;

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		textSize(btnH);
		noStroke();
		section = TWO_PI / sections;

		inp_roomCode = createInput('');
		inp_roomCode.size(100);
		inp_roomCode.style('visibility', 'hidden');
		inp_roomCode.style('text-align', 'center');
		inp_roomCode.style('text-transform', 'uppercase');
		inp_roomCode.attribute('placeholder', 'Room Code');
		inp_roomCode.attribute('pattern', '[A-Z0-9]+');
		inp_roomCode.attribute('maxlength', 4);
		inp_roomCode.input(inputChanged);

		btn_newGame = new Clickable();
		btn_newGame.text = "NEW GAME";
		btn_newGame.resize(btnW, btnH);
		btn_newGame.onPress = function () {
			print("new game");
			newGame();
		}
		btns.push(btn_newGame);

		btn_joinGame = new Clickable();
		btn_joinGame.text = "JOIN GAME";
		btn_joinGame.resize(btnW, btnH);
		btn_joinGame.onPress = function () {
			print("join game");
			inp_roomCode.value('');
			inp_roomCode.style('visibility', 'visible');
			joinRoomView = true;
		}
		btns.push(btn_joinGame);

		btn_back = new Clickable();
		btn_back.text = "← BACK";
		btn_back.resize(btnW - margin, btnH);
		btn_back.onPress = function () {
			resetElements();
		}
		btns_join.push(btn_back);

		btn_enter = new Clickable();
		btn_enter.text = "ENTER →";
		btn_enter.resize(btnW - margin, btnH);
		btn_enter.onPress = function () {
			let validPattern = '[A-Z0-9]{4}';
			let inp_value = inp_roomCode.value();
			if (inp_value.match(validPattern)) {
				//joinRoom(roomId);
				print("Valid roomcode: " + inp_value);
				joinRoom(inp_value);
			} else {
				currError = true;
				fade = 255;
				errorMsg = 'Invalid Roomcode!'
				print("Invalid roomcode: " + inp_value);
			}
		}
		btns_join.push(btn_enter);

		this.btns = btns;
		this.btns_join = btns_join;


		positionElements();
	}

	function newGame() {
		// main socket
		newRoom();
	}

	this.joinRoomError = function (msg) {
		currError = true;
		fade = 255;
		errorMsg = msg;
	}

	this.enter = function () {
		joinRoomView = false;
		positionElements();
	}

	this.leave = function () {
		resetElements();
	}

	this.draw = function () {

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

		image(this.sceneManager.logo, width / 2, height / 3, 100, 50);

		if (joinRoomView) {
			btns_join.forEach(btn => {
				btn.draw();
			});
		} else {
			btns.forEach(btn => {
				btn.draw();
			});
		}

		if (currError) {
			fill(255, 0, 0, fade);
			text(errorMsg, (windowWidth / 2), (2 * windowHeight / 3) + btnH);
			fade += -2
			if (fade <= 0) {
				currError = false;
				fade = 255;
			}
		}
	}

	function resetElements() {
		joinRoomView = false;
		currError = false;
		fade = 255;
		inp_roomCode.style('visibility', 'hidden');
	}

	function positionElements() {
		btn_newGame.locate((windowWidth / 2) - (btnW / 2), (windowHeight / 2) - (btnH / 2));
		btn_joinGame.locate((windowWidth / 2) - (btnW / 2), (2 * windowHeight / 3) - (btnH / 2));

		// input position is offset by margin, border and padding, current 0 + 2 + 2, might be different
		let offset = 4;
		inp_roomCode.position((windowWidth / 2) - (btnW / 2) - offset, (windowHeight / 2) - (btnH / 2));
		btn_back.locate((windowWidth / 2) - (btnW), (2 * windowHeight / 3) - (btnH / 2));
		btn_enter.locate((windowWidth / 2) + margin, (2 * windowHeight / 3) - (btnH / 2));
	}

	function inputChanged() {
		this.value(this.value().toUpperCase());
	}

	this.resize = function () {
		positionElements();
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}