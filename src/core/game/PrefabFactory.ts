import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

export class PrefabFactory {
  private loader = new GLTFLoader();

  private templates: THREE.Object3D[] = [];

  private isLoaded = false;

  public async loadAll(urls: string[]): Promise<void> {
    if (this.isLoaded) return;

    const gltfs = await Promise.all(
      urls.map((url) => this.loader.loadAsync(url))
    );

    this.templates = gltfs.map((gltf) => {
      const scene = gltf.scene;
      scene.position.set(0, 0, 0);
      return scene;
    });

    this.isLoaded = true;
  }

  public async loadMultipleGLBs(urls: string[]): Promise<THREE.Object3D[]> {
    const loader = new GLTFLoader();
    const frames: THREE.Object3D[] = [];

    for (const url of urls) {
      const gltf = await loader.loadAsync(url);
      const object = gltf.scene;
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
        }
      });
      frames.push(object);
    }

    return frames;
  }

  public createFrames(): THREE.Object3D[] {
    if (!this.isLoaded) {
      throw new Error(
        "PrefabFactory: не загруженно! [проверь вызов loadAll(urls)]"
      );
    }
    return this.templates.map((tpl) => tpl.clone(true));
  }
}
