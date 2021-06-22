function Sound() {

	const logoH = 50, imgDim = 100, labelDim = 200, btnDim = 30, txtSize = 32;
	
	var drawingX, drawingY, drawingW = 512, drawingH = 512;

	let initialized = false;
	let intro = false, fade = 255;
	let strokeColor = 'black';

	let btn_objective, btn_result, btn_dones;
	let btns = [];

	this.setup = function () {
		btn_objective = new Clickable();
		//btn_objectives.text = "Pose: " + room['objectives'][0];
		btn_objective.text = "Sound: " + currObjective;
		btn_objective.textColor = strokeColor;
		btn_objective.textSize = txtSize;
		btn_objective.textScaled = true;
		btn_objective.resize(labelDim, btnDim);
		btns.push(btn_objective);

		btn_result = new Clickable();
		btn_result.text = "Recognised: " + poseLabel;
		btn_result.textColor = strokeColor;
		btn_result.textSize = txtSize;
		btn_result.textScaled = true;
		btn_result.resize(labelDim, btnDim);
		btns.push(btn_result);

		/*btn_dones = new Clickable();
		btn_dones.text = "Done: " + countDone() + "/" + objectivesDone.length + " Poses";
		btn_dones.textColor = strokeColor;
		btn_dones.textSize = txtSize;
		btn_dones.textScaled = true;
		btn_dones.resize(labelDim, btnDim);
		btns.push(btn_results);*/

		initialized = true;
	}

	this.draw = function () {
		noStroke();
		drawBackground();
		image(this.sceneManager.logo, windowWidth / 2, windowHeight / 8, imgDim, logoH);

		if (intro) {
			fill(10, 10, 10, fade);
			rect(0, 0, windowWidth, windowHeight);
			fill(240, 240, 240, fade);
			noStroke();
			textSize(txtSize);
			let instructions = "Do three sounds the fastest!";
			text(instructions, windowWidth / 2 - textWidth(instructions) / 2, windowHeight / 2);
			fade -= 3;
			if (fade <= 0) {
				intro = false;
				//classifying = true;
			}
		} else {
			

			image(barn['barn'], windowWidth / 2, windowHeight / 2, windowWidth/2.5, windowHeight/2);
			// Draw the label in the canvas

			switch (currObjective) {
				case 'Cat':
					image(barn['Cat'], 2*windowWidth / 6.3, windowHeight / 1.58, (windowWidth/ 7)/2, (windowHeight / 4)/2);
					break;
				case 'Dog':
					image(barn['Dog'], 2 * windowWidth / 5, windowHeight / 1.5, (windowWidth/ 7)/2.1, (windowHeight / 4)/2.1);
					break;
				case 'Dow':
					image(barn['Cow'], 4 * windowWidth / 8, windowHeight / 1.6, (windowWidth/ 6)/1.5, (windowHeight / 4)/1.5);
					break;
				case 'Duck':
					image(barn['Duck'], 6 * windowWidth / 10, windowHeight / 1.55, (windowWidth/ 7)/1.5, (windowHeight / 4)/1.5);
					break;
				case 'Frog':
					image(barn['Frog'], 6 * windowWidth / 9, windowHeight / 2.2, (windowWidth/ 7)/2.5, (windowHeight / 4)/2.5);
					break;
				case 'Goat':
					image(barn['Goat'], 6.3 * windowWidth / 9, windowHeight / 1.6, (windowWidth/ 7)/1.8, (windowHeight / 4)/1.8);
					break;
				case 'Owl':
					image(barn['Owl'],  4*windowWidth / 9, windowHeight / 2.6, (windowWidth/ 7)/2, (windowHeight / 5)/2);
					break;
				default:
					break;
			}

			drawingX = windowWidth / 2 - drawingW / 2;
			drawingY = windowHeight / 2 - drawingH / 2;

			btn_objective.locate(windowWidth / 2 - labelDim - 10, drawingY+drawingH+btnDim);
			btn_result.locate(windowWidth / 2 + 10, drawingY+drawingH+btnDim);

			btn_result.text = "Recognised: " + soundLabel;

			btns.forEach(btn => {
				btn.draw();
			});
		}
	}

	this.enter = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		nextObjective();
		l("args: " + this.sceneArgs);
		positionElements();
	}

	this.leave = function () { }

	this.resize = function () {
		positionElements();
	}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	this.isInitialized = function () {
		return initialized;
	}

	function positionElements() {

		btn_objective.locate(windowWidth / 2 - labelDim - 10, 6*windowHeight/8);
		btn_result.locate(windowWidth / 2 + 10, 6*windowHeight/8);
		//btn_dones.locate(windowWidth / 2 - labelDim/2, 7*windowHeight/8);
	}

	function countDone() {
		var count = 0;
		objectivesDone.forEach(function (e) {
			if (e) {count += 1;}
		});
		return count;
	}
}