$(document).ready(function() {
	var canvas = document.getElementById("gameCanvas");
	var ctx = canvas.getContext("2d");
  
	var defender = new Image();
	defender.src = "defender.png";
	var missile = new Image();
	missile.src = "missile.png";
	var invader = new Image();
	invader.src = "invader.png";
	var bomb = new Image();
	bomb.src = "bomb.png";
  
	var invaders = [];
	var missiles = [];
	var bombs = [];
	var defenderX = canvas.width / 2 - 25;
	var defenderY = canvas.height - 50;
	var invaderWidth = 50;
	var invaderHeight = 50;
	var invaderSpeed = 2;
	var missileSpeed = 5;
	var bombSpeed = 3;
	var invaderInterval;
	var bombInterval;
  
	function drawDefender() {
	  ctx.drawImage(defender, defenderX, defenderY, 50, 50);
	}
  
	function drawMissiles() {
	  for (var i = 0; i < missiles.length; i++) {
		ctx.drawImage(missile, missiles[i].x, missiles[i].y, 10, 20);
	  }
	}
  
	function drawInvaders() {
	  for (var i = 0; i < invaders.length; i++) {
		ctx.drawImage(invader, invaders[i].x, invaders[i].y, invaderWidth, invaderHeight);
	  }
	}
  
	function drawBombs() {
	  for (var i = 0; i < bombs.length; i++) {
		ctx.drawImage(bomb, bombs[i].x, bombs[i].y, 10, 20);
	  }
	}
  
	function collisionDetection() {
	  for (var i = 0; i < missiles.length; i++) {
		for (var j = 0; j < invaders.length; j++) {
		  if (
			missiles[i].x >= invaders[j].x &&
			missiles[i].x <= invaders[j].x + invaderWidth &&
			missiles[i].y >= invaders[j].y &&
			missiles[i].y <= invaders[j].y + invaderHeight
		  ) {
			invaders.splice(j, 1);
			missiles.splice(i, 1);
			if (invaders.length === 0) {
			  clearInterval(invaderInterval);
			  clearInterval(bombInterval);
			  alert("You win!");
			  location.reload();
			}
			break;
		  }
		}
	  }
  
	  for (var i = 0; i < bombs.length; i++) {
		if (
		  bombs[i].x >= defenderX &&
		  bombs[i].x <= defenderX + 50 &&
		  bombs[i].y >= defenderY &&
		  bombs[i].y <= defenderY + 50
		) {
		  clearInterval(invaderInterval);
		  clearInterval(bombInterval);
		  alert("Game over!");
		  location.reload();
		}
	  }
	}
  
	function updateCanvas() {
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  drawDefender();
	  drawMissiles();
	  drawInvaders();
	  drawBombs();
	  collisionDetection();
  
	  for (var i = 0; i < missiles.length; i++) {
		missiles[i].y -= missileSpeed;
		if (missiles[i].y < 0) {
		  missiles.splice(i, 1);
		}
	  }
  
	  for (var i = 0; i < invaders.length; i++) {
		if (invaders[i].x + invaderWidth > canvas.width || invaders[i].x < 0) {
		  invaders[i].speed *= -1;
		  invaders[i].y += invaderHeight;
		}
		invaders[i].x += invaders[i].speed;
  
		if (invaders[i].y + invaderHeight > canvas.height) {
		  clearInterval(invaderInterval);
		  clearInterval(bombInterval);
		  alert("Game over!");
		  location.reload();
		}
	  }
  
	  for (var i = 0; i < bombs.length; i++) {
		bombs[i].y += bombSpeed;
		if (bombs[i].y > canvas.height) {
		  bombs.splice(i, 1);
		}
	  }
	}
  
	function launchMissile() {
	  missiles.push({
		x: defenderX + 20,
		y: defenderY
	  });
	}
  
	function dropBomb() {
	  var randomInvader = invaders[Math.floor(Math.random() * invaders.length)];
	  bombs.push({
		x: randomInvader.x + invaderWidth / 2 - 5,
		y: randomInvader.y + invaderHeight
	  });
	}
  
	function createInvader() {
	  invaders.push({
		x: 0,
		y: 0,
		speed: invaderSpeed
	  });
	  if (invaders.length === 20) {
		clearInterval(invaderInterval);
	  }
	}
  
	$(document).keydown(function(e) {
	  if (e.keyCode === 37 && defenderX > 0) {
		defenderX -= 10; // Move defender left
	  } else if (e.keyCode === 39 && defenderX < canvas.width - 50) {
		defenderX += 10; // Move defender right
	  } else if (e.keyCode === 32) {
		launchMissile(); // Launch missile on spacebar press
	  }
	});
  
	invaderInterval = setInterval(createInvader, 4000);
	bombInterval = setInterval(dropBomb, 10000);
	setInterval(updateCanvas, 10);
  });
  