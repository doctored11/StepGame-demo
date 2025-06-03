import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { Tile, TileId } from "./Tile";
import { TileFactory } from "./TileFactory";
import { TileRotation, TileType } from "./TileType";

export class GameMap {
  private tilesById: Map<TileId, Tile> = new Map();
  private tilesByCoord: Map<string, Tile> = new Map();
  private nextId: number = 1;

  constructor(
    private scene: THREE.Scene,
    private tileFactory: TileFactory,
    private tileSize: number = 1
  ) {}

  public generateGrid(width: number, height: number) {
    // Кольцо по краю
    for (let x = 0; x < width; x++) {
      this.ensureTileAt(x, 0);
      this.ensureTileAt(x, height - 1);
    }
    for (let z = 1; z < height - 1; z++) {
      this.ensureTileAt(0, z);
      this.ensureTileAt(width - 1, z);
    }

    const verticalBridges: number[] = [];
    const horizontalBridges: number[] = [];
    const verticalBridgeMaxCount = Math.floor(width / 5);
    const horizontalBridgeCount = Math.floor(height / 5);

    let chance = 0.2;
    for (let i = 0; i < verticalBridgeMaxCount; i++) {
      if (Math.random() < chance) {
        chance += chance > 0.3 ? -0.3 : 0.3;
        const line = chooseLine(width, verticalBridges, 1);
        if (line !== null) {
          verticalBridges.push(line);
          for (let z = 1; z < height - 1; z++) {
            this.ensureTileAt(line, z);
          }
        }
      }
      chance += 0.3;
    }

    for (let i = 0; i < horizontalBridgeCount; i++) {
      if (Math.random() < chance) {
        chance += chance > 0.3 ? -0.3 : 0.3;
        const line = chooseLine(height, horizontalBridges, 1);
        if (line !== null) {
          horizontalBridges.push(line);
          for (let x = 1; x < width - 1; x++) {
            this.ensureTileAt(x, line);
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

    for (const tile of this.tilesById.values()) {
      const obj = this.tileFactory.createTileFromNeighbors(
        tile.position.x / this.tileSize,
        tile.position.z / this.tileSize,
        this.getTileAt.bind(this)
      );
      obj.position.copy(tile.position);
      this.scene.add(obj);
      tile.object = obj;
    }

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

  private ensureTileAt(x: number, z: number) {
    const existing = this.getTileAt(x, z);
    if (existing) return;

    const id = this.nextId++;
    const worldPos = new THREE.Vector3(x * this.tileSize, 0, z * this.tileSize);
    const tile = new Tile(id, worldPos);
    tile.position.copy(worldPos);

    this.tilesById.set(id, tile);
    this.tilesByCoord.set(`${x},${z}`, tile);
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
      //
      // const boxHelper = new THREE.BoxHelper(tile.object, 0xff0000);
      // scene.add(boxHelper);
      // const axesHelper = new THREE.AxesHelper(0.5);
      // tile.object.add(axesHelper);
    }
  }

  public getAllTiles(): Tile[] {
    return Array.from(this.tilesById.values());
  }
}
