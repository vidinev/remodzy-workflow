import { StateItemsBySide } from './state-items-by-side.interface';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';
import { IStateGroup } from '../models/interfaces/state.interface';

export interface CurveTieLinesStructure extends StateItemsBySide {
  tieStart: ITiePointCircle;
  rootState: IStateGroup;
}
