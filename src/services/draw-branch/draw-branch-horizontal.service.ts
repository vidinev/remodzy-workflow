import { DrawBranchService } from './draw-branch.service';
import { WorkflowData } from '../workflow-data.service';
import { Canvas, Group } from 'fabric/fabric-impl';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { marginSize, passStateItemSize, stateItemSize, tieLineSize } from '../../configs/size.config';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { StateTypesEnum } from '../../configs/state-types.enum';
import { BranchItems } from '../../models/branch-items.model';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { TieLine } from '../../models/tie-line.model';
import { DrawPositionService } from '../draw-position.service';
import { TieLinesHorizontalService } from '../tie-lines/tie-lines-horizontal.service';

export class DrawBranchHorizontalService extends DrawBranchService {
  constructor(protected workflowData: WorkflowData, protected canvas: Canvas, protected startPosition?: PointCoords) {
    super(workflowData, canvas, startPosition);

    if (!startPosition) {
      this.position = {
        x: marginSize.horizontalMargin,
        y: Math.round(this.canvas.height! / 2 - stateItemSize.height / 2),
      };
    }
    this.drawPosition = new DrawPositionService(this.position);
    this.tieLines = new TieLinesHorizontalService(this.canvas);
  }

  public drawBranch(): IStateGroup[] {
    this.drawStates();
    this.drawTiePoints();
    this.drawTieLines();
    return this.states;
  }

  public drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    let left = position.x;
    let top = position.y;
    if (stateData.Type === StateTypesEnum.Pass) {
      top += Math.ceil((stateItemSize.height - passStateItemSize.height) / 2);
    }
    const stateGroup = this.getRootStateGroup(stateData, left, top, workflowData);
    this.canvas.add(stateGroup);
    return stateGroup;
  }

  protected drawBranches(branches: WorkflowData[], position: PointCoords): BranchItems[] {
    let branchSubItems: BranchItems[] = [];
    const heightForBranches =
      branches.length * (stateItemSize.height + marginSize.verticalMargin) - marginSize.verticalMargin;
    const startY = position.y - Math.ceil(heightForBranches / 2) + Math.ceil(stateItemSize.height / 2);
    for (let i = 0; i < branches.length; i++) {
      const branchWorkflowData = branches[i];
      const drawBranchService = new DrawBranchHorizontalService(branchWorkflowData, this.canvas, {
        y: startY + (stateItemSize.height + marginSize.verticalMargin) * i,
        x: position.x + stateItemSize.width,
      });
      const states = drawBranchService.drawBranch();
      branchSubItems.push(new BranchItems(states, []));
    }
    return branchSubItems;
  }

  protected movePositionToNextState(rootState: IStateGroup, branchesItemsGroup?: Group) {
    const drawPositionRight = branchesItemsGroup
      ? (branchesItemsGroup.left || 0) + (branchesItemsGroup.width || 0) + marginSize.horizontalMargin
      : rootState.getCenterRightCoords().x + marginSize.horizontalMargin;
    this.drawPosition.setRight(drawPositionRight);
  }

  protected drawTiePoints() {
    this.states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.data.Type === StateTypesEnum.Pass) {
        return;
      }
      if (!stateGroup.data.Start) {
        const rightTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterLeftCoords());
        stateGroup.setLeftTiePoint(rightTiePoint);
      }
      const isMainBranchEnd = stateGroup.data.stateId === this.workflowData.getEndStateId();
      if (!isMainBranchEnd && stateGroup.data.Type) {
        const rightTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterRightCoords());
        stateGroup.setRightTiePoint(rightTiePoint);
      }
    });
  }

  protected drawTieLines() {
    let tieLinesStructure;
    tieLinesStructure = this.tieLines.getTieLinesStructure(this.states);
    tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
      const { x: fromTieX } = tieLineStructure.startCoords || { x: null };
      const { x: toTieX, y } = tieLineStructure.endCoords || { x: null };
      if (fromTieX) {
        this.canvas.add(
          new TieLine([fromTieX + tieLineSize.margin, y, (toTieX || tieLineSize.margin) - tieLineSize.margin, y]),
        );
      }
    });
  }
}
