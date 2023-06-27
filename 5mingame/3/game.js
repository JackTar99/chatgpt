window.onload = function() {
  // Get the canvas element
  var canvas = document.getElementById("gameCanvas");
  var context = canvas.getContext("2d");

  // Game variables
  var invaders = [];
  var bombs = [];
  var missiles = [];
  var defender = {
    x: canvas.width / 2 - 25, // Initial position of the defender
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5
  };
  var gameStatus = "playing"; // "playing", "gameOver", "gameWon"

  // Load images
  var invaderImage = new Image();
  invaderImage.src = "invader.png";
  var bombImage = new Image();
  bombImage.src = "bomb.png";
  var defenderImage = new Image();
  defenderImage.src = "defender.png";
  var missileImage = new Image();
  missileImage.src = "missile.png";

  // Add event listeners for arrow keys and spacebar
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  // Functions for handling keyboard input
  var rightPressed = false;
  var leftPressed = false;
  var spacePressed = false;

  function keyDownHandler(event) {
    if (event.keyCode === 39) {
      rightPressed = true;
    } else if (event.keyCode === 37) {
      leftPressed = true;
    } else if (event.keyCode === 32) {
      spacePressed = true;
    }
  }

  function keyUpHandler(event) {
    if (event.keyCode === 39) {
      rightPressed = false;
    } else if (event.keyCode === 37) {
      leftPressed = false;
    } else if (event.keyCode === 32) {
      spacePressed = false;
    }
  }

  // Game loop
  setInterval(updateGame, 10);

  function updateGame() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStatus === "playing") {
      // Update defender position
      if (rightPressed && defender.x < canvas.width - defender.width) {
        defender.x += defender.speed;
      } else if (leftPressed && defender.x > 0) {
        defender.x -= defender.speed;
      }

      // Update missiles position
      for (var i = 0; i < missiles.length; i++) {
        missiles[i].y -= 5;

        // Check collision with invaders
        for (var j = 0; j < invaders.length; j++) {
          if (
            missiles[i].x < invaders[j].x + invaders[j].width &&
            missiles[i].x + missiles[i].width > invaders[j].x &&
            missiles[i].y < invaders[j].y + invaders[j].height &&
            missiles[i].y + missiles[i].height > invaders[j].y
          ) {
            // Collision detected, remove the invader and missile
            invaders.splice(j, 1);
            missiles.splice(i, 1);
            j--;
            i--;

            // Check if the player has won
            if (invaders.length === 0) {
              gameStatus = "gameWon";
              break;
            }
          }
        }

        // Remove missiles that are out of the canvas
        if (missiles[i] && missiles[i].y < 0) {
          missiles.splice(i, 1);
          i--;
        }
      }

      // Update invaders position and drop bombs
      for (var k = 0; k < invaders.length; k++) {
        invaders[k].x += invaders[k].speedX;

        // Move down and change direction if the invader reaches the edge
        if (
          invaders[k].x + invaders[k].width > canvas.width ||
          invaders[k].x < 0
        ) {
          invaders[k].speedX *= -1;
          invaders[k].y += invaders[k].height;

          // Check if the invaders reach the bottom
          if (invaders[k].y + invaders[k].height > canvas.height) {
            gameStatus = "gameOver";
            break;
          }
        }

        // Drop bombs every 10 seconds
        if (Math.random() < 0.01 && Date.now() - invaders[k].lastBombTime >= 10000) {
          var newBomb = {
            x: invaders[k].x + invaders[k].width / 2 - 5,
            y: invaders[k].y + invaders[k].height,
            width: 10,
            height: 10
          };
          bombs.push(newBomb);
          invaders[k].lastBombTime = Date.now();
        }

        // Check collision with the defender
        if (
          defender.x < invaders[k].x + invaders[k].width &&
          defender.x + defender.width > invaders[k].x &&
          defender.y < invaders[k].y + invaders[k].height &&
          defender.y + defender.height > invaders[k].y
        ) {
          gameStatus = "gameOver";
          break;
        }
      }

      // Update bombs position
      for (var m = 0; m < bombs.length; m++) {
        bombs[m].y += 3;

        // Check collision with the defender
        if (
          bombs[m].x < defender.x + defender.width &&
          bombs[m].x + bombs[m].width > defender.x &&
          bombs[m].y < defender.y + defender.height &&
          bombs[m].y + bombs[m].height > defender.y
        ) {
          gameStatus = "gameOver";
          break;
        }

        // Remove bombs that are out of the canvas
        if (bombs[m] && bombs[m].y > canvas.height) {
          bombs.splice(m, 1);
          m--;
        }
      }

      // Draw the defender
      context.drawImage(defenderImage, defender.x, defender.y, defender.width, defender.height);

      // Draw the missiles
      for (var n = 0; n < missiles.length; n++) {
        context.drawImage(missileImage, missiles[n].x, missiles[n].y, missiles[n].width, missiles[n].height);
      }

      // Draw the invaders
      for (var p = 0; p < invaders.length; p++) {
        context.drawImage(invaderImage, invaders[p].x, invaders[p].y, invaders[p].width, invaders[p].height);
      }

      // Draw the bombs
      for (var q = 0; q < bombs.length; q++) {
        context.drawImage(bombImage, bombs[q].x, bombs[q].y, bombs[q].width, bombs[q].height);
      }

      // Generate new invaders every 1.5 seconds
      if (Math.random() < 0.01) {
        var newInvader = {
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          speedX: 2,
          lastBombTime: 0
        };
        invaders.push(newInvader);
      }

      // Launch missile when space bar is pressed
      if (spacePressed) {
        var newMissile = {
          x: defender.x + defender.width / 2 - 2.5,
          y: defender.y,
          width: 5,
          height: 20
        };
        missiles.push(newMissile);
        spacePressed = false;
      }
    } else {
      // Display game over or game won message
      var message = gameStatus === "gameOver" ? "Game Over" : "You Win!";
      context.font = "40pt Arial";
      context.fillText(message, canvas.width / 2 - 100, canvas.height / 2);
    }
  }
};
