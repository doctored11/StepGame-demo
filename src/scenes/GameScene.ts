import * as THREE from "three";
import { GameMap } from "../core/game/GameMap";
import { TileSelector } from "../core/game/TileSelector";
import { Player } from "../core/game/Player";
import { GameMaster, GameResult } from "../core/game/GameMaster";
import { TileFactory } from "../core/game/TileFactory";
import { Tile } from "../core/game/Tile";
import { Berry } from "../core/game/Berry";
import { PrefabFactory } from "../core/game/PrefabFactory";
import { RedEnemy } from "../core/game/RedEnemy";
import { BlueEnemy } from "../core/game/BlueEnemy";
import { useGame } from "../context/GameContext";

type Callbacks = {
  getDiceValue: () => number;
  addLog: (msg: string) => void;
  setCanRoll: (canRoll: boolean) => void;
  addScore: (amount: number) => void;
  onGameOver: (result: GameResult, turns: number) => void;
};

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  private container: HTMLElement;
  private animationId?: number;
  private lastFrameTime: number;
  private gameMap!: GameMap;
  private tileFactory: TileFactory;
  private PrefabFactory: PrefabFactory;

  private player!: Player;
  private gameMaster!: GameMaster;
  private tileSelector!: TileSelector;

  private isInitialized = false;

  // private berries: Set<Berry> = new Set();

  private getDiceValue: () => number;
  private addLog: (msg: string) => void;
  private setCanRoll: (canRoll: boolean) => void;
  private addScore: (amount: number) => void;
  private onGameOver: (result: GameResult, turns: number) => void;

  private localScore: number;
  private isBlueSpawned: boolean;

  constructor(container: HTMLElement, callbacks: Callbacks) {
    this.container = container;

    this.getDiceValue = callbacks.getDiceValue;
    this.addLog = callbacks.addLog;
    this.setCanRoll = callbacks.setCanRoll;
    this.addScore = callbacks.addScore;
    this.onGameOver = callbacks.onGameOver;
    this.localScore = 0;
    this.isBlueSpawned = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const camX = 5;
    const camY = 7;
    const camZ = 7.5;

    const lookX = camX;
    const lookY = camY - 3;
    const lookZ = camZ - 1;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(lookX, lookY, lookZ);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.renderer.toneMapping = THREE.NoToneMapping;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xbbffaa, 3);
    dirLight.position.set(5, 3, -2);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    const waterMaterial = new THREE.MeshPhongMaterial({
      color: 0x44ccff,
      transparent: true,
      opacity: 0.6,

      shininess: 100,
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.33;
    this.scene.add(water);

    this.tileFactory = new TileFactory();
    this.PrefabFactory = new PrefabFactory();
    this.initializeAsync();

    this.lastFrameTime = performance.now();
    this.animate();
  }

  public getScore() {
    return this.localScore;
  }

  private async initializeAsync() {
    await this.tileFactory.loadAll("/assets/models/tiles/");
    await this.PrefabFactory.loadAll([
      "/assets/models/berry_1.glb",
      "/assets/models/berry_2.glb",
      "/assets/models/berry_3.glb",
    ]);

    this.gameMap = new GameMap(
      this.scene,
      this.tileFactory,
      this.PrefabFactory,
      1
    );

    this.gameMap.generateGrid(10, 10);
    this.gameMap.addToScene(this.scene);

    const startTile = this.gameMap.getTileById(1); //todo порандомить

    if (!startTile) throw new Error("не удалось найти тайл id=1");

    //todo адекватно заренеймить
    const playerFrames = await this.PrefabFactory.loadMultipleGLBs([
      "/assets/models/player_1.glb",
      "/assets/models/player_2.glb",
    ]);
    this.player = new Player(startTile, playerFrames);
    this.scene.add(this.player.getObject3D());
    this.gameMap.occupyTile(startTile.position.x, startTile.position.z);

    const firstBerry = this.gameMap.spawnBerry();
    // if (firstBerry) this.berries.add(firstBerry);

    this.tileSelector = new TileSelector(
      this.camera,
      this.renderer,
      this.gameMap
    );

    this.tileSelector.setOnTileSelectedCallback((tile) => {
      if (!this.gameMaster.canMoveTo(tile)) {
        console.log("Нельзя ходить на эту клетку");
        return;
      }
      this.gameMaster.onTileSelected(tile);
    });

    this.gameMaster = new GameMaster(
      this.gameMap,
      this.player,
      () => {
        this.setCanRoll(true);
        this.addLog("Ход завершён");
        this.gameMap.getAllTiles().forEach((t) => t.disableGlow());
      },
      (reachableTiles: Tile[]) => {
        this.gameMap.getAllTiles().forEach((t) => t.disableGlow());
        reachableTiles.forEach((t) => t.enableGlow());
      },
      () => {
        this.addScore(1);
        this.localScore++;
        this.addLog("+1");
        if (!this.isBlueSpawned && this.localScore >= 3) {
          this.spawnBlueEnemy();
          this.isBlueSpawned = true;
        }
      },
      (result, score, turns) => {
        this.addLog(
          `🎯 Игра окончена! Результат: ${result}, очки: ${score}, ходы: ${turns}`
        );
        this.onGameOver(result, turns);
      }
    );

    const redEnemyFrames = await this.PrefabFactory.loadMultipleGLBs([
      "/assets/models/red_1.glb",
      "/assets/models/red_2.glb",
    ]);
    const redStartTile = this.gameMap.getTileById(5)!; //todo порандомить 5

    const redEnemy = new RedEnemy(
      this.gameMaster,
      redStartTile,
      redEnemyFrames
    );

    this.gameMaster.registerEnemy(redEnemy);
    this.scene.add(redEnemy.getObject3D());

    this.gameMaster.updateReachableTiles();

    this.isInitialized = true;
  }

  private async spawnBlueEnemy() {
    const blueFrames = await this.PrefabFactory.loadMultipleGLBs([
      "/assets/models/blue_1.glb",
      "/assets/models/blue_2.glb",
    ]);

    let free = this.gameMap
      .getFreeTiles()
      .filter((t) => t !== this.player.currentTile);

    const occupiedByEnemy = new Set(
      this.gameMaster.enemies.map(
        (e) => `${e.currentTile.position.x},${e.currentTile.position.z}`
      )
    );
    free = free.filter(
      (t) => !occupiedByEnemy.has(`${t.position.x},${t.position.z}`)
    );

    const MinDist = 4;
    const px = this.player.currentTile.position.x;
    const pz = this.player.currentTile.position.z;
    const farEnough = free.filter((t) => {
      const dx = Math.abs(t.position.x - px);
      const dz = Math.abs(t.position.z - pz);
      return dx + dz > MinDist;
    });

    const candidates = farEnough.length > 0 ? farEnough : free;
    if (candidates.length === 0) {
      console.warn("Нет подходящих тайлов для синего ");
      return;
    }

    const idx = Math.floor(Math.random() * candidates.length);
    const spawnTile = candidates[idx];
    const blue = new BlueEnemy(this.gameMaster, spawnTile, blueFrames);
    this.gameMaster.registerEnemy(blue);
    this.scene.add(blue.getObject3D());

    this.addLog("🔷 синий заспавнился");
  }

  public startTurnWithDiceValue(diceValue: number) {
    if (!this.isInitialized || !this.gameMaster) return;
    this.gameMaster.startTurn(diceValue);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.isInitialized || !this.gameMap || !this.player) return;
    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // this.player.update(delta); //todo унаследовать от анимации и добавить модели

    this.gameMap.getAllBerries().forEach((berry) => {
      berry.update(delta);
    });

    this.gameMaster.enemies.forEach((e) => e.update(delta));

    this.player.update(delta);

    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
