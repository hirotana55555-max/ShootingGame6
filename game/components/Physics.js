// game/components/Physics.js
export class Physics {
    constructor({ mass = 1, drag = 0.1 } = {}) {
      this.mass = mass; // 質量（重さ）
      this.drag = drag; // 空気/空間抵抗
      this.force = { x: 0, y: 0 }; // 現在かかっている力
    }
  }
  