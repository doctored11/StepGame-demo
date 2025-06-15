import { Tile } from "./Tile";
import { GameMap } from "./GameMap";

export interface PathfinderOptions {
  blockedTiles?: Set<Tile>;
  allowEndOnBlocked?: boolean;
  exactSteps?: number;
}

export function findPath(
  startTile: Tile,
  endTile: Tile,
  gameMap: GameMap,
  opts: PathfinderOptions = {}
): Tile[] {
  const blocked = opts.blockedTiles ?? new Set<Tile>();
  const allowEnd = opts.allowEndOnBlocked ?? false;
  const exactSteps = opts.exactSteps;

  if (exactSteps !== undefined) {
    const result = findPathWithExactSteps(
      startTile,
      endTile,
      exactSteps,
      gameMap,
      {
        blockedTiles: blocked,
        allowEndOnBlocked: allowEnd,
      }
    );

    if (result.length > 0) {
      return result;
    }
  }

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

function findPathWithExactSteps(
  startTile: Tile,
  endTile: Tile,
  steps: number,
  gameMap: GameMap,
  opts: PathfinderOptions
): Tile[] {
  const blocked = opts.blockedTiles ?? new Set<Tile>();
  const allowEnd = opts.allowEndOnBlocked ?? false;

  const queue: Array<{ tile: Tile; path: Tile[]; step: number }> = [
    { tile: startTile, path: [startTile], step: 0 },
  ];

  while (queue.length > 0) {
    const { tile, path, step } = queue.shift()!;
    if (step === steps) {
      if (tile === endTile && (!blocked.has(tile) || allowEnd)) {
        return path.slice(1);
      }
      continue;
    }

    for (const nid of tile.neighbors) {
      const neigh = gameMap.getTileById(nid);
      if (!neigh || path.includes(neigh)) continue;
      if (
        blocked.has(neigh) &&
        !(allowEnd && step + 1 === steps && neigh === endTile)
      )
        continue;

        
      queue.push({ tile: neigh, path: [...path, neigh], step: step + 1 });
    }
  }

  return [];
}

export function findReachableTiles(
  startTile: Tile,
  maxSteps: number,
  gameMap: GameMap,
  opts: PathfinderOptions = {}

): Tile[] {
  const blocked = opts.blockedTiles ?? new Set<Tile>();
  const allowEnd = opts.allowEndOnBlocked ?? false;

  const result = new Set<Tile>();
  const queue: Array<{ tile: Tile; steps: number; visitedPath: Set<Tile> }> = [
    { tile: startTile, steps: 0, visitedPath: new Set([startTile]) },
  ];

  while (queue.length > 0) {
    const { tile, steps, visitedPath } = queue.shift()!;
    if (steps > maxSteps) continue;

    if (steps === maxSteps) {
      if (!(blocked.has(tile) && !allowEnd)) {
        result.add(tile);
      }
      continue;
    }

    for (const nid of tile.neighbors) {
      const neigh = gameMap.getTileById(nid);
      if (!neigh) continue;
      if (visitedPath.has(neigh)) continue;

      const newVisited = new Set(visitedPath);
      newVisited.add(neigh);

      if (blocked.has(neigh) && !(allowEnd && steps + 1 === maxSteps)) continue;

      queue.push({
        tile: neigh,
        steps: steps + 1,
        visitedPath: newVisited,
      });
    }
  }

  return Array.from(result);
}
