function win_screen(){

    var label = 'lost';
    var btnW = 100, btnH = 32;
    var btns = [];
    const fireworks = [];
	let gravity;

	var player = ['João','Tomás','Catarina','Benjamin','João','Tomás','Catarina','Benjamin'];
	var n_players = 8;
	var score = [1,12,5,9,1,12,5,9];

	this.setup = function () {

		btn_nextGame = new Clickable();
		btn_nextGame.text = "NEXT GAME";
		btn_nextGame.resize(btnW*2, btnH*2);
		btn_nextGame.onPress = function () {
			l("Next game");
			gotoGameSelect();
		}
		btns.push(btn_nextGame);

		btn_endGame = new Clickable();
		btn_endGame.text = "END GAME";
		btn_endGame.resize(btnW*2, btnH*2);
		btn_endGame.onPress = function () {
			l("End game");
			leaveRoom();
		}
		btns.push(btn_endGame);
	}

	this.enter = function () {}

	this.leave = function () {}

	this.draw = function () {
		drawBackground();
        stroke(0);
        strokeWeight(4);
        textSize(200);
        textAlign(CENTER, CENTER);

        if (label == 'win'){
            fill(89, 254, 0);
            text("You Won!", width/2, height/5);
        }

        if (label == 'lost'){
            textSize(100);
            fill(255, 45, 0);
            text("Scores!", width/2, height/4);
        }
        var n = 0;
        for (let i = 0; i < n_players; i++){
            var new_n;
            new_n = textWidth(player[i] + ": " + score[i]);
            if (new_n > n) {
                n = new_n;
            }
        }
        fill(255, 187, 2);
        stroke(0);
        strokeWeight(4);
        // TODO Rectangle doesnt work
        //rect(width/2 -n/6 , height/2 - n_players*height/(100)*2.4, n*width/7000, n_players*height/15, 20);

        textSize(50);
        //fill(254, 128, 82);
        fill(255, 187, 2);
        textAlign(CENTER, CENTER);

        let pRows = 2, pCols = 4;
        let pIds = Object.keys(players);
        let i = 0;
        /*
        for (let pRow = 0; pRow < pRows; pRow++) {
            for (let pCol = 0; pCol < pCols; pCol++) {
                let p = pIds[(pRow * pCols) + pCol];
                if (p !== undefined) {
                    text(players[p]['name'] + ": " + room['scores'][p], width/2, height/2 + 60*i);
                    i++;
                }
            }
        }*/

        for (let i = 0; i < n_players; i++){
            var m = player[i] + ": " + score[i]
            text(player[i] + ": " + score[i], width/2 , height/2 - n_players*height/50 + i*height/15);
        }
        /*
        if (label == 'win') {
            if (random(1) < 0.04) {
                fireworks.push(new Firework());
            }
            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                fireworks[i].show();

                if (fireworks[i].done()) {
                    fireworks.splice(i, 1);
                }
            }
        }*/
        if (label == 'end') {
            fill(20, 96, 168);
            stroke(0);
            strokeWeight(4);
            textSize(200);
            textAlign(CENTER, CENTER);
            text("The End!", width/2, height/5);
            btn_endGame.locate((windowWidth / 2) - btnW, (2 * windowHeight / 2.5) - (btnH / 2));
            btn_endGame.draw();
        }
        else {
            btn_nextGame.locate((windowWidth / 2) - btnW * 2.5, (2 * windowHeight / 2.5) - (btnH / 2));
            btn_endGame.locate((windowWidth / 2) + btnW * 0.5, (2 * windowHeight / 2.5) - (btnH / 2));
            btns.forEach(btn => {
                btn.draw();
            });
        }
	}

	this.resize = function () {}

	this.setMgr = function (mgr) {
		this.mgr = mgr;
	}
}