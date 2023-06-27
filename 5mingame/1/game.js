// Game Constants
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 30;
const DEFENDER_WIDTH = 40;
const DEFENDER_HEIGHT = 40;
const MISSILE_WIDTH = 5;
const MISSILE_HEIGHT = 15;
const BOMB_WIDTH = 10;
const BOMB_HEIGHT = 20;
const INVADER_SPEED = 1;
const BOMB_DROP_INTERVAL = 10000; // 10 seconds
const INVADER_CREATION_INTERVAL = 1500; // 1.5 seconds

// Game State
let invaders = [];
let missiles = [];
let bombs = [];
let defenderX = (CANVAS_WIDTH - DEFENDER_WIDTH) / 2;
let gameOver = false;
let gameWon = false;

// Initialize the canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const invaderImage = new Image();
invaderImage.src = 'invader.png';
const defenderImage = new Image();
defenderImage.src = 'defender.png';
const missileImage = new Image();
missileImage.src = 'missile.png';
const bombImage = new Image();
bombImage.src = 'bomb.png';

// Event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Game loop
function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

// Update game state
function update() {
  // Move the invaders
  invaders.forEach(invader => {
    invader.x += invader.direction * INVADER_SPEED;
    if (invader.x + INVADER_WIDTH >= CANVAS_WIDTH || invader.x <= 0) {
      invader.direction *= -1;
      invader.y += INVADER_HEIGHT;
      if (invader.y + INVADER_HEIGHT >= CANVAS_HEIGHT) {
        gameOver = true;
      }
    }
  });

  // Move the defender
  if (isKeyDown('ArrowLeft') && defenderX > 0) {
    defenderX -= 5;
  }
  if (isKeyDown('ArrowRight') && defenderX + DEFENDER_WIDTH < CANVAS_WIDTH) {
    defenderX += 5;
  }

  // Move the missiles
  missiles.forEach(missile => {
    missile.y -= 5;
    checkMissileCollision(missile);
  });

  // Move the bombs
  bombs.forEach(bomb => {
    bomb.y += 3;
    checkBombCollision(bomb);
  });

  // Check game over or win conditions
  if (invaders.length >= 20) {
    gameWon = true;
    gameOver = true;
  }
}

// Check collision between missiles and invaders
function checkMissileCollision(missile) {
  for (let i = 0; i < invaders.length; i++) {
    const invader = invaders[i];
    if (
      missile.x < invader.x + INVADER_WIDTH &&
      missile.x + MISSILE_WIDTH > invader.x &&
      missile.y < invader.y + INVADER_HEIGHT &&
      missile.y + MISSILE_HEIGHT > invader.y
    ) {
      invaders.splice(i, 1);
      missiles.splice(missiles.indexOf(missile), 1);
      break;
    }
  }
}

// Check collision between bombs and defender
function checkBombCollision(bomb) {
  if (
    bomb.x < defenderX + DEFENDER_WIDTH &&
    bomb.x + BOMB_WIDTH > defenderX &&
    bomb.y < CANVAS_HEIGHT &&
    bomb.y + BOMB_HEIGHT > CANVAS_HEIGHT - DEFENDER_HEIGHT
  ) {
    gameOver = true;
  }
}

// Draw game objects
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw the invaders
  invaders.forEach(invader => {
    ctx.drawImage(invaderImage, invader.x, invader.y, INVADER_WIDTH, INVADER_HEIGHT);
  });

  // Draw the defender
  ctx.drawImage(defenderImage, defenderX, CANVAS_HEIGHT - DEFENDER_HEIGHT, DEFENDER_WIDTH, DEFENDER_HEIGHT);

  // Draw the missiles
  missiles.forEach(missile => {
    ctx.drawImage(missileImage, missile.x, missile.y, MISSILE_WIDTH, MISSILE_HEIGHT);
  });

  // Draw the bombs
  bombs.forEach(bomb => {
    ctx.drawImage(bombImage, bomb.x, bomb.y, BOMB_WIDTH, BOMB_HEIGHT);
  });

  // Draw game over or win message
  if (gameOver) {
    drawText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'red', '40pt');
  } else if (gameWon) {
    drawText('You Win!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'green', '40pt');
  }
}

// Utility functions
function isKeyDown(key) {
  return keyState[key] === true;
}

function drawText(text, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = size + ' Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

// Keyboard input handling
const keyState = {};

function handleKeyDown(event) {
  keyState[event.key] = true;
  if (event.key === ' ') {
    missiles.push({ x: defenderX + DEFENDER_WIDTH / 2 - MISSILE_WIDTH / 2, y: CANVAS_HEIGHT - DEFENDER_HEIGHT });
  }
}

function handleKeyUp(event) {
  keyState[event.key] = false;
}

// Create invaders at regular intervals
let invaderCreationIntervalId = setInterval(createInvader, INVADER_CREATION_INTERVAL);

function createInvader() {
  if (invaders.length < 20) {
    invaders.push({ x: 0, y: 0, direction: 1 });
    let bombDropIntervalId = setInterval(() => {
      if (!gameOver) {
        bombs.push({ x: invaders[invaders.length - 1].x + INVADER_WIDTH / 2 - BOMB_WIDTH / 2, y: INVADER_HEIGHT });
      }
    }, BOMB_DROP_INTERVAL);
    setTimeout(() => {
      clearInterval(bombDropIntervalId);
    }, BOMB_DROP_INTERVAL * invaders.length);
  } else {
    clearInterval(invaderCreationIntervalId);
  }
}

// Start the game loop
gameLoop();
