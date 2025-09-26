// game/systems/MovementSystem.js 【Lerpモデル・完成版】
import { Position, Velocity, Controllable, InputState } from '../components/index.js';

// 線形補間関数 (lerp)。2つの値の間を滑らかに補間します。
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
    
    // --- 調整用パラメータ (ここだけ触ればOK) ---
    const maxSpeed = 7;       // 最高速度
    const easing = 0.15;      // 追従の滑らかさ (0.1でぬるぬる、0.3でキビキビ。0~1の範囲)
    const stopRadius = 50.0;   // この半径内に入ったら停止したとみなす

    for (const entityId of controllableEntities) {
      const pos = this.world.getComponent(entityId, Position);
      const vel = this.world.getComponent(entityId, Velocity);

      let targetVelX = 0;
      let targetVelY = 0;

      // --- 1. 目標速度 (targetVelocity) を決定する ---
      if (inputState.target.x !== null) { // マウス操作
        const dx = inputState.target.x - pos.x;
        const dy = inputState.target.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 目標から一定距離以上離れていれば、目標速度を計算
        if (dist > stopRadius) {
            const dirX = dx / dist;
            const dirY = dy / dist;
            targetVelX = dirX * maxSpeed;
            targetVelY = dirY * maxSpeed;
        }
        // stopRadius内なら目標速度は(0, 0)のまま。これにより停止する。

      } else { // キーボード操作
        let dirX = 0;
        let dirY = 0;
        if (inputState.keys.has('ArrowLeft')) dirX = -1;
        if (inputState.keys.has('ArrowRight')) dirX = 1;
        if (inputState.keys.has('ArrowUp')) dirY = -1;
        if (inputState.keys.has('ArrowDown')) dirY = 1;
        
        targetVelX = dirX * maxSpeed;
        targetVelY = dirY * maxSpeed;
      }

      // --- 2. 現在の速度を目標速度に滑らかに近づける (Lerp) ---
      // これがこのコードの心臓部。現在の速度を目標速度に easing の割合で近づける。
      vel.x = lerp(vel.x, targetVelX, easing);
      vel.y = lerp(vel.y, targetVelY, easing);

      // --- 3. 位置の更新 ---
      // 最終的に確定した速度で位置を更新する
      pos.x += vel.x;
      pos.y += vel.y;
    }
  }
}
