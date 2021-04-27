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
import { CurveTieLinesStructure } from '../../interfaces/curve-tie-lines-structure.interface';
import { SideState } from '../../interfaces/state-items-by-side.interface';
import { BezierCurveTieLine } from 'src/models/bezier-curve-tie-line.model';

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

  protected drawCurveTieLines() {
    const curveTieLinesStructure = this.tieLines.getCurveTieLinesStructure(this.states);
    curveTieLinesStructure.forEach((curveLineStructure: CurveTieLinesStructure) => {
      const startCoords = curveLineStructure.rootState?.getRightTiePoint?.().getCenterRightCoords?.() || { x: 0, y: 0 };
      const nextStateCoords = curveLineStructure.nextState?.getLeftTiePoint?.().getCenterLeftCoords?.();
      startCoords.x = startCoords.x + tieLineSize.margin;
      const { leftSide = [], rightSide = [], middleItems = [] } = curveLineStructure;
      const rightmostCoords = curveLineStructure.rootState.getRightMostItemCoordsUnderChildren();

      leftSide.forEach((sideState: SideState) => {
        this.drawStartCurveTieLine(sideState, startCoords);
        this.drawEndCurveTieLine(curveLineStructure, sideState, rightmostCoords, nextStateCoords);
      });
      rightSide.forEach((sideState: SideState) => {
        this.drawStartCurveTieLine(sideState, startCoords);
        this.drawEndCurveTieLine(curveLineStructure, sideState, rightmostCoords, nextStateCoords, 1);
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
    offsetY: number = 0,
  ) {
    const branchRightMost = this.drawStraightBranchItemLine(
      curveLineStructure,
      sideState,
      rightmostCoords,
    )?.getCenterRightCoords();
    if (branchRightMost && nextStateCoords?.x && nextStateCoords?.y) {
      const tieLine = new BezierCurveTieLine(
        nextStateCoords,
        {
          x: rightmostCoords.x,
          y: branchRightMost?.y,
        },
        true,
      );
      tieLine.set({ top: tieLine.top + offsetY });
      this.canvas.add(tieLine);
    }
  }

  protected drawStartCurveTieLine(sideState: SideState, startCoords: PointCoords) {
    const endCoords = sideState.state?.getCenterLeftCoords?.() || { x: null, y: null };
    const tieLine = new BezierCurveTieLine(startCoords, endCoords);
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
    if (rightmostCoords && branchRightMost?.x !== rightmostCoords.x) {
      const bottomOfBranchTieLine = new TieLine([
        branchRightMost?.x,
        branchRightMost?.y,
        rightmostCoords?.x,
        branchRightMost?.y,
      ]);
      this.canvas.add(bottomOfBranchTieLine);
    }
    return currentBranchItem;
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
    const passStateMargin = (stateItemSize.width - passStateItemSize.width) / 2;
    const drawPositionRight = branchesItemsGroup
      ? (branchesItemsGroup.left || 0) + (branchesItemsGroup.width || 0) + passStateMargin
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
