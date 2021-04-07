// TODO
// - http-server dockerimage with cors header and adjusted imageModelURL
// - buttons for color and size -> adjust lines & linesStack structure

const BG = "white", // background
  FG = "black", // drawings
  FPS = 30,
  C = 512, // canvas dimensions
  SW = 5; // strokewidth

var session, // filename suffix for downloads, TODO fix seed
  lineStack = [], // all lines
  lines = [], // current line holding [x,y],[x,y],..
  undoLast = false, // pop and redraw all
  inside = false, // was mouse inside canvas since mousePressed and mouseReleased
  stopClassifying = false, // TODO button
  classifying = false, // flag
  fpsCounter = 0; // for limiting classification

// buttons
let btn_undo, btn_redo, p_label; 
// ml related
let canvasCopy, classifier, label, imageModelURL = 'http://localhost:8080/data/sketchrecognition_v2/';
// The model has to be loaded via url, a local file path did not work for me. Currently "http://localhost:8080/data/MODELNAME" is the used path. When opening the site make sure to go to localhost:8080, not 127.0.0.1, or set the CORS header of the http server accordingly. Firefox might still be bitchy about it.

function preload() {
  // init local model
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelPreLoaded);
}

function setup() {
  // session token
  let now = Date.now();
  session = cyrb53(now, now);
  // only once
  frameRate(FPS);
  createCanvas(C, C);
  // loading screen
  background("Gray");
  fill(FG);
  textSize(32);
  textAlign(CENTER);
  text("Loading", width / 2, height / 2);
  // draw controls
  controls();
  // init buffer
  canvasCopy = createImage(width, height);
}

function draw() {
  // undo was pressed
  if (undoLast) {
    undo();
  }
  // change curser
  if(mouseInside()){
    cursor(CROSS);
  } else {
    cursor(ARROW);
  }
  // draw when pressed
  if (mouseIsPressed) {
    stroke(FG);
    strokeWeight(SW);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  // limit classification to state and by time
  if(!classifying && fpsCounter % FPS == 0){
    classifyCanvas();
    fpsCounter=0;
  }
  fpsCounter++;
}

// not really loaded yet
function modelPreLoaded() {
  console.log('Model loading...');
}

// now we're ready
function modelLoaded() {
  console.log('Model loaded!');
  background(BG);
}

// DOM outside of the canvas
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

  p_label = createP("䁼"); // "consider as nothing"
  p_label.elt.name = "label";
  p_label.elt.draggable = false;
  p_label.style('font-size', '30px');
  p_label.style('user-select', 'none');
  p_label.position(width + 10, 197);
}

// css shadow toggle
function shadow(event) {
  event.target.classList.toggle("shadow");
}

// MOUSE LISTENERS
// mouse down, once at the beginning
function mousePressed() {
  // only if inside canvas, might be button presses
  if (mouseInside()) {
    inside = true;
    // add the starting point
    lines.push([mouseX, mouseY]);
  }
}

function mouseDragged() {
  // has the mouse been moved inside
  if (mouseInside()) {
    inside = true;
  }
  // the new coordinates
  lines.push([pmouseX, pmouseY]);
}

function mouseReleased() {
  if (!inside) {
    // if the curser was never inside since button pressed
    // delete the last line sampled
    lines = [];
  }
  // only non-empty lines will be pushed, 
  // otherwise the undo function will not work properly
  if (lines.length > 0) {
    lineStack.push(lines);
    lines = [];
  }
  // reset ever inside flag
  inside = false;
}

// is the mouse currently within the canvas
function mouseInside() {
  return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

// pop last line, clear canvas and redraw all lines
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
      // single element means a dot, use line for strokeweight
      line(lineStack[i][0][0], lineStack[i][0][1], lineStack[i][0][0], lineStack[i][0][1]);
    } else {
      // for every element - last, draw a line to the next element
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
  // reset flag
  undoLast = false;
}

// clear
function redo() {
  background(BG);
  lines.length = 0;
  lineStack.length = 0;
}

// saveCanvas is taken
function copyCanvas() {
  canvasCopy = get();
  save(canvasCopy, label+"_"+Date.now()+"_"+session+".png");
}

// elements stay unresponse while model is still loading
let loaded = false;
function gotResult(error, results) {
  // remove loading screen attributes
  if(!loaded) {
    modelLoaded();
    btn_undo.removeClass("loading");
    btn_redo.removeClass("loading");
    btn_save.removeClass("loading");
    loaded = true;
  }
  // If there is an error with the classification
  if (error) {
    console.error(error);
    return;
  }
  // TODO use results for game logic and gui
  console.log(results);

  label = results[0].label;
  p_label.html(label);

  // finished classifying
  if(!stopClassifying) {
    classifying = false;
  }
}

// set flag, get canvas content and classify
function classifyCanvas() {
  classifying = true;
  canvasCopy = get();
  classifier.classify(canvasCopy, gotResult);
}

// hash for session id
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
