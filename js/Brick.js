export class Brick {
  constructor(x, y, width, height, type = "normal", hp = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.destroyed = false;
  }

  hit() {
    this.hp--;

    if (this.hp <= 0) {
      this.destroyed = true;
      return true;
    }

    return false;
  }

  getColor() {
    if (this.type === "bomb") return "#ef4444";
    if (this.type === "power") return "#22c55e";

    const colors = {
      1: "#38bdf8",
      2: "#a78bfa",
      3: "#fb923c"
    };

    return colors[this.hp] || "#fff";
  }
}
