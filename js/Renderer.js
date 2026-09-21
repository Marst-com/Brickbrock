export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  clear() {
    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  drawBackground() {
    this.ctx.fillStyle = "#101827";

    this.ctx.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  drawPaddle(paddle) {
    this.ctx.fillStyle = "#ffffff";

    this.roundRect(
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      7
    );
  }

  drawBall(ball) {
    this.ctx.fillStyle = "#ffffff";

    this.ctx.beginPath();

    this.ctx.arc(
      ball.x,
      ball.y,
      ball.radius,
      0,
      Math.PI * 2
    );

    this.ctx.fill();
  }

  drawBrick(brick) {
    if (!brick.alive) return;

    this.ctx.fillStyle =
      brick.hp > 1
        ? "#f59e0b"
        : "#6366f1";

    this.roundRect(
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      5
    );
  }

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.roundRect(x, y, w, h, r);

    ctx.fill();
  }
      }
