import { DrawBranchService } from './draw-branch.service';
import { WorkflowData } from '../workflow-data.service';
import { Canvas, Group } from 'fabric/fabric-impl';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { dropAreaSize, marginSize, stateItemSize, tieLineSize } from '../../configs/size.config';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { BranchItems } from '../../models/branch-items.model';
import { StateTypesEnum } from '../../configs/state-types.enum';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { TieLine } from '../../models/tie-line.model';
import { DrawPositionService } from '../draw-position.service';
import { TieLinesVerticalService } from '../tie-lines/tie-lines-vertical.service';

export class DrawBranchVerticalService extends DrawBranchService {
  constructor(protected workflowData: WorkflowData, protected canvas: Canvas, protected startPosition?: PointCoords) {
    super(workflowData, canvas, startPosition);

    if (!startPosition) {
      this.position = {
        x: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
        y: marginSize.verticalMargin,
      };
    }
    this.drawPosition = new DrawPositionService(this.position);
    this.tieLines = new TieLinesVerticalService(this.canvas);
  }

  public drawBranch(): IStateGroup[] {
    this.drawStates();
    this.drawTiePoints();
    this.drawDropAreas();
    this.drawCurveTieLines();
    this.drawTieLines();
    return this.states;
  }

  public drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    const stateGroup = this.getRootStateGroup(stateData, position.x, position.y, workflowData);
    this.canvas.add(stateGroup);
    return stateGroup;
  }

  protected drawBranches(branches: WorkflowData[], position: PointCoords): BranchItems[] {
    let branchSubItems: BranchItems[] = [];
    const widthForBranches =
      branches.length * (stateItemSize.width + marginSize.horizontalMargin) - marginSize.horizontalMargin;
    const startX = position.x - widthForBranches / 2 + stateItemSize.width / 2;
    for (let i = 0; i < branches.length; i++) {
      const branchWorkflowData = branches[i];
      const drawBranchService = new DrawBranchVerticalService(branchWorkflowData, this.canvas, {
        y: position.y + stateItemSize.height + marginSize.stateToBranchMargin,
        x: startX + (stateItemSize.width + marginSize.horizontalMargin) * i,
      });
      const states = drawBranchService.drawBranch();
      const dropAreas = states.map((state: IStateGroup) => state.getDropArea());
      branchSubItems.push(new BranchItems(states, dropAreas, []));
    }
    return branchSubItems;
  }

  protected movePositionToNextState(rootState: IStateGroup, branchesItemsGroup?: Group) {
    if (branchesItemsGroup?.height) {
      this.drawPosition.moveBottom(
        rootState.height +
          (branchesItemsGroup?.height || 0) +
          marginSize.stateToBranchMargin * 2 +
          marginSize.verticalMargin / 2 +
          dropAreaSize.height / 2,
      );
      return;
    }
    this.drawPosition.moveBottom(marginSize.verticalMargin + rootState.height + (branchesItemsGroup?.height || 0));
  }

  protected drawTiePoints() {
    this.states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.data.Type === StateTypesEnum.Pass) {
        return;
      }
      if (!stateGroup.data.Start) {
        const topTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterTopCoords());
        stateGroup.setTopTiePoint(topTiePoint);
      }
      const isMainBranchEnd = stateGroup.isInMainBranch() && stateGroup.data.End;
      if (!isMainBranchEnd && stateGroup.data.Type) {
        const bottomTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterBottomCoords());
        stateGroup.setBottomTiePoint(bottomTiePoint);
      }
    });
  }

  protected drawTieLines() {
    let tieLinesStructure;
    tieLinesStructure = this.tieLines.getTieLinesStructure(this.states);
    tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
      const { x, y: fromTieY } = tieLineStructure.startCoords || { x: null, y: null };
      const { y: toTieY, x: toTieX } = tieLineStructure.endCoords || { y: null, x: null };
      const { y: toDropY } = tieLineStructure.dropArea!.getCenterTopCoords();
      const { y: fromDropY } = tieLineStructure.dropArea!.getCenterBottomCoords();
      if (x && fromTieY) {
        this.canvas.add(new TieLine([x, fromTieY + tieLineSize.margin, x, toDropY]));
      }
      if (toTieY) {
        this.canvas.add(new TieLine([x || toTieX, fromDropY, x || toTieX, toTieY - tieLineSize.margin]));
      }
    });
  }
}
