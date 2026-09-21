export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(width, height) {
    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );
  }

  background(width, height) {
    const ctx = this.ctx;

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        height
      );

    gradient.addColorStop(
      0,
      "#111827"
    );

    gradient.addColorStop(
      1,
      "#020617"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(
      0,
      0,
      width,
      height
    );
  }

  paddle(paddle) {
    const ctx = this.ctx;

    const gradient =
      ctx.createLinearGradient(
        paddle.x,
        paddle.y,
        paddle.x,
        paddle.y + paddle.height
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      0.45,
      "#cbd5e1"
    );

    gradient.addColorStop(
      1,
      "#64748b"
    );

    ctx.fillStyle = gradient;

    this.roundRect(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      7
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(255,255,255,.7)";

    ctx.lineWidth = 1;

    ctx.stroke();
  }

  ball(ball) {
    const ctx = this.ctx;

    const gradient =
      ctx.createRadialGradient(
        ball.x - 3,
        ball.y - 3,
        1,
        ball.x,
        ball.y,
        ball.radius
      );

    gradient.addColorStop(
      0,
      "#ffffff"
    );

    gradient.addColorStop(
      0.5,
      ball.piercing
        ? "#fb923c"
        : "#e0f2fe"
    );

    gradient.addColorStop(
      1,
      ball.piercing
        ? "#ea580c"
        : "#38bdf8"
    );

    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
      ball.x,
      ball.y,
      ball.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  brick(brick) {
    const ctx = this.ctx;

    const color =
      brick.getColor();

    // 그림자
    ctx.fillStyle =
      "rgba(0,0,0,.3)";

    this.roundRect(
      ctx,
      brick.x + 2,
      brick.y + 3,
      brick.width,
      brick.height,
      7
    );

    ctx.fill();

    // 본체 그라디언트
    const gradient =
      ctx.createLinearGradient(
        brick.x,
        brick.y,
        brick.x,
        brick.y + brick.height
      );

    gradient.addColorStop(
      0,
      this.lighten(color)
    );

    gradient.addColorStop(
      0.45,
      color
    );

    gradient.addColorStop(
      1,
      this.darken(color)
    );

    ctx.fillStyle = gradient;

    this.roundRect(
      ctx,
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      7
    );

    ctx.fill();

    // 외곽선
    ctx.strokeStyle =
      "rgba(255,255,255,.45)";

    ctx.lineWidth = 1;

    ctx.stroke();

    // 위쪽 광택
    ctx.fillStyle =
      "rgba(255,255,255,.18)";

    this.roundRect(
      ctx,
      brick.x + 3,
      brick.y + 3,
      brick.width - 6,
      5,
      4
    );

    ctx.fill();

    // HP 표시
    if (
      brick.type === "bomb"
    ) {
      ctx.fillStyle = "#fff";

      ctx.font =
        "bold 15px Arial";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "💣",
        brick.x +
          brick.width / 2,
        brick.y +
          brick.height / 2 + 1
      );

      // 폭탄 테두리
      ctx.strokeStyle =
        "rgba(255,255,255,.8)";

      ctx.lineWidth = 1.5;

      this.roundRect(
        ctx,
        brick.x + 2,
        brick.y + 2,
        brick.width - 4,
        brick.height - 4,
        6
      );

      ctx.stroke();

      return;
    }

    if (brick.hp > 1) {
      // HP 원형 배지
      const badgeX =
        brick.x +
        brick.width -
        13;

      const badgeY =
        brick.y + 12;

      ctx.beginPath();

      ctx.arc(
        badgeX,
        badgeY,
        8,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        "rgba(15,23,42,.55)";

      ctx.fill();

      ctx.fillStyle = "#fff";

      ctx.font =
        "bold 10px Arial";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        brick.hp,
        badgeX,
        badgeY
      );
    }

    // 중앙 작은 하이라이트
    ctx.fillStyle =
      "rgba(255,255,255,.12)";

    ctx.fillRect(
      brick.x + 10,
      brick.y + 10,
      brick.width - 32,
      1
    );
  }

  powerUp(powerUp) {
    powerUp.draw(this.ctx);
  }

  particle(particle) {
    const ctx = this.ctx;

    ctx.globalAlpha =
      particle.life;

    ctx.fillStyle =
      particle.color;

    ctx.fillRect(
      particle.x,
      particle.y,
      particle.size,
      particle.size
    );

    ctx.globalAlpha = 1;
  }

  countdown(seconds) {
    const ctx = this.ctx;

    ctx.save();

    ctx.fillStyle =
      "rgba(2,6,23,.45)";

    ctx.fillRect(
      0,
      0,
      900,
      500
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "900 72px Arial";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor =
      "rgba(56,189,248,.8)";

    ctx.shadowBlur = 25;

    ctx.fillText(
      seconds,
      450,
      250
    );

    ctx.shadowBlur = 0;

    ctx.font =
      "bold 18px Arial";

    ctx.fillStyle =
      "#bae6fd";

    ctx.fillText(
      "READY...",
      450,
      315
    );

    ctx.restore();
  }

  lighten(hex) {
    return this.mixColor(
      hex,
      "#ffffff",
      0.3
    );
  }

  darken(hex) {
    return this.mixColor(
      hex,
      "#000000",
      0.25
    );
  }

  mixColor(
    color1,
    color2,
    amount
  ) {
    const a =
      this.hexToRgb(color1);

    const b =
      this.hexToRgb(color2);

    const r = Math.round(
      a.r +
        (b.r - a.r) *
          amount
    );

    const g = Math.round(
      a.g +
        (b.g - a.g) *
          amount
    );

    const bValue = Math.round(
      a.b +
        (b.b - a.b) *
          amount
    );

    return `rgb(${r}, ${g}, ${bValue})`;
  }

  hexToRgb(hex) {
    const value =
      hex.replace("#", "");

    return {
      r: parseInt(
        value.substring(0, 2),
        16
      ),
      g: parseInt(
        value.substring(2, 4),
        16
      ),
      b: parseInt(
        value.substring(4, 6),
        16
      )
    };
  }

  roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {
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
