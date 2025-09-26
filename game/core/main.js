// game/core/main.js
import { World } from './World.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { MovementSystem } from '../systems/MovementSystem.js';
import { createPlayer } from './entityFactory.js';


let world;
let animationFrameId;

let lastTime = 0;
let frameCount = 0;
let fps = 0;


/**
 * ゲームを開始する
 * @param {HTMLCanvasElement} canvas
 */
export function startGame(canvas) {
  console.log("ゲームを開始します...");
  const context = canvas.getContext('2d');
  world = new World();
  world.canvas = canvas; // Worldにcanvasとcontextを持たせておく
  world.context = context;

  // --- システムの追加 ---
  world.addSystem(new InputSystem(world));
  world.addSystem(new MovementSystem(world));
  world.addSystem(new RenderSystem(world));

  // --- エンティティの創造（専門家に依頼） ---
  createPlayer(world);


  function gameLoop(currentTime) {
    // 最初のフレームの初期化
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    // 経過時間(dt)を計算
    const dt = (currentTime - lastTime) / 1000;

    // FPS計算
    frames++;
    if (currentTime >= lastTime + 1000) {
        fps = frames;
        frames = 0;
        lastTime = currentTime;
    }

    // 画面クリア
    const context = world.context;
    context.clearRect(0, 0, world.canvas.width, world.canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, world.canvas.width, world.canvas.height);

    // ワールドを更新
    world.update(dt);

    // デバッグ情報描画
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText(`FPS: ${fps}`, 10, 20);
    // dtは非常に大きくなる可能性があるので、表示を調整
    context.fillText(`DeltaTime: ${(dt % 1).toFixed(4)}`, 10, 40); 
    context.fillText('Game Loop is Running!', 10, 60);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  gameLoop(performance.now());
}

/**
 * ゲームを停止する
 */
export function stopGame() {
  console.log("ゲームを停止します。");
  cancelAnimationFrame(animationFrameId);
}
