function Pose() {

	const logoH = 50, imgDim = 100, labelDim = 200, btnDim = 30, txtSize = 32;
	let initialized = false;
	// set in enter
	let intro, fade = 255;
	let strokeColor = 'black';

	let btn_objective, btn_result;
	let btns = [];

	// win indication
	let c = 'white', weight = 4, matchesRequired = 2, matchIndicatorW = 15;

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
			//text(instructions, windowWidth / 2 - textWidth(instructions) / 2, windowHeight / 2);
			text(instructions, windowWidth / 2, windowHeight / 2);
			fade -= 3;
			if (fade <= 0) {
				intro = false;
				//classifying = true;
			}
		} else if (outro){
			fill(10,10,10,fade);
			rect(0,0,windowWidth,windowHeight);
			fill(240,240,240,fade);
			fade += 9;
			if(fade >= 255) {
				outro = false;
				nextScene();
			}
		} else {
			btns.forEach(btn => {
				btn.draw();
			});

			// win indicator
			strokeWeight(weight);
			stroke(c);
			
			fill('linen');
			for(let i = 1; i <= matchesRequired; i++) {
				circle((windowWidth/2) + (matchIndicatorW/2) - (matchesRequired*matchIndicatorW) + (i*matchIndicatorW),7*windowHeight/8,matchIndicatorW);
			}
			fill('deeppink');
			for(let j = 0; j < poseMatches; j++) {
				circle((windowWidth/2) + (matchIndicatorW/2) - (matchesRequired*matchIndicatorW) + ((j+1)*matchIndicatorW),7*windowHeight/8,matchIndicatorW);
			}

			// hardcoded
			image(imgYMCA, windowWidth / 2, windowHeight / 2, 200, 280);

			if (!classifyingPose && frameCount % FRAME_RATE == 0) {
				classifyingPose = true;
				classifyPose();
			}

			btn_objective.text = "Pose: " + currObjective;
			btn_result.text = "Recognised: " + poseLabel;

			if(currObjective == poseLabel){
				poseMatches += 1;
				nextObjective();
			}
		}
	}

	this.enter = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		nextObjective();
		intro = true;
		fade = 255;
		poseMatches = 0;
		//l("args: " + this.sceneArgs);
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
	}

	function classifyPose(){
		if (poses.length > 0 ) {
		  let input = [];
		  for (let i = 0; i < poses.length; i++) {
			  for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
				  let x = poses[i].pose.keypoints[j].position.x;
				  let y = poses[i].pose.keypoints[j].position.y;
				  input.push(x);
				  input.push(y);
			  }
		  }
		  pose_classifier.classify(input, gotPoseResult);   
		} else {
		  setTimeout(classifyPose, 100);
		}
	}
}