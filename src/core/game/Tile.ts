import * as THREE from "three";
import { Berry } from "./Berry";

export type TileId = number;

export class Tile {
  public id: TileId;
  public position: THREE.Vector3;
  public neighbors: TileId[];
  public height: number;

  public object: THREE.Object3D;
  public walkable: boolean = false;
  public berry: Berry | null = null;

  public collider: THREE.Mesh;
  private originalMaterials: Map<
    THREE.Mesh,
    THREE.Material | THREE.Material[]
  > = new Map();


  constructor(id: TileId, position: THREE.Vector3, height: number = 1) {
    this.id = id;
    this.position = position;
    this.height = height;
    this.neighbors = [];

    this.object = new THREE.Object3D();
    this.object.position.copy(position);

    const geom = new THREE.BoxGeometry(0.9, 1.2, 0.9);
    const mat = new THREE.MeshBasicMaterial({ visible: false }); //true для дебага колизии
    this.collider = new THREE.Mesh(geom, mat);
    this.collider.position.set(position.x, -0.4, position.z); //тут подумать
  }

  public setObject3D(obj: THREE.Object3D) {
    this.object = obj;
    this.object.position.copy(this.position);

    const highlight = obj.clone();
    highlight.name = "highlight";

    highlight.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        });
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });

    highlight.visible = false;
    this.object.add(highlight);
  }

  public addNeighbor(tileId: TileId) {
    if (!this.neighbors.includes(tileId)) {
      this.neighbors.push(tileId);
    }
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.object);
    scene.add(this.collider);
  }

  setHighlight(active: boolean, color = 0x00ff00) {
    console.log("хайлайт", active);
    const highlightObj = this.object.getObjectByName("highlight");
    if (highlightObj) {
      highlightObj.visible = active;

      highlightObj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (
            (child as THREE.Mesh).material as THREE.MeshBasicMaterial
          ).color.setHex(color);
        }
      });
    }
  }

  public setWalkable(value: boolean) {
    this.walkable = value;
  }

  public isWalkable(): boolean {
    return this.walkable;
  }

  public enableGlow() {
    this.object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!this.originalMaterials.has(mesh)) {
          this.originalMaterials.set(mesh, mesh.material);
        }
        const oldMat = mesh.material as THREE.MeshStandardMaterial;

        const glowMat = new THREE.MeshBasicMaterial({
          map: oldMat.map || null,
          color: oldMat.color.clone().multiplyScalar(3),
        });
        mesh.material = glowMat;
      }
    });
  }

  public disableGlow() {
    this.object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const orig = this.originalMaterials.get(mesh);
        if (orig) {
          mesh.material = orig;
        }
      }
    });
    this.originalMaterials.clear();
  }
  // public select() {
  //   // this.enableGlow();
  //   this.setHighlight(true);
  // }

  // //todo вынести колористику
  // public deselect() {
  //   console.log("deselect")
  //    this.disableGlow();
  //   this.setHighlight(false);
  // }

  public getObject3D(): THREE.Object3D {
    return this.object;
  }

  public isFree(occupiedTiles: Set<string>): boolean {
    const key = `${this.position.x},${this.position.z}`;
    return !occupiedTiles.has(key);
  }
}
