import { IStateGroup } from '../models/interfaces/state.interface';

// Interface describes children states that grouped by side related to root item position
export interface StateItemsBySide {
  leftSide: SideState[];
  rightSide: SideState[];
  middleItems: SideState[];
}

export interface SideState {
  branchIndex: number;
  state: IStateGroup;
}
