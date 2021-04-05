const BG = "white", // background
  FG = "black", // drawings
  FPS = 30,
  C = 512, // canvas dimensions
  SW = 5;

var lineStack = [],
  lines = [],
  undoLast = false,
    inside = false;

let btn_undo, btn_clear, p_label;
let classifier, label, imageModelURL = 'http://localhost:8080/data/sketchrecognition/';

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  frameRate(FPS);
  createCanvas(C,C);
  background(BG);
  controls();
  classifyVideo();
}

function draw() {
  if (undoLast) {
    undo();
  }
  if (mouseIsPressed) {
    stroke(FG);
    strokeWeight(SW);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function controls() {
  btn_undo = createP("↺");
  btn_undo.elt.name = "undo";
  btn_undo.elt.draggable = false;
  btn_undo.style('font-size', '50px');
  btn_undo.style('user-select', 'none');
  btn_undo.position(width + 10, 0);
  btn_undo.mouseOver(shadow).mouseOut(shadow).mouseReleased(undo);

  //TODO wipe
  btn_clear = createP("⥀");
  btn_clear.elt.name = "clear";
  btn_clear.elt.draggable = false;
  btn_clear.style('font-size', '50px');
  btn_clear.style('user-select', 'none');
  btn_clear.position(width + 10, btn_clear.height + 50);
  btn_clear.mouseOver(shadow).mouseOut(shadow).mouseReleased(clear);

  p_label = createP("");
  p_label.elt.name = "label";
  p_label.elt.draggable = false;
  p_label.style('font-size', '50px');
  p_label.style('user-select', 'none');
  p_label.position(width + 10, 100);
}

function shadow(event) {
  event.target.classList.toggle("shadow");
}

function mousePressed() {
  if (mouseInside()) {
    lines.push([mouseX, mouseY]);
    inside = true;
  }
}

function mouseDragged() {
  if (mouseInside()) {
    inside = true;
  }
  lines.push([pmouseX, pmouseY]);
}

function mouseReleased() {
  if(!inside) {
    lines = [];
  }
  if (lines.length > 0) {
    lineStack.push(lines);
    lines = [];
  }
  inside = false;
}

function mouseInside(){
  return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

function undo() {
  lineStack.pop();
  background(BG);
  stroke(FG);
  for (let i = lineStack.length - 1; i >= 0; i--) {
    var l = lineStack[i].length;
    if (l <= 0) {
      console.log("empty lines section, should never happen");
      continue;
    }
    if (l == 1) {
      line(lineStack[i][0][0], lineStack[i][0][1], lineStack[i][0][0], lineStack[i][0][1]);
    } else {
      for (let j = 0; j < lineStack[i].length - 1; j++) {
        line(
          lineStack[i][j][0],
          lineStack[i][j][1],
          lineStack[i][j + 1][0],
          lineStack[i][j + 1][1]
        );
      }
    }
  }
  undoLast = false;
}

function clear(){
  background(BG);
  lineStack.length = 0;
  lines.length = 0;
}

function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  label = results[0].label;
  
  //console.log(label);
  // Classifiy again!
  classifyVideo();
}

let flippedCanvas, canvasCopy;
function classifyVideo() {
  canvasCopy = createImage(width, height);
  loadPixels();
  canvasCopy.loadPixels();
  console.log();
  canvasCopy.pixels = pixels;
  canvasCopy.updatePixels();
  classifier.classify(canvasCopy, gotResult);
  image(canvasCopy, 0,0,50,50);
  
}