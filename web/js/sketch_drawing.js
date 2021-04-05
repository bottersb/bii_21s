const BG = "white", // background
  FG = "black", // drawings
  FPS = 30,
  C = 512, // canvas dimensions
  SW = 5;

var lineStack = [],
  lines = [],
  undoLast = false,
    inside = false;

let btn_undo;

function setup() {
  frameRate(FPS);
  createCanvas(C, C);
  background(BG);
  controls();
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
  btn_undo = createP("⎌");
  btn_undo.elt.name = "undo";
  btn_undo.elt.draggable = false;
  btn_undo.style('font-size', '50px');
  btn_undo.style('user-select', 'none');
  btn_undo.position(width + 10, -50);
  btn_undo.mouseOver(shadow).mouseOut(shadow).mouseReleased(undo);
}

function shadow(event) {
  event.target.classList.toggle("shadow");
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    lines.push([mouseX, mouseY]);
    inside = true;
  }
}

function mouseDragged() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
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
