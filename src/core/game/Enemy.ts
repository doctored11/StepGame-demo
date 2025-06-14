import { AnimatedEntity } from "./AnimatedEntity";
import { Tile } from "./Tile";
import { GameMaster } from "./GameMaster";
import * as THREE from "three";

export abstract class Enemy extends AnimatedEntity {
  public currentTile: Tile;

  constructor(
    protected master: GameMaster,
    startTile: Tile,
    frames: THREE.Object3D[],
    fps = 3
  ) {
    super(
      startTile.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
      frames,
      fps
    );
    this.currentTile = startTile;
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
      last.copy(target);
    }

    return this.moveAlong(waypoints).then(() => {
      if (tiles.length > 0) {
        this.currentTile = tiles[tiles.length - 1];
      }
    });
  }

  public abstract takeTurn(): Promise<void>;
}
