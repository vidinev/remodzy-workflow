import { PointCoords } from '../../interfaces/point-coords.interface';

export interface WorkflowDimensions {
  width: number;
  height: number;
  startPoint: PointCoords;
  leftSideWidth: number;
  rightSideWidth: number;
}
