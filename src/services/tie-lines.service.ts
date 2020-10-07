import { Canvas, Object as CanvasObject } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { MathService } from './math.service';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';

export class TieLinesService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  getTieLinesStructure(): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.state && !canvasObject.data.end) {
        const currentStatePoints = this.getStateRelatedPoints(canvasObject.data.id);
        const nextStatePoints = this.getStateRelatedPoints(canvasObject.data.next);

        const currentStateBottom = (canvasObject.top || 0) + (canvasObject.height || 0);

        const tieStart = MathService
          .findClosestObjectToTop(
            currentStatePoints,
            currentStateBottom
          ) as ITiePointCircle;

        const tieEnd = MathService
          .findClosestObjectToTop(
            nextStatePoints,
            currentStateBottom
          ) as ITiePointCircle;

        const dropArea = this.getDropArea(canvasObject.data.id);

        if (tieStart && tieEnd && dropArea) {
          tieLinesStructure.push({ tieStart, tieEnd, dropArea });
        }
      }
    });
    return tieLinesStructure;
  }

  private getStateRelatedPoints(stateId: string): CanvasObject[] {
    let tiePoints: CanvasObject[] = [];
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.type === ObjectTypes.tiePoint
        && canvasObject.data.stateId === stateId) {
         tiePoints.push(canvasObject);
      }
    });
    return tiePoints;
  }

  private getDropArea(stateId: string): IDropAreaGroup|null {
    let dropArea: IDropAreaGroup|null = null;
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.dropArea
        && canvasObject.data.stateId === stateId) {
        dropArea = canvasObject as IDropAreaGroup;
      }
    });
    return dropArea;
  }
}
