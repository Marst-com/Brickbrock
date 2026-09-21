export class Input {
  constructor(canvas) {
    this.left = false;
    this.right = false;

    this.pointerActive = false;
    this.pointerX = 0;

    window.addEventListener("keydown", e => {
      const key = e.key.toLowerCase();

      if (
        key === "arrowleft" ||
        key === "a"
      ) {
        this.left = true;
      }

      if (
        key === "arrowright" ||
        key === "d"
      ) {
        this.right = true;
      }

      // 스페이스로 스크롤 방지
      if (
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " "
      ) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", e => {
      const key = e.key.toLowerCase();

      if (
        key === "arrowleft" ||
        key === "a"
      ) {
        this.left = false;
      }

      if (
        key === "arrowright" ||
        key === "d"
      ) {
        this.right = false;
      }
    });

    const updatePointer = e => {
      const rect =
        canvas.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) / rect.width) *
        canvas.width;

      this.pointerX = x;
      this.pointerActive = true;
    };

    canvas.addEventListener(
      "pointermove",
      updatePointer
    );

    canvas.addEventListener(
      "pointerdown",
      e => {
        this.pointerActive = true;
        updatePointer(e);
      }
    );

    canvas.addEventListener(
      "pointerleave",
      () => {
        this.pointerActive = false;
      }
    );

    canvas.addEventListener(
      "pointercancel",
      () => {
        this.pointerActive = false;
      }
    );
  }
}
