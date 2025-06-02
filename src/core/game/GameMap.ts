import * as THREE from "three";
import { Tile, TileId } from "./Tile";

export class GameMap {
  private tilesById: Map<TileId, Tile> = new Map();
  private tilesByCoord: Map<string, Tile> = new Map();
  private nextId: number = 1;

  constructor(private tileSize: number = 1) {}

  public generateGrid(width: number, height: number) {
    // Кольцо по краю
    for (let x = 0; x < width; x++) {
      this.addTileAt(x, 0);
      this.addTileAt(x, height - 1);
    }

    for (let z = 1; z < height - 1; z++) {
      this.addTileAt(0, z);
      this.addTileAt(width - 1, z);
    }

    // мосты по X
    const verticalBridgeMaxCount = Math.floor(width / 5);
    const verticalBridges: number[] = [];
    let chance = 0.2;

    for (let i = 0; i < verticalBridgeMaxCount; i++) {
      if (Math.random() < chance) {
        chance += chance > 0.3 ? -0.3 : 0.3; //заменить 
        const line = chooseLine(width, verticalBridges, 1);
        if (line !== null) {
          verticalBridges.push(line);
         
          for (let z = 1; z < height - 1; z++) {
            this.addTileAt(line, z);
          }
        }
      }
      chance += 0.3;
    }

    // Добавляем дополнительные горизонтальные мосты (по z)
    const horizontalBridgeCount = Math.floor(height / 5);
    const horizontalBridges: number[] = [];

    for (let i = 0; i < horizontalBridgeCount; i++) {
      if (Math.random() < chance) {
        chance += chance > 0.3 ? -0.3 : 0.3
        const line = chooseLine(height, horizontalBridges, 1);
        if (line !== null) {
          horizontalBridges.push(line);
          for (let x = 1; x < width - 1; x++) {
            this.addTileAt(x, line);
          }
        }
      }
      chance += 0.3;
    }

   
    this.connectRingAndBridge(
      width,
      height,
      verticalBridges,
      horizontalBridges
    );

    function chooseLine(
      maxIndex: number,
      existingLines: number[],
      minGap: number
    ): number | null {
      const candidates: number[] = [];
      for (let i = 1; i < maxIndex - 1; i++) {
        if (i === 1 || i === maxIndex - 2) continue;
        
        if (existingLines.every((line) => Math.abs(line - i) > minGap)) {
          candidates.push(i);
        }
      }
      if (candidates.length === 0) return null;
      const idx = Math.floor(Math.random() * candidates.length);
      return candidates[idx];
    }
  }


  private connectRingAndBridge(
    width: number,
    height: number,
    verticalBridges: number[] = [],
    horizontalBridges: number[] = []
  ) {
    const ringCoords: Array<[number, number]> = [];

    for (let x = 0; x < width; x++) ringCoords.push([x, 0]);
    for (let z = 1; z < height - 1; z++) ringCoords.push([width - 1, z]);
    for (let x = width - 1; x >= 0; x--) ringCoords.push([x, height - 1]);
    for (let z = height - 2; z >= 1; z--) ringCoords.push([0, z]);

    for (let i = 0; i < ringCoords.length; i++) {
      const [x1, z1] = ringCoords[i];
      const [x2, z2] = ringCoords[(i + 1) % ringCoords.length];
      this.addConnectionByCoords(x1, z1, x2, z2);
    }

    for (const x of verticalBridges) {
      for (let z = 1; z < height - 2; z++) {
        this.addConnectionByCoords(x, z, x, z + 1);
      }
      this.addConnectionByCoords(x, 1, x, 0);
      this.addConnectionByCoords(x, height - 2, x, height - 1);
    }

    for (const z of horizontalBridges) {
      for (let x = 1; x < width - 2; x++) {
        this.addConnectionByCoords(x, z, x + 1, z);
      }
      this.addConnectionByCoords(1, z, 0, z);
      this.addConnectionByCoords(width - 2, z, width - 1, z);
    }
  }

  public addTileAt(x: number, z: number): Tile | null {
    const key = `${x},${z}`;
    if (this.tilesByCoord.has(key)) return null; 

    const id = this.nextId++;
    const pos = new THREE.Vector3(x * this.tileSize, 0, z * this.tileSize);
    const tile = new Tile(id, pos);

    this.tilesById.set(id, tile);
    this.tilesByCoord.set(key, tile);
    return tile;
  }

  public getTileAt(x: number, z: number): Tile | undefined {
    return this.tilesByCoord.get(`${x},${z}`);
  }

  public getTileById(id: TileId): Tile | undefined {
    return this.tilesById.get(id);
  }

  public addConnectionByCoords(x1: number, z1: number, x2: number, z2: number) {
    const t1 = this.getTileAt(x1, z1);
    const t2 = this.getTileAt(x2, z2);
    if (t1 && t2) {
      t1.addNeighbor(t2.id);
      t2.addNeighbor(t1.id);
    }
  }

  public addToScene(scene: THREE.Scene) {
    for (const tile of this.tilesById.values()) {
      tile.addToScene(scene);
    }
  }
}
