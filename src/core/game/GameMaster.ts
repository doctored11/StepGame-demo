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
    // private getDiceValue: () => number | null,
    private onTurnComplete: () => void
  ) {
    // this.updateReachableTiles();
  }
  //
 

  updateReachableTiles() {
    for (const tile of this.gameMap.getAllTiles()) {
      //снятие подсветки со всех полей - todo снимать не со всех а с предыдущих
      tile.walkable = false;
      tile.setHighlight(false);
    }

     const diceValue = this.currentDiceValue;
    if (diceValue === null) return;
    console.warn(diceValue);

    const reachable = this.findReachableTiles(
      this.player.currentTile,
      diceValue
    );

    reachable.forEach((tile) => {
      tile.walkable = true;
      tile.setHighlight(true);
    });

    this.reachableTiles = new Set(reachable);
  }

  startTurn(diceValue: number) {
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

    return result;
  }

  canMoveTo(tile: Tile): boolean {
    return this.reachableTiles.has(tile);
  }

  onTileSelected(tile: Tile) {
    if (!this.isTurnInProgress) {
      console.log("Ход не начат — подожди броска кубика");
      return;
    }
    if (!this.canMoveTo(tile)) {
      console.log("Нельзя ходить на эту клетку");
      return;
    }

    this.movePlayerToTile(tile);

    this.updateReachableTiles();

    this.endTurn();
  }

  private movePlayerToTile(tile: Tile) {
    if (!this.player) return;

    this.player.setTile(tile);

    this.player.currentTile = tile;
  }

  private endTurn() {
    // очистка подсветки  - вынести
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
