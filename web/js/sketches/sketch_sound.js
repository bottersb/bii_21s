// basic scene template
function sketch_sound(){

	// Label
	let label = 'listening...';
	let classifier;
	// Teachable Machine model URL:
	let soundModel = 'http://localhost:8080/data/animalnoises/';

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
		background(255);	// POS,SIZE
		image(barn['barn'], windowWidth/2, windowHeight/2, windowWidth, windowHeight);
		image(barn['cat'], windowWidth/9, windowHeight/1.3, barn['cat'].width/4, barn['cat'].height/4);
		image(barn['dog'], 2*windowWidth/9, windowHeight/1.3, barn['dog'].width/70, barn['dog'].height/70);
		image(barn['cow'], 3*windowWidth/9, windowHeight/1.5, barn['cow'].width/3, barn['cow'].height/3);
		image(barn['duck'], 4*windowWidth/9, windowHeight/1.3, barn['duck'].width/5, barn['duck'].height/5);
		image(barn['frog'], 5*windowWidth/9, windowHeight/1.9, barn['frog'].width/5, barn['frog'].height/5);
		image(barn['goat'], 6*windowWidth/9, windowHeight/1.3, barn['goat'].width/2, barn['goat'].height/2);
		image(barn['owl'], 7*windowWidth/9, windowHeight/2.1, barn['owl'].width/7, barn['owl'].height/7);
		// Draw the label in the canvas
		fill(255);
		textSize(32);
		textAlign(CENTER, CENTER);
		text(label, width / 2, height / 5);
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
	}
}