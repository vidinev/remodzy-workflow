import { Group } from 'fabric/fabric-impl';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { IDropAreaGroup } from './drop-area.interface';
import { ITiePointCircle } from './tie-point.interface';

export interface IStateGroup extends Group {
  data: WorkflowState & { stateId: string; parentStateId: string | null; Start: boolean };
  top: number;
  left: number;
  height: number;
  width: number;
  isBranchRoot: () => boolean;
  isMainRoot: () => boolean;
  isInMainBranch: () => boolean;
  setChildrenState: (states: IStateGroup[]) => void;
  getChildrenStates: () => IStateGroup[];
  getCenterBottomCoordsUnderChildren: () => PointCoords;
  getRightMostItemUnderChildren: () => IStateGroup;
  getLeftMostItemUnderChildren: () => IStateGroup;
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
  getCenterRightCoords: () => PointCoords;
  getCenterLeftCoords: () => PointCoords;
  getStateData: () => WorkflowState;
  setDropArea: (dropArea: IDropAreaGroup) => void;
  getDropArea: () => IDropAreaGroup;
  setTopTiePoint: (tiePoint: ITiePointCircle) => void;
  getTopTiePoint: () => ITiePointCircle;
  setBottomTiePoint: (tiePoint: ITiePointCircle) => void;
  getBottomTiePoint: () => ITiePointCircle;
  setLeftTiePoint: (tiePoint: ITiePointCircle) => void;
  getLeftTiePoint: () => ITiePointCircle;
  setRightTiePoint: (tiePoint: ITiePointCircle) => void;
  getRightTiePoint: () => ITiePointCircle;
}
