import { Canvas } from 'fabric/fabric-impl';
import { TieLinesService } from './tie-lines.service';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { StateTypesEnum } from '../../configs/state-types.enum';

export class TieLinesHorizontalService extends TieLinesService {
  constructor(canvas: Canvas) {
    super(canvas);
  }

  getTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (!canvasObject.data.End) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        const tieStart = canvasObject.getRightTiePoint();
        const tieEnd = nextState?.getLeftTiePoint();
        let startCoords = tieStart?.getCenterRightCoords();
        if (canvasObject.data.Type === StateTypesEnum.Pass && !tieStart) {
          startCoords = canvasObject.getCenterRightCoords();
        }
        if (startCoords && !canvasObject.isBranchRoot()) {
          tieLinesStructure.push({
            startCoords,
            endCoords: tieEnd?.getCenterLeftCoords(),
          });
        }
      }
    });
    return tieLinesStructure;
  }
}
