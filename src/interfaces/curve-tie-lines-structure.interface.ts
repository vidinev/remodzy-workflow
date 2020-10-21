import { StateItemsBySide } from './state-items-by-side.interface';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';

export interface CurveTieLinesStructure extends StateItemsBySide {
  tieStart: ITiePointCircle;
}
