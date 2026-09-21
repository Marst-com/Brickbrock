export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;

    this.size = 18;
    this.speed = 3;

    this.type = type;
    this.active = true;
  }

  update() {
    this.y += this.speed;

    if (this.y > 550) {
      this.active = false;
    }
  }

  draw(ctx) {
    const colors = {
      duplicate: "#22d3ee",
      expand: "#a855f7",
      fast: "#f97316",
      slow: "#60a5fa",
      life: "#22c55e"
    };

    const symbols = {
      duplicate: "×2",
      expand: "↔",
      fast: "⚡",
      slow: "❄",
      life: "+"
    };

    ctx.fillStyle = colors[this.type] || "#fff";

    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.size / 2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      symbols[this.type] || "?",
      this.x,
      this.y
    );
  }
}
