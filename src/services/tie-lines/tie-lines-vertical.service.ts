import { Canvas } from 'fabric/fabric-impl';
import { TieLinesService } from './tie-lines.service';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { StateTypesEnum } from '../../configs/state-types.enum';

export class TieLinesVerticalService extends TieLinesService {
  constructor(canvas: Canvas) {
    super(canvas);
  }

  getTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      const dropArea = canvasObject.getDropArea();
      if (!canvasObject.data.End || (canvasObject.data.End && dropArea)) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        const tieStart = canvasObject.getBottomTiePoint();
        const tieEnd = nextState?.getTopTiePoint();

        let startCoords = tieStart?.getCenterBottomCoords();
        if (canvasObject.data.Type === StateTypesEnum.Pass && !tieStart) {
          startCoords = canvasObject.getCenterBottomCoords();
        }

        if (startCoords && dropArea) {
          tieLinesStructure.push({
            startCoords,
            endCoords: tieEnd?.getCenterTopCoords(),
            dropArea,
          });
        }
      }
    });
    return tieLinesStructure;
  }
}
