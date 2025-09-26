// game/systems/RenderSystem.js
import { Position } from '../components/Position.js'; // 一つ上がってcomponentsへ
import { Renderable } from '../components/Renderable.js'; // 一つ上がってcomponentsへ

export class RenderSystem {
  /**
   * @param {import('../core/World').World} world
   */
  constructor(world) {
    this.world = world;
    this.query = [Position, Renderable]; // このシステムが興味を持つコンポーネント
  }

  update() {
    const context = this.world.context;
    const entities = this.world.getEntities(this.query); // ワールドから対象エンティティを取得

    for (const entityId of entities) {
      const position = this.world.getComponent(entityId, Position);
      const renderable = this.world.getComponent(entityId, Renderable);

      context.fillStyle = renderable.color;
      context.fillRect(
        position.x - renderable.width / 2,
        position.y - renderable.height / 2,
        renderable.width,
        renderable.height
      );
    }
  }
}
