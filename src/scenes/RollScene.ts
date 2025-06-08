import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DiceOrientations } from "../roll/DiceOrientation";

export class RollScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private diceMesh?: THREE.Object3D;
  private clock = new THREE.Clock();

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(160, 160);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    this.camera.position.set(0, 3, 0);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0x4599fa, 1));
    const dl = new THREE.DirectionalLight(0xacccff, 4);
    dl.position.set(1, 3, 0);
    this.scene.add(dl);

    this.animate();
  }

  public async loadDiceModel(url: string) {
    const gltf = await new GLTFLoader().loadAsync(url);
    this.diceMesh = gltf.scene.clone();
    this.diceMesh.scale.set(2, 2, 2);
    this.diceMesh.position.set(0, 0, 0);
    this.scene.add(this.diceMesh);
  }

  public rollTo(face: number, onComplete?: () => void) {
    if (!this.diceMesh) return;
    const target = DiceOrientations[face];
    const start = this.diceMesh.rotation.clone();

    const duration = 800;
    const startTime = performance.now();

    const tick = (t: number) => {
      const dt = t - startTime;
      const alpha = Math.min(dt / duration, 1);

      const extra = 4 * Math.PI * (1 - alpha);
      this.diceMesh!.rotation.x = THREE.MathUtils.lerp(
        start.x + extra,
        target.x,
        alpha
      );
      this.diceMesh!.rotation.y = THREE.MathUtils.lerp(
        start.y + extra,
        target.y,
        alpha
      );
      this.diceMesh!.rotation.z = THREE.MathUtils.lerp(
        start.z + extra,
        target.z,
        alpha
      );

      if (alpha < 1) requestAnimationFrame(tick);
      else onComplete?.();
    };
    requestAnimationFrame(tick);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
