import * as THREE from "three";
import { Tile } from "./Tile";
import { GameMap } from "./GameMap";
import { AnimatedEntity } from "./AnimatedEntity";
import { findReachableTiles } from "./Pathfinder";

export class Player extends AnimatedEntity {
  public currentTile: Tile;

  // private path: THREE.Vector3[] = [];
  // private moveSpeed = 5;

  constructor(startTile: Tile, frames: THREE.Object3D[]) {
    super(
      startTile.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
      frames,
      5
    );
    this.getObject3D().rotation.y += Math.PI;

    this.currentTile = startTile;

    this.snapToCurrent();
  }

  private snapToCurrent() {
    this.getObject3D()
      .position.copy(this.currentTile.position)
      .add(new THREE.Vector3(0, 0.5, 0));
    console.log(this.getObject3D().position);
  }

  public setTile(tile: Tile) {
    this.currentTile = tile;
    this.getObject3D()
      .position.copy(tile.position)
      .add(new THREE.Vector3(0, 0.5, 0));
  }

  public moveAlongTiles(tiles: Tile[]): Promise<void> {
    const waypoints: THREE.Vector3[] = [];
    let last = this.getObject3D().position.clone();

    for (const t of tiles) {
      const target = t.position.clone().add(new THREE.Vector3(0, 0.5, 0));
      const dx = target.x - last.x;
      const dz = target.z - last.z;

      if (dx !== 0 && dz !== 0) {
        waypoints.push(
          new THREE.Vector3(target.x, target.y, last.z),
          target.clone()
        );
      } else {
        waypoints.push(target.clone());
      }
      last = target.clone();
    }

    return this.moveAlong(waypoints).then(() => {
      if (tiles.length > 0) this.currentTile = tiles[tiles.length - 1];
    });
  }

  // private orientTo(target: THREE.Vector3) {
  //   const dir = target.clone().sub(this.getObject3D().position);
  //   const angle = Math.atan2(dir.x, dir.z);
  //   this.getObject3D().rotation.y = angle+Math.PI;
  // }

  public reachableTiles(map: GameMap, maxSteps = 3): Tile[] {
    return findReachableTiles(this.currentTile, maxSteps, map);
  }

  public override update(delta: number): void {
    super.update(delta);
  }
}
