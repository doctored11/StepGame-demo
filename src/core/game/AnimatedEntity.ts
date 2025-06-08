import * as THREE from "three";

export abstract class AnimatedEntity {
  protected root: THREE.Object3D;

  protected animationFrames: THREE.Object3D[];

  protected currentFrameIndex: number = 0;

  protected animationTimer: number = 0;

  protected readonly animationInterval: number;

  protected currentAnimTile: THREE.Vector3;

  constructor(
    initialTilePos: THREE.Vector3,
    frames: THREE.Object3D[],
    framesPerSecond: number = 5
  ) {
    if (frames.length === 0) {
      throw new Error("AnimatedEntity: нет кадров!");
    }
    this.currentAnimTile = initialTilePos.clone();
    this.animationInterval = 1 / framesPerSecond;
    this.root = new THREE.Object3D();
    this.root.position.copy(initialTilePos);
    this.animationFrames = frames;
    frames.forEach((frame, idx) => {
      frame.position.set(0, 0, 0);
      frame.visible = idx === 0;
      this.root.add(frame);
    });
  }

  public update(delta: number): void {
    if (this.animationFrames.length <= 1) return;

    this.animationTimer += delta;
    if (this.animationTimer >= this.animationInterval) {
      this.animationTimer -= this.animationInterval;
      this.animationFrames[this.currentFrameIndex].visible = false;
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.animationFrames.length;
      this.animationFrames[this.currentFrameIndex].visible = true;
    }
  }

  public destroy(): void {
    if (this.root.parent) {
      this.root.parent.remove(this.root);
    }
    this.animationFrames.forEach((frame) => {
      frame.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    });
  }

  public getObject3D(): THREE.Object3D {
    return this.root;
  }
}
