import { propertyMap } from 'model-mapper';

export class Angle {

  @propertyMap({ default: 0 })
  public radian: number;

  public get degree(): number {
    return this.radian * 180 / Math.PI;
  }

  static fromDegree(degree: number): Angle {
    return new Angle(degree * Math.PI / 180);
  }

  constructor(radian = 0) {
    this.radian = radian;
  }

  toString(degree = false) {
    return degree ? `${this.degree}deg` : `${this.radian}rad`;
  }

  public add(angle: Angle | number): this {
    this.radian = this.radian + (angle instanceof Angle ? angle.radian : angle);
    return this;
  }

  public reverse(): this {
    this.radian = 2 * Math.PI - this.radian;
    return this;
  }

  public negate(): this {
    this.radian = -this.radian;
    return this;
  }

  public get isAssisted(): boolean {
    return Math.abs(this.radian) < Math.PI;
  }

  public clone(): Angle {
    return new Angle(this.radian);
  }

  public setPrecision(precision: number): this {
    this.radian = Number.parseFloat(this.radian.toFixed(precision));
    return this;
  }

}