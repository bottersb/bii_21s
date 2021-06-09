function Intro() {

	const duration = 30;
	var sections = 16, section;

	var btnW = 100, btnH = 32;

	var btns = [], btn_newGame, btn_joinGame, btn_back, btn_enter;

	let inp_roomCode;

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		noStroke();
		section = TWO_PI / sections;

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
			//TODO check for inserted code
			print("join game");
		}
		btns.push(btn_joinGame);

		/*inp_roomCode = createInput('');
		inp_roomCode.position(0, 0);
		inp_roomCode.size(0);*/
		this.btns = btns;

		positionButtons();
	}

	function newGame() {
		newRoom();
	}

	this.enter = function () {
		positionButtons();
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

		// foreach
		btns.forEach(btn => {
			btn.draw();
		});
	}

	function positionButtons() {
		btn_newGame.locate((windowWidth / 2) - (btnW / 2), (windowHeight / 2) - (btnH / 2));
		btn_joinGame.locate((windowWidth / 2) - (btnW / 2), (2 * windowHeight / 3) - (btnH / 2));
	}

	function drawJoinForm() {
		inp_roomCode.position((windowWidth / 2) - (btnW / 2), (windowHeight / 2) - (btnH / 2));
		inp_roomCode.size(btnW);
		inp_roomCode.input(myInputEvent);
	}

	function myInputEvent() {
		console.log('you are typing: ', this.value());
	}

	this.resize = function () {
		positionButtons();
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}