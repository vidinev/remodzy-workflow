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
import { BranchConfiguration } from '../../interfaces/branch-configuration.interface';
import { DrawBranchOptions } from '../../interfaces/draw-branch-options.interface';
import { defaultDrawOptions } from './default-draw-options';
import { WorkflowDimensions } from '../../models/interfaces/workflow dimentions.interface';

export class DrawBranchVerticalService extends DrawBranchService {

  constructor(protected workflowData: WorkflowData,
              protected canvas: Canvas,
              protected options: DrawBranchOptions = defaultDrawOptions,
              protected startPosition?: PointCoords) {
    super(workflowData, canvas, options, startPosition);

    if (!startPosition) {
      this.position = {
        x: Math.round(this.canvas.getWidth()! / 2 - stateItemSize.width / 2),
        y: marginSize.verticalMargin,
      };
    }
    this.drawPosition = new DrawPositionService(this.position);
    this.tieLines = new TieLinesVerticalService(this.canvas);
  }

  public drawBranch(): IStateGroup[] {
    this.drawStates();
    this.drawDropAreas();
    if (!this.options.draft) {
      this.drawTiePoints();
      this.drawCurveTieLines();
      this.drawTieLines();
    }
    return this.states;
  }

  public drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    const stateGroup = this.getRootStateGroup(stateData, position.x, position.y, workflowData);
    this.canvas.add(stateGroup);
    return stateGroup;
  }

  public getBranchDimensions(): WorkflowDimensions {
    let widthOfBranch = stateItemSize.width;
    const defaultCoords = { x: 0, y: 0 };
    let rightMost = defaultCoords
    let leftMost = defaultCoords;
    let stateCenterTop = defaultCoords;
    this.states.forEach((state: IStateGroup) => {
      if (state.isBranchRoot()) {
        rightMost = state.getRightMostItemCoordsUnderChildren(true);
        leftMost = state.getLeftMostItemCoordsUnderChildren();
        widthOfBranch = rightMost.x - leftMost.x;
      }
      if (state.data.stateId === this.workflowData.getStartStateId()) {
        stateCenterTop = state.getCenterTopCoords();
      }
    });
    return {
      width: widthOfBranch + marginSize.horizontalMargin * 2,
      height: this.position.y + marginSize.verticalMargin * 2,
      leftSideWidth: stateCenterTop.x - leftMost.x,
      rightSideWidth: rightMost.x - stateCenterTop.x,
      startPoint: stateCenterTop
    };
  }

  protected getRootStateGroup(stateData: WorkflowState, left: number, top: number, workflowData?: WorkflowData) {
    const state = super.getRootStateGroup(stateData, left, top, workflowData);
    state.alignCenter();
    return state;
  }

  protected drawBranches(branchesConfiguration: BranchConfiguration[], position: PointCoords): BranchItems[] {
    let branchSubItems: BranchItems[] = [];
    let positionX = this.getBranchDrawStartPosition(branchesConfiguration, position.x, 'width');
    for (let i = 0; i < branchesConfiguration.length; i++) {
      const branchWorkflowData = branchesConfiguration[i].data;
      const widthWithMargin = branchesConfiguration[i].width + marginSize.branchesMargin;
      positionX += widthWithMargin / 2;
      const drawBranchService = new DrawBranchVerticalService(branchWorkflowData, this.canvas, this.options, {
        y: position.y + stateItemSize.height + marginSize.stateToBranchMargin,
        x: positionX - stateItemSize.width / 2,
      });
      positionX += widthWithMargin / 2;
      const states = drawBranchService.drawBranch();
      const dropAreas = states.map((state: IStateGroup) => state.getDropArea());
      branchSubItems.push(new BranchItems(states, dropAreas, []));
    }
    return branchSubItems;
  }

  protected calculateBranchWidth(branch: WorkflowData) {
    const virtualCanvas = new fabric.Canvas(null);
    const drawBranchService = new DrawBranchVerticalService(branch, virtualCanvas, { draft: true }, {
      y: 0,
      x: 0,
    });
    const states = drawBranchService.drawBranch();
    const width = this.getStatesWidth(states);
    virtualCanvas.dispose();
    return width;
  }

  protected getStatesWidth(states: IStateGroup[]) {
    let widthOfBranch = stateItemSize.width;
    states.forEach((state: IStateGroup) => {
      if (state.isBranchRoot()) {
        const rightMost = state.getRightMostItemCoordsUnderChildren(true);
        const leftMost = state.getLeftMostItemCoordsUnderChildren();
        widthOfBranch = rightMost.x - leftMost.x;
      }
    });
    return widthOfBranch;
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
