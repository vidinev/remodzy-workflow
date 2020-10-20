import { Canvas } from 'fabric/fabric-impl';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { IStateGroup } from '../models/interfaces/state.interface';
import { WorkflowData } from './workflow-data.service';

export class TieLinesService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  getTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    const tieLinesStructure: TieLineStructure[] = [];
    states.forEach((canvasObject: IStateGroup) => {
      if (!canvasObject.data.End) {
        const nextState = this.getStateGroupById(states, canvasObject.data.Next!);
        if (nextState) {
          const tieStart = canvasObject.getBottomTiePoint();
          const tieEnd = nextState.getTopTiePoint();
          const dropArea = canvasObject.getDropArea();
          if (tieStart && tieEnd && dropArea) {
            tieLinesStructure.push({ tieStart, tieEnd, dropArea });
          }
        }
      }
    });
    return tieLinesStructure;
  }

  getCurveTieLinesStructure(states: IStateGroup[]): TieLineStructure[] {
    states.forEach((canvasObject: IStateGroup) => {
      if (canvasObject.data.BranchesData && canvasObject.data.BranchesData.length) {
        const tieStart = canvasObject.getBottomTiePoint();
        const isEvenBranches = canvasObject.data.BranchesData.length % 2 === 0;
        const middleBranchIndex = Math.ceil(canvasObject.data.BranchesData.length / 2);
        const tieEndLeft = [];
        canvasObject.data.BranchesData.forEach((branchData: WorkflowData, i: number) => {
          const indexNumber = i + 1;
          if (isEvenBranches ? indexNumber <= middleBranchIndex : indexNumber < middleBranchIndex) {
            console.log('tie end left', branchData);
          }
          if (!isEvenBranches && indexNumber === middleBranchIndex) {
            console.log('tie middle', branchData);
          }
          if (indexNumber > middleBranchIndex) {
            console.log('tie end right', branchData);
          }
        });
      }
    });
    return [];
  }

  private getStateGroupById(states: IStateGroup[], stateId: string) {
    return states.find((state: IStateGroup) => state.data.stateId === stateId);
  }
}
