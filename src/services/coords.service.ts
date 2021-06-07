import { IStateGroup } from '../models/interfaces/state.interface';
import { PointCoords } from '../interfaces/point-coords.interface';
import { StateTypesEnum } from '../configs/state-types.enum';
import { passStateItemSize, stateItemSize } from '../configs/size.config';

export class CoordsService {
  getCenterBottomCoords(states: IStateGroup[], passStateAsFullState: boolean = false) {
    let lowerItem: IStateGroup = { } as IStateGroup;
    lowerItem = states[0];
    states.forEach((state: IStateGroup) => {
      if (CoordsService.getBottomY(state) > (CoordsService.getBottomY(lowerItem) || 0)) {
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
    if (passStateAsFullState && lowerItem.data.Type === StateTypesEnum.Pass) {
      return {
        ...centerBottomCoords,
        y: centerBottomCoords.y + (stateItemSize.height - passStateItemSize.height) / 2,
      };
    }
    return centerBottomCoords;
  }

  getCenterTopCoords(states: IStateGroup[]) {
    let topItem: IStateGroup = { } as IStateGroup;
    topItem = states[0];
    states.forEach((state: IStateGroup) => {
      if (CoordsService.getTopY(state) < (CoordsService.getTopY(topItem) || 0)) {
        topItem = state;
      }
    });
    return topItem.getCenterTopCoords();
  }

  getCenterRightCoords(states: IStateGroup[], passStateAsFullState: boolean = false): PointCoords {
    let rightmostItem: IStateGroup = { } as IStateGroup;
    states.forEach((state: IStateGroup) => {
      if (CoordsService.getRightX(state) > CoordsService.getRightX(rightmostItem)) {
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
    let leftmostItem: IStateGroup = { } as IStateGroup;
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

  private static getRightX(state: IStateGroup) {
    let currentX = (state.getLeft?.() || 0) + (state.width || 0);
    if (state.isBranchRoot?.()) {
      currentX = state.getRightMostItemCoordsUnderChildren()?.x || currentX;
    }
    return currentX;
  }

  private static getTopY(state: IStateGroup) {
    let currentY = state.getCenterTopCoords?.()?.y || 0;
    if (state.isBranchRoot?.()) {
      currentY = state.getCenterTopCoordsAboveChildren()?.y || currentY;
    }
    return currentY;
  }

  private static getBottomY(state: IStateGroup) {
    let currentY = state.getCenterBottomCoords?.()?.y || 0;
    if (state.isBranchRoot?.()) {
      currentY = state.getCenterBottomCoordsUnderChildren()?.y || currentY;
    }
    return currentY;
  }
}
