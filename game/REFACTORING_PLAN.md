# リファクタリング計画書 (REFACTORING_PLAN.md)

## 1. 背景と目的

現在、`entityFactory.js`は`createPlayer`や`createBullet`といった具体的なエンティティ生成関数を直接保持している。今後、敵の種類が増えるたびに`createMeteor`, `createFighter`のような関数を追加していくと、このファイルは急速に肥大化し、可読性とメンテナンス性が著しく低下する「神ファイル（God File）」になる危険性がある。

本計画の目的は、この問題を未然に防ぎ、エンティティの定義をコードからデータに分離すること（データ駆動設計）で、将来的な拡張性と保守性を確保することにある。

## 2. 解決策：ブループリント（設計図）方式への移行

エンティティの定義（どのコンポーネントを、どのような初期値で組み合わせるか）を、JavaScriptの関数ではなく、外部のデータファイル（例: JSON）に「ブループリント」として記述する方式に移行する。

`entityFactory.js`は、特定のブループリントを読み込み、エンティティを組み立てるだけの汎用的な「組み立て係」としての役割に徹する。

### 2.1. ディレクトリ構造の変更

新たに`game/blueprints/`ディレクトリを作成し、エンティティの設計図を格納する。

```
/game
  /blueprints
    - player.json
    - bullet.json
    - meteor.json
    - fighter.json
  ...
```

### 2.2. ブループリントファイルの例 (`meteor.json`)

```json
{
  "name": "Meteor",
  "components": {
    "Renderable": { "color": "gray", "width": 20, "height": 20, "shape": "rectangle" },
    "Team": { "id": "enemy" },
    "Health": { "value": 3 },
    "Collidable": { "group": "enemy", "radius": 20 },
    "Velocity": { "vx": 0, "vy": 1.5 }
  }
}
```

### 2.3. `entityFactory.js`の将来像

個別の`create`関数を廃止し、代わりに`createEntityFromBlueprint`という単一の汎用関数を実装する。

```javascript
import * as Components from '../components/index.js';
import meteorBlueprint from '../blueprints/meteor.json';
// ... 他のブループリントもインポート

// すべてのブループリントを一つのオブジェクトで管理
const blueprints = {
  meteor: meteorBlueprint,
  // ...
};

/**
 * ブループリント名に基づいてエンティティを生成する汎用関数
 * @param {World} world
 * @param {string} blueprintName - 'meteor' や 'fighter' など
 * @param {object} overrides - 初期位置など、ブループリントの値を上書きする設定
 */
export function createEntityFromBlueprint(world, blueprintName, overrides = {}) {
  const blueprint = blueprints[blueprintName];
  if (!blueprint) throw new Error(`ブループリント'${blueprintName}'が見つかりません。`);

  const entity = world.createEntity();

  // ブループリントに基づいてコンポーネントを追加
  for (const componentName in blueprint.components) {
    const params = blueprint.components[componentName];
    // new Components['Position'](x, y) のように動的にインスタンス化
    world.addComponent(entity, new Components[componentName](...Object.values(params)));
  }

  // overridesで指定されたコンポーネント（主にPosition）を上書き
  if (overrides.Position) {
    world.addComponent(entity, new Components.Position(overrides.Position.x, overrides.Position.y));
  }
  // ...他のoverride処理...

  return entity;
}
```

## 3. 実行計画（トリガー）

このリファクタリングは、時期尚早な複雑化を避けるため、段階的に実行する。

*   **トリガー:** **敵エンティティの種類が3種類以上に増え、`entityFactory.js`の管理が煩雑になってきたと感じた時点**で、本計画に着手する。
*   **移行手順:**
    1.  まず`meteor`（隕石）からブループリント化を試みる。
    2.  `createEntityFromBlueprint`関数を実装し、`createMeteor`を置き換える。
    3.  動作確認後、他のエンティティ（`player`, `bullet`など）も順次ブループrint化していく。

この計画に従うことで、プロジェクトの健全性を長期的に維持する。

---
