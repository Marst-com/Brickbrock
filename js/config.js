export const CONFIG = {
  canvas: {
    width: 900,
    height: 500
  },

  paddle: {
    width: 130,
    height: 14,
    speed: 8,
    expandedWidth: 210
  },

  ball: {
    radius: 8,

    // 1스테이지는 여유롭게
    speed: 4,

    // 최대 속도
    maxSpeed: 9
  },

  brick: {
    rows: 6,
    cols: 10,
    width: 80,
    height: 24,
    gap: 7,
    top: 55,

    // 아이템 드롭 확률
    dropRate: 0.45,

    hpColors: {
      1: "#38bdf8",
      2: "#a78bfa",
      3: "#fb923c"
    }
  },

  powerUp: {
    size: 18,
    speed: 3
  },

  lives: 3,

  respawn: {
    countdown: 3
  }
};
