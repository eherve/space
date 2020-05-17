import { propertyMap } from 'model-mapper';
import { Angle } from './angle';

export class Vector2D {

  @propertyMap({ default: 0 })
  public x: number;

  @propertyMap({ default: 0 })
  public y: number;

  static from(p0: { x: number, y: number }, p1: { x: number, y: number }): Vector2D {
    return new Vector2D(p1.x - p0.x, p1.y - p0.y);
  }

  static crossProduct(v0: Vector2D, v1: Vector2D): number {
    return v0.x * v1.y - v0.y * v1.x;
  }

  static dotProduct(v0: Vector2D, v1: Vector2D): number {
    return v0.x * v1.x + v0.y * v1.y;
  }

  static angle(v0: Vector2D, v1: Vector2D): Angle {
    const crossProduct = Vector2D.crossProduct(v0, v1);
    const rad = Math.atan2(Math.abs(crossProduct), Vector2D.dotProduct(v0, v1));
    return new Angle(crossProduct < 0 ? Math.PI * 2 - rad : rad);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public get length(): number {
    return Math.hypot(this.x, this.y);
  }

  public toString(): string {
    return `<${this.x}, ${this.y}>`;
  }

}