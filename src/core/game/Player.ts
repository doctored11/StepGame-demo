import * as THREE from "three";
import { Tile } from "./Tile";
import { GameMap } from "./GameMap";

export class Player {
  public mesh: THREE.Mesh;
  public currentTile: Tile;

  constructor(startTile: Tile) {
    this.currentTile = startTile;

    const geometry = new THREE.SphereGeometry(0.3, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffd700 });
    this.mesh = new THREE.Mesh(geometry, material);

    this.snapToCurrent();
  }

  private snapToCurrent() {
    this.mesh.position
      .copy(this.currentTile.position)
      .add(new THREE.Vector3(0, 0.5, 0));
      console.log(this.mesh.position)
  }

  public setTile(tile: Tile) {
    this.currentTile = tile;
    this.snapToCurrent();
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
}
