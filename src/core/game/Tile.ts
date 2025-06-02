import * as THREE from "three";

export type TileId = number;

export class Tile {
  public id: TileId;
  public position: THREE.Vector3;
  public neighbors: TileId[];
  public height: number;

  public mesh: THREE.Mesh;
  private walkable: boolean = true;

  constructor(id: TileId, position: THREE.Vector3, height: number = 1) {
    this.id = id;
    this.position = position;
    this.height = height;
    this.neighbors = [];

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const sum = Math.floor(position.x) + Math.floor(position.z);
    const color = sum % 2 === 0 ? 0xffffff : 0x4444;
    const material = new THREE.MeshStandardMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.set(position.x, 0.5, position.z);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
  }

  public addNeighbor(tileId: TileId) {
    if (!this.neighbors.includes(tileId)) {
      this.neighbors.push(tileId);
    }
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  public setHighlight(active: boolean) {
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    if (active) {
      mat.emissive.set(0x00ff00);
    } else {
      mat.emissive.set(0x000000);
    }
  }

  public setWalkable(value: boolean) {
    this.walkable = value;
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    mat.color.set(value ? 0x228833 : 0x882222);
  }

  public isWalkable(): boolean {
    return this.walkable;
  }

  public removeFromScene(scene: THREE.Scene) {
    scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
