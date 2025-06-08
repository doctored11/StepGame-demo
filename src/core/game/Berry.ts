import * as THREE from "three";
import { AnimatedEntity } from "./AnimatedEntity";

export class Berry extends AnimatedEntity {
  private scene: THREE.Scene;

  constructor(
    initialTilePos: THREE.Vector3,
    frames: THREE.Object3D[],
    scene: THREE.Scene
  ) {
    super(initialTilePos, frames, 5);

    this.scene = scene;
    this.scene.add(this.getObject3D());
  }

  public override update(delta: number): void {
    super.update(delta);
  }

  public collect(): void {
    super.destroy();
  }
}
