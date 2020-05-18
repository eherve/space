import * as THREE from 'three';
import { propertyMap } from 'model-mapper';


export class Spin {

  @propertyMap({ default: 0 })
  public xSpeed = 0;

  @propertyMap({ default: 0.0005 })
  public ySpeed = 0.0005;

  @propertyMap({ default: 0 })
  public zSpeed = 0;

}

export abstract class Luminary {

  @propertyMap()
  public name: string;

  @propertyMap({ default: 10 })
  public size = 10;

  @propertyMap()
  public position: { x: number, y: number, z: number };

  @propertyMap({ type: Spin })
  public spin: Spin;

  public setName(name: string) {
    this.name = name;
  }

  public setSize(size: number) {
    this.size = size;
    this.sizeUpdated();
  }

  public abstract tick(scene: THREE.Scene, camera: THREE.PerspectiveCamera, speedFactor: number);

  public abstract hover(raycaster: THREE.Raycaster, mouse: THREE.Vector2): boolean;

  protected updatePosition(x: number, y: number, z: number) {
    if (!this.position) { this.position = { x: 0, y: 0, z: 0 }; }
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  protected abstract sizeUpdated();

}


// import { propertyMap } from 'model-mapper';
// import { Point } from './point';
// import { Ellipse } from './ellipse';
// import { Vector2D } from './vector';

// export class SpinOptions {

//   @propertyMap({ default: 0 })
//   public speed: number;

//   @propertyMap({ default: 1 })
//   public dir: number;

//   @propertyMap({ default: 0 })
//   public tilt: number;

//   public by = 0;

// }

// export class RotationOptions {

//   @propertyMap({ default: 0 })
//   public speed: number;

//   @propertyMap({ default: 1 })
//   public dir: number;

//   @propertyMap({ type: Ellipse })
//   public orbit: Ellipse;

//   public index = 0;
//   public points: Point[] = [];
//   public get position(): Point {
//     return this.points[this.index];
//   }

//   public updatePoints(center: Point) {
//     this.points = this.orbit.getPoints(center);
//   }

// }

// export class Luminary {

//   @propertyMap()
//   public name: string;

//   @propertyMap()
//   public source: string;

//   @propertyMap()
//   public size: number;

//   @propertyMap({ type: Point })
//   public position: Point;

//   @propertyMap({ type: SpinOptions })
//   public spin: SpinOptions;

//   @propertyMap({ type: RotationOptions })
//   public rotation: RotationOptions;

//   @propertyMap({ type: [Luminary], default: [] })
//   public children: Luminary[];

//   public path: Path2D;

//   private inistialized = false;
//   private parent: Luminary;
//   private image: HTMLImageElement;
//   private lastParentPosition: Point;
//   private animation: any;

//   public init(parent?: Luminary): Promise<any> {
//     this.parent = parent;
//     if (this.parent && this.rotation && this.rotation.orbit) {
//       this.lastParentPosition = this.parent.position;
//       this.rotation.updatePoints(this.parent.position);
//       this.rotation.index = Math.floor(Math.random() * Math.floor(this.rotation.points.length));
//       this.position = this.rotation.position;
//     }
//     this.animation = setInterval(() => {
//       if (this.spin) { this.updateSpin(); }
//       if (this.rotation) { this.updateRotation(); }
//     }, 10);
//     return this.loadImage()
//       .then(() => Promise.all(this.children.map(c => c.init(this))))
//       .then(() => this.inistialized = true);
//   }

//   public contains(x: number, y: number): boolean {
//     const vector = Vector2D.from(this.position, new Point(x, y));
//     return this.size / 2 >= vector.length;
//   }

//   public toggleSelect(select: boolean) {
//     console.log(this.name, 'select', select);
//   }

//   public draw(ctx: CanvasRenderingContext2D) {
//     if (!this.inistialized) { return; }
//     if (this.rotation && this.rotation.orbit && this.parent) { this.drawOrbit(ctx); }
//     if (this.position || this.parent) { this.drawImage(ctx); }
//     this.children.forEach(p => p.draw(ctx));
//   }

//   private updateSpin() {
//     const length = this.image.width - this.image.height;
//     const speed = length / (this.spin.speed / 10);
//     if (this.spin.dir >= 0) {
//       const val = this.spin.by + speed;
//       this.spin.by = val < length ? val : 0;
//     } else {
//       const val = this.spin.by - speed;
//       this.spin.by = val < 0 ? length - speed : val;
//     }
//   }

//   private updateRotation() {
//     const length = this.rotation.points.length;
//     const speed = Math.round(length / (this.rotation.speed / 10));
//     if (this.rotation.dir >= 0) {
//       const val = this.rotation.index + speed;
//       this.rotation.index = val < length ? val : 0;
//     } else {
//       const val = this.rotation.index - speed;
//       this.spin.by = val < 0 ? length - speed : val;
//     }
//   }

//   private drawOrbit(ctx: CanvasRenderingContext2D) {
//     ctx.beginPath();
//     if (!this.parent.position.equals(this.lastParentPosition)) {
//       this.lastParentPosition = this.parent.position;
//       this.rotation.updatePoints(this.parent.position);
//     }
//     this.rotation.points.forEach((m, i) => i === 0 ? ctx.moveTo(m.x, m.y) : ctx.lineTo(m.x, m.y));
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
//     ctx.stroke();
//     ctx.closePath();
//     this.position = this.rotation.position;
//   }

//   private drawImage(ctx: CanvasRenderingContext2D) {
//     if (this.spin) {
//       const dx = this.spin ? this.spin.by : 0;
//       ctx.save();
//       ctx.beginPath();
//       ctx.translate(this.position.x, this.position.y);
//       if (this.spin.tilt) {
//         ctx.rotate(this.spin.tilt * Math.PI / 180);
//       }
//       ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
//       ctx.fill(this.path);
//       ctx.clip();
//       ctx.drawImage(this.image,
//         dx, 0, this.image.height, this.image.height,
//         0 - this.size / 2, 0 - this.size / 2, this.size, this.size);
//       ctx.restore();
//     } else {
//       ctx.drawImage(this.image,
//         this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
//     }
//   }

//   private loadImage(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.image = new Image();
//       this.image.src = `assets/images/${this.source}`;
//       this.image.onload = () => resolve();
//     });
//   }


// }
