# 敵・衝突・AIに関する設計書 (DESIGN_DOCUMENT_ENEMY.md) 

## 1. 基本思想

敵、弾、その他すべての「ゲーム内オブジェクト」は、破壊や相互作用の可能性を持つエンティティとして扱われる。
本設計の目的は、以下の高度なインタラクションを実現するための、柔軟で拡張可能な構造を定義することである。

*   **動的なAI:** 敵の振る舞い（移動、攻撃パターン）を「状態」として管理し、ダメージや時間経過によって動的に変化させる。
*   **階層構造:** 戦艦と砲台のような、親子関係を持つ敵の実現。
*   **部位破壊:** 巨大な敵の装甲や特定のパーツのみを破壊する。
*   **多彩な出現パターン:** 時間、プレイヤーの位置、特定の条件など、様々なトリガーによる敵の動的生成。
*   **リッチな衝突表現:** オブジェクトの「素材」に基づいた、多彩な衝突エフェクト（火花、爆発、破片など）の実現。

## 2. 新規コンポーネント定義

### 2.1. 基本ステータス

*   **`Health`**: `(current, max)`
    *   役割: エンティティの耐久値を管理する。
    *   用途: 敵、破壊可能な障害物、プレイヤーなど。

*   **`Collidable`**: 
    *   **現状の実装**: `(group, radius)`
        *   役割: **円形**の当たり判定を持つことを示す。
        *   `group`: 'enemy', 'player_bullet', 'player' など。衝突判定のグループ分けに使用。
        *   `radius`: 当たり判定の半径。
    *   **将来の拡張予定**: `(shape, size, group)`
        *   `shape`: 'circle', 'rectangle' など。
        *   `size`: `{ radius: 10 }`, `{ width: 20, height: 30 }` など。
        *   ※ 現在は円形のみ対応。矩形などは今後の実装課題。

### 2.2. AIと振る舞い

*   **`AIState`**: `(currentState, states)`
    *   役割: エンティティの現在の振る舞い（AIの状態）を定義する。
    *   `currentState`: 'approaching', 'attacking', 'fleeing' など、現在の状態を示すキー。
    *   `states`: 状態ごとの具体的な振る舞いを定義したオブジェクト。
        *   **例:**
            ```json
            {
              "approaching": { "movement": "move_towards_player", "shooting": "none" },
              "attacking": { "movement": "circle_player", "shooting": "fire_main_gun" },
              "damaged": { "movement": "drift_uncontrolled", "shooting": "none" }
            }
            ```

### 2.3. 階層構造

*   **`Parent`**: `(entityId, offset)`
    *   役割: 親エンティティのIDを保持する。自身の座標は親からの相対位置となる。
    *   `offset`: `{ x: 0, y: -50 }` のように、親の中心からの相対座標。

*   **`Children`**: `(entityIds = [])`
    *   役割: 子エンティティのIDリストを保持する。親の破壊などに連動させるために使用。

### 2.4. イベントアクション

*   **`OnDeath`**: `(actions = [])`
    *   役割: `Health`が0になった際に実行されるアクションを定義する。
    *   **アクションの例:**
        *   分裂: `{ "type": "SPAWN", "entityType": "small_meteor", "count": 3 }`
        *   状態変化: `{ "type": "CHANGE_AI_STATE", "target": "SELF", "newState": "berserk" }`
        *   アイテムドロップ: `{ "type": "DROP_ITEM", "itemType": "power_up" }`

*   **`OnCollision`**: `(actions = [])`
    *   役割: 他のエンティティと衝突した際に実行されるアクションを定義する。
    *   **アクションの例:**
        *   ダメージを与える: `{ "type": "DEAL_DAMAGE", "amount": 10 }`
        *   エフェクトを生成: `{ "type": "SPAWN_EFFECT", "effectType": "spark_small", "position": "CONTACT_POINT" }`
        *   跳ね返る: `{ "type": "BOUNCE", "restitution": 0.8 }`
        *   消滅する: `{ "type": "DESTROY_SELF" }`

### 2.5. 出現ロジック

