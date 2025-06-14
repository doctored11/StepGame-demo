import { GameMap } from "./GameMap";
import { Player } from "./Player";
import { Tile, TileId } from "./Tile";
import { RedEnemy } from "./RedEnemy";
import { Enemy } from "./Enemy";
import { findPath, findReachableTiles, PathfinderOptions } from "./Pathfinder";

export class GameMaster {
  private reachableTiles: Set<Tile> = new Set();
  private isTurnInProgress: boolean = false;
  private currentDiceValue: number | null = null;
  public enemies: Enemy[] = [];

  constructor(
    private gameMap: GameMap,
    private player: Player,
    private onTurnComplete: () => void,
    private onReachablesChanged: (tiles: Tile[]) => void,
    private onAddScorePoint: () => void
  ) {
    this.updateReachableTiles();
  }
  //

  public getPlayer() {
    return this.player;
  }
  public getGameMap() {
    return this.gameMap;
  }

  public updateReachableTiles() {
    for (const tile of this.gameMap.getAllTiles()) {
      tile.setWalkable(false);
      tile.setHighlight(false);
    }

    const diceValue = this.currentDiceValue;
    if (diceValue === null) {
      this.reachableTiles.clear();
      this.onReachablesChanged([]);
      return;
    }
    console.warn(diceValue);

    const blocked = new Set<Tile>(this.enemies.map((e) => e.currentTile));
    const reachable = findReachableTiles(
      this.player.currentTile,
      this.currentDiceValue!,
      this.gameMap,
      { blockedTiles: blocked, allowEndOnBlocked: false }
    );

    this.reachableTiles = new Set(reachable);
    for (const t of reachable) {
      t.setWalkable(true);
    }

    this.onReachablesChanged(Array.from(this.reachableTiles));
  }

  public startTurn(diceValue: number) {
    this.currentDiceValue = diceValue;
    this.isTurnInProgress = true;

    this.updateReachableTiles();
  }

  // BFS -todo вынести в утилиты
  public findReachableTiles(startTile: Tile, maxSteps: number): Tile[] {
    const visited = new Set<Tile>();
    const queue: Array<{ tile: Tile; steps: number }> = [
      { tile: startTile, steps: 0 },
    ];
    const result: Tile[] = [];

    while (queue.length > 0) {
      const { tile, steps } = queue.shift()!;
      if (steps > maxSteps) continue;

      if (steps === maxSteps) {
        result.push(tile);
        continue;
      }

      for (const neighborId of tile.neighbors) {
        const neighbor = this.gameMap.getTileById(neighborId);
        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ tile: neighbor, steps: steps + 1 });
        }
      }
    }
    // console.log("🐣 ", result);

    return result.filter((t) => t !== startTile); //да костыль - при выбросе именно 2 был ход под себя
  }

  // public findPath(startTile: Tile, endTile: Tile): Tile[] {
  //   // с сохр предков
  //   const queue: Tile[] = [startTile];
  //   const cameFrom = new Map<Tile, Tile | null>();
  //   cameFrom.set(startTile, null);

  //   while (queue.length > 0) {
  //     const tile = queue.shift()!;
  //     if (tile === endTile) break;

  //     for (const nid of tile.neighbors) {
  //       const neigh = this.gameMap.getTileById(nid);
  //       if (neigh && !cameFrom.has(neigh)) {
  //         cameFrom.set(neigh, tile);
  //         queue.push(neigh);
  //       }
  //     }
  //   }

  //   if (!cameFrom.has(endTile)) {
  //     return [];
  //   }

  //   const path: Tile[] = [];
  //   let cur: Tile | null = endTile;
  //   while (cur && cur !== startTile) {
  //     path.push(cur);
  //     cur = cameFrom.get(cur)!;
  //   }
  //   return path.reverse();
  // }

  public canMoveTo(tile: Tile): boolean {
    return this.reachableTiles.has(tile);
  }

  public getTileById(id: TileId) {
    return this.gameMap.getTileById(id);
  }

  public onTileSelected(tile: Tile) {
    if (!this.isTurnInProgress) {
      console.log("⏱️Ход не начат - жди броска кубика");
      return;
    }
    if (!this.canMoveTo(tile)) {
      console.log("Нельзя ходить на эту клетку");
      return;
    }
    this.isTurnInProgress = false;
    const blocked = new Set<Tile>(this.enemies.map((e) => e.currentTile));
    const path = findPath(this.player.currentTile, tile, this.gameMap, {
      blockedTiles: blocked,
      allowEndOnBlocked: false,
    });
    if (path.length === 0) {
      console.log("⚠️пат! Никаких ходов нет");
      this.endTurn();
      return;
    }

    this.updateReachableTiles();
    this.player.moveAlongTiles(path).then(() => {
      this.player.currentTile = tile;
      const berry = this.gameMap.getTileAt(
        tile.position.x,
        tile.position.z
      )?.berry;
      if (berry) {
        this.gameMap.removeBerryAtTile(tile);
        this.onAddScorePoint();
      }
      this.endTurn();
    });
  }
  public registerEnemy(enemy: Enemy) {
    this.enemies.push(enemy);
  }

  private movePlayerToTile(tile: Tile) {
    if (!this.player) return;

    this.player.setTile(tile);

    this.player.currentTile = tile;
  }

  private async endTurn() {
    for (const tile of this.reachableTiles) {
      tile.walkable = false;
      tile.setHighlight(false);
    }
    for (const e of this.enemies) {
      await e.takeTurn();
    }

    this.reachableTiles.clear();
    this.isTurnInProgress = false;
    this.currentDiceValue = null;
    this.onTurnComplete();
  }
}
