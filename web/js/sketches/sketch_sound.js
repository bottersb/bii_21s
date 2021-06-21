// basic scene template
function sketch_sound(){

	// Label
	let label = 'listening...';
	let classifier;
	// Teachable Machine model URL:
	let soundModel = 'http://localhost:8080/data/animalnoises/';

	let state = 'waiting';

	let barn = {};

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
	}
	this.draw = function () {
		if (state == "waiting") {
			background(255);	// POS,SIZE
			image(barn['barn'], windowWidth / 2, windowHeight / 2, windowWidth, windowHeight);
			switch (room['objective']) {
				case 'cat':
					image(barn['cat'], windowWidth / 9, windowHeight / 1.23, (windowWidth / 7), (windowHeight / 4));
					break;
				case 'dog':
					image(barn['dog'], 2 * windowWidth / 9, windowHeight / 1.3, (windowWidth / 7), (windowHeight / 4));
					break;
				case 'cow':
					image(barn['cow'], 4 * windowWidth / 9, windowHeight / 1.3, windowWidth / 4, windowHeight / 3);
					break;
				case 'duck':
					image(barn['duck'], 6 * windowWidth / 9, windowHeight / 1.3, windowWidth / 7, windowHeight / 5);
					break;
				case 'frog':
					image(barn['frog'], 6 * windowWidth / 9, windowHeight / 2.2, (windowWidth/ 7)/1.5, (windowHeight / 4)/1.5);
					break;
				case 'goat':
					image(barn['goat'], 8 * windowWidth / 9, windowHeight / 1.3, (windowWidth/ 7)/1, (windowHeight / 4)/1);
					break;
				case 'owl':
					image(barn['owl'], 2 * windowWidth / 9, windowHeight / 2.1, (windowWidth/ 7)/1.5, (windowHeight / 5)/1.5);
					break;
				default:
					break;
			}

			// Draw the label in the canvas
			stroke(0);
			strokeWeight(4);
			fill(255, 205, 0);
			rect(width/3, height/11, 700, 100);
			fill(255);
			textSize(32);
			textAlign(CENTER, CENTER);
			text(label, width / 2, height / 7);
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
		label = results[0].label;
		// Checks if the player won
		if (label == room['objective']) {
			state = "won";
		}
	}
}