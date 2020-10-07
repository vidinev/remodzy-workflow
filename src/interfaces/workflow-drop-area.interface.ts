import { Group } from 'fabric/fabric-impl';
import { PointCoords } from './point-coords.interface'

export interface WorkflowDropAreaGroup extends Group {
  isActive: () => boolean;
  toggleActive: (toggle: boolean) => void;
  getCenterTopCoords: () => PointCoords;
  getCenterBottomCoords: () => PointCoords;
}
