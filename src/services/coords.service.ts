import { IStateGroup } from '../models/interfaces/state.interface';
import { PointCoords } from '../interfaces/point-coords.interface';

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

  getCenterRightCoords(states: IStateGroup[]): PointCoords {
    let rightmostItem: IStateGroup = {} as IStateGroup;
    states.forEach((state: IStateGroup) => {
      const currentRight = (rightmostItem.left || 0) + (rightmostItem.width || 0);
      const right = state.left + state.width;
      if (right > currentRight) {
        rightmostItem = state;
      }
    });
    const centerRightCoords = rightmostItem.getCenterRightCoords();
    const tiePoint = rightmostItem.getRightTiePoint();
    if (tiePoint) {
      return tiePoint.getCenterRightCoords();
    }
    return centerRightCoords;
  }
}
