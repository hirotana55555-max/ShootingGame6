// game/systems/MovementSystem.js 【キーボード操作修正版】
import { Position, Velocity, Controllable, InputState } from '../components/index.js';

function lerp(start, end, amount) {
  return (1 - amount) * start + amount * end;
}

export class MovementSystem {
  constructor(world) {
    this.world = world;
  }

  update() {
    const inputEntities = this.world.getEntities([InputState]);
    if (inputEntities.length === 0) return;
    const inputState = this.world.getComponent(inputEntities[0], InputState);

    const controllableEntities = this.world.getEntities([Controllable, Position, Velocity]);
    
    // --- 調整用パラメータ ---
    const maxSpeed = 7;
    const easing = 0.15;      // マウス追従の滑らかさ
    const stopRadius = 50.0;
    
    // ★★★ キーボード用のパラメータを追加 ★★★
    const keyAcceleration = 1.0; // キーボードの加速度
    const keyDrag = 0.95;        // キーを離した時の減速率

    for (const entityId of controllableEntities) {
      const pos = this.world.getComponent(entityId, Position);
      const vel = this.world.getComponent(entityId, Velocity);

      if (inputState.target.x !== null) {
        // --- マウス操作のロジック (変更なし) ---
        let targetVelX = 0;
        let targetVelY = 0;
        const dx = inputState.target.x - pos.x;
        const dy = inputState.target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > stopRadius) {
            const dirX = dx / dist;
            const dirY = dy / dist;
            targetVelX = dirX * maxSpeed;
            targetVelY = dirY * maxSpeed;
        }
        vel.x = lerp(vel.x, targetVelX, easing);
        vel.y = lerp(vel.y, targetVelY, easing);

      } else {
        // ★★★ キーボード操作のロジック (新方式) ★★★
        let dirX = 0;
        let dirY = 0;
        if (inputState.keys.has('ArrowLeft')) dirX = -1;
        if (inputState.keys.has('ArrowRight')) dirX = 1;
        if (inputState.keys.has('ArrowUp')) dirY = -1;
        if (inputState.keys.has('ArrowDown')) dirY = 1;

        if (dirX !== 0 || dirY !== 0) {
          // 押している間は、その方向に加速する
          vel.x += dirX * keyAcceleration;
          vel.y += dirY * keyAcceleration;
        } else {
          // 離している間は、滑らかに減速する
          vel.x *= keyDrag;
          vel.y *= keyDrag;
        }

        // 最高速度を超えないように制限
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
        if (speed > maxSpeed) {
          const ratio = maxSpeed / speed;
          vel.x *= ratio;
          vel.y *= ratio;
        }
      }

      // --- 3. 位置の更新 (共通) ---
      pos.x += vel.x;
      pos.y += vel.y;
    }
  }
}
