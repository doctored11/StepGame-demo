import { GameMap } from "./GameMap";
import { Player } from "./Player";
import { Tile } from "./Tile";

export class GameMaster {
  private reachableTiles: Set<Tile> = new Set();
  private isTurnInProgress: boolean = false;
  private currentDiceValue: number | null = null;

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

  updateReachableTiles() {
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

    const reachable = this.findReachableTiles(
      this.player.currentTile,
      diceValue
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
  private findReachableTiles(startTile: Tile, maxSteps: number): Tile[] {
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

 
  private findPath(startTile: Tile, endTile: Tile): Tile[] {
    // с сохр предков
    const queue: Tile[] = [startTile];
    const cameFrom = new Map<Tile, Tile | null>();
    cameFrom.set(startTile, null);

    while (queue.length > 0) {
      const tile = queue.shift()!;
      if (tile === endTile) break;

      for (const nid of tile.neighbors) {
        const neigh = this.gameMap.getTileById(nid);
        if (neigh && !cameFrom.has(neigh)) {
          cameFrom.set(neigh, tile);
          queue.push(neigh);
        }
      }
    }

    if (!cameFrom.has(endTile)) {
      return [];
    }

    const path: Tile[] = [];
    let cur: Tile | null = endTile;
    while (cur && cur !== startTile) {
      path.push(cur);
      cur = cameFrom.get(cur)!;
    }
    return path.reverse();
  }

  canMoveTo(tile: Tile): boolean {
    return this.reachableTiles.has(tile);
  }

  onTileSelected(tile: Tile) {
    if (!this.isTurnInProgress ) {
      console.log("Ход не начат — подожди броска кубика");
      return;
    }
    if (!this.canMoveTo(tile)) {
      console.log("Нельзя ходить на эту клетку");
      return;
    }

    const path = this.findPath(this.player.currentTile, tile);
    this.isTurnInProgress = false;

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

  private movePlayerToTile(tile: Tile) {
    if (!this.player) return;

    this.player.setTile(tile);

    this.player.currentTile = tile;
  }

  private endTurn() {
    for (const tile of this.reachableTiles) {
      tile.walkable = false;
      tile.setHighlight(false);
    }

    this.reachableTiles.clear();
    this.isTurnInProgress = false;
    this.currentDiceValue = null;
    this.onTurnComplete();
  }
}
