import { IStateGroup } from '../models/interfaces/state.interface';

export class CoordsService {

  getCenterBottomCoords(states: IStateGroup[]) {
    let lowerItem: IStateGroup = {} as IStateGroup;
    states.forEach((state: IStateGroup) => {
      if ((state.top || 0) > (lowerItem?.top || 0)) {
        lowerItem = state;
      }
    });
    const dropArea = lowerItem.getDropArea?.();
    const centerBottomCoords = lowerItem.getCenterBottomCoords();
    if (dropArea) {
      return {
        ...centerBottomCoords,
        y: (dropArea.top || 0) + (dropArea.height || 0),
      };
    }
    return centerBottomCoords;
  }
}
