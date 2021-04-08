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
}
