import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { PointCoords } from './point-coords.interface';

export interface TieLineStructure {
  startCoords: PointCoords;
  endCoords?: PointCoords;
  dropArea: IDropAreaGroup;
}
