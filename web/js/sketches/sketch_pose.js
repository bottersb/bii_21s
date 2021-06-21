// basic scene template
function sketch_pose(){

	let capture;
	let constraints = {
	video: {
		mandatory: {
			minWidth: 1280,
			minHeight: 720
		},
		optional: [{ maxFrameRate: 30 }]
	},
		audio: false
	};

	let poseNet, poses = [];
	let brain;
	let poseLabel = "?";

	var btnW = 100, btnH = 32, margin = 4, imgDim = 100;

	var btns = [];

	//0 is collect, 1 is train, 2 is deploy
	let debug = 2;

	const fireworks = [];
	let gravity;

	let state = 'waiting';
	let targetLabel;

	this.setup = function () {
		capture = createCapture(constraints);
		poseNet = ml5.poseNet(capture, modelReady);

		poseNet.on('pose', (results) => {
			poses = results;
			// COLLECT
			if (debug == 0) {
				gotPoses(poses);
			}
		});
		capture.hide();

		colorMode(RGB);
		gravity = createVector(0, 0.2);

		stroke(255);
		strokeWeight(4);
		background(0);

		let options = {
			input: 9*2,
			output: 5,
			task: 'classification',
			debug: true
		}

		brain = ml5.neuralNetwork(options);
		const modelInfo = {
			model: 'http://localhost:8080/data/pose/model.json',
			metadata: 'http://localhost:8080/data/pose/model_meta.json',
			weights: 'http://localhost:8080/data/pose/model.weights.bin',
		};

		// TRAIN
		if (debug == 1) {
			brain.loadData('http://localhost:8080/data/pose/' + 'trained.json', dataReady);
		}
		//DEPLOY
		if (debug == 2) {
			brain.load(modelInfo, brainLoaded);
		}

		btn_nextGame = new Clickable();
		btn_nextGame.text = "NEXT GAME";
		btn_nextGame.resize(btnW, btnH);
		btn_nextGame.onPress = function () {
			l("Next game");
			gotoGameSelect();
		}
		btns.push(btn_nextGame);

		btn_endGame = new Clickable();
		btn_endGame.text = "END GAME";
		btn_endGame.resize(btnW, btnH);
		btn_endGame.onPress = function () {
			l("End game");
			leaveRoom();
		}
		btns.push(btn_endGame);
	}
	this.draw = function () {
		//if (state == "waiting"){
			drawBackground();
			image(capture, windowWidth/2, windowHeight/1.6, capture.width, capture.height);
			drawKeypoints();
			//drawSkeleton();
			stroke(0);
			strokeWeight(4);
			fill(255, 205, 0);
			rect(width / 2.21 - textWidth(poseLabel)/2*0.9, height/9,textWidth(poseLabel)*1.5,height/10);
			fill(255,0,255);
			noStroke();
			textSize(50);
			textAlign(CENTER, CENTER);
			text(poseLabel.toUpperCase(), width/2, height/6);
			if (debug == 0) {
				let i = 0;
				switch (key) {
					case 's':
						brain.saveData();
						break;
					case 'a': //chair
						targetLabel = "Chair";
						i = 1;
						break;
					case 't': // Warrior
						targetLabel = "Warrior";
						i = 1;
						break;
					case 'c': //tree
						targetLabel = "Half Standing Fold";
						i = 1;
						break;
					case 'i': // Mountain
						targetLabel = "Mountain";
						i = 1;
						break;
					case 'u': //butterfly
						targetLabel = "Triangle";
						i = 1;
						break;
				}
				if (i == 1){
					console.log(targetLabel);
					setTimeout(function () {
						console.log('collecting');
						state = 'collecting';
						setTimeout(function () {
							console.log('not collecting');
							state = 'waiting';
						}, 10000);
					}, 5000);
				}
				key = 'v';
			}
		//}
		// Creates the win screen
		/*
		else if (state == "won"){
			drawBackground();
			stroke(0);
			strokeWeight(4);
			textSize(200);
			textAlign(CENTER, CENTER);
			fill(89, 254, 0);
			text("You Won!", width/2, height/4);
			textSize(50);
			fill(254, 128, 82);
			textAlign(CENTER, CENTER);

			let pRows = 2, pCols = 4;
			let pIds = Object.keys(players);
			let i = 0;

			for (let pRow = 0; pRow < pRows; pRow++) {
				for (let pCol = 0; pCol < pCols; pCol++) {
					let p = pIds[(pRow * pCols) + pCol];
					if (p !== undefined) {
						text(players[p]['name'] + ": " + room['scores'][p], width/2, height/2 + 60*i);
						i++;
					}
				}
			}




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

			btn_nextGame.locate((windowWidth / 2) - (btnW) - btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
			btn_endGame.locate((windowWidth / 2) + btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
			btns.forEach(btn => {
				btn.draw();
			});
		}

		else if (room['gameStarted'] == false){
			drawBackground();
			stroke(0);
			strokeWeight(4);
			textSize(200);
			textAlign(CENTER, CENTER);
			fill(254, 58, 2);
			text("You Lost!", width/2, height/4);
			textSize(50);
			fill(254, 128, 82);
			textAlign(CENTER, CENTER);

			let pRows = 2, pCols = 4;
			let pIds = Object.keys(players);
			let i = 0;

			for (let pRow = 0; pRow < pRows; pRow++) {
				for (let pCol = 0; pCol < pCols; pCol++) {
					let p = pIds[(pRow * pCols) + pCol];
					if (p !== undefined) {
						text(players[p]['name'] + ": " + room['scores'][p], width/2, height/2 + 60*i);
						i++;
					}
				}
			}
			btn_nextGame.locate((windowWidth / 2) - (btnW) - btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
			btn_endGame.locate((windowWidth / 2) + btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
			btns.forEach(btn => {
				btn.draw();
			});
		} */

	}
	function dataReady(){
	  brain.normalizeData();
	  brain.train({epochs: 10}, finished);
	}

	function finished(){
	  console.log('model trained');
	  brain.save();
	}

	this.enter = function () {}
	this.leave = function () {}
	this.resize = function () {
		btn_nextGame.locate((windowWidth / 2) - (btnW / 2), (windowHeight / 1.4) - (btnH / 2));
		btn_endGame.locate((windowWidth / 2) + (btnW / 2), (windowHeight / 1.4) + (btnH / 2));
	}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
	function brainLoaded() {
		console.log('pose classification ready!');
		classifyPose();
	}
	function classifyPose(){
		if (poses.length > 0 ) {
			let input = [];
			for (let i = 0; i < poses.length; i++) {
				for (let j = 0; j < poses[i].pose.keypoints.length - 4; j++) {
					switch (j) {
						case 0:			// Nose
						case 5:			// leftShoulder
						case 6:			// rightShoulder
						case 7:			// leftElbow
						case 8:			// rightElbow
						case 9:			// leftWrist
						case 10:		// rightWrist
						case 11:		// leftHip
						case 12:		// rightHip
							let x = poses[i].pose.keypoints[j].position.x;
							let y = poses[i].pose.keypoints[j].position.y;
							input.push(x);
							input.push(y);
							break;
						default: break;
					}
				}
			}
			brain.classify(input, gotResult);
		} else {
			setTimeout(classifyPose, 100);
		}
	}

	function gotResult(error, results){
		if (state == "waiting"){
			if (results[0].confidence > 0.1) {
				poseLabel = results[0].label;
				console.log(results[0].confidence);
				console.log(results[0].label);
			}
			// Checks if the player won
			if (poseLabel == room['objective']) {
				state = "won";
				//updateWins();
			}
			classifyPose();
		}
	}
	// A function to draw ellipses over the detected keypoints
	function drawKeypoints() {
		// Loop through all the poses detected
		//console.log(poses);
		for (let i = 0; i < poses.length; i++) {
			// For each pose detected, loop through all the keypoints
			let pose = poses[i].pose;
			for (let j = 0; j < pose.keypoints.length - 4; j++) {
				switch (j) {
					case 0:			// Nose
					case 5:			// leftShoulder
					case 6:			// rightShoulder
					case 7:			// leftElbow
					case 8:			// rightElbow
					case 9:			// leftWrist
					case 10:		// rightWrist
					case 11:		// leftHip
					case 12:		// rightHip
						// A keypoint is an object describing a body part (like rightArm or leftShoulder)
						let keypoint = pose.keypoints[j];
						// Only draw an ellipse is the pose probability is bigger than 0.2
						if (keypoint.score > 0.3) {
							fill(255, 0, 0);
							noStroke();
							ellipse(keypoint.position.x + windowWidth/5, keypoint.position.y + windowHeight/3.8, 20, 20);
						}
						break;
					default: break;
				}
			}
		}
	}

	// A function to draw the skeletons
	function drawSkeleton() {
		// Loop through all the skeletons detected
		for (let i = 0; i < poses.length; i++) {
			let skeleton = poses[i].skeleton;
			// For every skeleton, loop through all body connections
			for (let j = 0; j < skeleton.length - 6; j++) {
				let partA = skeleton[j][0];
				let partB = skeleton[j][1];
				stroke(255, 0, 0);
				line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
			}
		}
	}

	function modelReady() {
		console.log("Model ready!");
	}

	function gotPoses(poses) {
		if (poses.length > 0) {
			pose = poses[0].pose;
			skeleton = poses[0].skeleton;

			if (state == 'collecting') {

				let input = [];
				for (let i = 0; i < pose.keypoints.length - 4; i++) {
					switch (i) {
						case 0:			// Nose
						case 5:			// leftShoulder
						case 6:			// rightShoulder
						case 7:			// leftElbow
						case 8:			// rightElbow
						case 9:			// leftWrist
						case 10:		// rightWrist
						case 11:		// leftHip
						case 12:		// rightHip
							let x = pose.keypoints[i].position.x;
							let y = pose.keypoints[i].position.y;
							input.push(x);
							input.push(y);
							break;
						default:
							break;
					}
				}
				let target = [targetLabel];

				brain.addData(input, target);
			}
		}
	}
}