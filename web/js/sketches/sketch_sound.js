// basic scene template
function sketch_sound(){

	// Label
	let label = 'listening...';
	let classifier;
	// Teachable Machine model URL:
	let soundModel = 'http://localhost:8080/data/animalnoises/';

	let intro = true, fade = 255;

	var btn_objective, btn_result;
	var btns = [];

	var drawingX, drawingY, drawingW = 512, drawingH = 512;

	let barn = {};

	const txtSize = 32, btnDim = 30, SW = 5, strokeColor = 'black',
	logoH = 50, imgDim = 100, labelDim = 200;

	this.setup = function () {
		classifier = ml5.soundClassifier(soundModel + 'model.json');
		classifier.classify(gotResult);
		//barn = this.sceneManager.barn;

		barn['barn'] = loadImage('data/animal_png/barn-yard.jpg');
		barn['cat'] = loadImage('data/animal_png/cat.png');
		barn['dog'] = loadImage('data/animal_png/dog.png');
		barn['cow'] = loadImage('data/animal_png/cow.png');
		barn['duck'] = loadImage('data/animal_png/duck.png');
		barn['frog'] = loadImage('data/animal_png/frog.png');
		barn['goat'] = loadImage('data/animal_png/goat.png');
		barn['owl'] = loadImage('data/animal_png/owl.png');

		btn_objective = new Clickable();
		btn_objective.text = "Make the sound of a Cow"; //room['objective'];
		btn_objective.textColor = strokeColor;
		btn_objective.textSize = txtSize;
		btn_objective.textScaled  = true;
		btn_objective.resize(labelDim, btnDim);
		btns.push(btn_objective);

		btn_result = new Clickable();
		btn_result.text = "Recognised: " + label;
		btn_result.textColor = strokeColor;
		btn_result.textSize = txtSize;
		btn_result.textScaled  = true;
		btn_result.resize(labelDim, btnDim);
		btns.push(btn_result);
	}
	this.draw = function () {
		image(this.sceneManager.logo, windowWidth / 2, height / 8, imgDim, logoH);
		if (intro) {
			fill(10, 10, 10, fade);
			rect(0, 0, windowWidth, windowHeight);
			fill(240, 240, 240, fade);
			noStroke();
			textSize(txtSize);
			let instructions = "Make the sound of a " + 'Cow';//room['objective'];
			text(instructions, windowWidth / 2 - textWidth(instructions) / 2, windowHeight / 2);
			fade -= 3;
			if (fade <= 0) {
				intro = false;
				classifying = true;
			}
		} else {
			drawBackground();
			image(barn['barn'], windowWidth / 2, windowHeight / 2, windowWidth/2.5, windowHeight/2);
			// Draw the label in the canvas

			switch ('cat') {
				case 'cat':
					image(barn['cat'], 2*windowWidth / 6.3, windowHeight / 1.58, (windowWidth/ 7)/2, (windowHeight / 4)/2);
				//break;
				case 'dog':
					image(barn['dog'], 2 * windowWidth / 5, windowHeight / 1.5, (windowWidth/ 7)/2.1, (windowHeight / 4)/2.1);
				//break;
				case 'cow':
					image(barn['cow'], 4 * windowWidth / 8, windowHeight / 1.6, (windowWidth/ 6)/1.5, (windowHeight / 4)/1.5);
				//break;
				case 'duck':
					image(barn['duck'], 6 * windowWidth / 10, windowHeight / 1.55, (windowWidth/ 7)/1.5, (windowHeight / 4)/1.5);
				//break;
				case 'frog':
					image(barn['frog'], 6 * windowWidth / 9, windowHeight / 2.2, (windowWidth/ 7)/2.5, (windowHeight / 4)/2.5);
				//break;
				case 'goat':
					image(barn['goat'], 6.3 * windowWidth / 9, windowHeight / 1.6, (windowWidth/ 7)/1.8, (windowHeight / 4)/1.8);
				//break;
				case 'owl':
					image(barn['owl'],  4*windowWidth / 9, windowHeight / 2.6, (windowWidth/ 7)/2, (windowHeight / 5)/2);
				//break;
				default:
					break;
			}

			drawingX = windowWidth / 2 - drawingW / 2;
			drawingY = windowHeight / 2 - drawingH / 2;

			btn_objective.locate(windowWidth / 2 - labelDim - 10, drawingY+drawingH+btnDim);
			btn_result.locate(windowWidth / 2 + 10, drawingY+drawingH+btnDim);

			btn_result.text = "Recognised: " + label;

			btns.forEach(btn => {
				btn.draw();
			});
		}
	}
	this.enter = function () {}
	this.leave = function () {}
	this.resize = function () {}
	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
	function gotResult(error, results) {
		if (error) {
			console.error(error);
			return;
		}
		// The results are in an array ordered by confidence.
		// console.log(results[0]);
		if (results[0].confidence > 0.1) {
			label = results[0].label;
		}
		// Checks if the player won
		//if (label == room['objective']) {
	//	state = "won";
	//	}
	}
}