import { Group } from 'fabric/fabric-impl';
import { PointCoords } from '../../interfaces/point-coords.interface';

export interface IDropAreaGroup extends Group {
  isActive: () => boolean;
  toggleActive: (toggle: boolean) => void;
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
}
