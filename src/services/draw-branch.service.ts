import { WorkflowData } from './workflow-data.service';
import { PointCoords } from '../interfaces/point-coords.interface';
import { IStateGroup } from '../models/interfaces/state.interface';
import { RemodzyWfDirection } from '../interfaces/workflow-settings.interface';
import { marginSize, passStateItemSize, stateItemSize, tieLineSize, tiePointSize } from '../configs/size.config';
import { Canvas, Group, Object as CanvasObject } from 'fabric/fabric-impl';
import { DrawPositionService } from './draw-position.service';
import { StateTypesEnum } from '../configs/state-types.enum';
import { CurveTieLinesStructure } from '../interfaces/curve-tie-lines-structure.interface';
import { MiddleTieLine } from '../models/middle-tie-line.model';
import { CurveTieLine } from '../models/curve-tie-line.model';
import { CurveTieLineDirection } from '../models/configs/curve-tie-line-config';
import { TieLinesService } from './tie-lines.service';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { TieLine } from '../models/tie-line.model';
import { WorkflowState } from '../interfaces/state-language.interface';
import { StateGroup } from '../models/state.model';
import { BranchItems } from '../models/branch-items.model';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';
import { TiePointCircle } from '../models/tie-point.model';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { DropAreaGroup } from '../models/drop-area.model';

export class DrawBranchService {
  private readonly position: PointCoords;
  private tieLines: TieLinesService;
  private states: IStateGroup[] = [];
  constructor(
    private workflowData: WorkflowData,
    private canvas: Canvas,
    // TODO rework to inheritance
    private direction: RemodzyWfDirection = RemodzyWfDirection.vertical,
    private startPosition?: PointCoords,
  ) {
    if (startPosition) {
      this.position = { ...startPosition };
    } else {
      switch (this.direction) {
        case RemodzyWfDirection.horizontal:
          this.position = {
            x: marginSize.horizontalMargin,
            y: Math.round(this.canvas.height! / 2 - stateItemSize.height / 2),
          };
          break;
        default:
          this.position = {
            x: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
            y: marginSize.verticalMargin,
          };
      }
    }
    this.tieLines = new TieLinesService(this.canvas);
  }

  public drawBranch(): IStateGroup[] {
    this.drawStates();
    this.drawTiePoints();
    if (this.direction === RemodzyWfDirection.vertical) {
      this.drawDropAreas();
      this.drawCurveTieLines();
    }
    this.drawTieLines();
    return this.states;
  }

  public drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    const isStart = stateData.Parameters?.stateId === workflowData?.getStartStateId();
    const isEnd = stateData.Parameters?.stateId === this.workflowData.getEndStateId();
    let left = position.x;
    let top = position.y;
    switch (this.direction) {
      case RemodzyWfDirection.horizontal:
        if (stateData.Type === StateTypesEnum.Pass) {
          top += Math.ceil((stateItemSize.height - passStateItemSize.height) / 2);
        }
        break;
    }

    const stateGroup = new StateGroup(
      stateData,
      {
        left,
        top,
        hoverCursor: isStart || isEnd ? 'default' : 'pointer',
        selectable: !(isStart || isEnd),
      },
      isStart,
    );

