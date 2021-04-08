import { Circle } from 'fabric/fabric-impl';
import { PointCoords } from '../../interfaces/point-coords.interface';

export interface ITiePointCircle extends Circle {
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
  getCenterRightCoords: () => PointCoords;
  getCenterLeftCoords: () => PointCoords;
}
