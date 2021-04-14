import { WorkflowData } from './workflow-data.service';
import { PointCoords } from '../interfaces/point-coords.interface';
import { IStateGroup } from '../models/interfaces/state.interface';
import { marginSize, tiePointSize } from '../configs/size.config';
import { Canvas, Group, Object as CanvasObject } from 'fabric/fabric-impl';
import { DrawPositionService } from './draw-position.service';
import { CurveTieLinesStructure } from '../interfaces/curve-tie-lines-structure.interface';
import { MiddleTieLine } from '../models/middle-tie-line.model';
import { CurveTieLine } from '../models/curve-tie-line.model';
import { CurveTieLineDirection } from '../models/configs/curve-tie-line-config';
import { TieLinesService } from './tie-lines.service';
import { WorkflowState } from '../interfaces/state-language.interface';
import { StateGroup } from '../models/state.model';
import { BranchItems } from '../models/branch-items.model';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';
import { TiePointCircle } from '../models/tie-point.model';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { DropAreaGroup } from '../models/drop-area.model';

export class DrawBranchService {
  protected position: PointCoords = { x: 0, y: 0 };
  protected tieLines: TieLinesService;
  protected drawPosition: DrawPositionService = new DrawPositionService(this.position);
  protected states: IStateGroup[] = [];
  constructor(
    protected workflowData: WorkflowData,
    protected canvas: Canvas,
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

  protected getRootStateGroup(stateData: WorkflowState, left: number, top: number, workflowData?: WorkflowData) {
    const isStart = stateData.Parameters?.stateId === workflowData?.getStartStateId();
    const isEnd = stateData.Parameters?.stateId === this.workflowData.getEndStateId();
    return new StateGroup(
      stateData,
      {
        left,
        top,
        hoverCursor: isStart || isEnd ? 'default' : 'pointer',
        selectable: !(isStart || isEnd),
      },
      isStart,
    );
  }

  protected drawBranches(branches: WorkflowData[], position: PointCoords): BranchItems[] {
    return [];
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
        this.workflowData
      );
      states.push(endStateGroup);
    }
    this.states = states;
    return states;
  }

  protected movePositionToNextState(rootState: IStateGroup, branchesItemsGroup?: Group): void {
    return undefined;
  }

  protected drawState(
    stateData: WorkflowState,
    position: PointCoords,
    workflowData: WorkflowData,
  ): { rootState: IStateGroup; branchesItemsGroup?: Group } {
    let branchesItems: CanvasObject[] = [];
    let branchesItemsGroup;
    const rootState = this.drawStateRoot(stateData, position, workflowData);
    if (stateData.BranchesData?.length) {
      this.drawBranches(stateData.BranchesData, position).forEach((branchItems) => {
        branchesItems = [...branchesItems, ...branchItems.getAllItems()];
      });
      branchesItems.forEach((branchItem) => {
        rootState.addChildState(branchItem as IStateGroup);
      });
      branchesItemsGroup = new fabric.Group(branchesItems.filter(Boolean));
    }
    return { branchesItemsGroup, rootState };
  }

  protected drawTiePoints(): void {
    return undefined;
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
        // stateGroup.getCenterBottomCoordsUnderChildren()
      }

      const isMainBranchEnd = stateGroup.data.stateId === this.workflowData.getEndStateId();
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
    const dropAreaGroup = new DropAreaGroup({
      left: position.x,
      top: position.y,
      data: {
        stateId,
      },
    });
    this.canvas.add(dropAreaGroup);
    dropAreaGroup.set({
      left: Math.round(dropAreaGroup.left - dropAreaGroup.width / 2),
      top: Math.ceil(dropAreaGroup.top - dropAreaGroup.height / 2),
    });
    return dropAreaGroup;
  }

  protected drawCurveTieLines() {
    const curveTieLinesStructure = this.tieLines.getCurveTieLinesStructure(this.states);
    curveTieLinesStructure.forEach((curveLineStructure: CurveTieLinesStructure) => {
      const rootCoords = curveLineStructure.tieStart.getCenterBottomCoords();
      curveLineStructure.middleItems.forEach((state: IStateGroup) => {
        const bottomCoords = state.getCenterTopCoords();
        const straightLine = new MiddleTieLine({
          topCoords: rootCoords,
          bottomCoords,
        });
        this.canvas.add(straightLine);
      });
      curveLineStructure.leftSide.forEach((state: IStateGroup) => {
        const sideStateCoords = state.getCenterTopCoords();
        const leftCurve = new CurveTieLine(CurveTieLineDirection.topToLeft, rootCoords, sideStateCoords);
        this.canvas.add(leftCurve);
      });
      curveLineStructure.rightSide.forEach((state: IStateGroup) => {
        const sideStateCoords = state.getCenterTopCoords();
        const rightCurve = new CurveTieLine(CurveTieLineDirection.topToRight, rootCoords, sideStateCoords);
        this.canvas.add(rightCurve);
      });
    });
  }

  protected drawTieLines(): void {
    return undefined;
  }
}
