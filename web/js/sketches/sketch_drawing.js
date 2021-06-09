const BG = "white", // background
  FG = "black", // drawings
  FPS = 30,
  C = 512, // canvas dimensions
  SW = 5;

var session,
  lineStack = [],
  lines = [],
  undoLast = false,
  inside = false,
  classifying = false,
  // todo btn
  stopClassifying = false,
  fpsCounter = 0;

let btn_undo, btn_redo, p_label;
let canvasCopy, classifier, label, imageModelURL = 'http://localhost:8080/data/sketchrecognition/';

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelPreLoaded);
}

function setup() {
  let now = Date.now();
  session = cyrb53(now, now);
  frameRate(FPS);
  createCanvas(C, C);
  background("Gray");
  fill(FG);
  textSize(32);
  textAlign(CENTER);
  text("Loading", width / 2, height / 2);
  controls();
  canvasCopy = createImage(width, height);
}

function draw() {
  if (undoLast) {
    undo();
  }
  if(mouseInside()){
    cursor(CROSS);
  } else {
    cursor(ARROW);
  }
  if (mouseIsPressed) {
    stroke(FG);
    strokeWeight(SW);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  if(!classifying && fpsCounter % FPS == 0){
    classifyCanvas();
    fpsCounter=0;
  }
  fpsCounter++;
}

function modelPreLoaded() {
  console.log('Model loading...');
}

function modelLoaded() {
  console.log('Model loaded!');
  background(BG);
}

function controls() {
  btn_undo = createP("↺");
  btn_undo.elt.name = "undo";
  btn_undo.elt.draggable = false;
  btn_undo.style('font-size', '50px');
  btn_undo.style('user-select', 'none');
  btn_undo.position(width + 10, 0);
  btn_undo.addClass("loading");
  btn_undo.mouseOver(shadow).mouseOut(shadow).mouseReleased(undo);

  btn_redo = createP("⥀");
  btn_redo.elt.name = "clear";
  btn_redo.elt.draggable = false;
  btn_redo.style('font-size', '50px');
  btn_redo.style('user-select', 'none');
  btn_redo.position(width + 10, btn_redo.height + 50);
  btn_redo.addClass("loading");
  btn_redo.mouseOver(shadow).mouseOut(shadow).mouseReleased(redo);

  btn_save = createP("💾");
  btn_save.elt.name = "save";
  btn_save.elt.draggable = false;
  btn_save.style('font-size', '33px');
  btn_save.style('user-select', 'none');
  btn_save.position(width + 10, 146);
  btn_save.addClass("loading");
  btn_save.mouseOver(shadow).mouseOut(shadow).mouseReleased(copyCanvas);

  p_label = createP("䁼");
  p_label.elt.name = "label";
  p_label.elt.draggable = false;
  p_label.style('font-size', '30px');
  p_label.style('user-select', 'none');
  p_label.position(width + 10, 197);
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
  if (!inside) {
    // if the curser was never inside since button pressed
    // delete the last line sampled
    lines = [];
  }
  if (lines.length > 0) {
    lineStack.push(lines);
    lines = [];
  }
  inside = false;
}

function mouseInside() {
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

function redo() {
  background(BG);
  lines.length = 0;
  lineStack.length = 0;
}

function copyCanvas() {
  canvasCopy = get();
  save(canvasCopy, label+"_"+Date.now()+"_"+session+".png");
}

let loaded = false;
function gotResult(error, results) {
  if(!loaded) {
    modelLoaded();
    btn_undo.removeClass("loading");
    btn_redo.removeClass("loading");
    btn_save.removeClass("loading");
    loaded = true;
  }
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  console.log(results);
  label = results[0].label;
  p_label.html(label);

  if(!stopClassifying) {
    classifying = false;
  }
}

function classifyCanvas() {
  classifying = true;
  canvasCopy = get();
  classifier.classify(canvasCopy, gotResult);
}

const cyrb53 = function(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1>>>0);
};
