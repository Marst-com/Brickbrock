export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;

    this.dx = (Math.random() - 0.5) * 6;
    this.dy = (Math.random() - 0.5) * 6;

    this.size = Math.random() * 4 + 2;
    this.life = 1;

    this.color = color;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    this.life -= 0.025;
  }

  get dead() {
    return this.life <= 0;
  }
}
