// Initialize game variables
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var invaderImage = new Image();
var defenderImage = new Image();
var missileImage = new Image();
var bombImage = new Image();
var invaderWidth = 40;
var invaderHeight = 40;
var defenderWidth = 40;
var defenderHeight = 40;
var missileWidth = 10;
var missileHeight = 20;
var bombWidth = 10;
var bombHeight = 20;
var invaderSpeed = 1;
var defenderSpeed = 5;
var missileSpeed = 5;
var bombSpeed = 3;
var invaderCount = 0;
var invaderMaxCount = 20;
var invaders = [];
var defender;
var missiles = [];
var bombs = [];
var gameStarted = false;
var gameOver = false;
var gameWon = false;
var frameRate = 2;

// Load image files
invaderImage.src = "invader.png";
defenderImage.src = "defender.png";
missileImage.src = "missile.png";
bombImage.src = "bomb.png";

// Create defender object
defender = {
    x: (canvas.width - defenderWidth) / 2,
    y: canvas.height - defenderHeight,
    width: defenderWidth,
    height: defenderHeight,
    image: defenderImage,
    direction: 0 // 0 for still, -1 for left, 1 for right
};

// Event listeners for player input
// Event listeners for player input
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Keydown event handler
function keyDownHandler(event) {
    if (event.keyCode === 39) {
        // Right arrow key
        defender.direction = 1;
    } else if (event.keyCode === 37) {
        // Left arrow key
        defender.direction = -1;
    } else if (event.keyCode === 32 && !gameStarted) {
        // Space bar to start game
        gameStarted = true;
        setInterval(draw, 1000 / frameRate);
    } else if (event.keyCode === 38) {
        // Up arrow key to increase frame rate
        frameRate += 1;
    } else if (event.keyCode === 32) {
        // Space bar to fire missile
        createMissile();
    }
}

// Keyup event handler
function keyUpHandler(event) {
    if (event.keyCode === 39 || event.keyCode === 37) {
        // Right or left arrow key released
        defender.direction = 0;
    }
}

// Create invader object
function createInvader() {
    var invader = {
        x: 0,
        y: 0,
        width: invaderWidth,
        height: invaderHeight,
        image: invaderImage,
        direction: 1, // 1 for right, -1 for left
        bombTimer: null
    };
    invader.x = Math.random() * (canvas.width - invaderWidth);
    invader.y = 0;
    invaders.push(invader);

    // Drop a bomb every 10 seconds
    invader.bombTimer = setInterval(function() {
        if (!gameOver && !gameWon) {
            createBomb(invader.x + invaderWidth / 2, invader.y + invaderHeight);
        }
    }, 10000);
}

// Create bomb object
function createBomb(x, y) {
    var bomb = {
        x: x,
        y: y,
        width: bombWidth,
        height: bombHeight,
        image: bombImage
    };
    bombs.push(bomb);
}

// Create missile object
function createMissile() {
    var missile = {
        x: defender.x + defenderWidth / 2 - missileWidth / 2,
        y: defender.y,
        width: missileWidth,
        height: missileHeight,
        image: missileImage
    };
    missiles.push(missile);
}

// Update game objects
function update() {
    // Update defender position
    defender.x += defenderSpeed * defender.direction;
    if (defender.x < 0) {
        defender.x = 0;
    } else if (defender.x > canvas.width - defenderWidth) {
        defender.x = canvas.width - defenderWidth;
    }

    // Update invaders position
    for (var i = 0; i < invaders.length; i++) {
        var invader = invaders[i];
        invader.x += invaderSpeed * invader.direction;
        if (invader.x > canvas.width - invaderWidth || invader.x < 0) {
            invader.y += 100;
            invader.direction *= -1;
        }
        if (invader.y > canvas.height) {
            // Invader reached the bottom - game over
            gameOver = true;
        }
    }

    // Update missiles position
    for (var i = 0; i < missiles.length; i++) {
        var missile = missiles[i];
        missile.y -= missileSpeed;
        if (missile.y < 0) {
            missiles.splice(i, 1);
            i--;
        }
    }

    // Update bombs position
    for (var i = 0; i < bombs.length; i++) {
        var bomb = bombs[i];
        bomb.y += bombSpeed;
        if (bomb.y + bombHeight > canvas.height) {
            bombs.splice(i, 1);
            i--;
        } else if (
            bomb.x < defender.x + defenderWidth &&
            bomb.x + bombWidth > defender.x &&
            bomb.y < defender.y + defenderHeight &&
            bomb.y + bombHeight > defender.y
        ) {
            // Bomb hit the defender - game over
            gameOver = true;
        }
    }

    // Check for invader-missile collisions
    for (var i = 0; i < invaders.length; i++) {
        var invader = invaders[i];
        for (var j = 0; j < missiles.length; j++) {
            var missile = missiles[j];
            if (
                missile.x < invader.x + invaderWidth &&
                missile.x + missileWidth > invader.x &&
                missile.y < invader.y + invaderHeight &&
                missile.y + missileHeight > invader.y
            ) {
                // Invader hit by missile - remove both
                invaders.splice(i, 1);
                missiles.splice(j, 1);
                i--;
                j--;
                invaderCount++;
                if (invaderCount === invaderMaxCount) {
                    // All invaders destroyed - player wins
                    gameWon = true;
                }
            }
        }
    }
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw defender
    ctx.drawImage(defender.image, defender.x, defender.y, defender.width, defender.height);

    // Draw invaders
    for (var i = 0; i < invaders.length; i++) {
        var invader = invaders[i];
        ctx.drawImage(invader.image, invader.x, invader.y, invader.width, invader.height);
    }

    // Draw missiles
    for (var i = 0; i < missiles.length; i++) {
        var missile = missiles[i];
        ctx.drawImage(missile.image, missile.x, missile.y, missile.width, missile.height);
    }

    // Draw bombs
    for (var i = 0; i < bombs.length; i++) {
        var bomb = bombs[i];
        ctx.drawImage(bomb.image, bomb.x, bomb.y, bomb.width, bomb.height);
    }

    // Draw game over or game won message
    if (gameOver) {
        ctx.font = "40pt Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    } else if (gameWon) {
        ctx.font = "40pt Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Win", canvas.width / 2, canvas.height / 2);
    }
}

// Create new invaders every 1500 milliseconds
setInterval(function() {
    if (invaders.length < invaderMaxCount && gameStarted) {
        createInvader();
    }
}, 1500);

// Set the initial frame rate
setInterval(function() {
    if (frameRate > 0) {
        frameRate--;
    }
}, 1000);

// Game loop
function gameLoop() {
    update();
    draw();

    if (!gameOver && !gameWon) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game loop
requestAnimationFrame(gameLoop);
