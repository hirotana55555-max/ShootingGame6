# リファクタリング計画書 (REFACTORING_PLAN.md) 

## 0. 実行ワークフロー：仮説駆動開発 (Hypothesis-Driven Development)

本リファクタリングは、AIと人間の協創における失敗と分析の末に確立された、以下の「仮説駆動開発」ワークフローに厳密に従って実行する。これは、AIの能力の限界を認め、人間の知的判断を最大限に活用することで、安全かつ効率的にタスクを遂行するための最適解である。

1.  **仮説立案 (Hypothesis):**
    *   **人間とAIが協働**し、変更の目的から影響が及ぶであろうファイル群について、知的で的を絞った**「仮説」**を立てる。闇雲な全ファイルクロールは行わない。

2.  **検証 (Verification):**
    *   仮説を検証するため、関連すると推測されるファイルを**一つずつ**AIに提示し、分析させる。
    *   AIは提示された単一のファイルの分析に集中する。人間は、その分析結果が仮説と一致するか、あるいは予期せぬ依存関係がないかを確認する。
    *   このプロセスを、仮説に含まれるすべてのファイルに対して繰り返す。

3.  **計画の確定 (Plan Finalization):**
    *   すべての関連ファイルの分析（検証）が完了し、仮説が**「実証された事実」**に変わった瞬間に、初めて最終的な**「実行計画（変更後コードの全量）」**をAIに生成させる。
    *   人間は、生成された計画全体をレビューし、承認する。

4.  **実行 (Execution):**
    *   人間は、確定した計画に基づき、必要なすべての変更を**一度に、機械的に**適用し、テストを行う。

このワークフローは、断片的な施工による破綻を防ぎ、AIの「知的だが視野が狭い」という特性を最大限に活用するためのものである。

---

## 1. 背景と目的

現在、`entityFactory.js`は`createPlayer`や`createBullet`といった具体的なエンティティ生成関数を直接保持している。今後、敵の種類が増えるたびに`createMeteor`, `createFighter`のような関数を追加していくと、このファイルは急速に肥大化し、可読性とメンテナンス性が著しく低下する「神ファイル（God File）」になる危険性がある。

本計画の目的は、この問題を未然に防ぎ、エンティティの定義をコードからデータに分離すること（データ駆動設計）で、将来的な拡張性と保守性を確保することにある。

## 2. 解決策：ブループリント方式への移行

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

ブループリントのパラメータは、コンストラクタに渡すオブジェクトそのものとして定義する。

```json
{
  "name": "Meteor",
  "components": {
    "Position": { "x": 0, "y": 0 },
    "Velocity": { "vx": 0, "vy": 1.5 },
    "Renderable": { "color": "gray", "width": 20, "height": 20, "shape": "rectangle" },
    "Team": { "id": "enemy" },
    "Health": { "value": 3 },
    "Collidable": { "group": "enemy", "radius": 20 }
  }
}
```

### 2.3. `entityFactory.js`の将来像

個別の`create`関数を廃止し、代わりに`createEntityFromBlueprint`という単一の汎用関数を実装する。

```javascript
import * as Components from '../components/index.js';
// ブループリントの動的インポートについては別途検討
import meteorBlueprint from '../blueprints/meteor.json';

const blueprints = {
  meteor: meteorBlueprint,
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

  // ブループリントのデフォルト値と、呼び出し元の指定(overrides)をマージする
  const finalComponents = { ...blueprint.components };
  for (const componentName in overrides) {
    finalComponents[componentName] = {
      ...finalComponents[componentName],
      ...overrides[componentName]
    };
  }

  for (const componentName in finalComponents) {
    const params = finalComponents[componentName];
    world.addComponent(entity, new Components[componentName](params));
  }

  return entity;
}
```

## 3. 実行計画

このリファクタリングは、プロジェクトの健全性を維持するため、以下のステップで段階的に実行する。

### フェーズ1：基礎工事（完了）

-   [x] **【済】全コンポーネントの`constructor`をオブジェクト引数形式に統一する。**
    -   `constructor(x, y)` を `constructor({ x, y })` に変更。
    -   これにより、引数の順序の問題が根本的に解決された。
-   [x] **【済】`entityFactory`等の関数呼び出しをオブジェクト引数形式に統一する。**
    -   `createBullet(world, pos, rot)` を `createBullet(world, { ownerPosition, ownerRotation })` に変更。
    -   これにより、関数呼び出しの可読性と安全性が向上した。

### フェーズ2：ブループリント方式への移行（次ステップ）

*   **トリガー:** 敵エンティティの種類が2種類以上に増える、または親子関係のような複雑なエンティティ（例：砲台を持つ戦艦）の設計が必要になった時点。
*   **移行手順:**
    1.  `game/blueprints/` ディレクトリを作成する。
    2.  `createEntityFromBlueprint`関数を上記2.3の通りに実装する。
    3.  まず`meteor`（隕石）からブループリント化を試す。`meteor.json`を作成し、`SpawningSystem`が`createMeteor`の代わりに`createEntityFromBlueprint('meteor', ...)`を呼び出すように修正する。
    4.  動作確認後、他のエンティティ（`player`, `bullet`など）も順次ブループリント化していく。
    5.  最終的に、`entityFactory.js`から個別の`create`関数を削除し、`createEntityFromBlueprint`に一本化する。

### フェーズ3：将来的な課題

*   **親子関係の実装:** 砲台を持つ戦艦のようなエンティティを表現するため、`Parent`コンポーネントや`Children`コンポーネント、およびそれらを処理する`HierarchySystem`の導入を検討する。
*   **ブループリントの動的ロード:** エンティティの種類が増えた際、すべてのブループリントを事前に`import`するのは非効率。必要なブループリントを動的に読み込む仕組みを検討する。

```