let classifier;

// Label
let label = 'listening...';

// Teachable Machine model URL:
let soundModel = 'http://localhost:8080/data/animalnoises/';

function preload() {
  // Load the model
  classifier = ml5.soundClassifier(soundModel + 'model.json');
  //classifier = ml5.soundClassifier(soundModel + 'metadata.json');
}

function setup() {
  createCanvas(windowWidth - 500, windowHeight - 50);
  barn = loadImage('data/barn-yard.jpg');
  cat = loadImage('data/cat.png');
  dog = loadImage('data/dog.png');
  cow = loadImage('data/cow.png');
  duck = loadImage('data/duck.png');
  frog = loadImage('data/frog.png');
  goat = loadImage('data/goat.png');
  owl = loadImage('data/owl.png');

//660, 720
  /*
  hud = createImg('data/HUD.png').position(windowWidth-450, 40).size(660*0.6,720*1.1);
  let div = createDiv('Score');
  div.style('font-size', '70px');
  div.style('color', 'blue');
  div.style('font-family', 'Comic Sans MS');
  div.position(windowWidth-330, windowHeight/5);
  */

  // Start classifying
  // The sound model will continuously listen to the microphone
  classifier.classify(gotResult);
}

function draw() {
  background(255);
  image(barn, (windowWidth - 600)/2 - barn.width/1.5, windowHeight/2 - barn.height/1.5, barn.width*1.5, barn.height*1.5);
  image(cat, (windowWidth - 600)/2 - 350, windowHeight/2 + 200 , cat.width/4, cat.height/4);
  image(dog, (windowWidth - 600)/2, windowHeight/2 + 180, dog.width/70, dog.height/70);
  image(cow, (windowWidth - 600)/2 + 250, windowHeight/2 + 150, cow.width/5, cow.height/5);
  image(duck, (windowWidth - 600)/2 - 200, windowHeight/2 + 150, duck.width/5, duck.height/5);
  image(frog, (windowWidth - 600)/2 + 120, windowHeight/2 - 100, frog.width/5, frog.height/5);
  image(goat, (windowWidth - 600)/2, windowHeight/2 - 100, goat.width/5, goat.height/5);
  image(owl, (windowWidth - 600)/2 - 130, windowHeight/2 - 100, owl.width/7, owl.height/7);
  // Draw the label in the canvas
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(label, width / 2, height / 5);
}


// The model recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
}