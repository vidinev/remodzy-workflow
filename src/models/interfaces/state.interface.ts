import { Group } from 'fabric/fabric-impl';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { IDropAreaGroup } from './drop-area.interface';
import { ITiePointCircle } from './tie-point.interface';

export interface IStateGroup extends Group {
  data: WorkflowState & { stateId: string, Start: boolean };
  top: number;
  left: number;
  height: number;
  isBranchRoot: () => boolean;
  addChildState: (state: IStateGroup) => void;
  getChildrenStates: () => IStateGroup[];
  getCenterBottomCoordsUnderChildren: () => PointCoords;
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
  getStateData: () => WorkflowState;
  setDropArea: (dropArea: IDropAreaGroup) => void;
  getDropArea: () => IDropAreaGroup;
  setTopTiePoint: (tiePoint: ITiePointCircle) => void;
  getTopTiePoint: () => ITiePointCircle;
  setBottomTiePoint: (tiePoint: ITiePointCircle) => void;
  getBottomTiePoint: () => ITiePointCircle;
}
