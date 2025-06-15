import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class EndScene {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private model?: THREE.Object3D;
  private animId?: number;

  constructor(private container: HTMLElement) {
    const { clientWidth: w, clientHeight: h } = container;

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 1.5, 3);
    this.camera.lookAt(0, 1, 0);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(w, h);
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 5);
    this.scene.add(dir);
  }

  public async loadAndPlay(modelUrl: string) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelUrl);
    this.model = gltf.scene;

    this.model.position.y += 1;
    this.model.scale.set(2, 2, 2);
    this.scene.add(this.model);
    this.animate();
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);
    if (this.model) this.model.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