*   **`Generator`**: `(config)`
    *   役割: 新しいエンティティを動的に生成する「スポナー」の定義。
    *   **configの例:**
        *   `entityType`: 'zako_fighter'
        *   `trigger`: `{ "type": "TIMER", "interval": 5.0 }`
        *   `spawnPosition`: `{ "type": "RANDOM_TOP" }`
        *   `limit`: `{ "total": 10, "concurrent": 5 }`

### 2.6. 材質とエフェクト

*   **`Material`**: `(type)`
    *   役割: エンティティの「材質」を定義する。
    *   `type`: 'flesh' (生身), 'steel' (鋼鉄), 'rock' (岩), 'energy' (エネルギー体) など。

## 3. 新規・更新システム定義

*   **`AISystem` (新規):**
    *   責務: `AIState`を持つエンティティを監視する。現在の状態（例: 'approaching'）に応じた振る舞い（例: `movement: "move_towards_player"`）を、他のコンポーネント（例: `Velocity`）に反映させる。例えば、`move_towards_player`というロジックに基づき、`Velocity`コンポーネントの値を毎フレーム計算・更新する。

*   **`SpawningSystem`**:
    *   責務: `Generator`を持つエンティティを監視し、条件に応じて新しいエンティティを生成する。

*   **`CollisionSystem`**:
    *   責務: `Collidable`を持つエンティティ同士の衝突を検知し、**「衝突イベント」**を生成する。

*   **`ActionSystem` (新規/責務統合):**
    *   責務: `OnCollision`や`OnDeath`などによって生成されたアクションイベント（`DEAL_DAMAGE`, `CHANGE_AI_STATE`など）を解釈し、実行する。
    *   `DEAL_DAMAGE` -> 対象の`Health`を減らす。
    *   `CHANGE_AI_STATE` -> 対象の`AIState.currentState`を書き換える。
    *   `SPAWN_EFFECT` -> エフェクト生成の指示を出す。

*   **`EffectSystem`**:
    *   責務: `SPAWN_EFFECT`アクションを受け、指定されたパーティクルやアニメーションを生成する。エフェクト自体も一時的なエンティティとして扱う。

*   **`DeathSystem`**:
    *   責務: `Health`が0以下になったエンティティを探し、そのエンティティの`OnDeath`アクションを実行するためのイベントを生成する。

*   **`HierarchySystem`**:
    *   責務: `Parent`を持つエンティティの`Position`を、親エンティティの`Position`に基づいて更新する。

## 4. 処理フローの例

### 例1：弾が敵に当たり、敵がダメージ状態に移行する

1.  **`CollisionSystem`**が「弾」と「敵」の衝突を検知。
2.  **`ActionSystem`**が弾の`OnCollision`（`DEAL_DAMAGE`）を処理し、敵の`Health`を減らす。
3.  **`ActionSystem`**が敵の`OnCollision`（`SPAWN_EFFECT`）を処理。
4.  **`EffectSystem`**が敵の`Material`に応じた火花エフェクトを生成。
5.  敵の`Health`が一定値を下回ったことを検知した別のシステム（または`ActionSystem`自身）が、`CHANGE_AI_STATE`アクションを実行。
6.  **`ActionSystem`**がこれを処理し、敵の`AIState.currentState`を `'attacking'` から `'damaged'` に変更する。
7.  次のフレームから、**`AISystem`**は敵の`AIState`が`'damaged'`であると認識し、その振る舞い（例: `movement: "drift_uncontrolled"`）を`Velocity`コンポーネントに適用する。結果、敵は制御を失ったように漂い始める。

### 例2：隕石が破壊され、分裂する

1.  弾が隕石に当たり、`Health`が0になる。
2.  **`DeathSystem`**がこれを検知し、隕石の`OnDeath`アクション（`{ type: 'SPAWN', entityType: 'small_meteor', count: 3 }`）を取得し、イベントを生成。
3.  **`ActionSystem`**がこのイベントを処理し、`SpawningSystem`（または`entityFactory`）に指示を出す。
4.  3つの小さな隕石エンティティが生成される。
5.  元の隕石エンティティはワールドから削除される。