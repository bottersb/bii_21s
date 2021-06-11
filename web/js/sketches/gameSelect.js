// basic scene template
function GameSelect() {

	var imgDim = 80, txtSize = 17, c = 'white', weight = 4, bgc = 'steelblue';

	var btn_gameSound, btn_gamePose, btn_gameSketch, btn_gameRandom,
	btn_countDown, btn_info;

	let countDown = 5;

	btns = [];

	var selected = undefined;

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CORNER);
		rectMode(CORNER);
		textSize(txtSize);

		btn_gameSound = new Clickable();
		btn_gameSound.color = bgc;
		btn_gameSound.strokeWeight = weight;
		btn_gameSound.cornerRadius = weight;
		btn_gameSound.stroke = c;
		btn_gameSound.textColor = c;
		btn_gameSound.textSize = txtSize;
		btn_gameSound.image = gameIcons['sound'];
		btn_gameSound.text = "SOUND";
		btn_gameSound.resize(imgDim, imgDim);
		btn_gameSound.onHover = btnOnHover;
		btn_gameSound.onOutside = btnOnOutside;
		btns.push(btn_gameSound);

		btn_gamePose = new Clickable();
		btn_gamePose.color = bgc;
		btn_gamePose.strokeWeight = weight;
		btn_gamePose.cornerRadius = weight;
		btn_gamePose.stroke = c;
		btn_gamePose.textColor = c;
		btn_gamePose.textSize = txtSize;
		btn_gamePose.image = gameIcons['pose'];
		btn_gamePose.text = "POSE";
		btn_gamePose.resize(imgDim, imgDim);
		btn_gamePose.onHover = btnOnHover;
		btn_gamePose.onOutside = btnOnOutside;
		btns.push(btn_gamePose);

		btn_gameSketch = new Clickable();
		btn_gameSketch.color = bgc;
		btn_gameSketch.strokeWeight = weight;
		btn_gameSketch.cornerRadius = weight;
		btn_gameSketch.stroke = c;
		btn_gameSketch.textColor = c;
		btn_gameSketch.textSize = txtSize;
		btn_gameSketch.image = gameIcons['sketch'];
		btn_gameSketch.text = "SKETCH";
		btn_gameSketch.resize(imgDim, imgDim);
		btn_gameSketch.onHover = btnOnHover;
		btn_gameSketch.onOutside = btnOnOutside;
		btns.push(btn_gameSketch);

		btn_gameRandom = new Clickable();
		btn_gameRandom.color = bgc;
		btn_gameRandom.strokeWeight = weight;
		btn_gameRandom.cornerRadius = weight;
		btn_gameRandom.stroke = c;
		btn_gameRandom.textColor = c;
		btn_gameRandom.textSize = txtSize;
		btn_gameRandom.image = gameIcons['random'];
		btn_gameRandom.text = "RANDOM";
		btn_gameRandom.resize(imgDim, imgDim);
		btn_gameRandom.onHover = btnOnHover;
		btn_gameRandom.onOutside = btnOnOutside;
		btns.push(btn_gameRandom);

		btn_info = new Clickable();
		btn_info.text = "VOTE A GAME!";
		btn_info.textColor = 'white';
		btn_info.color = 'crimson';
		btn_info.resize(imgDim, imgDim/2);
		btns.push(btn_info);

		btn_countDown = new Clickable();
		btn_countDown.text = countDown;
		btn_countDown.resize(imgDim, imgDim/2);
		btn_countDown.textSize = txtSize;
		btns.push(btn_countDown);

		initialized = true;
	}
	this.draw = function () {
		drawBackground();
		image(this.sceneManager.logo, (width / 2) - (imgDim/2),  windowHeight / 8, imgDim, imgDim/2);

		btns.forEach(btn => {
			btn.draw();
		});
	}
	this.enter = function () {
		btn_countDown.text = countDown;
		positionElements();
	}
	this.leave = function () {
		countDown = 5;
	}
	this.resize = function () {
		positionElements();
	}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	function positionElements() {
		btn_gameSound.locate((windowWidth / 2) - (imgDim / 2), 2 * windowHeight / 8);
		btn_gameSketch.locate((windowWidth / 2) - (imgDim / 2), 3 * windowHeight / 8);
		btn_gamePose.locate((windowWidth / 2) - (imgDim / 2), 4 * windowHeight / 8);
		btn_gameRandom.locate((windowWidth / 2) - (imgDim / 2), 5 * windowHeight / 8);
		btn_info.locate((windowWidth / 2) - (imgDim / 2), 6 * windowHeight / 8);
		btn_countDown.locate((windowWidth / 2) - (imgDim / 2), 6.5 * windowHeight / 8);
	}

	this.isInitialized = function () {
		return initialized;
	}
}