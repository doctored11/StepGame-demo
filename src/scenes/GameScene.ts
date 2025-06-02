import * as THREE from "three";
import { GameMap } from "../core/game/GameMap";
import { TileSelector } from "../core/game/TileSelector";
import { Player } from "../core/game/Player";
import { GameMaster } from "../core/game/GameMaster";

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
    this.camera.position.set(6, 15, 6);
    this.camera.lookAt(6, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    this.createMap(10);

    const startTile = this.gameMap.getTileById(1); //todo внести потом рандом
    if (startTile) {
      this.player = new Player(startTile);
      console.log(this.player);
    } else console.error("010");
    this.scene.add(this.player.mesh);

    this.tileSelector = new TileSelector(
      this.camera,
      this.renderer,
      this.gameMap,
    //   this.player
    );
    this.gameMaster = new GameMaster(
      this.gameMap,
      this.player,
    //   this.getDiceValue,
      () => {
        this.setCanRoll(true);
        this.addLog("Ход завершён, можно бросать кубик");
      }
    );

    this.tileSelector.setOnTileSelectedCallback((tile) => {
      if (!this.gameMaster.canMoveTo(tile)) {
        console.log("Ход на эту клетку невозможен");
        return;
      }
      this.gameMaster.onTileSelected(tile);
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const geometry = new THREE.PlaneGeometry(90, 50);
    const material = new THREE.MeshStandardMaterial({ color: 0x3333aa });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);

    this.lastFrameTime = performance.now();
    this.animate();
  }

   public startTurnWithDiceValue(diceValue: number) {
    this.gameMaster.startTurn(diceValue); 
  }

  private animate = () => {
    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  private update(delta: number) {}

  public createMap(size: number) {
    this.gameMap = new GameMap();
    this.gameMap.generateGrid(size, size);
    this.gameMap.addToScene(this.scene);
  }

  public dispose() {
    if (this.animationId !== undefined) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
