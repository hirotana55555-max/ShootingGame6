// game/core/entityFactory.js 【リファクタリング後】

import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';
import { Velocity } from '../components/Velocity.js';
import { Controllable } from '../components/Controllable.js';

/**
 * プレイヤーエンティティを作成して返す
 * @param {import('./World').World} world
 * @returns {number} 作成されたプレイヤーエンティティのID
 */
export function createPlayer(world) {
  const canvas = world.canvas;
  if (!canvas) {
    throw new Error('Worldにcanvasが設定されていません。');
  }

  const player = world.createEntity();
  world.addComponent(player, new Position(canvas.width / 2, canvas.height - 50));
  world.addComponent(player, new Renderable('white', 30, 30));
  world.addComponent(player, new Velocity(0, 0));
  world.addComponent(player, new Controllable());

  console.log(`プレイヤーを作成しました (ID: ${player})`);
  return player;
}

// --- 将来的には、ここに createEnemy や createBullet などの関数が追加されていく ---
