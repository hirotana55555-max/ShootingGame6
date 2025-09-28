//CollisionSystem.js
import { Collidable, Position } from '../components/index.js';

export class CollisionSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.getEntities([Collidable, Position]);
    
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        const collidableA = this.world.getComponent(entityA, Collidable);
        const positionA = this.world.getComponent(entityA, Position);

        const collidableB = this.world.getComponent(entityB, Collidable);
        const positionB = this.world.getComponent(entityB, Position);

        if (collidableA.group === collidableB.group) {
          continue;
        }

        const dx = positionA.x - positionB.x;
        const dy = positionA.y - positionB.y;
        const distanceSq = dx * dx + dy * dy;

        const radiusSum = collidableA.radius + collidableB.radius;
        const radiusSumSq = radiusSum * radiusSum;

        if (distanceSq < radiusSumSq) {
          // ★ 衝突イベントを発行する
          this.world.emitEvent({
            type: 'collision',
            entityA: entityA,
            entityB: entityB,
            groupA: collidableA.group,
            groupB: collidableB.group
          });
        }
      }
    }
  }
}
