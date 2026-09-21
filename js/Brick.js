export class Brick {
  constructor(x, y, width, height, hp = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.hp = hp;
    this.alive = true;
  }

  hit() {
    this.hp--;

    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }

    return false;
  }
}
