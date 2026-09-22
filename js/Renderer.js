export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  // =========================================================
  // 기본
  // =========================================================

  clear(width, height) {
    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );
  }


  // =========================================================
  // BACKGROUND
  // =========================================================

  background(width, height) {
    const ctx = this.ctx;

    // 기본 게임판
    ctx.fillStyle = "#080d18";
    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    // 아주 약한 격자
    ctx.strokeStyle =
      "rgba(148,163,184,0.025)";

    ctx.lineWidth = 1;

    for (
      let x = 0;
      x < width;
      x += 30
    ) {

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }


    for (
      let y = 0;
      y < height;
      y += 30
    ) {

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }


    // 게임판 테두리
    ctx.strokeStyle =
      "#334155";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      1,
      1,
      width - 2,
      height - 2
    );
  }


  // =========================================================
  // PADDLE
  // =========================================================

  paddle(paddle) {
    const ctx = this.ctx;


    // 그림자
    ctx.fillStyle =
      "rgba(0,0,0,0.5)";

    this.roundRect(
      ctx,
      paddle.x + 2,
      paddle.y + 3,
      paddle.width,
      paddle.height,
      4
    );

    ctx.fill();


    // 본체
    ctx.fillStyle =
      "#dbe4ee";

    this.roundRect(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      4
    );

    ctx.fill();


    // 윗부분
    ctx.fillStyle =
      "#ffffff";

    this.roundRect(
      ctx,
      paddle.x + 3,
      paddle.y + 2,
      paddle.width - 6,
      3,
      2
    );

    ctx.fill();


    // 아래쪽
    ctx.fillStyle =
      "#64748b";

    this.roundRect(
      ctx,
      paddle.x + 3,
      paddle.y +
        paddle.height - 4,
      paddle.width - 6,
      2,
      1
    );

    ctx.fill();


    ctx.strokeStyle =
      "#475569";

    ctx.lineWidth = 1;

    this.roundRect(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height,
      4
    );

    ctx.stroke();
  }


  // =========================================================
  // BALL
  // =========================================================

  ball(ball) {
    const ctx = this.ctx;


    // 공 그림자
    ctx.fillStyle =
      "rgba(0,0,0,0.45)";

    ctx.beginPath();

    ctx.arc(
      ball.x + 1.5,
      ball.y + 2,
      ball.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    // 공
    ctx.fillStyle =
      ball.piercing
        ? "#fb923c"
        : "#f8fafc";

    ctx.beginPath();

    ctx.arc(
      ball.x,
      ball.y,
      ball.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      ball.piercing
        ? "#c2410c"
        : "#94a3b8";

    ctx.lineWidth = 1;

    ctx.stroke();


    // 작은 하이라이트
    ctx.fillStyle =
      "rgba(255,255,255,0.8)";

    ctx.beginPath();

    ctx.arc(
      ball.x - 2,
      ball.y - 2,
      2,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }


  // =========================================================
  // BRICK
  // =========================================================

  brick(brick) {
    const ctx = this.ctx;


    const colors = {
      1: "#2563eb",
      2: "#7c3aed",
      3: "#ea580c"
    };


    const darkColors = {
      1: "#1d4ed8",
      2: "#6d28d9",
      3: "#c2410c"
    };


    let color =
      colors[brick.hp] ||
      "#64748b";

    let darkColor =
      darkColors[brick.hp] ||
      "#475569";


    // 폭탄 벽돌
    if (
      brick.type === "bomb"
    ) {

      color = "#dc2626";
      darkColor = "#991b1b";
    }


    // -------------------------
    // 그림자
    // -------------------------

    ctx.fillStyle =
      "rgba(0,0,0,0.55)";

    this.roundRect(
      ctx,
      brick.x + 2,
      brick.y + 3,
      brick.width,
      brick.height,
      4
    );

    ctx.fill();


    // -------------------------
    // 본체
    // -------------------------

    ctx.fillStyle =
      color;

    this.roundRect(
      ctx,
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      4
    );

    ctx.fill();


    // -------------------------
    // 아래쪽 음영
    // -------------------------

    ctx.fillStyle =
      darkColor;

    this.roundRect(
      ctx,
      brick.x + 2,
      brick.y +
        brick.height - 5,
      brick.width - 4,
      3,
      2
    );

    ctx.fill();


    // -------------------------
    // 위쪽 하이라이트
    // -------------------------

    ctx.fillStyle =
      "rgba(255,255,255,0.22)";

    this.roundRect(
      ctx,
      brick.x + 3,
      brick.y + 3,
      brick.width - 6,
      3,
      2
    );

    ctx.fill();


    // -------------------------
    // 테두리
    // -------------------------

    ctx.strokeStyle =
      "rgba(255,255,255,0.35)";

    ctx.lineWidth = 1;

    this.roundRect(
      ctx,
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      4
    );

    ctx.stroke();


    // =====================================================
    // 폭탄
    // =====================================================

    if (
      brick.type === "bomb"
    ) {

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 15px Arial";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillText(
        "💣",
        brick.x +
          brick.width / 2,
        brick.y +
          brick.height / 2 +
          1
      );


      // 위험 표시
      ctx.strokeStyle =
        "#fca5a5";

      ctx.lineWidth = 2;

      this.roundRect(
        ctx,
        brick.x + 2,
        brick.y + 2,
        brick.width - 4,
        brick.height - 4,
        3
      );

      ctx.stroke();


      return;
    }


    // =====================================================
    // HP 표시
    // =====================================================

    if (
      brick.maxHp > 1
    ) {

      const pipWidth = 8;

      const totalWidth =
        brick.maxHp *
        pipWidth +
        (brick.maxHp - 1) * 3;

      const startX =
        brick.x +
        (
          brick.width -
          totalWidth
        ) / 2;


      const y =
        brick.y +
        brick.height -
        7;


      for (
        let i = 0;
        i < brick.maxHp;
        i++
      ) {

        ctx.fillStyle =
          i < brick.hp
            ? "#ffffff"
            : "rgba(255,255,255,0.2)";


        this.roundRect(
          ctx,
          startX +
            i *
            (pipWidth + 3),
          y,
          pipWidth,
          3,
          1
        );

        ctx.fill();
      }
    }


    // =====================================================
    // DAMAGE 표시
    // =====================================================

    if (
      brick.hp < brick.maxHp
    ) {

      ctx.strokeStyle =
        "rgba(255,255,255,0.55)";

      ctx.lineWidth = 1;


      // 간단한 금
      ctx.beginPath();

      ctx.moveTo(
        brick.x + 18,
        brick.y + 5
      );

      ctx.lineTo(
        brick.x + 23,
        brick.y + 12
      );

      ctx.lineTo(
        brick.x + 19,
        brick.y + 18
      );

      ctx.stroke();
    }
  }


  // =========================================================
  // POWER UP
  // =========================================================

  powerUp(powerUp) {
    const ctx = this.ctx;


    const colors = {
      duplicate: "#06b6d4",
      expand: "#a855f7",
      fast: "#f97316",
      slow: "#3b82f6",
      life: "#22c55e"
    };


    const symbols = {
      duplicate: "×2",
      expand: "↔",
      fast: "!",
      slow: "S",
      life: "+"
    };


    const color =
      colors[powerUp.type] ||
      "#ffffff";


    // 외곽
    ctx.fillStyle =
      "#020617";

    ctx.beginPath();

    ctx.arc(
      powerUp.x,
      powerUp.y,
      powerUp.size / 2 + 2,
      0,
      Math.PI * 2
    );

    ctx.fill();


    // 본체
    ctx.fillStyle =
      color;

    ctx.beginPath();

    ctx.arc(
      powerUp.x,
      powerUp.y,
      powerUp.size / 2,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      "#ffffff";

    ctx.lineWidth = 1;

    ctx.stroke();


    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "bold 11px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      symbols[powerUp.type] ||
        "?",
      powerUp.x,
      powerUp.y
    );
  }


  // =========================================================
  // PARTICLE
  // =========================================================

  particle(particle) {
    const ctx = this.ctx;


    ctx.globalAlpha =
      Math.max(
        0,
        particle.life
      );


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


  // =========================================================
  // COUNTDOWN
  // =========================================================

  countdown(seconds) {
    const ctx = this.ctx;


    // 광고 같은 거대한 오버레이 대신
    // 게임 화면을 살짝 어둡게만 함

    ctx.fillStyle =
      "rgba(0,0,0,0.45)";

    ctx.fillRect(
      0,
      0,
      900,
      500
    );


    // 숫자 박스
    const boxWidth = 100;
    const boxHeight = 82;

    const x =
      450 -
      boxWidth / 2;

    const y =
      205;


    ctx.fillStyle =
      "rgba(15,23,42,0.9)";

    this.roundRect(
      ctx,
      x,
      y,
      boxWidth,
      boxHeight,
      8
    );

    ctx.fill();


    ctx.strokeStyle =
      "#475569";

    ctx.lineWidth = 2;

    this.roundRect(
      ctx,
      x,
      y,
      boxWidth,
      boxHeight,
      8
    );

    ctx.stroke();


    // 숫자
    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "900 52px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      seconds,
      450,
      245
    );


    // 작은 문구
    ctx.fillStyle =
      "#94a3b8";

    ctx.font =
      "bold 12px Arial";

    ctx.fillText(
      "READY",
      450,
      276
    );
  }


  // =========================================================
  // UTIL
  // =========================================================

  roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {

    ctx.beginPath();

    if (
      typeof ctx.roundRect ===
      "function"
    ) {

      ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
      );

      return;
    }


    // 구형 브라우저 fallback
    ctx.moveTo(
      x + radius,
      y
    );

    ctx.lineTo(
      x + width - radius,
      y
    );

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + radius
    );

    ctx.lineTo(
      x + width,
      y + height - radius
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );

    ctx.lineTo(
      x + radius,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    ctx.lineTo(
      x,
      y + radius
    );

    ctx.quadraticCurveTo(
      x,
      y,
      x + radius,
      y
    );
  }
}
