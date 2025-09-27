// game/systems/InputSystem.js 【純粋化版】
import { InputState } from '../components/InputState.js';

export class InputSystem {
  constructor(world) {
    this.world = world;
    const inputEntity = world.createEntity();
    world.addComponent(inputEntity, new InputState());
    this.inputState = world.getComponent(inputEntity, InputState);
    this.registerEventListeners();
  }

  registerEventListeners() {
    // キーボード
    document.addEventListener('keydown', (e) => this.inputState.keys.add(e.key));
    document.addEventListener('keyup', (e) => this.inputState.keys.delete(e.key));

    const canvas = this.world.canvas;
    if (!canvas) return;

    // マウス/タッチの座標を更新する共通関数
    const updateTarget = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      this.inputState.target.x = clientX - rect.left;
      this.inputState.target.y = clientY - rect.top;
    };

    // マウス
    canvas.addEventListener('mousemove', (e) => updateTarget(e.clientX, e.clientY));
    canvas.addEventListener('mouseleave', () => {
        this.inputState.target.x = null;
        this.inputState.target.y = null;
    });

    // タッチ
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      updateTarget(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
        this.inputState.target.x = null;
        this.inputState.target.y = null;
    });
  }

  update(dt) {
    // InputSystemはもう毎フレームの更新処理はほとんど何もしない
  }
}
