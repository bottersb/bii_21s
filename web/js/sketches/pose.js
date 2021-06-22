function Pose() {

	const logoH = 50, imgDim = 100, labelDim = 200, btnDim = 30, txtSize = 32;
	
	let initialized = false;
	let intro = false, fade = 255;
	let strokeColor = 'black';

	let btn_objective, btn_result, btn_dones;
	let btns = [];

	var objectivesDone = [false, false];

	this.setup = function () {
		btn_objective = new Clickable();
		//btn_objectives.text = "Pose: " + room['objectives'][0];
		btn_objective.text = "Pose: " + currObjective;
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
			let instructions = "Do two poses the fastest!";
			text(instructions, windowWidth / 2 - textWidth(instructions) / 2, windowHeight / 2);
			fade -= 3;
			if (fade <= 0) {
				intro = false;
				//classifying = true;
			}
		} else {
			btns.forEach(btn => {
				btn.draw();
			});

			// hardcoded
			image(imgYMCA, windowWidth / 2, windowHeight / 2, 200, 280);
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