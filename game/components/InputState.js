// game/components/InputState.js
export class InputState {
    constructor() {
      this.keys = new Set();
      this.isDragging = false;
      this.dragDeltaX = 0; // 1フレームにどれだけドラッグされたか
    }
  }
  