$(document).ready(function() {
	var canvas = document.getElementById('gameCanvas');
	var ctx = canvas.getContext('2d');
	
	var gameWidth = canvas.width;
	var gameHeight = canvas.height;
	
	var defender = {
	  x: gameWidth / 2 - 25,
	  y: gameHeight - 50,
	  width: 50,
	  height: 50,
	  speed: 5,
	  missileSpeed: 8,
	  missileCooldown: 500,
	  lastMissileTime: 0
	};
	
	var invaders = [];
	var missiles = [];
	var bombs = [];
	
	var invaderImage = new Image();
	invaderImage.src = 'invader.png';
	
	var defenderImage = new Image();
	defenderImage.src = 'defender.png';
	
	var missileImage = new Image();
	missileImage.src = 'missile.png';
	
	var bombImage = new Image();
	bombImage.src = 'bomb.png';
	
	var gameOver = false;
	var gameWon = false;
	
	function update() {
	  if (gameOver || gameWon) {
		return;
	  }
	  
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
	  
	  if (invaders.length === 20 && missiles.length === 0 && bombs.length === 0) {
		gameWon = true;
		$('#gameWon').removeClass('d-none');
	  }
	}
	
	function clearCanvas() {
	  ctx.clearRect(0, 0, gameWidth, gameHeight);
	}
	
	function moveDefender() {
	  if (rightPressed && defender.x + defender.width < gameWidth) {
		defender.x += defender.speed;
	  } else if (leftPressed && defender.x > 0) {
		defender.x -= defender.speed;
	  }
	}
	
	function drawDefender() {
	  ctx.drawImage(defenderImage, defender.x, defender.y, defender.width, defender.height);
	}
	
	function moveMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		missiles[i].y -= defender.missileSpeed;
		if (missiles[i].y < 0) {
		  missiles.splice(i, 1);
		  i--;
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
		invaders[i].x += invaders[i].speedX;
		if (invaders[i].x + invaders[i].width > gameWidth || invaders[i].x < 0) {
		  invaders[i].speedX *= -1;
		  invaders[i].y += invaders[i].speedY;
		}
		
		if (invaders[i].y + invaders[i].height > gameHeight) {
		  gameOver = true;
		  $('#gameOver').removeClass('d-none');
		}
	  }
	}
	
	function drawInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		ctx.drawImage(invaderImage, invaders[i].x, invaders[i].y, invaders[i].width, invaders[i].height);
	  }
	}
	
	function moveBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		bombs[i].y += bombs[i].speed;
		if (bombs[i].y + bombs[i].height > gameHeight) {
		  bombs.splice(i, 1);
		  i--;
		}
	  }
	}
	
	function drawBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		ctx.drawImage(bombImage, bombs[i].x, bombs[i].y, bombs[i].width, bombs[i].height);
	  }
	}
	
	function checkCollision() {
	  for (var i = 0; i < invaders.length; i++) {
		for (var j = 0; j < missiles.length; j++) {
		  if (
			missiles[j].x < invaders[i].x + invaders[i].width &&
			missiles[j].x + missiles[j].width > invaders[i].x &&
			missiles[j].y < invaders[i].y + invaders[i].height &&
			missiles[j].y + missiles[j].height > invaders[i].y
		  ) {
			invaders.splice(i, 1);
			missiles.splice(j, 1);
			i--;
			j--;
		  }
		}
		
		if (
		  defender.x < invaders[i].x + invaders[i].width &&
		  defender.x + defender.width > invaders[i].x &&
		  defender.y < invaders[i].y + invaders[i].height &&
		  defender.y + defender.height > invaders[i].y
		) {
		  gameOver = true;
		  $('#gameOver').removeClass('d-none');
		}
	  }
	  
	  for (var i = 0; i < bombs.length; i++) {
		if (
		  bombs[i].x < defender.x + defender.width &&
		  bombs[i].x + bombs[i].width > defender.x &&
		  bombs[i].y < defender.y + defender.height &&
		  bombs[i].y + bombs[i].height > defender.y
		) {
		  gameOver = true;
		  $('#gameOver').removeClass('d-none');
		}
	  }
	}
	
	var rightPressed = false;
	var leftPressed = false;
	
	$(document).keydown(function(e) {
	  if (e.key === 'ArrowRight') {
		rightPressed = true;
	  } else if (e.key === 'ArrowLeft') {
		leftPressed = true;
	  } else if (e.key === ' ') {
		if (Date.now() - defender.lastMissileTime >= defender.missileCooldown) {
		  missiles.push({
			x: defender.x + defender.width / 2 - 5,
			y: defender.y,
			width: 10,
			height: 30
		  });
		  defender.lastMissileTime = Date.now();
		}
	  }
	});
	
	$(document).keyup(function(e) {
	  if (e.key === 'ArrowRight') {
		rightPressed = false;
	  } else if (e.key === 'ArrowLeft') {
		leftPressed = false;
	  }
	});
	
	setInterval(update, 20);
	
	var invaderCreationInterval = setInterval(function() {
	  if (invaders.length === 20) {
		clearInterval(invaderCreationInterval);
	  } else {
		invaders.push({
		  x: 0,
		  y: 0,
		  width: 50,
		  height: 50,
		  speedX: 3,
		  speedY: 100,
		  lastBombTime: 0
		});
	  }
	}, 4000);
	
	setInterval(function() {
	  for (var i = 0; i < invaders.length; i++) {
		if (Date.now() - invaders[i].lastBombTime >= 10000) {
		  bombs.push({
			x: invaders[i].x + invaders[i].width / 2 - 5,
			y: invaders[i].y + invaders[i].height,
			width: 10,
			height: 30,
			speed: 3
		  });
		  invaders[i].lastBombTime = Date.now();
		}
	  }
	}, 1000);
  });
  