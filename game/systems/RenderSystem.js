// game/systems/RenderSystem.js 【改造後コード】

import { Position, Renderable, Rotation } from '../components/index.js'; // ← ★Rotationをインポート

export class RenderSystem {
  /**
   * @param {import('../core/World').World} world
   */
  constructor(world) {
    this.world = world;
    // ★クエリにRotationを追加（ただし、必須ではないのでこの行は変更不要）
    this.query = [Position, Renderable]; 
  }

  update() {
    const context = this.world.context;
    const entities = this.world.getEntities(this.query);

    for (const entityId of entities) {
      const position = this.world.getComponent(entityId, Position);
      const renderable = this.world.getComponent(entityId, Renderable);
      
      // ★★★ ここからが改造部分 ★★★
      // Rotationコンポーネントを「あれば」取得する
      const rotation = this.world.getComponent(entityId, Rotation);

      // 1. 現在の描画状態を保存する
      context.save(); 

      // 2. 描画の原点をエンティティの中心に移動する
      context.translate(position.x, position.y);
      
      // 3. もしRotationコンポーネントがあれば、その角度だけキャンバスを回転させる
      if (rotation) {
        context.rotate(rotation.angle);
      }

      /*
      // 4. 色を設定し、原点(0,0)を中心に四角形を描画する
      context.fillStyle = renderable.color;
      context.fillRect(
        -renderable.width / 2, 
        -renderable.height / 2, 
        renderable.width, 
        renderable.height
      );
      */
      // 4. 色を設定し、原点(0,0)を中心に形状を判定し描画する
      context.fillStyle = renderable.color;

      if (renderable.shape === 'triangle') {
        // ▲ 縦長の三角形を描画
        context.beginPath();
        context.moveTo(0, -renderable.height / 2); // 頂点（上）
        context.lineTo(-renderable.width / 2, renderable.height / 2); // 左下
        context.lineTo(renderable.width / 2, renderable.height / 2); // 右下
        context.closePath();
        context.fill();
      } else {
        // ■ デフォルトは四角形
        context.fillRect(
          -renderable.width / 2, 
          -renderable.height / 2, 
          renderable.width, 
          renderable.height
        );
      }

      // 5. 保存しておいた描画状態に戻す（これがないと次の描画がおかしくなる）
      context.restore(); 
      // ★★★ ここまでが改造部分 ★★★
    }
  }
}
