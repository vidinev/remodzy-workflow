import { WorkflowData } from '../workflow-data.service';
import { PointCoords } from '../../interfaces/point-coords.interface';
import { IStateGroup } from '../../models/interfaces/state.interface';
import {
  curveRoundPartSize,
  dropAreaSize,
  marginSize,
  stateItemSize,
  strokeWidth,
  tiePointSize,
} from '../../configs/size.config';
import { Canvas, Group, Object as CanvasObject } from 'fabric/fabric-impl';
import { DrawPositionService } from '../draw-position.service';
import { CurveTieLinesStructure } from '../../interfaces/curve-tie-lines-structure.interface';
import { MiddleTieLine } from '../../models/middle-tie-line.model';
import { CurveTieLine } from '../../models/curve-tie-line.model';
import { CurveTieLineDirection } from '../../models/configs/curve-tie-line-config';
import { TieLinesService } from '../tie-lines/tie-lines.service';
import { WorkflowState } from '../../interfaces/state-language.interface';
import { StateGroup } from '../../models/state.model';
import { BranchItems } from '../../models/branch-items.model';
import { ITiePointCircle } from '../../models/interfaces/tie-point.interface';
import { TiePointCircle } from '../../models/tie-point.model';
import { IDropAreaGroup } from '../../models/interfaces/drop-area.interface';
import { DropAreaGroup } from '../../models/drop-area.model';
import { SideState } from '../../interfaces/state-items-by-side.interface';
import { TieLine } from '../../models/tie-line.model';
import { BranchConfiguration } from '../../interfaces/branch-configuration.interface';
import { DrawBranchOptions } from '../../interfaces/draw-branch-options.interface';
import { defaultDrawOptions } from './default-draw-options';
import { WorkflowDimensions } from '../../models/interfaces/workflow dimentions.interface';

export class DrawBranchService {
  protected position: PointCoords = { x: 0, y: 0 };
  protected tieLines: TieLinesService;
  protected drawPosition: DrawPositionService = new DrawPositionService(this.position);
  protected states: IStateGroup[] = [];

  static getMiddleBranchIndex(branchesConfiguration: BranchConfiguration[]) {
    return Math.ceil(branchesConfiguration.length / 2);
  }

  static isEvenBranches(branchesConfiguration: BranchConfiguration[]) {
    return branchesConfiguration.length % 2 === 0;
  }

  static isMiddleBranch(branchesConfiguration: BranchConfiguration[], indexNumber: number) {
    return (
      !DrawBranchService.isEvenBranches(branchesConfiguration) &&
      indexNumber === DrawBranchService.getMiddleBranchIndex(branchesConfiguration)
    );
  }

  static isLeftBranch(branchesConfiguration: BranchConfiguration[], indexNumber: number) {
    const middleBranchIndex = DrawBranchService.getMiddleBranchIndex(branchesConfiguration);
    return DrawBranchService.isEvenBranches(branchesConfiguration)
      ? indexNumber <= middleBranchIndex
      : indexNumber < middleBranchIndex;
  }

  constructor(
    protected workflowData: WorkflowData,
    protected canvas: Canvas,
    protected options: DrawBranchOptions = defaultDrawOptions,
    protected startPosition?: PointCoords,
  ) {
    if (startPosition) {
      this.position = { ...startPosition };
    }
    this.tieLines = new TieLinesService(this.canvas);
  }

  public drawBranch(): IStateGroup[] {
    return this.states;
  }

