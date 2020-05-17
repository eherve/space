import { propertyMap, ModelMapper } from 'model-mapper';
import { Point } from './point';
import { Vector2D } from './vector';
import { Angle } from './angle';


// export class Position {

//   @propertyMap({ default: 0 })
//   public x: number;

//   @propertyMap({ default: 0 })
//   public y: number;

//   @propertyMap({ default: 0 })
//   public angle: number; // in radian

//   public angleDeg: number; // in degree

//   public vector2D: Vector2D;

//   // public get directionVector(): { x: number, y: number } {
//   //   const length = 200;
//   //   return { x: length * Math.cos(angle) + this.x, y: length * Math.sin(angle) + this.y };
//   //   // const angle = this.direction * Math.PI / 180;
//   //   // const opp = Math.tan(angle) * this.x;
//   //   // return { x: this.x, y: opp };
//   // }

//   public update() {
//     this.angleDeg = this.angle * 180 / Math.PI;
//     const length = 100;
//     this.vector2D = new Vector2D(length * Math.cos(this.angle) + this.x, length * Math.sin(this.angle) + this.y);
//   }

//   public get translate3d(): string {
//     return `translate3d(${this.x}px, ${this.y}px, 0)`;
//   }

//   public get rotate3d(): string {
//     return `rotate3d(0, 0, 1, ${this.angleDeg}deg)`;
//   }

// }

export class Spaceship {

  @propertyMap()
  public name: string;

  @propertyMap({ default: 'spaceship-1.svg' })
  public image: string;

  @propertyMap({ default: { width: 60, height: 24 } })
  public size: { width: number, height: number };

  @propertyMap({ default: 1 })
  public speed: number;

  @propertyMap({ default: 0.2 })
  public acceleration: number;

  @propertyMap({ type: Point, default: new ModelMapper(Point).map({}) })
  public position: Point;

  @propertyMap({ type: Angle, default: new ModelMapper(Angle).map({}) })
  public rotation: Angle;

  public translate3d: string;

  public rotate3d: string;

  public vector: Vector2D;

  public update() {
    this.translate3d = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
    this.rotate3d = `rotate3d(0, 0, 1, ${this.rotation.radian}rad)`;
    const length = 200;
    // this.vector = new Vector2D(
    //   length * Math.cos(this.rotation.radian) + this.position.x,
    //   length * Math.sin(this.rotation.radian) + this.position.y);
    this.vector = new Vector2D(Math.cos(this.rotation.radian) * length, Math.sin(this.rotation.radian) * length);
  }

}
