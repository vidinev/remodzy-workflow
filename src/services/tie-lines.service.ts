import { Canvas } from 'fabric/fabric-impl';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { IStateGroup } from '../models/interfaces/state.interface';

export class TieLinesService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  getTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (!canvasObject.data.End) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        if (nextState) {
          const tieStart = canvasObject.getBottomTiePoint();
          const tieEnd = nextState.getTopTiePoint();
          const dropArea = canvasObject.getDropArea();
          if (tieStart && tieEnd && dropArea) {
            tieLinesStructure.push({ tieStart, tieEnd, dropArea });
          }
        }
      }
    });
    return tieLinesStructure;
  }

  private getStateGroupById(states: IStateGroup[], stateId: string) {
    return states.find((state: IStateGroup) => state.data.stateId === stateId);
  }
}
