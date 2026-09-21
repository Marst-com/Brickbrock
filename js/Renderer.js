export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(width, height) {
    this.ctx.clearRect(0, 0, width, height);
  }

  background(width, height) {
    const ctx = this.ctx;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      height
    );

    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#020617");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  paddle(paddle) {
    const ctx = this.ctx;

    ctx.fillStyle = "#f8fafc";

    this.roundRect(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      7
    );

    ctx.fill();
  }

  ball(ball) {
    const ctx = this.ctx;

    ctx.beginPath();

    ctx.arc(
      ball.x,
      ball.y,
      ball.radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      ball.piercing
        ? "#f97316"
        : "#ffffff";

    ctx.fill();
  }

  brick(brick) {
    const ctx = this.ctx;

    ctx.fillStyle = brick.getColor();

    this.roundRect(
      ctx,
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      6
    );

    ctx.fill();

    if (brick.type === "bomb") {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "💣",
        brick.x + brick.width / 2,
        brick.y + brick.height / 2
      );
    } else if (brick.hp > 1) {
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        brick.hp,
        brick.x + brick.width / 2,
        brick.y + brick.height / 2
      );
    }
  }

  powerUp(powerUp) {
    powerUp.draw(this.ctx);
  }

  particle(particle) {
    const ctx = this.ctx;

    ctx.globalAlpha = particle.life;

    ctx.fillStyle = particle.color;

    ctx.fillRect(
      particle.x,
      particle.y,
      particle.size,
      particle.size
    );

    ctx.globalAlpha = 1;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();

    ctx.roundRect(
      x,
      y,
      width,
      height,
      radius
    );
  }
}
