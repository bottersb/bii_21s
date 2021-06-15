function sketch_drawing() {
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
      fpsCounter = 0,
      glob_label = 'Else',
      state = 'waiting',
      i = 0;

  let btn_undo, btn_redo, p_label;
  let canvasCopy, classifier, label, imageModelURL = 'http://localhost:8080/data/sketchrecognition/';

  this.setup = function () {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelPreLoaded);
    let now = Date.now();
    session = cyrb53(now, now);
    frameRate(FPS);
    controls();
    canvasCopy = createImage(width, height);
  }

  this.draw = function() {
    if (state == "waiting") {
      fill('green');
      noStroke();
      rect(0, 0, width / 4.1, height);
      rect(0, 0, width, height / 4.1);
      rect(3 * width / 4.4, 0, 2 * width / 4.1, height);
      rect(0, 3 * height / 4.1, width, 2 * height / 4.1);

      btn_undo.position(2.05 * width / 3, height / 2.8);
      btn_redo.position(2.05 * width / 3, height / 2.33);
      btn_save.position(2.05 * width / 3, height / 2);

      stroke(0);
      strokeWeight(4);
      fill(255, 205, 0);
      rect(width / 2.16 - textWidth(glob_label) / 2 * 1.5, height / 40, textWidth(glob_label) * 1.5, 200);
      fill(255, 0, 255);
      noStroke();
      textSize(150);
      textAlign(CENTER, CENTER);
      text(glob_label.toUpperCase(), width / 2.16, height / 7.5);

      //drawBackground();
      if (undoLast) {
        undo();
      }
      if (mouseInside()) {
        cursor(CROSS);
      } else {
        cursor(ARROW);
      }
      if (mouseIsPressed) {
        if (mouseInside()) {
          stroke(FG);
          strokeWeight(SW);
          line(mouseX, mouseY, pmouseX, pmouseY);
        }
      }
      if (!classifying && fpsCounter % FPS == 0) {
        classifyCanvas();
        fpsCounter = 0;
      }
      fpsCounter++;
      i++;
      if (i == 100){
        state = 'won';
      }

    }
    else if (state == "won"){
      drawBackground();
      stroke(0);
      strokeWeight(4);
      textSize(200);
      textAlign(CENTER, CENTER);
      fill(89, 254, 0);
      text("You Won!", width/2, height/4);
      textSize(50);
      fill(254, 128, 82);
      textAlign(CENTER, CENTER);

      let pRows = 2, pCols = 4;
      let pIds = Object.keys(players);
      let i = 0;

      for (let pRow = 0; pRow < pRows; pRow++) {
          for (let pCol = 0; pCol < pCols; pCol++) {
              let p = pIds[(pRow * pCols) + pCol];
              if (p !== undefined) {
                  text(players[p]['name'] + ": " + room['scores'][p], width/2, height/2 + 60*i);
                  i++;
              }
          }
      }



      /*
      if (random(1) < 0.04) {
          fireworks.push(new Firework());
      }
      for (let i = fireworks.length - 1; i >= 0; i--) {
          fireworks[i].update();
          fireworks[i].show();

          if (fireworks[i].done()) {
              fireworks.splice(i, 1);
          }
      }*/

      btn_nextGame.locate((windowWidth / 2) - (btnW) - btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
      btn_endGame.locate((windowWidth / 2) + btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
      btns.forEach(btn => {
          btn.draw();
      });
      btn_redo.remove();
      btn_undo.style('visibility', 'hidden');
      btn_save.style('visibility', 'hidden');
    }

    else if (room['gameStarted'] == false){
      drawBackground();
      stroke(0);
      strokeWeight(4);
      textSize(200);
      textAlign(CENTER, CENTER);
      fill(254, 58, 2);
      text("You Lost!", width/2, height/4);
      textSize(50);
      fill(254, 128, 82);
      textAlign(CENTER, CENTER);

      let pRows = 2, pCols = 4;
      let pIds = Object.keys(players);
      let i = 0;

      for (let pRow = 0; pRow < pRows; pRow++) {
          for (let pCol = 0; pCol < pCols; pCol++) {
              let p = pIds[(pRow * pCols) + pCol];
              if (p !== undefined) {
                  text(players[p]['name'] + ": " + room['scores'][p], width/2, height/2 + 60*i);
                  i++;
              }
          }
      }
      btn_nextGame.locate((windowWidth / 2) - (btnW) - btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
      btn_endGame.locate((windowWidth / 2) + btnW*0.5, (2 * windowHeight / 2.5) - (btnH / 2));
      btns.forEach(btn => {
          btn.draw();
      });
      btn_redo.style('visibility', 'hidden');
      btn_undo.style('visibility', 'hidden');
      btn_save.style('visibility', 'hidden');
    }
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

    btn_undo.addClass("loading");
    btn_undo.mouseOver(shadow).mouseOut(shadow).mouseReleased(undo);

    btn_redo = createP("⥀");
    btn_redo.elt.name = "clear";
    btn_redo.elt.draggable = false;
    btn_redo.style('font-size', '50px');
    btn_redo.style('user-select', 'none');

    btn_redo.addClass("loading");
    btn_redo.mouseOver(shadow).mouseOut(shadow).mouseReleased(redo);

    btn_save = createP("💾");
    btn_save.elt.name = "save";
    btn_save.elt.draggable = false;
    btn_save.style('font-size', '33px');
    btn_save.style('user-select', 'none');

    btn_save.addClass("loading");
    btn_save.mouseOver(shadow).mouseOut(shadow).mouseReleased(copyCanvas);
  }

  function shadow(event) {
    event.target.classList.toggle("shadow");
  }

  function mousePressed() {
    if (mouseInside() && state == 'waiting') {
      lines.push([mouseX, mouseY]);
      inside = true;
    }
  }

  function mouseDragged() {
    if (mouseInside() && state == 'waiting') {
      inside = true;
    }
    lines.push([pmouseX, pmouseY]);
  }

  function mouseReleased() {
    if (!inside && state == 'waiting') {
      // if the curser was never inside since button pressed
      // delete the last line sampled
      lines = [];
    }
    if (lines.length > 0 && state == 'waiting') {
      lineStack.push(lines);
      lines = [];
    }
    inside = false;
  }

  function mouseInside() {
    return mouseX > width/4 && mouseX < 3*width/4 && mouseY > height/4 && mouseY < 3*height/4;
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
    save(canvasCopy, label + "_" + Date.now() + "_" + session + ".png");
  }

  let loaded = false;

  function gotResult(error, results) {
    if (!loaded) {
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
    if (results[0].confidence > 0.7){
      glob_label = label;
    }

    if (!stopClassifying) {
      classifying = false;
    }
  }

  function classifyCanvas() {
    classifying = true;
    canvasCopy = get();
    classifier.classify(canvasCopy, gotResult);
  }

  const cyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };

  this.enter = function () {}
  this.leave = function () {
    btn_redo.remove();
    btn_undo.style('visibility', 'hidden');
    btn_save.style('visibility', 'hidden');
  }
  this.resize = function () {}
  this.setMgr = function (mgr) {
      this.mgr = mgr;
  }
}