  public drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    return this.getRootStateGroup(stateData, position.x, position.y, workflowData);
  }

  public getBranchDimensions(): WorkflowDimensions {
    return {
      width: stateItemSize.width,
      height: stateItemSize.height,
      leftSideWidth: stateItemSize.width / 2,
      rightSideWidth: stateItemSize.width / 2,
      startPoint: { x: 0, y: 0 },
    };
  }

  public getDropAreas(states: IStateGroup[] = this.states): IDropAreaGroup[] {
    let dropAreas: IDropAreaGroup[] = [];
    states.forEach((state: IStateGroup) => {
      const dropArea = state.getDropArea();
      if (state.isBranchRoot()) {
        dropAreas = [...dropAreas, ...this.getDropAreas(state.getChildrenStates())];
      }
      if (dropArea) {
        dropAreas.push(dropArea);
      }
    });
    return dropAreas;
  }

  protected getRootStateGroup(stateData: WorkflowState, left: number, top: number, workflowData?: WorkflowData) {
    const isStart = stateData.Parameters?.stateId === workflowData?.getStartStateId();
    const isMainStart = workflowData?.isMainRoot() && isStart;
    const isEnd = stateData.Parameters?.stateId === this.workflowData.getEndStateId();
    const isMainEnd = workflowData?.isMainRoot() && isEnd;
    return new StateGroup(
      stateData,
      {
        left,
        top,
        hoverCursor: this.getCursor(isMainStart, isMainEnd),
        selectable: this.isSelectable(isMainStart, isMainEnd),
      },
      isStart,
      workflowData?.getParentStateId(),
      this.options.draft,
    );
  }

  protected isSelectable(isMainStart: boolean = false, isMainEnd: boolean = false): boolean {
    return !(isMainStart || isMainEnd);
  }

  protected getCursor(isMainStart: boolean = false, isMainEnd: boolean = false): string {
    return isMainStart || isMainEnd ? 'default' : 'pointer';
  }

  protected drawBranches(branchesConfiguration: BranchConfiguration[], position: PointCoords): BranchItems[] {
    return [];
  }

  protected getBranchDrawStartPosition(
    branchesConfiguration: BranchConfiguration[],
    positionPoint: number,
    branchDimension: 'width' | 'height',
  ) {
    const isEvenBranches = DrawBranchService.isEvenBranches(branchesConfiguration);
    let sizeForBranches = 0;
    let offset = 0;
    branchesConfiguration.forEach((branchConfiguration: BranchConfiguration, i: number) => {
      const sizeWithMargin =
        i === branchesConfiguration.length - 1
          ? branchConfiguration[branchDimension]
          : branchConfiguration[branchDimension] + marginSize.branchesMargin;
      const indexNumber = i + 1;
      if (DrawBranchService.isLeftBranch(branchesConfiguration, indexNumber)) {
        offset += sizeWithMargin;
      }
      if (DrawBranchService.isMiddleBranch(branchesConfiguration, indexNumber)) {
        offset += sizeWithMargin / 2;
      }
      return (sizeForBranches += sizeWithMargin);
    });
    const initialStartPosition = isEvenBranches
      ? positionPoint - sizeForBranches / 2 - marginSize.branchesMargin / 2
      : positionPoint - offset;
    return initialStartPosition + stateItemSize[branchDimension] / 2;
  }

  protected drawStates(): IStateGroup[] {
    const states: IStateGroup[] = [];
    let currentStateData = this.workflowData.getStartState();
    while (!currentStateData.End) {
      const { rootState, branchesItemsGroup } = this.drawState(
        currentStateData,
        this.drawPosition.getCurrentPosition(),
        this.workflowData,
      );

      this.movePositionToNextState(rootState, branchesItemsGroup);

      currentStateData = this.workflowData.getStateById(currentStateData.Next!);
      states.push(rootState);
      branchesItemsGroup?.destroy();
    }
    if (currentStateData.End) {
      const { rootState: endStateGroup } = this.drawState(
        currentStateData,
        this.drawPosition.getCurrentPosition(),
        this.workflowData,
      );
      states.push(endStateGroup);
    }
    this.states = states;
    return states;
  }

  protected movePositionToNextState(rootState: IStateGroup, branchesItemsGroup?: Group): void {}

  protected drawState(
    stateData: WorkflowState,
    position: PointCoords,
    workflowData: WorkflowData,
  ): { rootState: IStateGroup; branchesItemsGroup?: Group } {
    let branchesItemsGroup;
    const rootState = this.drawStateRoot(stateData, position, workflowData);
    if (stateData.BranchesData?.length) {
      const branchesConfiguration: BranchConfiguration[] = stateData.BranchesData.map((data: WorkflowData) => {
        return {
          data,
          width: this.calculateBranchWidth(data),
          height: this.calculateBranchHeight(data),
        };
      });
      const branchesItems: BranchItems[] = this.drawBranches(branchesConfiguration, position).filter(Boolean);
      rootState.setBranchItems(branchesItems);
      let branchObjects: CanvasObject[] = [];
      branchesItems.forEach((branch: BranchItems) => {
        branchObjects = [...branchObjects, ...branch.getAllItems()];
      });
      branchesItemsGroup = new fabric.Group(branchObjects);
    }
    return { branchesItemsGroup, rootState };
  }

  protected drawTiePoints(): void {}

  protected calculateBranchWidth(branch: WorkflowData): number {
    return stateItemSize.width;
  }

  protected calculateBranchHeight(branch: WorkflowData): number {
    return stateItemSize.height;
  }

  protected drawTiePoint(stateId: string, pointCoords: PointCoords): ITiePointCircle {
    const tiePoint = new TiePointCircle({
      top: Math.round(pointCoords.y - tiePointSize.radius),
      left: Math.round(pointCoords.x - tiePointSize.radius),
      data: {
        stateId,
      },
    });
    this.canvas.add(tiePoint);
    return tiePoint;
  }

  protected drawDropAreas() {
    this.states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.isBranchRoot()) {
        const { y: underChildrenBottom } = stateGroup.getCenterBottomCoordsUnderChildren();
        const { x: stateLeft } = stateGroup.getCenterBottomCoords();
        const dropAreaGroup = this.drawDropArea(stateGroup.data.stateId, {
          x: stateLeft,
          y: underChildrenBottom + dropAreaSize.height / 2 + curveRoundPartSize * 2 + strokeWidth * 2,
        });
        stateGroup.setDropArea(dropAreaGroup);
      }

      const isMainBranchEnd = stateGroup.isInMainBranch() && stateGroup.data.End;
      if (!isMainBranchEnd && !stateGroup.isBranchRoot()) {
        const { x: stateLeft, y: stateBottom } = stateGroup.getCenterBottomCoords();
        const dropAreaTop = stateBottom + marginSize.verticalMargin / 2;
        const dropAreaGroup = this.drawDropArea(stateGroup.data.stateId, {
          x: stateLeft,
          y: dropAreaTop,
        });
        stateGroup.setDropArea(dropAreaGroup);
      }
    });
  }

  protected drawDropArea(stateId: string, position: PointCoords): IDropAreaGroup {
    const dropAreaGroup = new DropAreaGroup(
      {
        left: position.x,
        top: position.y,
        data: {
          stateId,
        },
      },
      this.options.draft,
    );
    this.canvas.add(dropAreaGroup);
    dropAreaGroup.moveToCenter();
    return dropAreaGroup;
  }

  protected drawCurveTieLines() {
    const curveTieLinesStructure = this.tieLines.getCurveTieLinesStructure(this.states);
    curveTieLinesStructure.forEach((curveLineStructure: CurveTieLinesStructure) => {
      const rootCoords = curveLineStructure.tieStart.getCenterBottomCoords();
      curveLineStructure.middleItems.forEach((sideState: SideState) => {
        const bottomCoords = sideState.state.getCenterTopCoords();
        const bottomDropArea = curveLineStructure?.rootState?.getDropArea();
        const sideStateCoords = sideState.state.getCenterTopCoords();
        const bottomOfBranch = this.getBottomOfBranch(curveLineStructure, sideState);
        const straightLine = new MiddleTieLine({
          topCoords: rootCoords,
          bottomCoords,
        });
        const bottomOfBranchTieLine = new TieLine([
          bottomOfBranch?.x,
          bottomOfBranch?.y,
          sideStateCoords.x,
          (bottomDropArea.top || 0) - strokeWidth,
        ]);
        this.canvas.add(straightLine, bottomOfBranchTieLine);
      });
      curveLineStructure.leftSide.forEach((sideState: SideState) => {
        this.drawCurveTieLineForSide(curveLineStructure, sideState, CurveTieLineDirection.topToLeft);
      });
      curveLineStructure.rightSide.forEach((sideState: SideState) => {
        this.drawCurveTieLineForSide(curveLineStructure, sideState, CurveTieLineDirection.topToRight);
      });
    });
  }

  protected drawCurveTieLineForSide(
    curveLineStructure: CurveTieLinesStructure,
    sideState: SideState,
    direction: CurveTieLineDirection,
  ) {
    const rootCoords = curveLineStructure.tieStart.getCenterBottomCoords();
    const bottomDropArea = curveLineStructure?.rootState?.getDropArea();
    const sideStateCoords = sideState.state.getCenterTopCoords();
    const rightCurve = new CurveTieLine(direction, rootCoords, sideStateCoords);
    const bottomRight = new CurveTieLine(
      this.getBottomCurveTieLineDirection(direction),
      {
        ...rootCoords,
        y: bottomDropArea.top || 0,
      },
      sideStateCoords,
    );
    const bottomOfBranch = this.getBottomOfBranch(curveLineStructure, sideState);
    const bottomOfBranchTieLine = new TieLine([
      bottomOfBranch?.x,
      bottomOfBranch?.y,
      sideStateCoords.x,
      (bottomDropArea.top || 0) - curveRoundPartSize * 2,
    ]);
    this.canvas.add(rightCurve, bottomRight, bottomOfBranchTieLine);
  }

  protected getBottomOfBranch(curveLineStructure: CurveTieLinesStructure, sideState: SideState) {
    const branchItems = curveLineStructure.rootState.getBranchItems();
    const currentBranchItem = branchItems?.length ? branchItems[sideState.branchIndex] : null;
    return currentBranchItem?.getCenterBottomCoords();
  }

  protected getBottomCurveTieLineDirection(direction: CurveTieLineDirection) {
    switch (direction) {
      case CurveTieLineDirection.topToLeft:
        return CurveTieLineDirection.bottomToLeft;
      case CurveTieLineDirection.topToRight:
        return CurveTieLineDirection.bottomToRight;
      default:
        return CurveTieLineDirection.bottomToRight;
    }
  }

  protected drawTieLines(): void {}
}
