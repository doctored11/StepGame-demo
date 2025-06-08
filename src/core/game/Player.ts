import * as THREE from "three";
import { Tile } from "./Tile";
import { GameMap } from "./GameMap";
import { AnimatedEntity } from "./AnimatedEntity";

export class Player extends AnimatedEntity {
  public currentTile: Tile;

  private path: THREE.Vector3[] = [];
  private moveSpeed = 5;

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
    this.snapToCurrent();
  }

  public moveAlongTiles(tiles: Tile[]): Promise<void> {
    if (tiles.length === 0) return Promise.resolve();
    this.path = tiles.map((t) =>
      t.position.clone().add(new THREE.Vector3(0, 0.5, 0))
    );
    this.orientTo(this.path[0]);
    return new Promise((resolve) => {
      (this as any)._onPathComplete = resolve;
    });
  }

  private orientTo(target: THREE.Vector3) {
    const dir = target.clone().sub(this.getObject3D().position);
    const angle = Math.atan2(dir.x, dir.z);
    this.getObject3D().rotation.y = angle+Math.PI;
  }

  public reachableTiles(map: GameMap, maxSteps = 3): Tile[] {
    const visited = new Set<number>();
    const queue: Array<{ tile: Tile; dist: number }> = [
      { tile: this.currentTile, dist: 0 },
    ];
    const result: Tile[] = [];

    while (queue.length) {
      const { tile, dist } = queue.shift()!;
      if (dist === maxSteps) continue;

      for (const nId of tile.neighbors) {
        if (visited.has(nId)) continue;
        const nTile = map.getTileById(nId)!;
        visited.add(nId);
        result.push(nTile);
        queue.push({ tile: nTile, dist: dist + 1 });
      }
    }
    return result;
  }

  public override update(delta: number): void {
    super.update(delta);

    if (this.path.length > 0) {
      const root = this.getObject3D();
      const target = this.path[0];
      const dir = target.clone().sub(root.position);
      const dist = dir.length();

      if (dist <= this.moveSpeed * delta) {
        root.position.copy(target);
        this.path.shift();
        if (this.path.length > 0) {
          this.orientTo(this.path[0]);
        } else {
          const resolve = (this as any)._onPathComplete;
          if (resolve) resolve();
        }
      } else {
        dir.normalize();
        root.position.add(dir.multiplyScalar(this.moveSpeed * delta));
      }
    }
  }
}
