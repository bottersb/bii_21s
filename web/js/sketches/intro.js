function Intro() {

	const duration = 30;
	var sections = 16, section;

	var btnW = 100, btnH = 32;

	var btns = [], btn_newGame, btn_joinGame;

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		noStroke();
		section = TWO_PI / sections;

		btn_newGame = new Clickable();     //Create button
		btn_newGame.text = "NEW GAME";       //Text of the clickable (string)
		btn_newGame.resize(btnW,btnH);
		btn_newGame.onPress = function () {  //When myButton is pressed
			//TODO change scene to lobby
			print("new game");
			newGame();
		}
		btns.push(btn_newGame);
		
		btn_joinGame = new Clickable();     //Create button
		btn_joinGame.text = "JOIN GAME";       //Text of the clickable (string)
		btn_joinGame.resize(btnW,btnH);
		btn_joinGame.onPress = function () {  //When myButton is pressed
			//TODO check for inserted code
			print("join game");
		}
		btns.push(btn_joinGame);
		
		this.btns = btns;

		positionButtons();
	}

	function newGame(){
		this.mgr.newRoomDelegate();
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
		btn_newGame.locate((windowWidth / 2) - (btnW/2), (windowHeight/2) - (btnH / 2));
		btn_joinGame.locate((windowWidth / 2) - (btnW/2), (2*windowHeight/3) - (btnH / 2));
	}

	this.resize = function () {
		positionButtons();
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}