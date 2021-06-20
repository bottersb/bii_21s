// basic scene template
function GameSelect() {

	var imgDim = 80, txtSize = 17, c = 'white', weight = 4, btnc = 'steelblue', btncHover = 'skyblue';

	var btn_gameSound, btn_gamePose, btn_gameSketch, btn_gameRandom,
		btn_countDown, btn_info;

	let countDown = 5;

	btns = [];

	var DEBUG = { 'enabled': false };

	var gameTypeHPosOffset = {
		'sound': 2,
		'sketch': 3,
		'pose': 4,
		'random': 5
	}

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CORNER);
		rectMode(CORNER);
		textSize(txtSize);

		if (DEBUG['enabled']) {
			let debugDate = getDebugData();
			DEBUG['room'] = debugDate['room'];
			DEBUG['players'] = debugDate['players'];
		}

		btn_gameSound = new Clickable();
		btn_gameSound.color = btnc;
		btn_gameSound.strokeWeight = weight;
		btn_gameSound.cornerRadius = weight;
		btn_gameSound.stroke = c;
		btn_gameSound.textColor = c;
		btn_gameSound.textSize = txtSize;
		btn_gameSound.image = gameIcons['sound'];
		btn_gameSound.text = "SOUND";
		btn_gameSound.resize(imgDim, imgDim);
		btn_gameSound.onHover = btnOnHoverColor;
		btn_gameSound.onOutside = btnOnOutsideColor;
		btn_gameSound.onPress = function () {
			voteForGame('sound');
		};
		btns.push(btn_gameSound);

		btn_gamePose = new Clickable();
		btn_gamePose.color = btnc;
		btn_gamePose.strokeWeight = weight;
		btn_gamePose.cornerRadius = weight;
		btn_gamePose.stroke = c;
		btn_gamePose.textColor = c;
		btn_gamePose.textSize = txtSize;
		btn_gamePose.image = gameIcons['pose'];
		btn_gamePose.text = "POSE";
		btn_gamePose.resize(imgDim, imgDim);
		btn_gamePose.onHover = btnOnHoverColor;
		btn_gamePose.onOutside = btnOnOutsideColor;
		btn_gamePose.onPress = function () {
			voteForGame('pose');
		};
		btns.push(btn_gamePose);

		btn_gameSketch = new Clickable();
		btn_gameSketch.color = btnc;
		btn_gameSketch.strokeWeight = weight;
		btn_gameSketch.cornerRadius = weight;
		btn_gameSketch.stroke = c;
		btn_gameSketch.textColor = c;
		btn_gameSketch.textSize = txtSize;
		btn_gameSketch.image = gameIcons['sketch'];
		btn_gameSketch.text = "SKETCH";
		btn_gameSketch.resize(imgDim, imgDim);
		btn_gameSketch.onHover = btnOnHoverColor;
		btn_gameSketch.onOutside = btnOnOutsideColor;
		btn_gameSketch.onPress = function () {
			voteForGame('sketch');
		}
		btns.push(btn_gameSketch);

		btn_gameRandom = new Clickable();
		btn_gameRandom.color = btnc;
		btn_gameRandom.strokeWeight = weight;
		btn_gameRandom.cornerRadius = weight;
		btn_gameRandom.stroke = c;
		btn_gameRandom.textColor = c;
		btn_gameRandom.textSize = txtSize;
		btn_gameRandom.image = gameIcons['random'];
		btn_gameRandom.text = "RANDOM";
		btn_gameRandom.resize(imgDim, imgDim);
		btn_gameRandom.onHover = btnOnHoverColor;
		btn_gameRandom.onOutside = btnOnOutsideColor;
		btn_gameRandom.onPress = function () {
			voteForGame('random');
		};
		btns.push(btn_gameRandom);

		btn_info = new Clickable();
		btn_info.text = "VOTE A GAME!";
		btn_info.textColor = 'white';
		btn_info.color = 'crimson';
		btn_info.resize(imgDim, imgDim / 2);
		//btn_info.onRelease = voteForGame('none');
		btns.push(btn_info);

		btn_countDown = new Clickable();
		btn_countDown.text = countDown;
		btn_countDown.resize(imgDim, imgDim / 2);
		btn_countDown.textSize = txtSize;
		btns.push(btn_countDown);

		initialized = true;
	}

	this.draw = function () {
		drawBackground();
		image(this.sceneManager.logo, (width / 2) - (imgDim / 2), windowHeight / 8, imgDim, imgDim / 2);

		btns.forEach(btn => {
			btn.draw();
		});

		let r = DEBUG['enabled'] ? DEBUG['room'] : room;

		strokeWeight(weight);
		stroke(c);
		fill('deeppink');

		let votes = Object.values(r['votes']);
		let voteCounts = {
			'sound': 0,
			'sketch': 0,
			'pose': 0,
			'random': 0
		}
		for (let i = 0; i < votes.length; i++) {
			var gameType = votes[i];
			voteCounts[gameType] = voteCounts[gameType] + 1;
		}

		Object.entries(voteCounts).forEach(([k,v]) => {
			//l(k, v)
			for (let j = 0; j < v; j++) {
				//console.log(k + ":" + v);
				//console.log((windowWidth/2) + (imgDim / 2) + 50 + (40 * (v%4)) + ", " +  gameTypeHPosOffset[k] * (windowHeight / 8) + (40 * j));
				circle((windowWidth/2) + (imgDim / 2) + (20 * floor(j/4)) + 10, gameTypeHPosOffset[k] * (windowHeight / 8) + (20 * (j%4)) + 10, 15);
				//circle(100+(40*j), 10, 30);
			}
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

	btnOnHoverColor = function () {
		this.color = btncHover;
	}

	btnOnOutsideColor = function () {
		this.color = btnc;
	}

	function voteForGame(game) {
		// todo indicate personally clicked button
		castGameVote(game);
	}

	function positionElements() {
		btn_gameSound.locate((windowWidth / 2) - (imgDim / 2), gameTypeHPosOffset['sound'] * windowHeight / 8);
		btn_gameSketch.locate((windowWidth / 2) - (imgDim / 2), gameTypeHPosOffset['sketch'] * windowHeight / 8);
		btn_gamePose.locate((windowWidth / 2) - (imgDim / 2), gameTypeHPosOffset['pose'] * windowHeight / 8);
		btn_gameRandom.locate((windowWidth / 2) - (imgDim / 2), gameTypeHPosOffset['random'] * windowHeight / 8);
		btn_info.locate((windowWidth / 2) - (imgDim / 2), 6 * windowHeight / 8);
		btn_countDown.locate((windowWidth / 2) - (imgDim / 2), 6.5 * windowHeight / 8);
	}

	this.isInitialized = function () {
		return initialized;
	}
}