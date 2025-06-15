import { Enemy } from "./Enemy";
import { Tile } from "./Tile";
import { findPath } from "./Pathfinder";

export class RedEnemy extends Enemy {
  public async takeTurn(): Promise<void> {
    const master = this.master;
    const blockedForEnemies = new Set<Tile>();
    const allowCatch = true;
    const full = findPath(
      this.currentTile,
      master.getPlayer().currentTile,
      master.getGameMap(),
      {  exactSteps: 1, blockedTiles: blockedForEnemies, allowEndOnBlocked: true }
    );
    let next = full[0];
    if (!next) {
      const neigh = this.currentTile.neighbors
        .map((id) => master.getGameMap().getTileById(id)!)
        .filter((t) => t !== master.getPlayer().currentTile);
      next = neigh[Math.floor(Math.random() * neigh.length)];
    }
    if (next) {
      await this.moveAlongTiles([next]);
      this.currentTile = next;
    }
  }
}
