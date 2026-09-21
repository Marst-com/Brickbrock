export class Ball {
  constructor(x, y, radius, speed) {
    this.radius = radius;
    this.baseSpeed = speed;

    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;

    this.speed = this.baseSpeed;

    const angle =
      (Math.random() * 0.8 + 0.2) *
      (Math.random() < 0.5 ? -1 : 1);

    this.dx = Math.cos(angle) * this.speed;
    this.dy = -Math.sin(angle) * this.speed;

    this.alive = true;
    this.piercing = false;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  bounceX() {
    this.dx *= -1;
  }

  bounceY() {
    this.dy *= -1;
  }

  setSpeed(multiplier) {
    const angle = Math.atan2(this.dy, this.dx);

    this.speed = Math.min(
      this.baseSpeed * multiplier,
      9
    );

    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
  }
}
