class Player {

	constructor(dx, dy, x, y, width, height, image) {
		this.image = new Image(width, height);
		this.image.src = image;
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.width = width;
		this.height = height;
	}

	draw() {
		let image = this.pickImage(this.dx);

		game.context.drawImage(image, this.x, this.y, this.width, this.height);
	}

	pickImage(direction) {
		return direction < 0 ? this.reverse_image : this.standard_image;
	}

}


class Buttons {
	constructor(canvas) {

		let buttonRow = canvas.height - default_button_height / 2;
		let rect = canvas.getBoundingClientRect();
		let scaleX = rect.width / canvas.width;

		this.leftArrow = new Button("img/left_arrow.png",
			50,
			buttonRow,
			this.moveLeft);

		this.rightArrow = new Button("img/right_arrow.png",
			canvas.width - (50+default_button_width),
			buttonRow,
			this.moveRight);

		this.fireButton = new Button("img/fire_button.png",
			(canvas.width / 2) - (default_button_width / 2),
			buttonRow,
			this.throwBale);
	}

	touch(x, y) {

		if (this.fireButton.touch(x, y)) {
			game.player.throwBale();
		} else if (this.rightArrow.touch(x, y)) {
			game.player.moveRight();
		} else if (this.leftArrow.touch(x, y)) {
			game.player.moveLeft();
		} else if (y < game.player.y) {
			game.togglePause(true);
		}
	}

	draw() {
		this.leftArrow.draw();
		this.rightArrow.draw();
		this.fireButton.draw();
	}

	reSize() {
		this.leftArrow.reSize();
		this.rightArrow.reSize();
		this.fireButton.reSize();
	}
}

class Hayfield {
	constructor(canvas) {
		this.canvas = canvas;
		this.height = canvas.height / 10;
		this.width = canvas.width;
		this.hayfield = new Image(this.canvas.width, this.height);
		this.hayfield.src = "img/field.png";
	}

	draw() {
		let x = 0;
		let y = this.canvas.height - this.height;

		game.context.drawImage(this.hayfield, x, y, this.width, this.height);
	}
}

class Game {

	constructor(canvas) {
		self = this;
		this.state = "Playing";
		this.cowLimit = level.max_cows;
		this.cows = new Array();
		this.cow_pulses = new Array();
		this.hay_bales = new Array();;
		this.score = 0;
		this.canvas = canvas;

		player_height = this.canvas.height / 15;
		player_width = this.canvas.height / 15;

		this.stars = new StarField(this.canvas);
		this.healthBar = new HealthBar();
		this.buttons = new Buttons(canvas);
		this.hayfield = new Hayfield(canvas);

		this.pausePic = new Image(64, 120);
		this.pausePic.src = "img/pause.png";


		this.context = this.canvas.getContext("2d");
		this.player = new Farmer(this);
		this.newCowDelay = 50;
		this.pausedSounds = new Array();
		this.complaints = 0;
		document.getElementById("banner").hidden = true;
		this.canvas.scrollIntoView(false);
		this.readyToPanic = true;
		this.currentTouches = [];
	}

	complain() {
		this.complaints++;
	}

	updateComplaints() {
		if (this.complaints && this.readyToPanic) {
			this.readyToPanic = false;
			let id = paniced_cow_noise;
			id.volume = Math.random() * 0.2 + 0.2;
			id.play();
			this.complaints--;
		}
	}

	updatePulses() {
		let collision = false;

		for (let i = 0; i < this.cow_pulses.length; i++) {
			let cow_pulse = this.cow_pulses[i];
			cow_pulse.y += cow_pulse.dy;
			if (cow_pulse.collision(this.player)) {
				this.player.hit();
				this.cow_pulses.splice(i, 1);
				i--;
			} else if (cow_pulse.y > game.canvas.height) {
				this.cow_pulses.splice(i, 1);
				i--;
			}
		}
		return collision;
	}

	updateBales() {
		for (let i = 0; i < this.hay_bales.length; i++) {
			let bale = this.hay_bales[i];

			for (let j = 0; j < this.cows.length; j++) {
				if (bale.collision(this.cows[j])) {
					this.cows[j].hit();
					bale.y = 0;	// y <= 0 signals bale deletion.
				}
			}

			bale.y += bale.dy;
			if (bale.y <= 0) {
				this.hay_bales.splice(i, 1);
				i--;
			}
		}
	}

	drawBales() {
		for (let i = 0; i < this.hay_bales.length; i++) {
			this.hay_bales[i].draw();
		}
	}

	drawPulses() {
		for (let i = 0; i < this.cow_pulses.length; i++) {
			this.cow_pulses[i].draw();;
		}
	}

	isPlaying(id) {
		return id.currentAudio
			&& id.currentAudio.currentTime > 0
			&& !id.currentAudio.paused
			&& !id.currentAudio.ended
			&& id.currentAudio.readyState > 2;
	}

	pauseSound(sound) {
		id = document.getElementById(sound);

		if (id) {
			if (this.isPlaying(id)) {
				id.pause();
			}
		}
	}

	resumeSound() {
		bgndFinished();
	}

