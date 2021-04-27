function draw() {
  background(220);
}
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
let poseLabel = "Y";

let state = 'waiting';
let targetLabel;

function keyPressed() {
	if (key == 's') {
		brain.saveData();
	} else {
		targetLabel = key;
		console.log(targetLabel);
		setTimeout(function() {
			console.log('collecting');
			state = 'collecting';
				setTimeout(function() {
				console.log('not collecting');
				state = 'waiting';
			}, 10000);
		}, 10000);
	}
}

function setup() {
	createCanvas(1280, 720);
	capture = createCapture(constraints);
	poseNet = ml5.poseNet(capture, modelReady);

	poseNet.on('pose', (results) => {
		poses = results;
	});
	capture.hide();

	let options = {
		input: 34,
		output: 2,
		task: 'classification',
		debug: true
	}

	brain = ml5.neuralNetwork(options);	
    const modelInfo = {
      model: 'model.json',
      metadata: 'model_meta.json',
      weights: 'model.weights.bin',
    };
    brain.load(modelInfo, brainLoaded);
    //brain.loadData('ymca.json', dataReady);
}

function brainLoaded() {
  console.log('pose classification ready!');
  
  classifyPose();
}

function classifyPose(){
  if (poses.length > 0 ) {
  	console.log(poses);
    let input = [];
    for (let i = 0; i < poses.length; i++) {
    	for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
	        let x = poses[i].pose.keypoints[j].position.x;
	        let y = poses[i].pose.keypoints[j].position.y;
	        input.push(x);
	        input.push(y);
    	}
    }
    brain.classify(input, gotResult);   
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results){
	console.log(results[0].confidence)
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label;
    console.log(results[0].confidence);
  }
  classifyPose();
}

function dataReady(){
  brain.normalizeData();
  brain.train({epochs: 10}, finished);
}

function finished(){
  console.log('model trained');
  brain.save();
}

function draw() {
    push();
	background(255);
	image(capture, 0, 0, capture.width, capture.height);
	drawKeypoints();
	drawSkeleton();
    pop();
    fill(255,0,255);
    noStroke();
    textSize(256);
    textAlign(CENTER, CENTER);
    text(poseLabel, width/2, height/2);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	// Loop through all the poses detected
	for (let i = 0; i < poses.length; i++) {
		// For each pose detected, loop through all the keypoints
		let pose = poses[i].pose;
		for (let j = 0; j < pose.keypoints.length; j++) {
			// A keypoint is an object describing a body part (like rightArm or leftShoulder)
			let keypoint = pose.keypoints[j];
			// Only draw an ellipse is the pose probability is bigger than 0.2
			if (keypoint.score > 0.2) {
				fill(255, 0, 0);
				noStroke();
				ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
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
		for (let j = 0; j < skeleton.length; j++) {
			let partA = skeleton[j][0];
			let partB = skeleton[j][1];
			stroke(255, 0, 0);
			line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
		}
	}
}

function gotPoses(poses) {
	if (poses.length > 0) {
		pose = poses[0].pose;
		skeleton = poses[0].skeleton;

		if (state == 'collecting') {

			let input = [];
			for (let i = 0; i < pose.keypoints.length; i++) {
				let x = pose.keypoints[i].position.x;
				let y = pose.keypoints[i].position.y;
				input.push(x);
				input.push(y);
			}
			let target = [targetLabel];

			brain.addData(input, target);
		}
	}
}

function modelReady() {
	console.log("Model ready!");
}