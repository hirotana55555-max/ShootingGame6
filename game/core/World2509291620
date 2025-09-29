//World.js
export class World {
  constructor() {
    this.entities = new Set();
    this.components = new Map();
    this.systems = [];
    this.nextEntityId = 0;
    this.pendingRemovals = new Set();

    this.eventQueue = [];
  }

  createEntity() {
    const entityId = this.nextEntityId++;
    this.entities.add(entityId);
    return entityId;
  }

  addComponent(entityId, component) {
    const componentName = component.constructor.name;
    if (!this.components.has(componentName)) {
      this.components.set(componentName, new Map());
    }
    this.components.get(componentName).set(entityId, component);
  }

  removeEntity(entityId) {
    this.entities.delete(entityId);
    for (const componentMap of this.components.values()) {
      componentMap.delete(entityId);
    }
  }

  markForRemoval(entityId) {
    if (!this.entities.has(entityId)) return;
    this.pendingRemovals.add(entityId);
  }

  flushRemovals() {
    for (const entityId of this.pendingRemovals) {
      this.removeEntity(entityId);
    }
    this.pendingRemovals.clear();
  }

  // ★ イベントキューを操作するメソッドを2つ追加します
  /**
   * イベントをキューに追加する
   * @param {object} event - イベントオブジェクト (例: { type: 'collision', a: entityA, b: entityB })
   */
  emitEvent(event) {
    this.eventQueue.push(event);
  }

  /**
   * 現在のフレームのイベントをすべて取得する
   * @returns {Array<object>}
   */
  getEvents() {
    return this.eventQueue;
  }
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

  getEntities(componentClasses) {
    const entities = [];
    for (const entityId of this.entities) {
      if (componentClasses.every(cls => this.hasComponent(entityId, cls))) {
        entities.push(entityId);
      }
    }
    return entities;
  }

  hasComponent(entityId, componentClass) {
    const componentName = componentClass.name;
    return this.components.has(componentName) && this.components.get(componentName).has(entityId);
  }

  getComponent(entityId, componentClass) {
    const componentName = componentClass.name;
    if (!this.hasComponent(entityId, componentClass)) {
      return undefined;
    }
    return this.components.get(componentName).get(entityId);
  }

  addSystem(system) {
    this.systems.push(system);
  }

  update(dt) {
    for (const system of this.systems) {
      system.update(dt);
    }

    this.flushRemovals();

    // ★ 最後にイベントキューを空にする
    // ★ これにより、イベントは1フレームの間だけ有効になります
    this.eventQueue = [];
  }
}
