import { 
  Position, 
  Renderable, 
  Velocity, 
  Controllable, 
  Rotation, 
  Team, 
  Bullet, 
  Lifetime,
  // --- 新しく追加するコンポーネント ---
  Health,
  Collidable
} from '../components/index.js';

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
  world.addComponent(bullet, new Lifetime(0.8)); // 弾の寿命

  return bullet;
}

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★ ここから下が新しく追加された部分です
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

/**
 * 隕石エンティティを作成して返す
 * @param {World} world - ワールドオブジェクト
 * @param {number} x - 初期位置X
 * @param {number} y - 初期位置Y
 */
export function createMeteor(world, x, y) {
  const meteor = world.createEntity();

  // 画面上部からランダムなX方向へ、ゆっくりと落下させる
  const speed = 1.0 + Math.random() * 0.5; // 1.0〜1.5の範囲の速度
  const angle = (Math.random() - 0.5) * Math.PI / 4; // -22.5度〜+22.5度の範囲の角度
  const vx = Math.sin(angle) * speed;
  const vy = Math.cos(angle) * speed;

  world.addComponent(meteor, new Position(x, y));
  world.addComponent(meteor, new Velocity(vx, vy));
  world.addComponent(meteor, new Renderable('gray', 20, 20, 'rectangle')); // 見た目は灰色の四角
  world.addComponent(meteor, new Team('enemy')); // チームは'enemy'
  world.addComponent(meteor, new Health(3)); // 体力は3
  world.addComponent(meteor, new Collidable('enemy', 20)); // 半径20の当たり判定

  // console.log(`隕石を作成しました (ID: ${meteor})`);
  return meteor;
}
