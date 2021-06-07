import { DrawBranchService } from './draw-branch.service';
import { WorkflowData } from '../workflow-data.service';
import { Canvas, Group } from 'fabric/fabric-impl';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { marginSize, passStateItemSize, stateItemSize, strokeWidth, tieLineSize } from '../../configs/size.config';
import { IStateGroup } from '../../models/interfaces/state.interface';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { StateTypesEnum } from '../../configs/state-types.enum';
import { BranchItems } from '../../models/branch-items.model';
import { TieLineStructure } from '../../interfaces/tie-lines-structure.interface';
import { TieLine } from '../../models/tie-line.model';
import { DrawPositionService } from '../draw-position.service';
import { TieLinesHorizontalService } from '../tie-lines/tie-lines-horizontal.service';
import { CurveTieLinesStructure } from '../../interfaces/curve-tie-lines-structure.interface';
import { SideState } from '../../interfaces/state-items-by-side.interface';
import { BezierCurveTieLine } from 'src/models/bezier-curve-tie-line.model';
import { ConnectPoint } from 'src/models/connect-point.model';
import { BranchConfiguration } from '../../interfaces/branch-configuration.interface';

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
    this.drawCurveConnectPoints();
    this.drawCurveTieLines();
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

  protected drawCurveConnectPoints() {
    this.states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.isBranchRoot()) {
        const { x: rightmostLeft } = stateGroup.getRightMostItemCoordsUnderChildren();
        const { y: rightmostTop } = stateGroup.getCenterRightCoords();
        const left = rightmostLeft + marginSize.horizontalMargin + strokeWidth * 2;
        const connectPoint = new ConnectPoint(left, rightmostTop);
        stateGroup.setConnectPoint(connectPoint);
        this.canvas.add(connectPoint);
      }
    });
  }

  protected drawCurveTieLines() {
    const curveTieLinesStructure = this.tieLines.getCurveTieLinesStructure(this.states);
    curveTieLinesStructure.forEach((curveLineStructure: CurveTieLinesStructure) => {
      const startCoords = curveLineStructure.rootState?.getRightTiePoint?.().getCenterRightCoords?.() || { x: 0, y: 0 };
      let nextStateCoords = curveLineStructure.nextState?.getLeftTiePoint?.().getCenterLeftCoords?.();
      startCoords.x = startCoords.x + tieLineSize.margin;
      const { leftSide = [], rightSide = [], middleItems = [] } = curveLineStructure;
      const rightmostCoords = curveLineStructure.rootState.getRightMostItemCoordsUnderChildren();
      if (!curveLineStructure.nextState) {
        nextStateCoords = {
          x: rightmostCoords.x,
          y: startCoords.y,
        };
      }
      leftSide.forEach((sideState: SideState) => {
        this.drawStartCurveTieLine(sideState, startCoords);
        this.drawEndCurveTieLine(curveLineStructure, sideState, rightmostCoords, nextStateCoords);
      });
      rightSide.forEach((sideState: SideState) => {
        this.drawStartCurveTieLine(sideState, startCoords);
        this.drawEndCurveTieLine(curveLineStructure, sideState, rightmostCoords, nextStateCoords);
      });
      middleItems.forEach((sideState: SideState) => {
        this.drawStartCurveTieLine(sideState, startCoords);
        this.drawStraightBranchItemLine(curveLineStructure, sideState, nextStateCoords);
      });
    });
  }

  protected drawEndCurveTieLine(
    curveLineStructure: CurveTieLinesStructure,
    sideState: SideState,
    rightmostCoords: PointCoords,
    nextStateCoords: PointCoords = rightmostCoords,
  ) {
    const branchRightMost = this.drawStraightBranchItemLine(
      curveLineStructure,
      sideState,
      rightmostCoords,
    )?.getCenterRightCoords();
    if (branchRightMost && nextStateCoords?.x && nextStateCoords?.y) {
      let rightmostX = nextStateCoords.x;
      if (!curveLineStructure.nextState) {
        const { left = 0 } = curveLineStructure.rootState.getConnectPoint();
        rightmostX = left;
      }
      const tieLine = new BezierCurveTieLine(
        {
          x: rightmostX,
          y: nextStateCoords.y,
        },
        {
          x: rightmostCoords.x,
          y: branchRightMost?.y,
        },
        true,
      );
      tieLine.set({ top: tieLine.top + strokeWidth / 2 });
      this.canvas.add(tieLine);
    }
  }

  protected drawStartCurveTieLine(sideState: SideState, startCoords: PointCoords) {
    const endCoords = sideState.state?.getCenterLeftCoords?.() || { x: null, y: null };
    const tieLine = new BezierCurveTieLine(startCoords, {
      ...endCoords,
      x: endCoords.x,
    });
    this.canvas.add(tieLine);
  }

  protected drawStraightBranchItemLine(
    curveLineStructure: CurveTieLinesStructure,
    sideState: SideState,
    rightmostCoords?: PointCoords,
  ): BranchItems | null {
    const branchItems = curveLineStructure.rootState.getBranchItems();
    const currentBranchItem = branchItems?.length ? branchItems[sideState.branchIndex] : null;
    const branchRightMost = currentBranchItem?.getCenterRightCoords();
    if (rightmostCoords && branchRightMost?.x === rightmostCoords.x) {
      this.drawConnectPointTieLine(curveLineStructure, rightmostCoords);
    }
    if (rightmostCoords && branchRightMost?.x !== rightmostCoords.x) {
      let rightmostX = rightmostCoords?.x;
      this.drawConnectPointTieLine(curveLineStructure, rightmostCoords);
      const bottomOfBranchTieLine = new TieLine([
        branchRightMost?.x || 0,
        branchRightMost?.y,
        rightmostX,
        branchRightMost?.y,
      ]);
      this.canvas.add(bottomOfBranchTieLine);
    }
    return currentBranchItem;
  }

  protected drawConnectPointTieLine(curveLineStructure: CurveTieLinesStructure, rightmostCoords?: PointCoords) {
    if (!curveLineStructure.nextState) {
      const { left = 0, top } = curveLineStructure.rootState.getConnectPoint();
      if (top === rightmostCoords?.y && rightmostCoords?.x) {
        const connectPointTieLine = new TieLine([rightmostCoords?.x, top, left, top]);
        this.canvas.add(connectPointTieLine);
      }
    }
  }

  protected drawBranches(branchesConfiguration: BranchConfiguration[], position: PointCoords): BranchItems[] {
    let branchSubItems: BranchItems[] = [];
    let positionY = this.getBranchDrawStartPosition(branchesConfiguration, position.y, 'height');
    for (let i = 0; i < branchesConfiguration.length; i++) {
      const branchWorkflowData = branchesConfiguration[i].data;
      const heightWithMargin = branchesConfiguration[i].height + marginSize.branchesMargin;
      positionY += heightWithMargin / 2;
      const drawBranchService = new DrawBranchHorizontalService(branchWorkflowData, this.canvas, {
        y: positionY - stateItemSize.height / 2,
        x: position.x + stateItemSize.width + marginSize.horizontalMargin,
      });
      positionY += heightWithMargin / 2;
      const states = drawBranchService.drawBranch();
      const connectPoints = states.map((state: IStateGroup) => state.getConnectPoint()).filter(Boolean);
      branchSubItems.push(new BranchItems(states, [], connectPoints));
    }
    return branchSubItems;
  }

  protected calculateBranchHeight(branch: WorkflowData): number {
    const virtualCanvas = new fabric.Canvas(null);
    const drawBranchService = new DrawBranchHorizontalService(branch, virtualCanvas, {
      y: 0,
      x: 0,
    });
    const states = drawBranchService.drawBranch();
    const height = this.getStatesHeight(states);
    virtualCanvas.dispose();
    return height;
  }

  protected getStatesHeight(states: IStateGroup[]) {
    let heightOfBranch = stateItemSize.height;
    states.forEach((state: IStateGroup) => {
      if (state.isBranchRoot()) {
        const topPoint = state.getCenterTopCoordsAboveChildren();
        const bottomPoint = state.getCenterBottomCoordsUnderChildren(true);
        heightOfBranch = bottomPoint.y - topPoint.y;
      }
    });
    return heightOfBranch;
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
      const isMainBranchEnd = stateGroup.isInMainBranch() && stateGroup.data.End;
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
