import { IStateGroup } from '../models/interfaces/state.interface';
import { PointCoords } from '../interfaces/point-coords.interface';
import { StateTypesEnum } from '../configs/state-types.enum';
import { passStateItemSize, stateItemSize } from '../configs/size.config';
import { IConnectPoint } from '../models/interfaces/connect-point.interface';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';

export class CoordsService {
  getCenterBottomCoords(states: IStateGroup[],
                        passStateAsFullState: boolean = false,
                        dropArea: IDropAreaGroup | null = null) {
    let lowerItem: IStateGroup = {} as IStateGroup;
    let lowerCoords = { x: 0, y: 0 };
    lowerItem = states[0];
    CoordsService.getAllStates(states).forEach((state: IStateGroup) => {
      const currentStateLowerCoords = CoordsService.getBottomCoords(state, passStateAsFullState);
      const lowerStateLowerCoords = CoordsService.getBottomCoords(lowerItem, passStateAsFullState);
      if (currentStateLowerCoords.y >= lowerStateLowerCoords.y) {
        lowerItem = state;

        lowerCoords = currentStateLowerCoords;
      }
    });
    if (dropArea && dropArea.getCenterBottomCoords().y > lowerCoords.y) {
      lowerCoords = {
        x: dropArea.getLeft(),
        y: dropArea.getTop() + (dropArea.height || 0)
      };
    }
    return lowerCoords;
  }

  getCenterTopCoords(states: IStateGroup[]) {
    let topItem: IStateGroup = {} as IStateGroup;
    topItem = states[0];
    CoordsService.getAllStates(states).forEach((state: IStateGroup) => {
      if (CoordsService.getTopY(state) < (CoordsService.getTopY(topItem) || 0)) {
        topItem = state;
      }
    });
    const centerTopCoords = topItem.getCenterTopCoords();
    return {
      ...centerTopCoords,
      y: CoordsService.getTopY(topItem),
    };
  }

  getCenterRightCoords(states: IStateGroup[],
                       passStateAsFullState: boolean = false,
                       connectPoint: IConnectPoint | null = null): PointCoords {
    let rightmostItem: IStateGroup = {} as IStateGroup;
    let rightMostCoords = { x: 0, y: 0 };
    CoordsService.getAllStates(states).forEach((state: IStateGroup) => {
      const currentStateRightCoords = CoordsService.getRightCoords(state, passStateAsFullState);
      const rightMostStateRightCoords = CoordsService.getRightCoords(rightmostItem, passStateAsFullState);
      if (currentStateRightCoords.x > rightMostStateRightCoords.x) {
        rightmostItem = state;
        rightMostCoords = currentStateRightCoords;
      }
    });
    if (connectPoint && connectPoint.getLeft() > rightMostCoords.x) {
      rightMostCoords = {
        x: connectPoint.getLeft(),
        y: connectPoint.getTop()
      };
    }
    return rightMostCoords;
  }

  getCenterLeftCoords(states: IStateGroup[]): PointCoords {
    let leftmostItem: IStateGroup = {} as IStateGroup;
    leftmostItem = states[0];
    CoordsService.getAllStates(states).forEach((state: IStateGroup) => {
      if (CoordsService.getLeftX(state) < CoordsService.getLeftX(leftmostItem)) {
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
    return {
      ...centerLeftCoords,
      x: CoordsService.getLeftX(leftmostItem),
    };
  }

  private static getAllStates(states: IStateGroup[]): IStateGroup[] {
    let allStates: IStateGroup[] = [];
    states.forEach((state: IStateGroup) => {
      if (state.isBranchRoot?.()) {
        allStates.push(...state.getChildrenStates());
      }
      allStates.push(state);
    });
    return allStates;
  }

  private static getLeftX(state: IStateGroup) {
    return state.getLeft?.() || 0;
  }

  private static getRightCoords(state: IStateGroup, passStateAsFullState: boolean = false): PointCoords {
    const centerRightCoords = state.getCenterRightCoords?.() || { x: 0, y: 0 };
    const tiePoint = state.getRightTiePoint?.();
    const connectPoint = state.getConnectPoint?.();
    if (connectPoint) {
      return {
        x: connectPoint.getLeft() || 0,
        y: connectPoint.getTop() || 0,
      } as PointCoords;
    }
    if (tiePoint) {
      return tiePoint.getCenterRightCoords();
    }
    if (passStateAsFullState && state.data?.Type === StateTypesEnum.Pass) {
      return {
        ...centerRightCoords,
        x: centerRightCoords.x + (stateItemSize.width - passStateItemSize.width),
      } as PointCoords;
    }
    return centerRightCoords;
  }

  private static getBottomCoords(state: IStateGroup, passStateAsFullState: boolean = false) {
    let centerBottomCoords = state.getCenterBottomCoords?.() || { x: 0, y: 0 };
    const tiePoint = state.getBottomTiePoint?.();
    const dropArea = state.getDropArea?.();
    if (dropArea) {
      return {
        x: centerBottomCoords.x,
        y: dropArea.getTop() + (dropArea.height || 0)
      }
    }
    if (tiePoint) {
      return {
        x: centerBottomCoords.x,
        y: tiePoint.getCenterBottomCoords().y
      };
    }
    if (passStateAsFullState && state.data?.Type === StateTypesEnum.Pass) {
      return {
        ...centerBottomCoords,
        y: centerBottomCoords.y + (stateItemSize.height - passStateItemSize.height) / 2,
      };
    }
    return centerBottomCoords;
  }

  private static getTopY(state: IStateGroup) {
    let currentY =  state.getCenterTopCoords?.()?.y || 0;
    if (state.isBranchRoot?.()) {
      currentY = state.getCenterTopCoordsAboveChildren()?.y || currentY;
    }
    return currentY;
  }
}
