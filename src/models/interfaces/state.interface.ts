import { Group } from 'fabric/fabric-impl';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { PointCoords } from '../../interfaces/point-coords.interface';

export interface IStateGroup extends Group {
  data: WorkflowState & { stateId: string };
  top: number;
  left: number;
  height: number;
  getCenterBottomCoords: () => PointCoords;
}