	drawPause() {
		const pauseWidth = 64;
		const pauseHeight = 120;

		let x = (this.canvas.width / 2) - (pauseWidth / 2);
		let y = this.canvas.height / 2;
		game.context.drawImage(this.pausePic, x, y, pauseWidth, pauseHeight);
	}

	togglePause() {
		if (this.state === "Paused") {
			this.state = "Playing";
			this.resumeSound(this.pausedSounds);
		} else if (this.state === "Playing") {
			this.state = "Paused";
			this.pauseSound("arcade", this.pausedSounds);
			this.pauseSound("cow_pulse", this.pausedSounds);
			this.pauseSound("moo1", this.pausedSounds);
			this.pauseSound("moo_panic", this.pausedSounds);
			this.drawPause();
		}
	}

	updateCows() {

		let maxRow = 0;

		if (--this.newCowDelay == 0) {
			this.newCowDelay = frameRate * level.new_cow_rate;
			if (this.cowLimit > 0) {
				if (this.cows.length <= level.max_cows) {
					this.cows.push(new Cow(level.cow_images));
					this.cowLimit--;
				}
			}
		}

		for (let i = 0; i < this.cows.length; i++) {
			let cow = this.cows[i];

			if (cow.delete) {
				this.cows.splice(i, 1);
				i--;
			} else {
				if (this.newCowDelay % 30 == 0) {
					cow.x += cow.dx * 10;
				}
				if (cow.dx > 0) {
					if ((cow.x + cow.standard_image.width) > game.canvas.width) {
						cow.y += player_height;
						cow.dx = -cow.dx;
					}
				} else {
					if (cow.x <= 0) {
						cow.y += player_height;
						cow.dx = -cow.dx;
					}
				}
				maxRow = cow.y > maxRow ? cow.y : maxRow;
			}
		}

		for (let i = 0; i < this.cows.length; i++) {
			this.cows[i].firePulseIfReady(maxRow);
		}
		return maxRow >= game.player.y;
	}

	drawBackground() {
		this.context.fillStyle = `#000000`;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.stars.drawStars();
		this.hayfield.draw();
		this.healthBar.draw(this.player.health);
		this.buttons.draw();
	}

	displayResult() {
		let message;

		if (this.state == "Win") {
			message = 'You win!';
		} else if (this.state == "Over") {
			message = 'Game Over';
		} else {
			return;
		}

		let l, x, y;
		this.context.font = `40px Verdana`;
		this.context.fillStyle = `Yellow`;
		l = this.context.measureText(message).width;
		x = (this.canvas.width - l) / 2;
		y = this.canvas.height / 2;

		this.context.fillText(message, x, y);
	}

	gameOver(win) {

		this.state = win ? "Win" : "Over";
		clearInterval(interval);
		interval = null;
		document.getElementById("banner").hidden = false;
		this.closefullScreen();
	}

	repeatables() {
		const tickReset = 20;

		for (let i = 0; i < this.currentTouches.length; i++) {
			let touch = this.currentTouches[i];
			if (!touch.tick) {
				touch.tick = tickReset;
				this.mouseClick(touch.x, touch.y);
			} else {
				touch.tick--;
			}
		}
	}

	addTouchEvent(x, y, identifier) {
		this.currentTouches.push({
			ticks: 0,
			x: x,
			y: y,
			identifier: identifier
		});
	}

	removeTouchEvent(identifier) {
		for (let i = 0; i < this.currentTouches.length; i++) {
			if (this.currentTouches[i].identifier === identifier) {
				this.currentTouches.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	reviseTouchEvent(x, y, identifier) {
		//		this.removeTouchEvent(identifier);
		//		this.addTouchEvent(x, y, identifier);
	}

	drawFrame() {
		this.drawBackground();
		this.player.draw();
		for (let i = 0; i < this.cows.length; i++) {
			this.cows[i].draw();
		}
		this.drawPulses();
		this.drawBales();
		this.displayScore();
		this.displayResult();
	}

	updateFrame() {
		if (this.updateCows()) {
			this.gameOver(false)();
		} else {
			this.repeatables();
			this.updatePulses();
			this.updateBales();
			this.updateComplaints();
			playCowNoise();
			this.drawFrame();
		}
		this.player.evaluateWin();
	}


	displayScore() {
		let score = '000000' + this.score.toString(10);
		let message = 'Score ' + score.slice(-6);
		let x, y, l;

		this.context.font = '24px Verdana';
		this.context.fillStyle = `Yellow`;
		l = this.context.measureText(message).width;
		x = (this.canvas.width / 2 + l / 2);
		y = 25;
		this.context.fillText(message, x, y);
	}

	closefullScreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitfullScreen) { /* Safari */
			document.webkitExitfullScreen();
		} else if (document.msExitfullScreen) { /* IE11 */
			document.msExitfullScreen();
		}
	}

	mouseClick(x, y) {
		var rect = this.canvas.getBoundingClientRect();
		var scaleX = this.canvas.width / rect.width;
		var scaleY = this.canvas.height / rect.height;

		game.buttons.touch(x * scaleX, y * scaleY);
	}

	reSize() {
		this.player.setPosition();
		this.buttons.reSize();
	}
}

document.addEventListener('keydown', function (event) {

	preventDefault = false;

	if (event.code == "ArrowRight") {
		preventDefault = true;
		game.player.moveRight();
	} else if (event.code == "ArrowLeft") {
		preventDefault = true;
		game.player.moveLeft();
	} else if (event.code == "Space") {
		preventDefault = true;
		game.player.throwBale();
	} else if (event.code == "KeyP") {
		game.togglePause();
	} else if (event.code == "Escape") {
		game.togglePause();
		if (confirm('Ok to abandon the game?')) {
			game.gameOver(false);
		}
	}

	if (preventDefault) {
		if (typeof event.preventDefault === "function") {
			event.preventDefault();
		} else if (typeof event.stopPropagation === "function") {
			event.stopPropagation();
		}
	}
});

function updateGame() {
	if (game && game.state === "Playing") {
		game.updateFrame();
	} else {
		game.drawPause();
	}
}

function tryOpenfullScreen(elem) {
	let result = true;
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullScreen) { /* Safari */
		elem.webkitRequestFullScreen();
	} else if (elem.msRequestfullScreen) { /* IE11 */
		elem.msRequestfullScreen();
	} else {
		result = false;
	}
	return result;
}

