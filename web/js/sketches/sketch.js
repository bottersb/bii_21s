// basic scene template
function Sketch() {

	const txtSize = 32, btnDim = 30, SW = 5, strokeColor = 'black';

	let initialized = false;
	let intro = true;

	var lineStack = [],
		lines = [],
		undoLast = false,
		inside = false,
		classifying = false,
		stopClassifying = false;

	var btn_undo, btn_redo;
	var btns = [];

	var drawingX, drawingY, drawingW = 512, drawingH = 512;

	var btncHover = 'orangered', btnc = 'tomato', txtColor = 'white';

	var canvasCopy;

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

		canvasCopy = createImage(drawingW, drawingH);

		initialized = true;
	}

	this.draw = function () {
		noStroke();
		drawBackground();
		btns.forEach(btn => {
			btn.draw();
		});

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

		if (frameCount % FRAME_RATE == 0) {
			if(classifying) {
				classifyCanvas();
			}
			//console.log(lineStack);
		}

		strokeWeight(SW);
		//TODO redraw line stack

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
		for (let j = 0; j < lines.length-1; j++) {
			line(lines[j][0], lines[j][1], lines[j+1][0], lines[j+1][1]);
		}
	}

	this.enter = function () {
		l("args: " + this.sceneArgs);
		positionElements();
	}

	this.leave = function () { }

	this.resize = function () {
		positionElements();
	}

	function positionElements() {
		drawingX = windowWidth / 2 - drawingW / 2;
		drawingY = windowHeight / 2 - drawingH / 2;

		btn_undo.locate(windowWidth / 2 + drawingW / 2 + 10, windowHeight / 2 - drawingH / 2);
		btn_redo.locate(windowWidth / 2 + drawingW / 2 + 10, windowHeight / 2 - drawingH / 2 + 10 + btnDim);
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

	this.mousePressed = function() {
		if (mouseInside()) {
			lines.push([mouseX, mouseY]);
			inside = true;
		}
	}

	this.mouseDragged = function() {
		if(pmouseInside()){
			lines.push([pmouseX, pmouseY]);
		} else if (mouseInside()) {
			lines.push([mouseX, mouseY]);
			inside = true;
		}
	}

	this.mouseReleased = function() {
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

	function classifyCanvas() {
		classifying = true;
		canvasCopy = get(drawingX, drawingY, drawingW, drawingH);
		sketch_classifier.classify(canvasCopy, gotSketchResult);
	}

	btnOnHoverColor = function () {
		this.color = btncHover;
	}

	btnOnOutsideColor = function () {
		this.color = btnc;
	}
}