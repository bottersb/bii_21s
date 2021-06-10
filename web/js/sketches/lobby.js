function Lobby(){

	var btnW = 100, btnH = 32, margin = 4, imgDim = 100;
	let logoH = 50;

	var btn_iconL, btn_iconR, btn_nameConfirm;
	let btns = [];
	//◀▶

	this.setup = function () {
		ellipseMode(CENTER);
		imageMode(CENTER);
		rectMode(CORNER);
		textSize(btnH);
		stroke(2);
		
		btn_iconL = new Clickable();
		btn_iconL.text = "◀";
		btn_iconL.resize(btnH, btnW);
		btn_iconL.onPress = function () {
			let iconNr = players[socket.id]['icon'];
			if(iconNr <= 1){
				iconNr = Object.keys(icons).length;
			} else {
				iconNr -= 1;
			}
			changeIcon(iconNr);
		}
		btns.push(btn_iconL);

		btn_iconR = new Clickable();
		btn_iconR.text = "▶";
		btn_iconR.resize(btnH, btnW);
		btn_iconR.onPress = function () {
			let iconNr = players[socket.id]['icon'];
			if(iconNr >= Object.keys(icons).length){
				iconNr = 1;
			} else {
				iconNr += 1;
			}
			changeIcon(iconNr);
		}
		btns.push(btn_iconR);

		btn_nameConfirm = new Clickable();
		btn_nameConfirm.text = "SAVE";
		btn_nameConfirm.resize(btnW, btnH);
		btn_nameConfirm.onPress = function () {
			changeName(inp_playerName.value());
		}
		btns.push(btn_nameConfirm);

		inp_playerName.input(inputChanged);
		inp_playerName.value(players[socket.id]['name']);
		
	}
	this.draw = function () {
		drawBackground();
		image(this.sceneManager.logo, windowWidth / 2, height / 8, imgDim, logoH);
		fill(0,0,0,100);
		rect(windowWidth / 2 - 50, 3* windowHeight / 8 - 50, imgDim, imgDim);
		image(icons[players[socket.id]['icon']], windowWidth / 2, 3* windowHeight / 8, imgDim, imgDim);

		btns.forEach(btn => {
			btn.draw();
		});
	}
	this.enter = function () {
		inp_roomCode.value(room['id']);
		inp_roomCode.style('visibility', 'visible');
		inp_roomCode.attribute("readonly","true");
		
		inp_playerName.style('visibility', 'visible');
		
		positionElements();
	}
	this.leave = function () {
		inp_roomCode.value('');
		inp_roomCode.style('visibility', 'hidden');
		inp_roomCode.attribute("readonly","false");
		
		inp_playerName.style('visibility', 'hidden');
	}


	this.resize = function () {
		positionElements();
	}

	function positionElements(){
		inp_roomCode.position((windowWidth / 2) - (btnW / 2) - margin, (windowHeight / 4) - (btnH / 2));
		inp_playerName.position((windowWidth / 2) - (btnW / 2) - margin, (windowHeight / 2) - (btnH / 2));
		
		btn_iconL.locate((windowWidth / 2) - imgDim, (3* windowHeight / 8) - (btnW / 2));
		btn_iconR.locate((windowWidth / 2) + imgDim - btnH, (3* windowHeight / 8) - (btnW / 2));
		btn_nameConfirm.locate((windowWidth / 2) - (btnW/2), (4.5* windowHeight / 8) - (btnH / 2));
	}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}