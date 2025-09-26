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
   * 指定したコンポーネントを持つエンティティのリストを取得する
   * @param {Array<Function>} componentClasses
   * @returns {Array<number>}
   */
  getEntities(componentClasses) {
    const entities = [];
    for (const entityId of this.entities) {
      if (componentClasses.every(cls => this.hasComponent(entityId, cls))) {
        entities.push(entityId);
      }
    }
    return entities;
  }

  /**
   * エンティティが指定のコンポーネントを持っているか確認する
   * @param {number} entityId
   * @param {Function} componentClass
   * @returns {boolean}
   */
  hasComponent(entityId, componentClass) {
    const componentName = componentClass.name;
    return this.components.has(componentName) && this.components.get(componentName).has(entityId);
  }

  /**
   * エンティティから指定のコンポーネントを取得する
   * @param {number} entityId
   * @param {Function} componentClass
   * @returns {object | undefined}
   */
  getComponent(entityId, componentClass) {
    const componentName = componentClass.name;
    if (!this.hasComponent(entityId, componentClass)) {
      return undefined;
    }
    return this.components.get(componentName).get(entityId);
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
  