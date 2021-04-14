import { Canvas } from 'fabric/fabric-impl';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { IStateGroup } from '../models/interfaces/state.interface';
import { WorkflowData } from './workflow-data.service';
import { StateItemsBySide } from '../interfaces/state-items-by-side.interface';
import { CurveTieLinesStructure } from '../interfaces/curve-tie-lines-structure.interface';
import { StateTypesEnum } from '../configs/state-types.enum';

export class TieLinesService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  // TODO rework to base class and inheritance
  getVerticalTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      const dropArea = canvasObject.getDropArea();
      if (!canvasObject.data.End || (canvasObject.data.End && dropArea)) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        const tieStart = canvasObject.getBottomTiePoint();
        const tieEnd = nextState?.getTopTiePoint();

        let startCoords = tieStart?.getCenterBottomCoords();
        if (canvasObject.data.Type === StateTypesEnum.Pass && !tieStart) {
          startCoords = canvasObject.getCenterBottomCoords();
        }

        if (startCoords && dropArea) {
          tieLinesStructure.push({
            startCoords,
            endCoords: tieEnd?.getCenterTopCoords(),
            dropArea,
          });
        }
      }
    });
    return tieLinesStructure;
  }

  getHorizontalTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (!canvasObject.data.End) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        const tieStart = canvasObject.getRightTiePoint();
        const tieEnd = nextState?.getLeftTiePoint();
        let startCoords = tieStart?.getCenterRightCoords();
        if (canvasObject.data.Type === StateTypesEnum.Pass && !tieStart) {
          startCoords = canvasObject.getCenterRightCoords();
        }
        if (startCoords && !canvasObject.isBranchRoot()) {
          tieLinesStructure.push({
            startCoords,
            endCoords: tieEnd?.getCenterLeftCoords(),
          });
        }
      }
    });
    return tieLinesStructure;
  }

  getCurveTieLinesStructure(states: IStateGroup[]): CurveTieLinesStructure[] {
    const curveTieLinesStructure: CurveTieLinesStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (canvasObject.data.BranchesData && canvasObject.data.BranchesData.length) {
        const tieStart = canvasObject.getBottomTiePoint();
        curveTieLinesStructure.push({
          tieStart,
          ...this.getGroupedItemsBySide(canvasObject),
        });
      }
    });
    return curveTieLinesStructure;
  }

  private getGroupedItemsBySide(canvasObject: IStateGroup): StateItemsBySide {
    const branchesLength = canvasObject.data.BranchesData?.length || 0;
    const isEvenBranches = branchesLength % 2 === 0;
    const middleBranchIndex = Math.ceil(branchesLength / 2);
    const childrenStates = canvasObject.getChildrenStates();
    const leftSide: IStateGroup[] = [];
    const rightSide: IStateGroup[] = [];
    const middleItems: IStateGroup[] = [];
    canvasObject.data.BranchesData?.forEach((branchData: WorkflowData, i: number) => {
      const indexNumber = i + 1;
      const state = this.getStateGroupById(childrenStates, branchData.getStartStateId());
      if (state) {
        if (isEvenBranches ? indexNumber <= middleBranchIndex : indexNumber < middleBranchIndex) {
          leftSide.push(state);
        }
        if (!isEvenBranches && indexNumber === middleBranchIndex) {
          middleItems.push(state);
        }
        if (indexNumber > middleBranchIndex) {
          rightSide.push(state);
        }
      }
    });
    return { leftSide, middleItems, rightSide };
  }

  private getStateGroupById(states: IStateGroup[], stateId: string) {
    return states.find((state: IStateGroup) => state.data.stateId === stateId);
  }
}
