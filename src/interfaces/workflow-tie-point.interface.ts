import { Circle } from 'fabric/fabric-impl';
import { PointCoords } from './point-coords.interface';

export interface WorkflowTiePointCircle extends Circle {
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
}
