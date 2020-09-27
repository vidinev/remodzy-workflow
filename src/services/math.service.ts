export class MathService {
  static getTanDeg(deg: number): number {
    const rad = deg * Math.PI / 180;
    return Math.tan(rad);
  }
}
