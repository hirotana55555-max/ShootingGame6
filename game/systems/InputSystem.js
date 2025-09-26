// game/systems/InputSystem.js
import { Controllable } from '../components/Controllable.js';
import { Velocity } from '../components/Velocity.js';

export class InputSystem {
  /**
   * @param {import('../core/World').World} world
   */
  constructor(world) {
    this.world = world;
    this.keys = new Set(); // 現在押されているキーを保持する

    // イベントリスナーを登録
    document.addEventListener('keydown', (e) => this.keys.add(e.key));
    document.addEventListener('keyup', (e) => this.keys.delete(e.key));
  }

  update() {
    const entities = this.world.getEntities([Controllable, Velocity]);
    const moveSpeed = 200; // プレイヤーの移動速度

    for (const entityId of entities) {
      const velocity = this.world.getComponent(entityId, Velocity);
          
      velocity.x = 0; // 毎フレーム、速度をリセット

      if (this.keys.has('ArrowLeft') || this.keys.has('a')) {
        velocity.x = -moveSpeed;
      }
      if (this.keys.has('ArrowRight') || this.keys.has('d')) {
        velocity.x = moveSpeed;
      }
    }
  }
}
