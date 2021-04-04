let capture;
let constraints = {
	video: {
		mandatory: {
			minWidth: 640,
			minHeight: 360
		},
		optional: [{ maxFrameRate: 30 }]
	},
	audio: true
};

let poseNet, poses = [];

function setup() {
	createCanvas(1280, 800);
	capture = createCapture(constraints);
	poseNet = ml5.poseNet(capture, modelReady);

	poseNet.on('pose', (results) => {
		poses = results;
	});
	capture.hide();

}

function draw() {
	background(255);
	image(capture, 0, 0, capture.width, capture.height);
	drawKeypoints();
	drawSkeleton();
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