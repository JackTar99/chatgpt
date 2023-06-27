// Load images
const invaderImage = new Image();
invaderImage.src = 'invader.png';

const defenderImage = new Image();
defenderImage.src = 'defender.png';

const missileImage = new Image();
missileImage.src = 'missile.png';

const bombImage = new Image();
bombImage.src = 'bomb.png';

// Game variables
let canvas;
let context;
let defender;
let invaders = [];
let missiles = [];
let bombs = [];
let gameOver = false;
let gameWon = false;
let invaderSpeed = 1.5;

// Create invaders
function createInvader() {
  const invader = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    image: invaderImage,
    destroyed: false,
    dropBombTimeout: null
  };

  invader.x = Math.random() * (canvas.width - invader.width);
  invaders.push(invader);

  invader.dropBombTimeout = setTimeout(() => {
    if (!invader.destroyed) {
      const bomb = {
        x: invader.x + invader.width / 2,
        y: invader.y + invader.height,
        width: 10,
        height: 10,
        image: bombImage
      };

      bombs.push(bomb);
    }
  }, 10000);
}

// Move invaders
function moveInvaders() {
  for (let i = 0; i < invaders.length; i++) {
    const invader = invaders[i];

    if (!invader.destroyed) {
      invader.x += invaderSpeed;

      if (invader.x + invader.width >= canvas.width || invader.x <= 0) {
        invaderSpeed *= -1;
        invader.y += 100;
      }

      if (invader.y + invader.height >= canvas.height) {
        gameOver = true;
        return;
      }
    }
  }
}

// Move defender
function moveDefender(direction) {
  if (direction === 'left' && defender.x > 0) {
    defender.x -= 10;
  } else if (direction === 'right' && defender.x + defender.width < canvas.width) {
    defender.x += 10;
  }
}

// Shoot missile
function shootMissile() {
  const missile = {
    x: defender.x + defender.width / 2,
    y: defender.y,
    width: 10,
    height: 20,
    image: missileImage
  };

  missiles.push(missile);
}

// Collision detection
function checkCollisions() {
  for (let i = 0; i < missiles.length; i++) {
    const missile = missiles[i];

    for (let j = 0; j < invaders.length; j++) {
      const invader = invaders[j];

      if (!invader.destroyed && checkCollision(missile, invader)) {
        invader.destroyed = true;
        clearTimeout(invader.dropBombTimeout);

        missiles.splice(i, 1);
        i--;

        if (invaders.filter(invader => !invader.destroyed).length === 0) {
          gameWon = true;
        }

        break;
      }
    }
  }

  for (let i = 0; i < bombs.length; i++) {
    const bomb = bombs[i];

    if (checkCollision(bomb, defender)) {
      gameOver = true;
      break;
    }
  }
}

// Helper function to check collision between two objects
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Game loop
function gameLoop() {
  if (!gameOver && !gameWon) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    moveInvaders();
    moveDefender();
    checkCollisions();

    // Draw defender
    context.drawImage(defender.image, defender.x, defender.y, defender.width, defender.height);

    // Draw invaders
    for (let i = 0; i < invaders.length; i++) {
      const invader = invaders[i];

      if (!invader.destroyed) {
        context.drawImage(invader.image, invader.x, invader.y, invader.width, invader.height);
      }
    }

    // Draw missiles
    for (let i = 0; i < missiles.length; i++) {
      const missile = missiles[i];

      context.drawImage(missile.image, missile.x, missile.y, missile.width, missile.height);
      missile.y -= 5;

      if (missile.y < 0) {
        missiles.splice(i, 1);
        i--;
      }
    }

    // Draw bombs
    for (let i = 0; i < bombs.length; i++) {
      const bomb = bombs[i];

      context.drawImage(bomb.image, bomb.x, bomb.y, bomb.width, bomb.height);
      bomb.y += 2;

      if (bomb.y + bomb.height > canvas.height) {
        bombs.splice(i, 1);
        i--;
      }
    }

    requestAnimationFrame(gameLoop);
  } else {
    // Game over or game won
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '40pt Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.fillText(gameOver ? 'Game Over' : 'You Win!', canvas.width / 2, canvas.height / 2);
  }
}

// Initialize game
function initialize() {
  canvas = document.getElementById('gameCanvas');
  context = canvas.getContext('2d');

  defender = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 40,
    image: defenderImage
  };

  setInterval(createInvader, 1500);
  setInterval(shootMissile, 500);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      moveDefender('left');
    } else if (event.key === 'ArrowRight') {
      moveDefender('right');
    } else if (event.key === ' ') {
      shootMissile();
    }
  });

  gameLoop();
}

// Start game
initialize();
