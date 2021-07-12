function WinScreen() {

	var btnW = 100, btnH = 32, textS = 32, textSL = 48;
	var btns = [];

	var inFade, outFade, fade = 255, halfFade = 128, duration;

	var fireworks = [];

	var res = [];

	this.setup = function () {
		btn_endGame = new Clickable();
		btn_endGame.text = "END GAME";
		btn_endGame.resize(btnW, btnH);
		btn_endGame.onPress = function () {
			l("End game");
			gameDone = false;
			mgr.leaveLobbyDelegate();
		}
		btns.push(btn_endGame);

		gravity = createVector(0, 0.1);
	}

	this.enter = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		inFade = true;
		outFade = false;
		fade = 255;
		duration = FRAME_RATE * 5;

		res.length = 0;
		fireworks.length = 0;

		for (var id in room['scores']) {
			res.push([players[id]['name'], room['scores'][id]]);
		}

		res.sort(function (a, b) {
			return b[1] - a[1];
		});

		l(res);

		positionElements();
	}

	this.leave = function () { }

	this.draw = function () {
		drawBackground();
		noStroke();
		if (inFade) {
			fill(10, 10, 10, fade);
			rect(0, 0, windowWidth, windowHeight);
			fill(240, 240, 240, fade);
			fade -= 9;
			if (fade <= (gameDone ? halfFade : 0)) {
				inFade = false;
			}
		} else if (outFade) {
			fill(10, 10, 10, fade);
			rect(0, 0, windowWidth, windowHeight);
			fill(240, 240, 240, fade);
			fade += 9;
			if (fade >= 255) {
				outFade = false;
				mgr.gotoGameSelect();
			}
		} else {
			if (gameDone) {
				fill(10, 10, 10, halfFade);
				rect(0, 0, windowWidth, windowHeight);
				
				if (random(1) < 0.04) {
					fireworks.push(new Firework());
				}
				for (let i = fireworks.length - 1; i >= 0; i--) {
					fireworks[i].update();
					fireworks[i].show();

					if (fireworks[i].done()) {
						fireworks.splice(i, 1);
					}
				}

				btns.forEach(btn => {
					btn.draw();
				});
			} else {
				duration -= 1;
				if (duration <= 0) {
					outFade = true;
				}
			}

			strokeWeight(4);
			stroke('orchid');
			fill('indigo');
			textSize(textSL);
			textAlign(CENTER, CENTER);
			text('SCORES', windowWidth / 2, 2 * windowHeight / 16);

			strokeWeight(3);
			stroke('navy');
			fill('plum');
			textSize(textS);
			// 4/16
			let nameYOff = 4;
			let i = 1, prevScore = -1;
			res.forEach(function (score) {
				if (prevScore == score[1]) {
					text("   " + score[0] + " - " + score[1], windowWidth / 2, nameYOff * windowHeight / 16);
				} else {
					text(i + ". " + score[0] + " - " + score[1], windowWidth / 2, nameYOff * windowHeight / 16);
					i += 1;
				}
				prevScore = score[1];
				nameYOff += 1;
			});
		}
	}

	this.resize = function () {
		positionElements();
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	function positionElements() {
		btn_endGame.locate(windowWidth / 2 - (btnW/2), 13 * windowHeight / 16);
	}
}