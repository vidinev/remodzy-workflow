import { PointCoords } from '../interfaces/point-coords.interface';

export class DrawPositionService {
  private readonly offset: PointCoords;

  constructor(offset: PointCoords) {
    this.offset = offset;
  }

  getCurrentPosition(): PointCoords {
    return this.offset;
  }

  moveBottom(offset: number) {
    this.offset.y += offset;
  }

  moveRight(offset: number) {
    this.offset.x += offset;
  }

  setRight(x: number) {
    this.offset.x = x;
  }

  setBottom(y: number) {
    this.offset.y = y;
  }
}