function openfullScreen(elem) {
	let success = false;
	while (elem && !success) {
		success = tryOpenfullScreen(elem);
		elem = elem.parentNode;
	}
}

function handleClick(e) {
	let target = null;
	if (game) {
		map = (v, n1, n2, m1, m2) => { return (v - n1) / (n2 - n1) * (m2 - m1) + m1; }

		var x, y;
		var element = e.target;
		let br = element.getBoundingClientRect();

		if (fullScreen) {
			let ratio = window.innerHeight / canvas.height;
			let offset = (window.innerWidth - (canvas.width * ratio)) / 2;
			x = map(e.clientX - br.left - offset, 0, canvas.width * ratio, 0, element.width);
			y = map(e.clientY - br.top, 0, canvas.height * ratio, 0, element.height);
		} else {
			x = e.clientX - br.left;
			y = e.clientY - br.top;
		}

		game.mouseClick(x, y);
		target = { x: x, y: y, limit: 20, timer: 0 };
	}
	return target;
}

function handleTouchStart(e) {
	console.log("handleTouchStart");
	e.preventDefault();
	const touches = e.changedTouches;

	for (let i = 0; i < touches.length; i++) {
		let touch = touches[i];

		if (game && game.state === "Paused") {
			game.togglePause();
		} else {
			game.addTouchEvent(touch.pageX, touch.pageY, touch.identifier);
		}
	}
}

function handleTouchEnd(e) {
	console.log("handleTouchMove");
	e.preventDefault();
	const touches = e.changedTouches;

	for (let i = 0; i < touches.length; i++) {
		let touch = touches[i];

		game.removeTouchEvent(touch.identifier);
	}
}

function handleTouchCancel(e) {
	console.log("handleTouchCancel");
	e.preventDefault();
	const touches = e.changedTouches;

	for (let i = 0; i < touches.length; i++) {
		let touch = touches[i];

		game.removeTouchEvent(touch.identifier);
	}
}

function handleTouchMove(e) {
	console.log("handleTouchMove");
	const touches = e.changedTouches;

	for (let i = 0; i < touches.length; i++) {
		let touch = touches[i];

		game.reviseTouchEvent(touch.pageX, touch.pageY, touch.identifier);
	}
}


function onResizeGame(canvas) {
	const maxHeight = 1200;
	//	canvas.height = Math.min(window.innerHeight * 0.9, maxHeight);
	canvas.height = window.innerHeight;
	if (game) {
		game.reSize();
		game.drawFrame();
	}
}

function levelChange() {
	levelIndex = levelIndex > 4 ? 1 : levelIndex + 1;
	document.getElementById("displayLevel").innerText = levelIndex;
}


function startGame() {
	level = levels[levelIndex - 1];

	document.getElementById("gameArea").hidden = false;
	let canvas = document.getElementById("myCanvas");

	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		openfullScreen(document.getElementById("gameArea"));
		/*
		screen.orientation.lock("portrait-primary").then(
			success => console.log("display locked"),
			failure => console.log("Can't use screen.orientation.lock on this browser.")
		);
		*/
	} else {
		openfullScreen(document.getElementById("gameArea"));
	}

	canvas.focus();

	if (game && game.state == "Win") {
		let score = game.score;

		if (levelIndex < 5) {
			levelChange();
			level = levels[levelIndex - 1];
		}
		game = new Game(canvas);
		game.score = score;

	} else {
		game = new Game(canvas);
	}



	canvas.addEventListener('click', handleClick);
	canvas.addEventListener('touchstart', handleTouchStart);
	canvas.addEventListener('touchend', handleTouchEnd);
	canvas.addEventListener('touchmove', handleTouchMove);
	canvas.addEventListener('touchcancel', handleTouchCancel);

	if (!interval) {
		interval = setInterval(updateGame, frameRate);
	}

	bgndFinished();
}

