// game/systems/InputSystem.js
import { Controllable } from '../components/Controllable.js';
import { Velocity } from '../components/Velocity.js';

export class InputSystem {
  /**
   * @param {import('../core/World.js').World} world
   */
  constructor(world) {
    this.world = world;
    this.keys = new Set(); // 現在押されているキーを保持する
  
    // --- 状態管理プロパティを共通化 ---
    this.isDragging = false; // マウス/タッチ共通で「ドラッグ中か」を管理
    this.lastPointerX = 0;   // マウス/タッチ共通で「最後のポインターX座標」を管理

    // イベントリスナーを登録
    document.addEventListener('keydown', (e) => this.keys.add(e.key));
    document.addEventListener('keyup', (e) => this.keys.delete(e.key));
  // --- 新しいタッチイベントリスナー ---
    // gameLoopが始まるまでworld.canvasは存在しないので、リスナー登録は後で行う
  }

  // --- リスナーを登録するための新しいメソッド ---
  registerEventListeners() {
    const canvas = this.world.canvas;
    if (!canvas) return;

    // --- マウスイベント ---
    canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.lastPointerX = e.clientX;
    });

    canvas.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.isDragging = false;
    });

    canvas.addEventListener('mouseleave', (e) => {
      // キャンバス外にマウスが出たらドラッグ解除
      this.isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      e.preventDefault();
      if (!this.isDragging) return;

      const pointerX = e.clientX;
      const deltaX = pointerX - this.lastPointerX;
      this.lastPointerX = pointerX;

      this.applyVelocity(deltaX);
    });

    // タッチ開始
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // 画面のスクロールなどを防ぐ
      this.isDragging = true;
      this.lastTouchX = e.touches[0].clientX;
    }, { passive: false });

    // タッチ終了
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDragging = false;
    });

     // --- タッチイベント ---
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.lastPointerX = e.touches[0].clientX;
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isDragging = false;
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDragging) return;

      const pointerX = e.touches[0].clientX;
      const deltaX = pointerX - this.lastPointerX;
      this.lastPointerX = pointerX;

      this.applyVelocity(deltaX);
    }, { passive: false });
  }

  // --- ★新しいヘルパーメソッド: 速度を適用するロジックを共通化 ---
  applyVelocity(deltaX) {
    const entities = this.world.getEntities([Controllable, Velocity]);
    for (const entityId of entities) {
      const velocity = this.world.getComponent(entityId, Velocity);
      // deltaXをそのまま速度にすると動きすぎるので、適当な係数をかける
      velocity.x = deltaX * 5;
    }
  }

  update(dt) { // ← dtを受け取るように修正
    const entities = this.world.getEntities([Controllable, Velocity]);
    const moveSpeed = 20;

    for (const entityId of entities) {
      const velocity = this.world.getComponent(entityId, Velocity);
          
      // ドラッグ中でなければ、速度をリセット
      if (!this.isDragging) {
        velocity.x = 0;
      }

      // キーボード操作（ドラッグ中ではない場合のみ有効）
      if (!this.isDragging) {
        if (this.keys.has('ArrowLeft') || this.keys.has('a')) {
          velocity.x = -moveSpeed;
        }
        if (this.keys.has('ArrowRight') || this.keys.has('d')) {
          velocity.x = moveSpeed;
        }
      }
    }
  }
}