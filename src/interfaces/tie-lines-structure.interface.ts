import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';

export interface TieLineStructure {
  tieStart: ITiePointCircle;
  tieEnd: ITiePointCircle;
  dropArea: IDropAreaGroup;
}
