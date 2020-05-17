import { propertyMap } from 'model-mapper';
import { Point } from './point';

export class Ellipse {

  @propertyMap()
  public a: number;

  @propertyMap()
  public b: number;

  public getPoints(center: Point): Point[] {
    const points = [];
    for (let i = 0 * Math.PI; i < 2 * Math.PI; i += 0.001) {
      const x = center.x - (this.a * Math.cos(i));
      const y = center.y + (this.b * Math.sin(i));
      points.push(new Point(x, y));
    }
    return points;
  }

}
