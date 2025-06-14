import { Tile } from "./Tile";
import { GameMap } from "./GameMap";

export interface PathfinderOptions {
  blockedTiles?: Set<Tile>;

  allowEndOnBlocked?: boolean;
}

export function findPath(
  startTile: Tile,
  endTile: Tile,
  gameMap: GameMap,
  opts: PathfinderOptions = {}
): Tile[] {
  const blocked = opts.blockedTiles ?? new Set<Tile>();
  const allowEnd = opts.allowEndOnBlocked ?? false;

  const queue: Tile[] = [startTile];
  const cameFrom = new Map<Tile, Tile | null>([[startTile, null]]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endTile) break;

    for (const nid of current.neighbors) {
      const neigh = gameMap.getTileById(nid);
      if (!neigh || cameFrom.has(neigh)) continue;
      if (blocked.has(neigh) && !(allowEnd && neigh === endTile)) continue;

      cameFrom.set(neigh, current);
      queue.push(neigh);
    }
  }

  if (!cameFrom.has(endTile)) return [];
  const path: Tile[] = [];
  let cur: Tile | null = endTile;
  while (cur && cur !== startTile) {
    path.push(cur);
    cur = cameFrom.get(cur)!;
  }
  return path.reverse();
}

export function findReachableTiles(
  startTile: Tile,
  maxSteps: number,
  gameMap: GameMap,
  opts: PathfinderOptions = {}
): Tile[] {
  const blocked = opts.blockedTiles ?? new Set<Tile>();
  const allowEnd = opts.allowEndOnBlocked ?? false;

  const visited = new Set<Tile>([startTile]);
  const queue: Array<{ tile: Tile; steps: number }> = [
    { tile: startTile, steps: 0 },
  ];
  const result: Tile[] = [];

  while (queue.length > 0) {
    const { tile, steps } = queue.shift()!;
    if (steps === maxSteps) {
      if (!(blocked.has(tile) && !allowEnd)) {
        result.push(tile);
      }
      continue;
    }
    for (const nid of tile.neighbors) {
      const neigh = gameMap.getTileById(nid);
      if (!neigh || visited.has(neigh)) continue;
      if (blocked.has(neigh) && !(allowEnd && steps + 1 === maxSteps)) continue;
      visited.add(neigh);
      queue.push({ tile: neigh, steps: steps + 1 });
    }
  }
  return result;
}
