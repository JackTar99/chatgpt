$(document).ready(function() {
	// Game constants
	var canvas = document.getElementById("gameCanvas");
	var context = canvas.getContext("2d");
	var gameWidth = canvas.width;
	var gameHeight = canvas.height;
	var invaderWidth = 30;
	var invaderHeight = 30;
	var defenderWidth = 40;
	var defenderHeight = 40;
	var missileWidth = 10;
	var missileHeight = 20;
	var bombWidth = 10;
	var bombHeight = 20;
	var invaderSpeed = 2;
	var invaderDrop = 50;
	var bombSpeed = 4;
	var missileSpeed = 5;
	var maxInvaders = 20;
  
	// Game variables
	var invaders = [];
	var bombs = [];
	var missiles = [];
	var defenderX = gameWidth / 2 - defenderWidth / 2;
	var score = 0;
	var gameEnded = false;
  
	// Load images
	var invaderImage = new Image();
	invaderImage.src = "invader.png";
	var defenderImage = new Image();
	defenderImage.src = "defender.png";
	var missileImage = new Image();
	missileImage.src = "missile.png";
	var bombImage = new Image();
	bombImage.src = "bomb.png";
  
	// Event listeners for player controls
	$(document).keydown(function(e) {
	  if (e.which === 37) { // Left arrow key
		defenderX -= 10;
	  } else if (e.which === 39) { // Right arrow key
		defenderX += 10;
	  } else if (e.which === 32) { // Space bar
		fireMissile();
	  }
	});
  
	// Game loop
	function gameLoop() {
	  clearCanvas();
	  moveInvaders();
	  moveBombs();
	  moveMissiles();
	  drawDefender();
	  drawInvaders();
	  drawBombs();
	  drawMissiles();
	  checkCollisions();
	  checkGameEnd();
	  if (!gameEnded) {
		requestAnimationFrame(gameLoop);
	  }
	}
  
	// Clear the canvas
	function clearCanvas() {
	  context.clearRect(0, 0, gameWidth, gameHeight);
	}
  
	// Create a new invader
	function createInvader() {
	  var invader = {
		x: Math.random() * (gameWidth - invaderWidth),
		y: -invaderHeight,
		destroyed: false
	  };
	  invaders.push(invader);
	}
  
	// Move the invaders
	function moveInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		var invader = invaders[i];
		if (!invader.destroyed) {
		  invader.y += invaderSpeed;
		  if (invader.y + invaderHeight >= gameHeight) {
			gameEnded = true;
			showMessage("Game Over");
			break;
		  }
		  if (invader.x <= 0 || invader.x + invaderWidth >= gameWidth) {
			invaderSpeed *= -1;
			invader.y += invaderDrop;
		  }
		  if (Math.random() < 0.01) {
			dropBomb(invader.x + invaderWidth / 2);
		  }
		}
	  }
	}
  
	// Draw the invaders
	function drawInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		var invader = invaders[i];
		if (!invader.destroyed) {
		  context.drawImage(invaderImage, invader.x, invader.y, invaderWidth, invaderHeight);
		}
	  }
	}
  
	// Move the bombs
	function moveBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		var bomb = bombs[i];
		bomb.y += bombSpeed;
		if (bomb.y + bombHeight >= gameHeight) {
		  bombs.splice(i, 1);
		  i--;
		}
	  }
	}
  
	// Draw the bombs
	function drawBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		var bomb = bombs[i];
		context.drawImage(bombImage, bomb.x, bomb.y, bombWidth, bombHeight);
	  }
	}
  
	// Move the missiles
	function moveMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		var missile = missiles[i];
		missile.y -= missileSpeed;
		if (missile.y + missileHeight <= 0) {
		  missiles.splice(i, 1);
		  i--;
		}
	  }
	}
  
	// Draw the missiles
	function drawMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		var missile = missiles[i];
		context.drawImage(missileImage, missile.x, missile.y, missileWidth, missileHeight);
	  }
	}
  
	// Fire a missile from the defender
	function fireMissile() {
	  var missile = {
		x: defenderX + defenderWidth / 2 - missileWidth / 2,
		y: gameHeight - defenderHeight - missileHeight
	  };
	  missiles.push(missile);
	}
  
	// Drop a bomb from an invader
	function dropBomb(x) {
	  var bomb = {
		x: x - bombWidth / 2,
		y: invaderHeight
	  };
	  bombs.push(bomb);
	}
  
	// Draw the defender
	function drawDefender() {
	  context.drawImage(defenderImage, defenderX, gameHeight - defenderHeight, defenderWidth, defenderHeight);
	}
  
	// Check collisions between missiles, bombs, and invaders
	function checkCollisions() {
	  for (var i = 0; i < missiles.length; i++) {
		var missile = missiles[i];
		for (var j = 0; j < invaders.length; j++) {
		  var invader = invaders[j];
		  if (!invader.destroyed && collide(missile, invader)) {
			missiles.splice(i, 1);
			i--;
			invader.destroyed = true;
			score++;
			if (score === maxInvaders) {
			  gameEnded = true;
			  showMessage("You Win!");
			}
			break;
		  }
		}
	  }
	  for (var i = 0; i < bombs.length; i++) {
		var bomb = bombs[i];
		if (collide(bomb, { x: defenderX, y: gameHeight - defenderHeight, width: defenderWidth, height: defenderHeight })) {
		  gameEnded = true;
		  showMessage("Game Over");
		  break;
		}
	  }
	}
  
	// Check if two objects collide
	function collide(a, b) {
	  return a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y;
	}
  
	// Check if the game has ended
	function checkGameEnd() {
	  if (gameEnded) {
		$(document).off("keydown"); // Remove event listener for player controls
	  }
	}
  
	// Show a message on the screen
	function showMessage(text) {
	  $("#message").text(text);
	  $("#messageContainer").show();
	}
  
	// Start the game
	createInvader(); // Initial invader
	var invaderInterval = setInterval(function() {
	  if (invaders.length < maxInvaders) {
		createInvader();
	  } else {
		clearInterval(invaderInterval);
	  }
	}, 1000);
	gameLoop();
  });
  