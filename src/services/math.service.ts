import { Object as CanvasObject } from 'fabric/fabric-impl';

export class MathService {
  static getTanDeg(deg: number): number {
    const rad = (deg * Math.PI) / 180;
    return Math.tan(rad);
  }

  static nearToNumber(checkNumber: number = 0, first: number = 0, second: number = 0) {
    if (first !== second) {
      const firstPositive = Math.abs(first - checkNumber);
      const secondPositive = Math.abs(second - checkNumber);

      if (firstPositive < secondPositive) {
        return first;
      }
      if (secondPositive < firstPositive) {
        return second;
      }
      return 0;
    }
    return first;
  }

  static findClosestObjectToTop(objects: CanvasObject[], targetTop: number = 0): CanvasObject|null {
    const objectsLength = objects.length;
    let diff = -1;
    let smallest: CanvasObject|null = null;
    let positiveDiff;
    for (let i = 0; i < objectsLength; i++) {
      positiveDiff = Math.abs((objects[i].top || 0) - targetTop);
      if (diff < 0 || positiveDiff < diff) {
        diff = positiveDiff;
        smallest = objects[i];
      }
    }
    return smallest || null;
  }
}
