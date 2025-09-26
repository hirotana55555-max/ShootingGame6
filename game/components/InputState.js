// game/components/InputState.js
export class InputState {
    constructor() {
      this.keys = new Set();
      this.isDragging = false;
      this.target = { x: null, y: null }; // マウス/タップの目標座標
    }
  }
  