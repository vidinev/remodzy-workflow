import { Canvas, Group, ICanvasOptions, IEvent, Object as CanvasObject } from 'fabric/fabric-impl';
import { RemodzyWfDirection, RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawPositionService } from './draw-position.service';
import {
  canvasSize,
  marginSize,
  passStateItemSize,
  stateItemSize,
  tieLineSize,
  tiePointSize,
} from '../configs/size.config';
import { WorkflowState } from '../interfaces/state-language.interface';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { DropAreaGroup } from 'src/models/drop-area.model';
import { TiePointCircle } from '../models/tie-point.model';
import { StateGroup } from '../models/state.model';
import { TieLine } from '../models/tie-line.model';
import { WorkflowData } from './workflow-data.service';
import { TieLinesService } from './tie-lines.service';
import { IStateGroup } from '../models/interfaces/state.interface';
import { remodzyColors } from '../configs/colors.config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ITiePointCircle } from '../models/interfaces/tie-point.interface';
import { CurveTieLineDirection } from '../models/configs/curve-tie-line-config';
import { BranchItems } from '../models/branch-items.model';
import { CurveTieLinesStructure } from '../interfaces/curve-tie-lines-structure.interface';
import { CurveTieLine } from 'src/models/curve-tie-line.model';
import { MiddleTieLine } from 'src/models/middle-tie-line.model';
import { StateTypesEnum } from '../configs/state-types.enum';

/*
 * Drop area at the bottom of the branch (dev/1.jpg)
 * Draw all branch elements (bottom curves, missing tie lines)
 * Fix 2 drop area highlight at the same time
 * Fix drag and drop for 2 level
 * Add some branch inside branch, improve calculating to support all levels of inheritance.
 * Fix  drag and drop, and sorting between levels
 * Refactor OOP - Draw branch service
 * Test lib basic functionality
 * Merge all js files into one
 *
 * Set simple state instead pass state in branches ?
 * Set simple state in root branch ?
 */

