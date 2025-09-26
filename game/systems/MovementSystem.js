// game/systems/MovementSystem.js
import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';

export class MovementSystem {
  /**
   * @param {import('../core/World').World} world
   */
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.getEntities([Position, Velocity]);

    for (const entityId of entities) {
      const position = this.world.getComponent(entityId, Position);
      const velocity = this.world.getComponent(entityId, Velocity);

      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
    }
  }
}
