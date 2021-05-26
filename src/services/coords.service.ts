import { IStateGroup } from '../models/interfaces/state.interface';
import { PointCoords } from '../interfaces/point-coords.interface';
import { StateTypesEnum } from '../configs/state-types.enum';
import { passStateItemSize, stateItemSize } from '../configs/size.config';

export class CoordsService {
  getCenterBottomCoords(states: IStateGroup[]) {
    let lowerItem: IStateGroup = {} as IStateGroup;
    states.forEach((state: IStateGroup) => {
      if ((state.getTop() || 0) > (lowerItem?.getTop?.() || 0)) {
        lowerItem = state;
      }
    });
    const dropArea = lowerItem.getDropArea?.();
    const centerBottomCoords = lowerItem.getCenterBottomCoords();
    if (dropArea) {
      return {
        ...centerBottomCoords,
        y: dropArea.getTop() + (dropArea.height || 0),
      };
    }
    return centerBottomCoords;
  }

  getCenterRightCoords(states: IStateGroup[], passStateAsFullState: boolean = false): PointCoords {
    let rightmostItem: IStateGroup = {} as IStateGroup;
    states.forEach((state: IStateGroup) => {
      const currentRight = (rightmostItem.left || 0) + (rightmostItem.width || 0);
      const right = state.getLeft() + state.width;
      if (right > currentRight) {
        rightmostItem = state;
      }
    });
    const centerRightCoords = rightmostItem.getCenterRightCoords();
    const tiePoint = rightmostItem.getRightTiePoint();
    const connectPoint = rightmostItem.getConnectPoint();
    if (connectPoint) {
      return {
        x: connectPoint.left || 0,
        y: connectPoint.top || 0,
      };
    }
    if (tiePoint) {
      return tiePoint.getCenterRightCoords();
    }
    if (passStateAsFullState && rightmostItem.data.Type === StateTypesEnum.Pass) {
      return {
        ...centerRightCoords,
        x: centerRightCoords.x + (stateItemSize.width - passStateItemSize.width),
      };
    }
    return centerRightCoords;
  }

  getCenterLeftCoords(states: IStateGroup[]): PointCoords {
    let leftmostItem: IStateGroup = {} as IStateGroup;
    states.forEach((state: IStateGroup) => {
      if ((leftmostItem?.getLeft?.() || 0) === 0 || state.getLeft() < (leftmostItem?.getLeft?.() || 0)) {
        leftmostItem = state;
      }
    });
    const centerLeftCoords = leftmostItem.getCenterLeftCoords();
    const tiePoint = leftmostItem.getLeftTiePoint();
    const connectPoint = leftmostItem.getConnectPoint();
    if (connectPoint) {
      return {
        x: connectPoint.left || 0,
        y: connectPoint.top || 0,
      };
    }
    if (tiePoint) {
      return tiePoint.getCenterLeftCoords();
    }
    return centerLeftCoords;
  }
}
