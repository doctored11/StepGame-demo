

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
//мб отказаться от фабрики тут - ххз todo


export class BerryFactory {
  private loader = new GLTFLoader();

  private templates: THREE.Object3D[] = [];

  private isLoaded = false;

  
  public async loadAll(urls: string[]): Promise<void> {
    if (this.isLoaded) return;

    const gltfs = await Promise.all(urls.map((url) => this.loader.loadAsync(url)));

    this.templates = gltfs.map((gltf) => {
      const scene = gltf.scene;
      scene.position.set(0, 0, 0);
      return scene;
    });

    this.isLoaded = true;
  }

  
  public createFrames(): THREE.Object3D[] {
    if (!this.isLoaded) {
      throw new Error("BerryFactory: сперва вызовите loadAll(urls)");
    }
    return this.templates.map((tpl) => tpl.clone(true));
  }
}
