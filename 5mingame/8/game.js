$(document).ready(function() {
	var canvas = document.getElementById("gameCanvas");
	var context = canvas.getContext("2d");
  
	var invaderImage = new Image();
	invaderImage.src = "invader.png";
	var bombImage = new Image();
	bombImage.src = "bomb.png";
	var defenderImage = new Image();
	defenderImage.src = "defender.png";
	var missileImage = new Image();
	missileImage.src = "missile.png";
  
	var defenderWidth = 50;
	var defenderHeight = 50;
	var defenderX = canvas.width / 2 - defenderWidth / 2;
	var defenderY = canvas.height - defenderHeight;
  
	var invaders = [];
	var invaderWidth = 50;
	var invaderHeight = 50;
	var invaderSpeed = 1;
	var maxInvaders = 20;
	var invaderTimerMin = 5000; // milliseconds
	var invaderTimerMax = 20000; // milliseconds
  
	var missiles = [];
	var missileWidth = 10;
	var missileHeight = 30;
	var missileSpeed = 5;
  
	var bombs = [];
	var bombWidth = 20;
	var bombHeight = 20;
	var bombSpeed = 2;
  
	var gameInterval;
	var gameOver = false;
	var gameWon = false;
  
	function drawDefender() {
	  context.drawImage(defenderImage, defenderX, defenderY, defenderWidth, defenderHeight);
	}
  
	function drawInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		context.drawImage(invaderImage, invaders[i].x, invaders[i].y, invaderWidth, invaderHeight);
	  }
	}
  
	function drawMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		context.drawImage(missileImage, missiles[i].x, missiles[i].y, missileWidth, missileHeight);
	  }
	}
  
	function drawBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		context.drawImage(bombImage, bombs[i].x, bombs[i].y, bombWidth, bombHeight);
	  }
	}
  
	function moveDefender() {
	  $(document).keydown(function(e) {
		if (e.which === 37) { // left arrow key
		  if (defenderX > 0) {
			defenderX -= 10;
		  }
		} else if (e.which === 39) { // right arrow key
		  if (defenderX < canvas.width - defenderWidth) {
			defenderX += 10;
		  }
		} else if (e.which === 32) { // spacebar
		  if (!gameOver && !gameWon) {
			missiles.push({
			  x: defenderX + defenderWidth / 2 - missileWidth / 2,
			  y: defenderY - missileHeight,
			});
		  }
		}
	  });
	}
  
	function moveInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		var invader = invaders[i];
  
		if (!invader.dead) {
		  invader.x += invaderSpeed;
  
		  if (invader.x >= canvas.width - invaderWidth || invader.x <= 0) {
			invaderSpeed *= -1;
			invader.y += 50;
		  }
  
		  if (invader.y >= canvas.height - invaderHeight) {
			gameOver = true;
			stopGame();
		  }
		}
	  }
	}
  
	function moveMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		missiles[i].y -= missileSpeed;
  
		if (missiles[i].y <= 0) {
		  missiles.splice(i, 1);
		  i--;
		} else {
		  checkCollision(missiles[i]);
		}
	  }
	}
  
	function moveBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		bombs[i].y += bombSpeed;
  
		if (bombs[i].y >= canvas.height) {
		  bombs.splice(i, 1);
		  i--;
		} else {
		  checkCollision(bombs[i]);
		}
	  }
	}
  
	function checkCollision(obj) {
	  for (var i = 0; i < invaders.length; i++) {
		var invader = invaders[i];
  
		if (!invader.dead && obj.x < invader.x + invaderWidth &&
			obj.x + obj.width > invader.x &&
			obj.y < invader.y + invaderHeight &&
			obj.y + obj.height > invader.y) {
		  if (obj === missiles[i]) {
			invader.dead = true;
			missiles.splice(i, 1);
			i--;
  
			if (invaders.filter(invader => invader.dead).length === maxInvaders) {
			  gameWon = true;
			  stopGame();
			}
		  } else if (obj === bombs[i]) {
			if (obj.y + bombHeight >= defenderY &&
				obj.x + bombWidth >= defenderX &&
				obj.x <= defenderX + defenderWidth) {
			  gameOver = true;
			  stopGame();
			}
			bombs.splice(i, 1);
			i--;
		  }
		}
	  }
	}
  
	function generateInvaders() {
	  if (invaders.length < maxInvaders && !gameOver && !gameWon) {
		invaders.push({
		  x: 0,
		  y: 0,
		  timer: getRandomTimer(),
		  dead: false,
		});
	  }
	}
  
	function generateBombs(invaderIndex) {
	  bombs.push({
		x: invaders[invaderIndex].x + invaderWidth / 2 - bombWidth / 2,
		y: invaders[invaderIndex].y + invaderHeight,
		width: bombWidth,
		height: bombHeight,
	  });
	}
  
	function getRandomTimer() {
	  return Math.floor(Math.random() * (invaderTimerMax - invaderTimerMin + 1)) + invaderTimerMin;
	}
  
	function stopGame() {
	  clearInterval(gameInterval);
  
	  if (gameOver) {
		$("#gameOver").removeClass("d-none");
	  } else if (gameWon) {
		$("#gameWon").removeClass("d-none");
	  }
	}
  
	function gameLoop() {
	  context.clearRect(0, 0, canvas.width, canvas.height);
  
	  if (!gameOver && !gameWon) {
		drawDefender();
		drawInvaders();
		drawMissiles();
		drawBombs();
		moveInvaders();
		moveMissiles();
		moveBombs();
	  }
  
	  if (gameOver || gameWon) {
		stopGame();
	  }
	}
  
	gameInterval = setInterval(gameLoop, 10);
	setInterval(generateInvaders, 1000);
	moveDefender();
  });
  