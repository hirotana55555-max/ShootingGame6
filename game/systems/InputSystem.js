// game/systems/InputSystem.js 【革命版】
import { InputState } from '../components/InputState.js';

export class InputSystem {
  constructor(world) {
    this.world = world;
        
    // 操作対象のエンティティを探し、InputStateコンポーネントをアタッチする
    // 現状、操作対象は一つだけなので、ここで作ってしまう
    const inputEntity = world.createEntity();
    world.addComponent(inputEntity, new InputState());
    this.inputState = world.getComponent(inputEntity, InputState);

    this.lastPointerX = 0;

    this.registerEventListeners();
  }

  registerEventListeners() {
    // キーボード
    document.addEventListener('keydown', (e) => this.inputState.keys.add(e.key));
    document.addEventListener('keyup', (e) => this.inputState.keys.delete(e.key));

    const canvas = this.world.canvas;
    if (!canvas) return;

    // マウス
    const onMouseDown = (e) => {
      this.inputState.isDragging = true;
      this.lastPointerX = e.clientX;
    };
    const onMouseUp = () => { this.inputState.isDragging = false; };
    const onMouseMove = (e) => {
      if (!this.inputState.isDragging) return;
      const pointerX = e.clientX;
      this.inputState.dragDeltaX = pointerX - this.lastPointerX;
      this.lastPointerX = pointerX;
    };
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    // タッチ
    const onTouchStart = (e) => {
      this.inputState.isDragging = true;
      this.lastPointerX = e.touches[0].clientX;
    };
    const onTouchEnd = () => { this.inputState.isDragging = false; };
    const onTouchMove = (e) => {
      if (!this.inputState.isDragging) return;
      const pointerX = e.touches[0].clientX;
      this.inputState.dragDeltaX = pointerX - this.lastPointerX;
      this.lastPointerX = pointerX;
    };
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  }

  update(dt) {
    // 毎フレーム、dragDeltaXをリセットする
    // これをしないと、ドラッグをやめた後も最後の移動量が残ってしまう
    if (!this.inputState.isDragging) {
        this.inputState.dragDeltaX = 0;
    }
  }
}
