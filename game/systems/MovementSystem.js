// game/systems/MovementSystem.js 【権限強化版】
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Controllable } from '../components/Controllable.js';
import { InputState } from '../components/InputState.js';

export class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    // --- まず、入力状態を取得する ---
    // InputStateを持つエンティティは一つだけ、という前提
    const inputEntities = this.world.getEntities([InputState]);
    if (inputEntities.size === 0) return; // 入力エンティティがなければ何もしない
    const inputState = this.world.getComponent(inputEntities.values().next().value, InputState);

    // --- 次に、操作対象のエンティティを処理する ---
    const controllableEntities = this.world.getEntities([Controllable, Position, Velocity]);
    const moveSpeed = 20;

    for (const entityId of controllableEntities) {
      const position = this.world.getComponent(entityId, Position);
      const velocity = this.world.getComponent(entityId, Velocity);

      // --- 入力状態を解釈し、速度を決定する ---
      if (inputState.isDragging) {
        // ドラッグ操作
        velocity.x = inputState.dragDeltaX * 3; // 係数をかけて動きを調整
      } else {
        // キーボード操作
        velocity.x = 0; // まずリセット
        if (inputState.keys.has('ArrowLeft') || inputState.keys.has('a')) {
          velocity.x = -moveSpeed;
        }
        if (inputState.keys.has('ArrowRight') || inputState.keys.has('d')) {
          velocity.x = moveSpeed;
        }
      }

      // --- 最後に、物理法則を適用する ---
      // 移動距離 = 速度 × 時間
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
    }
  }
}
