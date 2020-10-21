import { IStateGroup } from '../models/interfaces/state.interface';

// Interface describes children states that grouped by side related to root item position
export interface StateItemsBySide {
  leftSide: IStateGroup[];
  rightSide: IStateGroup[];
  middleItems: IStateGroup[];
}
