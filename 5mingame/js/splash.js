
class splash {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.title = new Image();
		this.question = new Image();
		this.star = new Image();
	}

	drawStars() {
		for (let i = 0; i < 30; i++) {
			let x = Math.floor(this.canvas.width * Math.random());
			let y = Math.floor(this.canvas.height * Math.random());
			this.context.drawImage(this.star, x, y, 15, 15);
		}
	}

	drawTitle() {
		// Fit the title on the canvas
		let ratio = this.canvas.width/this.title.width;
		let width = this.title.width * ratio;
		let height = this.title.height * ratio;

		let x = Math.floor((this.canvas.width - width)/2);
		let y = Math.floor((this.canvas.height/2  - height/2));
		let angleInRadians = -10 * Math.PI/180;
		this.context.translate(x, y);
		this.context.rotate(angleInRadians);
		this.context.drawImage(this.title, 0, 0, width, height);
		this.context.rotate(-angleInRadians);
		this.context.translate(-x, -y);
	}

	drawQuestion() {
		let x = Math.floor(this.canvas.width - this.question.width);
		let y = Math.floor(this.canvas.height - this.question.height);
		this.context.drawImage(this.question, x, y);
	}

	draw() {		
		this.context.fillStyle = "#000000";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		let self = this;

		this.star.onload = function () {
			self.drawStars();

			self.title.onload = function () {
				self.drawTitle();
			}
			
			self.question.onload = function () {
				self.drawQuestion();
			}
			
			self.title.src = "img/title.png";
			self.question.src = "img/fromspace.png";
				
		}


		this.star.src = "img/star.png";
	}
}