// basic scene template
function Sketch() {

	const txtSize = 32, btnDim = 30, SW = 5, strokeColor = 'black', 
	logoH = 50, imgDim = 100, labelDim = 200;

	let initialized = false;
	// set in enter
	let intro, fade = 255;

	var lineStack = [],
		lines = [],
		undoLast = false,
		inside = false;
		
	let btn_undo, btn_redo, btn_objective, btn_result;
	var btns = [];

	var drawingX, drawingY, drawingW = 512, drawingH = 512;

	var btncHover = 'orangered', btnc = 'tomato', txtColor = 'white';
	var canvasCopy;

	// win indication
	let c = 'white', weight = 4, matchesRequired = 1, matchIndicatorW = 15;

	this.setup = function () {
		btn_undo = new Clickable();
		btn_undo.text = "↺";
		btn_undo.textColor = txtColor;
		btn_undo.textSize = txtSize;
		btn_undo.resize(btnDim, btnDim);
		btn_undo.onHover = btnOnHoverColor;
		btn_undo.onOutside = btnOnOutsideColor;
		btn_undo.onPress = function () {
			undo();
		};
		btns.push(btn_undo);

		btn_redo = new Clickable();
		btn_redo.text = "⥀";
		btn_redo.textColor = txtColor;
		btn_redo.textSize = txtSize;
		btn_redo.resize(btnDim, btnDim);
		btn_redo.onHover = btnOnHoverColor;
		btn_redo.onOutside = btnOnOutsideColor;
		btn_redo.onPress = function () {
			redo();
		};
		btns.push(btn_redo);

		btn_objective = new Clickable();
		btn_objective.text = "Draw: " + currObjective;
		btn_objective.textColor = strokeColor;
		btn_objective.textSize = txtSize;
		btn_objective.textScaled  = true;
		btn_objective.resize(labelDim, btnDim);
		btns.push(btn_objective);
		
		btn_result = new Clickable();
		btn_result.text = "Recognised: " + sketchLabel;
		btn_result.textColor = strokeColor;
		btn_result.textSize = txtSize;
		btn_result.textScaled  = true;
		btn_result.resize(labelDim, btnDim);
		btns.push(btn_result);
		
		canvasCopy = createImage(drawingW, drawingH);

		initialized = true;
	}

	this.draw = function () {
		noStroke();
		drawBackground();
		image(this.sceneManager.logo, windowWidth / 2, height / 8, imgDim, logoH);
		
		// todo check for label
		
		if (intro) {
			fill(10,10,10,fade);
			rect(0,0,windowWidth,windowHeight);
			fill(240,240,240,fade);
			noStroke();
			textSize(txtSize);
			let instructions = "Draw a sketch fastest!";
			//text(instructions, windowWidth/2 - textWidth(instructions)/2, windowHeight/2);
			text(instructions, windowWidth/2, windowHeight/2);
			fade -= 3;
			if(fade <= 0) {
				intro = false;
				//classifying = true;
			}
		} else if (outro){
			fill(10,10,10,fade);
			rect(0,0,windowWidth,windowHeight);
			fill(240,240,240,fade);
			fade += 9;
			if(fade >= 255) {
				outro = false;
				nextScene();
			}
		} else {
			btns.forEach(btn => {
				btn.draw();
			});

			// win indicator
			strokeWeight(weight);
			stroke(c);
			
			fill('linen');
			for(let i = 1; i <= matchesRequired; i++) {
				circle((windowWidth/2) + (matchIndicatorW/2) - (matchesRequired*matchIndicatorW) + (i*matchIndicatorW),7*windowHeight/8,matchIndicatorW);
			}
			fill('deeppink');
			for(let j = 0; j < sketchMatches; j++) {
				circle((windowWidth/2) + (matchIndicatorW/2) - (matchesRequired*matchIndicatorW) + ((j+1)*matchIndicatorW),7*windowHeight/8,matchIndicatorW);
			}

			stroke(strokeColor);
			strokeWeight(1);
			fill('white');
			rect(drawingX, drawingY, drawingW, drawingH);

			if (undoLast) {
				undo();
			}
			if (mouseInside()) {
				cursor(CROSS);
			} else {
				cursor(ARROW);
			}
			if (mouseIsPressed && mouseInside()) {
				stroke(strokeColor);
				strokeWeight(SW);
				line(mouseX, mouseY, pmouseX, pmouseY);
			}

			btn_result.text = "Recognised: " + sketchLabel;
			strokeWeight(SW);
			for (let i = lineStack.length - 1; i >= 0; i--) {
				var l = lineStack[i].length;
				if (l <= 0) {
					l("empty lines section, should never happen");
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
			for (let j = 0; j < lines.length - 1; j++) {
				line(lines[j][0], lines[j][1], lines[j + 1][0], lines[j + 1][1]);
			}
			
			btn_objective.text = "Draw: " + currObjective;
	
			if (!classifyingSketch && frameCount % FRAME_RATE == 0) {
				canvasCopy = get(drawingX, drawingY, drawingW, drawingH);
				classifyingSketch = true;
				sketch_classifier.classify(canvasCopy, gotSketchResult);
			}

			if(currObjective == sketchLabel){
				sketchMatches += 1;
				nextObjective();
			}
		}
	}

	this.enter = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		nextObjective();
		intro = true;
		fade = 255;
		sketchMatches = 0;
		positionElements();
	}

	this.leave = function () {
		classifyingSketch = false;
	}

	this.resize = function () {
		positionElements();
	}

	function positionElements() {
		drawingX = windowWidth / 2 - drawingW / 2;
		drawingY = windowHeight / 2 - drawingH / 2;

		btn_undo.locate(windowWidth / 2 + drawingW / 2 + 10, windowHeight / 2 - drawingH / 2);
		btn_redo.locate(windowWidth / 2 + drawingW / 2 + 10, windowHeight / 2 - drawingH / 2 + 10 + btnDim);

		btn_objective.locate(windowWidth / 2 - labelDim - 10, drawingY+drawingH+btnDim);
		btn_result.locate(windowWidth / 2 + 10, drawingY+drawingH+btnDim);
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	this.isInitialized = function () {
		return initialized;
	}

	function undo() {
		lineStack.pop();
		stroke(strokeColor);
		strokeWeight(1);
		fill('white');
		rect(drawingX, drawingY, drawingW, drawingH);
		strokeWeight(SW);

		for (let i = lineStack.length - 1; i >= 0; i--) {
			var l = lineStack[i].length;
			if (l <= 0) {
				l("empty lines section, should never happen");
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
		stroke(strokeColor);
		strokeWeight(1);
		fill('white');
		rect(drawingX, drawingY, drawingW, drawingH);
		lines.length = 0;
		lineStack.length = 0;
	}

	this.mousePressed = function () {
		if (mouseInside()) {
			lines.push([mouseX, mouseY]);
			inside = true;
		}
	}

	this.mouseDragged = function () {
		if (pmouseInside()) {
			lines.push([pmouseX, pmouseY]);
		} else if (mouseInside()) {
			lines.push([mouseX, mouseY]);
			inside = true;
		}
	}

	this.mouseReleased = function () {
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
		return mouseX > drawingX && mouseX < (drawingX + drawingW) && mouseY > drawingY && mouseY < (drawingY + drawingH);
	}

	function pmouseInside() {
		return pmouseX > drawingX && pmouseX < (drawingX + drawingW) && pmouseY > drawingY && pmouseY < (drawingY + drawingH);
	}

	btnOnHoverColor = function () {
		this.color = btncHover;
	}

	btnOnOutsideColor = function () {
		this.color = btnc;
	}
}