let capture;
let constraints = {
	video: {
		mandatory: {
			minWidth: 640,
			minHeight: 360
		},
		optional: [{ maxFrameRate: 30 }]
	},
	audio: false
};

let handpose, predictions = [];

function setup() {
	createCanvas(1280, 800);
	capture = createCapture(constraints);
	handpose = ml5.handpose(capture, modelReady);

	handpose.on("predict", results => {
		predictions = results;
	});
	capture.hide();

}

function draw() {
	backrgound(255);
	image(capture, 0, 0, capture.width, capture.height);
	drawKeypoints();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
	for (let i = 0; i < predictions.length; i += 1) {
		const prediction = predictions[i];
		for (let j = 0; j < prediction.landmarks.length; j += 1) {
			const keypoint = prediction.landmarks[j];
			fill(0, 255, 0);
			noStroke();
			ellipse(keypoint[0], keypoint[1], 10, 10);
		}
	}
}

function modelReady() {
	console.log("Model ready!");
}