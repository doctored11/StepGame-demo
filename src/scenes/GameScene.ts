import * as THREE from "three";
import { GameMap } from "../core/game/GameMap";

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private animationId?: number;
  private lastFrameTime: number;
  private gameMap!: GameMap;


  constructor(container: HTMLElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(6, 15, 6);
    this.camera.lookAt(6, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    this.createMap(10)

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
