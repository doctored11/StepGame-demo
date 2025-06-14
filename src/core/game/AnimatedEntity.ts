import * as THREE from "three";

export abstract class AnimatedEntity {
  protected root: THREE.Object3D;
  protected animationFrames: THREE.Object3D[];
  private currentFrameIndex = 0;
  private animationTimer = 0;
  protected readonly animationInterval: number;

  private path: THREE.Vector3[] = [];
  private onMoveComplete?: () => void;
  protected moveSpeed = 3; 

  constructor(
    initialPos: THREE.Vector3,
    frames: THREE.Object3D[],
    framesPerSecond = 5
  ) {
    if (frames.length === 0) {
      throw new Error("AnimatedEntity: нет кадров!");
    }

    this.root = new THREE.Object3D();
    this.root.position.copy(initialPos);

    this.animationInterval = 1 / framesPerSecond;
    this.animationFrames = frames;

    frames.forEach((f, i) => {
      f.position.set(0, 0, 0);
      f.visible = i === 0;
      this.root.add(f);
    });
  }

  public update(delta: number) {
    this.animationTimer += delta;
    if (this.animationTimer >= this.animationInterval) {
      this.animationTimer -= this.animationInterval;
      this.animationFrames[this.currentFrameIndex].visible = false;
      this.currentFrameIndex =
        (this.currentFrameIndex + 1) % this.animationFrames.length;
      this.animationFrames[this.currentFrameIndex].visible = true;
    }

    if (this.path.length > 0) {
      const target = this.path[0];
      const dir = target.clone().sub(this.root.position);
      const dist = dir.length();
      if (dist <= this.moveSpeed * delta) {
        this.root.position.copy(target);
        this.path.shift();
        if (this.path.length > 0) {
          this.orientTo(this.path[0]);
        } else {
          const cb = this.onMoveComplete;
          this.onMoveComplete = undefined;
          cb?.();
        }
      } else {
        dir.normalize();
        this.root.position.add(dir.multiplyScalar(this.moveSpeed * delta));
      }
    }
  }

  protected orientTo(target: THREE.Vector3) {
    const dir = target.clone().sub(this.root.position);
    const angle = Math.atan2(dir.x, dir.z);
    this.root.rotation.y = angle + Math.PI;
  }


  public moveAlong(waypoints: THREE.Vector3[]): Promise<void> {
    if (waypoints.length === 0) return Promise.resolve();
    this.path = waypoints.slice();
    this.orientTo(this.path[0]);
    return new Promise((res) => (this.onMoveComplete = res));
  }

  public destroy() {
    this.root.parent?.remove(this.root);
    this.animationFrames.forEach((f) => {
      f.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
          else m.material.dispose();
        }
      });
    });
  }

  public getObject3D() {
    return this.root;
  }
}
