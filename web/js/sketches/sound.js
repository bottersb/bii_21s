function Sound() {

	const logoH = 50, imgDim = 100, labelDim = 200, btnDim = 30, txtSize = 32;
	
	var drawingX, drawingY, drawingW = 512, drawingH = 512;

	let initialized = false;
	let intro, fade = 255;
	let strokeColor = 'black';

	let btn_objective, btn_result;
	let btns = [];

	// win indication
	let c = 'white', weight = 4, matchesRequired = 3, matchIndicatorW = 15;

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

		sound_classifier = ml5.soundClassifier(modelURL + 'animalnoises/model.json', function(){
			l('Sound Classifier loaded');
		});
		sound_classifier.classify(gotSoundResult);

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
				this.leave();
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
			for(let j = 0; j < soundMatches; j++) {
				circle((windowWidth/2) + (matchIndicatorW/2) - (matchesRequired*matchIndicatorW) + ((j+1)*matchIndicatorW),7*windowHeight/8,matchIndicatorW);
			}

			image(barn['barn'], windowWidth / 2, windowHeight / 2, windowWidth/2.5, windowHeight/2);
			// Draw the label in the canvas

			switch (currObjective) {
				case 'Cat':
					image(barn['Cat'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/2, (windowHeight / 4)/2);
					break;
				case 'Dog':
					image(barn['Dog'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/2.1, (windowHeight / 4)/2.1);
					break;
				case 'Cow':
					image(barn['Cow'], windowWidth / 2, windowHeight / 2, (windowWidth/ 6)/1.5, (windowHeight / 4)/1.5);
					break;
				case 'Duck':
					image(barn['Duck'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/1.5, (windowHeight / 4)/1.5);
					break;
				case 'Frog':
					image(barn['Frog'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/2.5, (windowHeight / 4)/2.5);
					break;
				case 'Goat':
					image(barn['Goat'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/1.8, (windowHeight / 4)/1.8);
					break;
				case 'Owl':
					image(barn['Owl'], windowWidth / 2, windowHeight / 2, (windowWidth/ 7)/2, (windowHeight / 5)/2);
					break;
				default:
					break;
			}

			drawingX = windowWidth / 2 - drawingW / 2;
			drawingY = windowHeight / 2 - drawingH / 2;

			btn_objective.locate(windowWidth / 2 - labelDim - 10, drawingY+drawingH+btnDim);
			btn_result.locate(windowWidth / 2 + 10, drawingY+drawingH+btnDim);

			btn_objective.text = "Sound: " + currObjective;
			btn_result.text = "Recognised: " + soundLabel;

			if(currObjective == soundLabel){
				soundMatches += 1;
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
		soundMatches = 0;
		//l("args: " + this.sceneArgs);
		positionElements();
	}

	this.leave = function () {
		// sound classifier should be stopped here
	}

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
}