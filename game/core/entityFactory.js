// game/core/entityFactory.js 【Lifetime追加版】

import { Position, Renderable, Velocity, Controllable, Rotation, Team, Bullet, Lifetime } from '../components/index.js';

/**
 * プレイヤーエンティティを作成して返す
 */
export function createPlayer(world) {
  const canvas = world.canvas;
  if (!canvas) {
    throw new Error('Worldにcanvasが設定されていません。');
  }

  const player = world.createEntity();
  world.addComponent(player, new Position(canvas.width / 2, canvas.height - 100));
  world.addComponent(player, new Renderable('white', 20, 30, 'triangle'));
  world.addComponent(player, new Velocity(0, 0));
  world.addComponent(player, new Controllable());
  world.addComponent(player, new Rotation(0));
  world.addComponent(player, new Team('player'));

  console.log(`プレイヤーを作成しました (ID: ${player})`);
  return player;
}

/**
 * 弾丸エンティティを作成して返す
 */
export function createBullet(world, ownerPosition, ownerRotation, ownerTeam) {
  const bullet = world.createEntity();
  const speed = 10.0;
  const vx = Math.sin(ownerRotation.angle) * speed;
  const vy = -Math.cos(ownerRotation.angle) * speed;

  world.addComponent(bullet, new Position(ownerPosition.x, ownerPosition.y));
  world.addComponent(bullet, new Velocity(vx, vy));
  world.addComponent(bullet, new Renderable('yellow', 5, 10, 'rectangle'));
  world.addComponent(bullet, new Bullet());
  world.addComponent(bullet, new Team(ownerTeam));
  world.addComponent(bullet, new Lifetime(3.0)); // ← ★★★ 弾に3秒の寿命を設定 ★★★

  return bullet;
}
