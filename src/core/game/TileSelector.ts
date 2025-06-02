import * as THREE from "three";
import { Tile } from "./Tile";
import { GameMap } from "./GameMap";
// import { Player } from "./Player";

export class TileSelector {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectedTile: Tile | null = null;

  private onTileSelectedCallback?: (tile: Tile) => void;

  constructor(
    private camera: THREE.Camera,
    private renderer: THREE.WebGLRenderer,
    private gameMap: GameMap,
    // private player: Player,
  ) {
    this.setupInput();
  }

  public setOnTileSelectedCallback(callback: (tile: Tile) => void) {
    this.onTileSelectedCallback = callback;
  }

  private setupInput() {
    window.addEventListener("click", this.onClick);
  }

  private onClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const tileMeshes = this.gameMap.getAllTiles().map((t) => t.getMesh());
    const intersects = this.raycaster.intersectObjects(tileMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const tile = this.gameMap.getAllTiles().find((t) => t.getMesh() === hit);
      if (!tile) return;

      if (tile !== this.selectedTile) {
        if (this.selectedTile) this.selectedTile.deselect();

        tile.select();
        this.selectedTile = tile;

        this.onTileSelectedCallback?.(tile);
      }
    }
  };

  public clearSelection() {
    if (this.selectedTile) {
      this.selectedTile.deselect();
      this.selectedTile = null;
    }
  }
}
