$(document).ready(function () {
	// Game variables
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
	var invaders = [];
	var defender;
	var missiles = [];
	var bombs = [];
	var gameOver = false;
	var gameWon = false;
	var invaderImage = new Image();
	var defenderImage = new Image();
	var missileImage = new Image();
	var bombImage = new Image();

	invaderImage.src = "invader.png";
	defenderImage.src = "defender.png";
	missileImage.src = "missile.png";
	bombImage.src = "bomb.png";

	// Add event listeners for player controls
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);

	// Create defender
	defender = {
		x: canvas.width / 2 - 25,
		y: canvas.height - 50,
		width: 50,
		height: 50,
		speed: 2,
		movingLeft: false,
		movingRight: false
	};

	// Create invaders
	setInterval(createInvader, 1000);
	setInterval(dropBomb, 10000);

	// Game loop
	setInterval(update, 20);

	function createInvader() {
		if (invaders.length < 20) {
			var invader = {
				x: 0,
				y: 0,
				width: 50,
				height: 50,
				speed: 1,
				destroyed: false
			};
			invaders.push(invader);
		}
	}

	function dropBomb() {
		if (!gameOver && !gameWon) {
			for (var i = 0; i < invaders.length; i++) {
				if (!invaders[i].destroyed) {
					var bomb = {
						x: invaders[i].x + invaders[i].width / 2 - 5,
						y: invaders[i].y + invaders[i].height,
						width: 10,
						height: 10,
						speed: 3
					};
					bombs.push(bomb);
				}
			}
		}
	}

	function update() {
		if (!gameOver && !gameWon) {
			clearCanvas();
			moveDefender();
			drawDefender();
			moveMissiles();
			drawMissiles();
			moveInvaders();
			drawInvaders();
			moveBombs();
			drawBombs();
			checkCollision();
			checkGameStatus();
		} else {
			endGame();
		}
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function moveDefender() {
		if (defender.movingLeft && defender.x > 0) {
			defender.x -= defender.speed;
		} else if (defender.movingRight && defender.x < canvas.width - defender.width) {
			defender.x += defender.speed;
		}
	}

	function drawDefender() {
		ctx.drawImage(defenderImage, defender.x, defender.y, defender.width, defender.height);
	}

	function handleKeyDown(event) {
		if (event.keyCode === 37) { // Left arrow key
			defender.movingLeft = true;
		}
		if (event.keyCode === 39) { // Right arrow key
			defender.movingRight = true;
		}
		if (event.keyCode === 32) { // Space bar
			fireMissile();
		}
	}

	function handleKeyUp(event) {
		if (event.keyCode === 37) { // Left arrow key
			defender.movingLeft = false;
		}
		if (event.keyCode === 39) { // Right arrow key
			defender.movingRight = false;
		}
	}

	function fireMissile() {
		if (!gameOver && !gameWon) {
			var missile = {
				x: defender.x + defender.width / 2 - 5,
				y: defender.y,
				width: 10,
				height: 20,
				speed: 3 
			};
			missiles.push(missile);
		}
	}

	function moveMissiles() {
		for (var i = 0; i < missiles.length; i++) {
			missiles[i].y -= missiles[i].speed;
			if (missiles[i].y < 0) {
				missiles.splice(i, 1);
			}
		}
	}

	function drawMissiles() {
		for (var i = 0; i < missiles.length; i++) {
			ctx.drawImage(missileImage, missiles[i].x, missiles[i].y, missiles[i].width, missiles[i].height);
		}
	}

	function moveInvaders() {
		for (var i = 0; i < invaders.length; i++) {
			if (!invaders[i].destroyed) {
				invaders[i].x += invaders[i].speed;
				if (invaders[i].x + invaders[i].width > canvas.width || invaders[i].x < 0) {
					invaders[i].speed *= -1;
					invaders[i].y += 50;
				}
				if (invaders[i].y + invaders[i].height > canvas.height) {
					gameOver = true;
				}
			}
		}
	}

	function drawInvaders() {
		for (var i = 0; i < invaders.length; i++) {
			if (!invaders[i].destroyed) {
				ctx.drawImage(invaderImage, invaders[i].x, invaders[i].y, invaders[i].width, invaders[i].height);
			}
		}
	}

	function moveBombs() {
		for (var i = 0; i < bombs.length; i++) {
			bombs[i].y += bombs[i].speed;
			if (bombs[i].y + bombs[i].height > canvas.height) {
				bombs.splice(i, 1);
			}
		}
	}

	function drawBombs() {
		for (var i = 0; i < bombs.length; i++) {
			ctx.drawImage(bombImage, bombs[i].x, bombs[i].y, bombs[i].width, bombs[i].height);
		}
	}

	function checkCollision() {
		for (var i = 0; i < missiles.length; i++) {
			for (var j = 0; j < invaders.length; j++) {
				if (!invaders[j].destroyed && collisionDetection(missiles[i], invaders[j])) {
					missiles.splice(i, 1);
					invaders[j].destroyed = true;
				}
			}
		}
		for (var i = 0; i < bombs.length; i++) {
			if (collisionDetection(defender, bombs[i])) {
				gameOver = true;
			}
		}
	}

	function collisionDetection(object1, object2) {
		return (
			object1.x < object2.x + object2.width &&
			object1.x + object1.width > object2.x &&
			object1.y < object2.y + object2.height &&
			object1.y + object1.height > object2.y
		);
	}

	function checkGameStatus() {
		// RRB .every returns true if there are zero invaders
		if (invaders.length == 20) {
			if (invaders.every(invader => invader.destroyed)) {
				gameWon = true;
			}
		}
	}

	function endGame() {
		ctx.font = "20pt Arial";
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		if (gameWon) {
			ctx.fillText("Congratulations! You won!", canvas.width / 2, canvas.height / 2);
		} else {
			ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
		}
	}
});