export class RemodzyWorkflowBuilder {
  private readonly canvas: Canvas;
  private readonly canvasConfig: ICanvasOptions = {
    ...canvasSize,
    selection: false,
    backgroundColor: remodzyColors.canvasBg,
  };
  private readonly workflowSettings: Partial<RemodzyWFSettings> = {
    direction: RemodzyWfDirection.vertical,
  };
  private canvasEvents: CanvasEventsService;
  private animate: AnimateService;
  private tieLines: TieLinesService;
  private readonly workflowData: WorkflowData;
  private readonly manropeFont: FontFaceObserver = new FontFaceObserver('Manrope');

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.animate = new AnimateService(this.canvas);
    this.tieLines = new TieLinesService(this.canvas);
    this.workflowData = new WorkflowData(settings.data);
    const { data, ...workflowSettings } = settings;
    this.workflowSettings = {
      ...this.workflowSettings,
      ...workflowSettings,
    };
    this.setupCanvasEvents();
    this.initialize().then(() => {
      this.canvasEvents.setupDropAreaEvents();
    });
  }

  public async initialize() {
    await this.manropeFont.load();
    this.render();
  }

  public render() {
    let initialBranchPosition;

    // TODO get initial branch position from service
    switch (this.workflowSettings.direction) {
      case RemodzyWfDirection.horizontal:
        initialBranchPosition = {
          x: marginSize.horizontalMargin,
          y: Math.round(this.canvas.height! / 2 - stateItemSize.height / 2),
        };
        break;
      default:
        initialBranchPosition = {
          x: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
          y: marginSize.verticalMargin,
        };
    }

    this.drawBranch(this.workflowData, initialBranchPosition);
  }

  private drawBranch(data: WorkflowData, startPosition: PointCoords): IStateGroup[] {
    const states = this.drawStates(data, startPosition);
    this.drawTiePoints(states);
    this.drawTieLines(states);
    if (this.workflowSettings.direction === RemodzyWfDirection.vertical) {
      this.drawDropAreas(states);
      this.drawCurveTieLines(states);
    }
    return states;
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        if (event.target) {
          this.drawStateCloneUnderMovingObject(event.target as IStateGroup);
          this.animate.animateDragDrop(event, 1);
        }
      },
      dropCallback: (event: IEvent, dropArea: IDropAreaGroup) => {
        if (event.target?.data.stateId) {
          this.sortObjectsAfterDragAndDrop(dropArea, event.target.data.stateId);
        }
      },
    });
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

  private drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    const isStart = stateData.Parameters?.stateId === workflowData?.getStartStateId();
    const isEnd = stateData.Parameters?.stateId === this.workflowData.getEndStateId();
    let left = position.x;
    let top = position.y;
    switch (this.workflowSettings.direction) {
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
    switch (this.workflowSettings.direction) {
      case RemodzyWfDirection.horizontal:
        const heightForBranches =
          branches.length * (stateItemSize.height + marginSize.verticalMargin) - marginSize.verticalMargin;
        const startY = position.y - Math.ceil(heightForBranches / 2) + Math.ceil(stateItemSize.height / 2);
        for (let i = 0; i < branches.length; i++) {
          const branchWorkflowData = branches[i];
          const states = this.drawBranch(branchWorkflowData, {
            y: startY + (stateItemSize.height + marginSize.verticalMargin) * i,
            x: position.x + stateItemSize.width
          });
          branchSubItems.push(new BranchItems(states, []));
        }
        break;
      default:
        const widthForBranches =
          branches.length * (stateItemSize.width + marginSize.horizontalMargin) - marginSize.horizontalMargin;
        const startX = position.x - widthForBranches / 2 + stateItemSize.width / 2;
        for (let i = 0; i < branches.length; i++) {
          const branchWorkflowData = branches[i];
          const states = this.drawBranch(branchWorkflowData, {
            y: position.y + stateItemSize.height + marginSize.stateToBranchMargin,
            x: startX + (stateItemSize.width + marginSize.horizontalMargin) * i,
          });
          const dropAreas = states.map((state: IStateGroup) => state.getDropArea());
          branchSubItems.push(new BranchItems(states, dropAreas));
        }
    }
    return branchSubItems;
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

  private drawTieLines(states: IStateGroup[]) {
    let tieLinesStructure;
    // TODO switch Refactor - service
    switch (this.workflowSettings.direction) {
      case RemodzyWfDirection.horizontal:
        tieLinesStructure = this.tieLines.getHorizontalTieLinesStructure(states);
        tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
          const { x: fromTieX } = tieLineStructure.startCoords;
          const { x: toTieX, y } = tieLineStructure.endCoords || { x: null };
          this.canvas.add(new TieLine([fromTieX, y, toTieX, y], tieLineSize.margin, 0));
        });
        break;
      default:
        tieLinesStructure = this.tieLines.getTieLinesStructure(states);
        tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
          const { x, y: fromTieY } = tieLineStructure.startCoords;
          const { y: toTieY } = tieLineStructure.endCoords || { y: null };
          const { y: toDropY } = tieLineStructure.dropArea!.getCenterTopCoords();
          const { y: fromDropY } = tieLineStructure.dropArea!.getCenterBottomCoords();
          this.canvas.add(new TieLine([x, fromTieY, x, toDropY], tieLineSize.margin, 0));
          if (toTieY) {
            this.canvas.add(new TieLine([x, fromDropY, x, toTieY], 0));
          }
        });
    }
  }

  private drawCurveTieLines(states: IStateGroup[]) {
    const curveTieLinesStructure = this.tieLines.getCurveTieLinesStructure(states);
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

  private drawStates(workflowData: WorkflowData, startPosition: PointCoords): IStateGroup[] {
    const states: IStateGroup[] = [];
    let currentStateData = workflowData.getStartState();
    const drawPosition = new DrawPositionService(startPosition);
    while (!currentStateData.End) {
      const { rootState, branchesItemsGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        workflowData,
      );

      // TODO refactor (move logic to service)
      switch (this.workflowSettings.direction) {
        case RemodzyWfDirection.horizontal:
          const drawPositionRight = branchesItemsGroup
            ? ((branchesItemsGroup.left || 0) + (branchesItemsGroup.width || 0)) + marginSize.horizontalMargin
            : rootState.getCenterRightCoords().x + marginSize.horizontalMargin
          drawPosition.setRight(drawPositionRight);
          break;
        default:
          drawPosition.moveBottom(marginSize.verticalMargin + rootState.height + (branchesItemsGroup?.height || 0));
      }

      currentStateData = workflowData.getStateById(currentStateData.Next!);
      states.push(rootState);
      branchesItemsGroup?.destroy();
    }
    if (currentStateData.End) {
      const { rootState: endStateGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        workflowData,
      );
      states.push(endStateGroup);
    }
    return states;
  }

  private drawDropAreas(states: IStateGroup[]) {
    states.forEach((stateGroup: IStateGroup) => {
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

  private drawTiePoints(states: IStateGroup[]) {
    states.forEach((stateGroup: IStateGroup) => {
      if (stateGroup.data.Type === StateTypesEnum.Pass) {
        return;
      }
      if (!stateGroup.data.Start) {
        // TODO refactor switch
        switch (this.workflowSettings.direction) {
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
        switch (this.workflowSettings.direction) {
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

  private drawStateCloneUnderMovingObject(movingState: IStateGroup) {
    const stateGroup = this.drawStateRoot(movingState.getStateData(), {
      y: movingState.top,
      x: movingState.left,
    });
    stateGroup.sendToBack();
  }

  private sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => this.render());
  }
}
