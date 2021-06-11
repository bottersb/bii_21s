// basic scene template
function GameSelect() {

	var imgDim = 100, txtSize = 20, c = 'white', weight = 4, bgc = 'steelblue';

	var btn_gameSound, btn_gamePose, btn_gameSketch, btn_gameRandom;

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
		btns.push(btn_gameSketch);

		btn_gameRandom = new Clickable();
		btn_gameRandom.color = bgc;
		btn_gameRandom.strokeWeight = weight;
		btn_gameRandom.cornerRadius = weight;
		btn_gameRandom.stroke = c;
		btn_gameRandom.textColor = c;
		btn_gameRandom.textSize = txtSize;
		//btn_gameRandom.image = gameIcons['sound'];
		btn_gameRandom.text = "?\nRANDOM";
		btn_gameRandom.resize(imgDim, imgDim);
		btns.push(btn_gameRandom);

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
		positionElements();
	}
	this.leave = function () { }
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
	}

	this.isInitialized = function () {
		return initialized;
	}
}