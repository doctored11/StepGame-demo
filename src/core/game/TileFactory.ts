import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { TileType, TileRotation } from "./TileType";
import { Tile } from "./Tile";

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

  private computeNeighborBitmask(
    x: number,
    z: number,
    getTileAt: (x: number, z: number) => Tile | undefined
  ): number {
    let mask = 0;
    if (getTileAt(x, z - 1)) mask |= 1; // верх
    if (getTileAt(x + 1, z)) mask |= 2;
    if (getTileAt(x, z + 1)) mask |= 4; //низ
    if (getTileAt(x - 1, z)) mask |= 8; // лев
    return mask;
  }

  public createTileFromNeighbors(
    x: number,
    z: number,
    getTileAt: (x: number, z: number) => Tile | undefined
  ): THREE.Object3D {
    const mask = this.computeNeighborBitmask(x, z, getTileAt);
    const { type, rotation } = this.resolveTileFromBitmask(mask);
    return this.createTileMesh(type, rotation);
  }

  private resolveTileFromBitmask(mask: number): {
    type: TileType;
    rotation: TileRotation;
  } {
    //пошел брутфорс
    //https://azbyka.ru/molitvoslov/molitvy-uchashhegosja.html#n5F
    switch (mask) {
      case 0b0001:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_0 }; //?
      case 0b0010:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_270 }; //?
      case 0b0100:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_0 }; //?
      case 0b1000:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_90 }; //?

      case 0b0011:
        return { type: TileType.TURN, rotation: TileRotation.ROT_90 }; //!
      case 0b0110:
        return { type: TileType.TURN, rotation: TileRotation.ROT_0 }; //!
      case 0b1100:
        return { type: TileType.TURN, rotation: TileRotation.ROT_270 }; //!
      case 0b1001:
        return { type: TileType.TURN, rotation: TileRotation.ROT_180 };

      case 0b0101:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_90 }; //!
      case 0b1010:
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_0 }; //!

      case 0b0111:
        return { type: TileType.T_JUNCTION, rotation: TileRotation.ROT_180 }; //!
      case 0b1110:
        return { type: TileType.T_JUNCTION, rotation: TileRotation.ROT_90 }; //!
      case 0b1101:
        return { type: TileType.T_JUNCTION, rotation: TileRotation.ROT_0 }; //!
      case 0b1011:
        return { type: TileType.T_JUNCTION, rotation: TileRotation.ROT_270 }; //!

      case 0b1111:
        return { type: TileType.CROSS, rotation: TileRotation.ROT_90 }; //!

      default:
        // заглушка
        return { type: TileType.STRAIGHT, rotation: TileRotation.ROT_270 };
    }
  }
}
