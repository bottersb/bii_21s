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
let objectiveLabel = "l";

let currentPoints = [10,20]
let numberOfPlayers = 2

const fireworks = [];
let gravity;

let state = 'working';
let targetLabel;

let hudCenter;

var modelURL = 'http://localhost:8080/data/pose/';

function keyPressed() {
	if (key == 'w') {
		console.log('end');
		state = "end";
	}
}

function setup() {
	createCanvas(windowWidth - 20, windowHeight - 30);
	capture = createCapture(constraints);
	poseNet = ml5.poseNet(capture, modelReady);

	poseNet.on('pose', (results) => {
		poses = results;
	});
	capture.hide();

	colorMode(RGB);
	gravity = createVector(0, 0.2);

	stroke(255);
  	strokeWeight(4);
  	background(0);

	let options = {
		input: 34,
		output: 10,
		task: 'classification',
		debug: true
	}

	brain = ml5.neuralNetwork(options);	
    const modelInfo = {
      model: modelURL + 'model.json',
      metadata: modelURL + 'model_meta.json',
      weights: modelURL + 'model.weights.bin',
    };
    brain.load(modelInfo, brainLoaded);

}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose(){
  if (poses.length > 0 ) {
    let input = [];
    for (let i = 0; i < poses.length; i++) {
    	for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
  			if (poses[i].pose.keypoints[j].score > 0.2){
 	        let x = poses[i].pose.keypoints[j].position.x;
	        let y = poses[i].pose.keypoints[j].position.y;
	        input.push(x);
	        input.push(y);
	      }
    	}
    }
    brain.classify(input, gotResult);   
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results){
  if (state == "working"){
	  if (results[0].confidence > 0.75) {
	    poseLabel = results[0].label;
	    console.log(results[0].confidence);
   	    console.log(results[0].label);
	  }
	  // Checks if the player won
	  if (poseLabel == objectiveLabel){
	  	state = "Won";

	  }

	  classifyPose();
	}
}

function draw() {
	if (state == "working"){
	    push();
		background(255);
		image(capture, 0, 0, capture.width, capture.height);
		drawKeypoints();
		drawSkeleton();
	    fill(255,0,255);
	    noStroke();
	    textSize(256);
	    textAlign(CENTER, CENTER);
	    text(poseLabel, width/2, height/2);
	    pop();    

	}
	// Creates the win screen
	
	else if (state == "Won"){
		push();
		background(0);
		fill(0,255,255);
		noStroke();
		textSize(200);
	    textAlign(CENTER, CENTER);
	    text("You Won!", width/2, height/2 - 100);
	    fill(255,255,0);
	    textSize(50);
	    for (let i = 0; i < numberOfPlayers; i++)
	    {
	    	text("Player " + (i+1) + ": " + currentPoints[i], width/2, height/2 + 70 + 60*i);
	    }	    
	    colorMode(RGB);  
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
		pop();
		button = createButton('Continue to the next game');
  		button.position(width/2 - 45, height/2 + 450);
  		button.mousePressed();

  		button2 = createButton('Leave Game');
  		button2.position(width/2, height/2 + 500);
  		button2.mousePressed();
	}
	else if (state == "Lost"){
		push();
		background(0);
		fill(0,255,255);
		noStroke();
		textSize(200);
	    textAlign(CENTER, CENTER);
	    text("You Lost!", width/2, height/2 - 100);
	    fill(255,255,0);
	    textSize(50);
	    for (let i = 0; i < numberOfPlayers; i++)
	    {
	    	text("Player " + (i+1) + ": " + currentPoints[i], width/2, height/2 + 70 + 60*i);
	    }	    
		pop();
		button = createButton('Continue to the next game');
  		button.position(width/2, height/2 + 300);
  		button.mousePressed();

  		button = createButton('Leave Game');
  		button.position(width/2, height/2 + 500);
  		button.mousePressed();
	}
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

function modelReady() {
	console.log("Model ready!");
}