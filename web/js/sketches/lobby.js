function Lobby() {

	var btnW = 100, btnH = 32, margin = 4, imgDim = 100;
	let logoH = 50, textS = 12;

	var btn_iconL, btn_iconR, btn_nameConfirm, btn_leave, btn_startGame;
	let btns = [];
	var admin = 'ADMIN';

	let currError = false, fade = 255, errorMsg = '';

	var initialized = false;

	this.setup = function () {
		btn_iconL = new Clickable();
		btn_iconL.text = "◀";
		btn_iconL.resize(btnH, btnW);
		btn_iconL.onPress = function () {
			let iconNr = players[socket.id]['icon'];
			if (iconNr <= 1) {
				iconNr = Object.keys(icons).length;
			} else {
				iconNr -= 1;
			}
			changeIcon(iconNr);
		}
		btn_iconL.onHover = btnOnHover;
		btn_iconL.onOutside = btnOnOutside;
		btns.push(btn_iconL);

		btn_iconR = new Clickable();
		btn_iconR.text = "▶";
		btn_iconR.resize(btnH, btnW);
		btn_iconR.onPress = function () {
			let iconNr = players[socket.id]['icon'];
			if (iconNr >= Object.keys(icons).length) {
				iconNr = 1;
			} else {
				iconNr += 1;
			}
			changeIcon(iconNr);
		}
		btn_iconR.onHover = btnOnHover;
		btn_iconR.onOutside = btnOnOutside;
		btns.push(btn_iconR);
		
		btn_nameConfirm = new Clickable();
		btn_nameConfirm.text = "SAVE";
		btn_nameConfirm.resize(btnW, btnH);
		btn_nameConfirm.onPress = function () {
			changeName(inp_playerName.value());
		}
		btn_nameConfirm.onHover = btnOnHover;
		btn_nameConfirm.onOutside = btnOnOutside;
		btns.push(btn_nameConfirm);

		btn_leave = new Clickable();
		btn_leave.text = "LEAVE";
		btn_leave.resize(btnW, btnH);
		btn_leave.onPress = function () {
			leaveRoom();
		}
		btn_leave.onHover = btnOnHover;
		btn_leave.onOutside = btnOnOutside;
		btns.push(btn_leave);
		
		btn_startGame = new Clickable();
		btn_startGame.text = "START";
		btn_startGame.resize(btnW, btnH);
		btn_startGame.onPress = function () {
			startGame();
		}
		btn_startGame.onHover = btnOnHover;
		btn_startGame.onOutside = btnOnOutside;
		btns.push(btn_startGame);

		inp_playerName.input(inputChanged);

		initialized = true;
	}

	this.draw = function () {
		drawBackground();
		image(this.sceneManager.logo, windowWidth / 2, height / 8, imgDim, logoH);
		fill(0, 0, 0, 100);
		noStroke();
		rect(windowWidth / 2 - 50, 3 * windowHeight / 8 - 50, imgDim, imgDim);
		image(icons[players[socket.id]['icon']], windowWidth / 2, 3 * windowHeight / 8, imgDim, imgDim);

		btns.forEach(btn => {
			btn.draw();
		});

		let pRows = 2, pCols = 4;
		let pIds = Object.keys(players);

		for (let pRow = 0; pRow < pRows; pRow++) {
			for (let pCol = 0; pCol < pCols; pCol++) {
				fill(0,0,200,50);
				stroke(50);
				rect(
					(windowWidth / 2) - (2*imgDim) + (pCol * imgDim),
					(6 * windowHeight / 8) - (imgDim) + (pRow * imgDim),
					imgDim,
					imgDim
					);
					
				fill('plum');
				stroke('navy');
				let p = pIds[(pRow * pCols) + pCol];
				if (p !== undefined) {
					image(
						icons[players[p]['icon']],
						(windowWidth / 2) - (3*imgDim/2) + (pCol * imgDim),
						(6 * windowHeight / 8) - (imgDim/2) + (pRow * imgDim),
						imgDim,
						imgDim
					);

					text(
						players[p]['name'], 
						(windowWidth / 2) - (3*imgDim/2) + (pCol * imgDim),
						(6 * windowHeight / 8) - (imgDim/4) + (pRow * imgDim)
					);

					if(p == room['admin']){
						fill('red');
						noStroke();
						text(
							admin, 
							(windowWidth / 2) - (2*imgDim) + (pCol * imgDim) + textWidth(admin)/2,
							(6 * windowHeight / 8) - imgDim + (pRow * imgDim) + textS
						);
					}
				}
			}
		}

		if (currError) {
			textSize(textS);
			noStroke();
			fill(255, 0, 0, fade);
			text(errorMsg, (windowWidth / 2), (7.4 * windowHeight / 8) + btnH);
			fade += -2
			if (fade <= 0) {
				currError = false;
				fade = 255;
			}
		}
	}
	this.enter = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		textStyle(BOLD);
		textAlign(CENTER);
		textSize(textS);
			
		stroke(2);

		currError = false;
		fade = 255;
		errorMsg = '';
		inp_roomCode.value(room['id']);
		inp_roomCode.style('visibility', 'visible');
		inp_roomCode.attribute("readonly", "true");

		inp_playerName.style('visibility', 'visible');
		inp_playerName.value(players[socket.id]['name']);

		positionElements();
	}
	this.leave = function () {
		inp_roomCode.value('');
		inp_roomCode.style('visibility', 'hidden');
		inp_roomCode.attribute("readonly", "false");
		inp_roomCode.removeAttribute('readonly');
		inp_playerName.style('visibility', 'hidden');
	}

	this.resize = function () {
		positionElements();
	}

	function positionElements() {
		inp_roomCode.position((windowWidth / 2) - (btnW / 2) - margin, (windowHeight / 4) - (btnH / 2));
		inp_playerName.position((windowWidth / 2) - (btnW / 2) - margin, (windowHeight / 2) - (btnH / 2));

		btn_iconL.locate((windowWidth / 2) - imgDim, (3 * windowHeight / 8) - (btnW / 2));
		btn_iconR.locate((windowWidth / 2) + imgDim - btnH, (3 * windowHeight / 8) - (btnW / 2));
		btn_nameConfirm.locate((windowWidth / 2) - (btnW / 2), (4.5 * windowHeight / 8) - (btnH / 2));
		btn_leave.locate((windowWidth / 2) - imgDim, (7.4 * windowHeight / 8) - (btnH / 2));
		btn_startGame.locate((windowWidth / 2) + imgDim - btnW, (7.4 * windowHeight / 8) - (btnH / 2));
	}

	this.startGameError = function (msg) {
		currError = true;
		fade = 255;
		errorMsg = msg;
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}

	this.isInitialized = function() {
		return initialized;
	}
}