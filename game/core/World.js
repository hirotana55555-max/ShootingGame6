// game/core/World.js

/**
 * ECSの世界全体を管理するクラス
 */
export class World {
    constructor() {
      this.entities = new Set(); // ゲームに存在する全てのエンティティID
      this.components = new Map(); // コンポーネントの種類ごとのデータ
      this.systems = []; // 実行される全てのシステム
      this.nextEntityId = 0;
    }
  
    /**
     * 新しいエンティティを作成し、IDを返す
     * @returns {number} エンティティID
     */
    createEntity() {
      const entityId = this.nextEntityId++;
      this.entities.add(entityId);
      return entityId;
    }
  
    /**
     * エンティティにコンポーネントを追加する
     * @param {number} entityId
     * @param {object} component
     */
    addComponent(entityId, component) {
      const componentName = component.constructor.name;
      if (!this.components.has(componentName)) {
        this.components.set(componentName, new Map());
      }
      this.components.get(componentName).set(entityId, component);
    }
  
    /**
     * システムをワールドに追加する
     * @param {System} system
     */
    addSystem(system) {
      this.systems.push(system);
    }
  
    /**
     * ワールドの状態を更新する（ゲームループで毎フレーム呼ばれる）
     * @param {number} dt - 前のフレームからの経過時間
     */
    update(dt) {
      for (const system of this.systems) {
        system.update(dt);
      }
    }
  }
  