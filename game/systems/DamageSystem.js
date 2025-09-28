import { Health, Bullet } from '../components/index.js';

export class DamageSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    // 1. 今フレームに発行されたイベントをすべて取得
    const events = this.world.getEvents();

    // 2. 'collision' イベントだけを抜き出して処理する
    for (const event of events) {
      if (event.type !== 'collision') {
        continue;
      }

      // 3. 衝突したペアの情報を整理する
      const { entityA, entityB, groupA, groupB } = event;

      // 4. 衝突ペアのどちらが「弾」でどちらが「敵」かを判定する
      let bulletEntity, enemyEntity;

      if (groupA === 'player_bullet' && groupB === 'enemy') {
        bulletEntity = entityA;
        enemyEntity = entityB;
      } else if (groupB === 'player_bullet' && groupA === 'enemy') {
        bulletEntity = entityB;
        enemyEntity = entityA;
      } else {
        // プレイヤーの弾と敵以外の衝突は無視
        continue;
      }

      // 5. 敵のHealthコンポーネントを取得
      const enemyHealth = this.world.getComponent(enemyEntity, Health);
      if (!enemyHealth) {
        // 敵にHealthがなければ何もしない
        continue;
      }

      // 6. ダメージを与える！ (今回は弾のダメージを1と仮定)
      enemyHealth.current -= 1;
      console.log(`ダメージ！ 敵(${enemyEntity})の残りHP: ${enemyHealth.current}`);

      // 7. 役目を終えた弾を消す (削除予約する)
      this.world.markForRemoval(bulletEntity);
    }
  }
}