    this.canvas.add(stateGroup);
    return stateGroup;
  }

  private drawBranches(branches: WorkflowData[], position: PointCoords): BranchItems[] {
    let branchSubItems: BranchItems[] = [];
    switch (this.direction) {
      case RemodzyWfDirection.horizontal:
        const heightForBranches =
          branches.length * (stateItemSize.height + marginSize.verticalMargin) - marginSize.verticalMargin;
        const startY = position.y - Math.ceil(heightForBranches / 2) + Math.ceil(stateItemSize.height / 2);
        for (let i = 0; i < branches.length; i++) {
          const branchWorkflowData = branches[i];
          const drawBranchService = new DrawBranchService(branchWorkflowData, this.canvas, this.direction, {
            y: startY + (stateItemSize.height + marginSize.verticalMargin) * i,
            x: position.x + stateItemSize.width,
          });
          const states = drawBranchService.drawBranch();
          branchSubItems.push(new BranchItems(states, []));
        }
        break;
      default:
        const widthForBranches =
          branches.length * (stateItemSize.width + marginSize.horizontalMargin) - marginSize.horizontalMargin;
        const startX = position.x - widthForBranches / 2 + stateItemSize.width / 2;
        for (let i = 0; i < branches.length; i++) {
          const branchWorkflowData = branches[i];
          const drawBranchService = new DrawBranchService(branchWorkflowData, this.canvas, this.direction, {
            y: position.y + stateItemSize.height + marginSize.stateToBranchMargin,
            x: startX + (stateItemSize.width + marginSize.horizontalMargin) * i,
          });
          const states = drawBranchService.drawBranch();
          const dropAreas = states.map((state: IStateGroup) => state.getDropArea());
          branchSubItems.push(new BranchItems(states, dropAreas));
        }
    }
    return branchSubItems;
  }

  private drawStates(): IStateGroup[] {
    const states: IStateGroup[] = [];
    let currentStateData = this.workflowData.getStartState();
    const drawPosition = new DrawPositionService(this.position);
    while (!currentStateData.End) {
      const { rootState, branchesItemsGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        this.workflowData,
      );

      // TODO refactor (move logic to service)
      switch (this.direction) {
        case RemodzyWfDirection.horizontal:
          const drawPositionRight = branchesItemsGroup
            ? (branchesItemsGroup.left || 0) + (branchesItemsGroup.width || 0) + marginSize.horizontalMargin
            : rootState.getCenterRightCoords().x + marginSize.horizontalMargin;
          drawPosition.setRight(drawPositionRight);
          break;
        default:
          drawPosition.moveBottom(marginSize.verticalMargin + rootState.height + (branchesItemsGroup?.height || 0));
      }

      currentStateData = this.workflowData.getStateById(currentStateData.Next!);
      states.push(rootState);
      branchesItemsGroup?.destroy();
    }
    if (currentStateData.End) {
      const { rootState: endStateGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        this.workflowData
      );
      states.push(endStateGroup);
    }
    this.states = states;
    return states;
  }

  private drawState(
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

  private drawTiePoints() {
    this.states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.data.Type === StateTypesEnum.Pass) {
        return;
      }
      if (!stateGroup.data.Start) {
        // TODO refactor switch
        switch (this.direction) {
          case RemodzyWfDirection.horizontal:
            const rightTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterLeftCoords());
            stateGroup.setLeftTiePoint(rightTiePoint);
            break;
          default:
            const topTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterTopCoords());
            stateGroup.setTopTiePoint(topTiePoint);
        }
      }
      const isMainBranchEnd = stateGroup.data.stateId === this.workflowData.getEndStateId();
      if (!isMainBranchEnd && stateGroup.data.Type) {
        // TODO refactor switch
        switch (this.direction) {
          case RemodzyWfDirection.horizontal:
            const rightTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterRightCoords());
            stateGroup.setRightTiePoint(rightTiePoint);
            break;
          default:
            const bottomTiePoint = this.drawTiePoint(stateGroup.data.stateId, stateGroup.getCenterBottomCoords());
            stateGroup.setBottomTiePoint(bottomTiePoint);
        }
      }
    });
  }

  private drawTiePoint(stateId: string, pointCoords: PointCoords): ITiePointCircle {
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

  private drawDropAreas() {
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

  private drawDropArea(stateId: string, position: PointCoords): IDropAreaGroup {
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

  private drawCurveTieLines() {
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

  private drawTieLines() {
    let tieLinesStructure;
    // TODO switch Refactor - service
    switch (this.direction) {
      case RemodzyWfDirection.horizontal:
        tieLinesStructure = this.tieLines.getHorizontalTieLinesStructure(this.states);
        tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
          const { x: fromTieX } = tieLineStructure.startCoords;
          const { x: toTieX, y } = tieLineStructure.endCoords || { x: null };
          this.canvas.add(
            new TieLine([fromTieX, y, toTieX, y], tieLineSize.margin, tieLineSize.margin, this.direction),
          );
        });
        break;
      default:
        tieLinesStructure = this.tieLines.getTieLinesStructure(this.states);
        tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
          const { x, y: fromTieY } = tieLineStructure.startCoords;
          const { y: toTieY } = tieLineStructure.endCoords || { y: null };
          const { y: toDropY } = tieLineStructure.dropArea!.getCenterTopCoords();
          const { y: fromDropY } = tieLineStructure.dropArea!.getCenterBottomCoords();
          this.canvas.add(new TieLine([x, fromTieY, x, toDropY], tieLineSize.margin, 0, this.direction));
          if (toTieY) {
            this.canvas.add(new TieLine([x, fromDropY, x, toTieY], 0, tieLineSize.margin, this.direction));
          }
        });
    }
  }
}
