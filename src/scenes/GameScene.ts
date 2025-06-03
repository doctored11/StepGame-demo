import * as THREE from "three";
import { GameMap } from "../core/game/GameMap";
import { TileSelector } from "../core/game/TileSelector";
import { Player } from "../core/game/Player";
import { GameMaster } from "../core/game/GameMaster";
import { TileFactory } from "../core/game/TileFactory";
import { Tile } from "../core/game/Tile";

type Callbacks = {
  getDiceValue: () => number;
  addLog: (msg: string) => void;
  setCanRoll: (canRoll: boolean) => void;
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

  private player!: Player;
  private gameMaster!: GameMaster;
  private tileSelector!: TileSelector;

  private getDiceValue: () => number;
  private addLog: (msg: string) => void;
  private setCanRoll: (canRoll: boolean) => void;

  constructor(container: HTMLElement, callbacks: Callbacks) {
    this.container = container;

    this.getDiceValue = callbacks.getDiceValue;
    this.addLog = callbacks.addLog;
    this.setCanRoll = callbacks.setCanRoll;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(4, 5, 4);
    this.camera.lookAt(3, 2, 3);

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

    this.tileFactory = new TileFactory();
    this.initializeAsync();

    this.lastFrameTime = performance.now();
    this.animate();
  }

  private async initializeAsync() {
    await this.tileFactory.loadAll("/assets/models/tiles/");

    this.gameMap = new GameMap(this.scene, this.tileFactory, 1);
    this.gameMap.generateGrid(7, 7);
    this.gameMap.addToScene(this.scene);

    const startTile = this.gameMap.getTileById(1); //todo порандомить
    if (!startTile) throw new Error("не удалось найти тайл id=1");
    this.player = new Player(startTile);
    this.scene.add(this.player.mesh);

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
        this.addLog("Ход завершён, можно бросить кубик");
          this.gameMap.getAllTiles().forEach((t) => t.disableGlow());
      },
      (reachableTiles: Tile[]) => {
        this.gameMap.getAllTiles().forEach((t) => t.disableGlow());
        reachableTiles.forEach((t) => t.enableGlow());
      }
    );

    this.gameMaster.updateReachableTiles();
  }

  public startTurnWithDiceValue(diceValue: number) {
    this.gameMaster.startTurn(diceValue);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

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
