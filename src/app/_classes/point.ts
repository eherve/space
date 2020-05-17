import { propertyMap } from 'model-mapper';

export class Point {

  @propertyMap({ default: 0 })
  public x: number;

  @propertyMap({ default: 0 })
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `[${this.x}, ${this.y}]`;
  }

  public move(vector: { x: number, y: number }): this {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  public equals(point: Point, precision = 0): boolean {
    if (!point) { return false; }
    const px = Math.abs(point.x - this.x);
    const py = Math.abs(point.y - this.y);
    return px <= precision && py <= precision;
  }

  public toJson(): any {
    return { x: this.x, y: this.y };
  }

}