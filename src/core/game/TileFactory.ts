import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { TileType, TileRotation } from "./TileType";

type ModelTemplate = {
  scene: THREE.Object3D;
};

export class TileFactory {
  private loader = new GLTFLoader();
  private modelTemplates: Partial<Record<TileType, ModelTemplate>> = {};

  public async loadAll(basePath: string): Promise<void> {
    const promises: Array<Promise<void>> = [];

    const fileNames: Record<TileType, string> = {
      [TileType.STRAIGHT]: "straight.glb",
      [TileType.TURN]: "turn.glb",
      [TileType.CROSS]: "tileCross.glb",
      [TileType.T_JUNCTION]: "t_junction.glb",
    };

    for (const type of Object.values(TileType)) {
      const url = `${basePath}${fileNames[type]}`;
      const p = this.loader.loadAsync(url).then((gltf) => {
        this.modelTemplates[type] = { scene: gltf.scene };
      });
      promises.push(p);
    }

    await Promise.all(promises);
  }

  public createTileMesh(
    type: TileType,
    rotation: TileRotation
  ): THREE.Object3D {
    const template = this.modelTemplates[type];
    if (!template) {
      throw new Error(`TileFactory: модель для типа "${type}" не загружена`);
    }

    const instance = template.scene.clone(true);

    instance.rotation.y = (rotation * Math.PI) / 180;

    return instance;
  }
}
