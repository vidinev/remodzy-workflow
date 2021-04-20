import { Canvas } from 'fabric/fabric-impl';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { WorkflowData } from '../workflow-data.service';
import { StateItemsBySide } from '../../interfaces/state-items-by-side.interface';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { CurveTieLinesStructure } from '../../interfaces/curve-tie-lines-structure.interface';

export class TieLinesService {
  constructor(protected canvas: Canvas) {}

  getTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    return [];
  }

  getCurveTieLinesStructure(states: IStateGroup[]): CurveTieLinesStructure[] {
    const curveTieLinesStructure: CurveTieLinesStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (canvasObject.data.BranchesData && canvasObject.data.BranchesData.length) {
        const tieStart = canvasObject.getBottomTiePoint();
        curveTieLinesStructure.push({
          rootState: canvasObject,
          tieStart,
          ...this.getGroupedItemsBySide(canvasObject),
        });
      }
    });
    return curveTieLinesStructure;
  }

  protected getGroupedItemsBySide(canvasObject: IStateGroup): StateItemsBySide {
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

  protected getStateGroupById(states: IStateGroup[], stateId: string) {
    return states.find((state: IStateGroup) => state.data.stateId === stateId);
  }
}
