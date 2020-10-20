import { Canvas, Group, ICanvasOptions, IEvent, Object as CanvasObject } from 'fabric/fabric-impl';
import { RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawPositionService } from './draw-position.service';
import { data } from '../configs/data.config';
import { canvasSize, marginSize, stateItemSize, tiePointSize } from '../configs/size.config';
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
import { CurveTieLine } from '../models/curve-tie-line.model';
import { curvesPath } from '../models/configs/curve-tie-line-config';

/*
 * Draw all branch element (drop areas, lines)
 * Draw branch service
 * Test lib basic functionality
 * Merge all js files into one
 */

export class RemodzyWorkflowBuilder {
  private readonly canvas: Canvas;
  private readonly canvasConfig: ICanvasOptions = {
    ...canvasSize,
    selection: false,
    backgroundColor: remodzyColors.canvasBg
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
    this.workflowData = new WorkflowData(data);
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
    const initialBranchPosition = {
      x: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
      y: marginSize.verticalMargin
    };
    this.drawBranch(this.workflowData, initialBranchPosition);
  }

  private drawBranch(data: WorkflowData, startPosition: PointCoords): IStateGroup[] {
    const states = this.drawStates(data, startPosition);
    this.drawDropAreas(states);
    this.drawTiePoints(states);
    this.drawTieLines(states);
    this.drawCurveTieLines(states);
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

  private drawState(stateData: WorkflowState,
                    position: PointCoords,
                    workflowData: WorkflowData): { rootState: IStateGroup; branchesItemsGroup?: Group } {
    let branchesItemsGroup;
    const rootState = this.drawStateRoot(stateData, position, workflowData);
    if (stateData.BranchesData?.length) {
      branchesItemsGroup = this.drawBranches(stateData.BranchesData, position);
    }
    return { branchesItemsGroup, rootState };
  }

  private drawStateRoot(stateData: WorkflowState, position: PointCoords, workflowData?: WorkflowData): IStateGroup {
    const isStart = stateData.Parameters?.stateId === workflowData?.getStartStateId();
    const stateGroup = new StateGroup(stateData, {
      left: position.x,
      top: position.y,
      hoverCursor: (isStart || stateData.End) ? 'default' : 'pointer',
      selectable: !(isStart || stateData.End),
    }, isStart);

    this.canvas.add(stateGroup);
    return stateGroup;
  }

  private drawBranches(branches: WorkflowData[], position: PointCoords): Group {
    const widthForBranches = branches.length
      * (stateItemSize.width + marginSize.horizontalMargin) - marginSize.horizontalMargin;
    const startX = position.x - widthForBranches / 2 + stateItemSize.width / 2;

    let branchSubItems: CanvasObject[] = [];
    for (let i = 0; i < branches.length; i++) {
      const branchWorkflowData = branches[i];
      const states = this.drawBranch(branchWorkflowData, {
        y: position.y + stateItemSize.height + marginSize.stateToBranchMargin,
        x: startX + (stateItemSize.width + marginSize.horizontalMargin) * i
      });
      const dropAreas = states.map((state: IStateGroup) => state.getDropArea());
      branchSubItems = [...branchSubItems, ...states, ...dropAreas];
    }
    return new fabric.Group(branchSubItems);
  }


  private drawDropArea(stateId: string, position: PointCoords): IDropAreaGroup {
    const dropAreaGroup = new DropAreaGroup({
      left: position.x,
      top: position.y,
      data: {
        stateId,
      }
    });
    this.canvas.add(dropAreaGroup);
    dropAreaGroup.set({
      left: Math.round(dropAreaGroup.left - dropAreaGroup.width / 2),
      top: Math.round(dropAreaGroup.top - dropAreaGroup.height / 2)
    });
    return dropAreaGroup;
  }

  private drawTiePoint(stateId: string, top: number): ITiePointCircle {
    const tiePoint = new TiePointCircle({
      top,
      left: Math.round((this.canvas.width || 0) / 2 - tiePointSize.radius),
      data: {
        stateId
      }
    });
    this.canvas.add(tiePoint);
    return tiePoint;
  }

  private drawTieLines(states: IStateGroup[]) {
    const tieLinesStructure = this.tieLines.getTieLinesStructure(states);
    tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
      const { x, y: fromTieY } = tieLineStructure.tieStart.getCenterBottomCoords();
      const { y: toTieY } = tieLineStructure.tieEnd.getCenterTopCoords();
      const { y: toDropY } = tieLineStructure.dropArea.getCenterTopCoords();
      const { y: fromDropY } = tieLineStructure.dropArea.getCenterBottomCoords();
      this.drawTieLine(x, fromTieY, x, toDropY);
      this.drawTieLine(x, fromDropY, x, toTieY);
    });
  }

  private drawCurveTieLines(states: IStateGroup[]) {
    states.forEach((state: IStateGroup) => {
      if (state.data.Branches && state.data.Branches.length) {
        const tieEnd = state.getBottomTiePoint();
        const coords = tieEnd.getCenterBottomCoords();
        const curve1 = new CurveTieLine(curvesPath.topToLeft, {
          left: coords.x - 15,
          top: coords.y
        });
        const curve2 = new CurveTieLine(curvesPath.topToRight, {
          left: coords.x,
          top: coords.y
        });
        this.canvas.add(curve1, curve2);
      }
    });
  }

  private drawTieLine(fromX: number, fromY: number, toX: number, toY: number) {
    this.canvas.add(new TieLine([fromX, fromY, toX, toY]));
  }

  private drawStates(workflowData: WorkflowData, startPosition: PointCoords): IStateGroup[] {
    const states: IStateGroup[] = [];
    let currentStateData = workflowData.getStartState();
    const drawPosition = new DrawPositionService(startPosition);
    while (!currentStateData.End) {
      const { rootState, branchesItemsGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        workflowData
      );
      drawPosition.moveBottom(marginSize.verticalMargin + rootState.height + (branchesItemsGroup?.height || 0));
      currentStateData = workflowData.getStateById(currentStateData.Next!);
      states.push(rootState);
      branchesItemsGroup?.destroy();
    }
    if (currentStateData.End) {
      const { rootState: endStateGroup } = this.drawState(
        currentStateData,
        drawPosition.getCurrentPosition(),
        workflowData
      );
      states.push(endStateGroup);
    }
    return states;
  }

  private drawDropAreas(states: IStateGroup[]) {
    states.forEach((stateGroup: IStateGroup) => {
      const isMainBranchEnd = stateGroup.data.stateId ===  this.workflowData.getEndStateId();
      if (!isMainBranchEnd && !stateGroup.isBranchRoot()) {
        const { x: stateLeft,  y: stateBottom } = stateGroup.getCenterBottomCoords();
        const dropAreaTop = stateBottom + marginSize.verticalMargin / 2;
        const dropAreaGroup = this.drawDropArea(stateGroup.data.stateId, {
          x: stateLeft,
          y: dropAreaTop
        });
        stateGroup.setDropArea(dropAreaGroup);
      }
    });
  }

  private drawTiePoints(states: IStateGroup[]) {
    states.forEach((stateGroup: IStateGroup) => {
      const stateTop = (stateGroup.top || 0);
      const tiePointTopPosition = stateTop - tiePointSize.radius;
      const tiePointBottomPosition = tiePointTopPosition + stateGroup.height;
      if (!stateGroup.data.Start) {
        const topTiePoint = this.drawTiePoint(stateGroup.data.stateId, tiePointTopPosition);
        stateGroup.setTopTiePoint(topTiePoint);
      }
      if (!stateGroup.data.End) {
        const bottomTiePoint = this.drawTiePoint(stateGroup.data.stateId, tiePointBottomPosition);
        stateGroup.setBottomTiePoint(bottomTiePoint);
      }
    });
  }

  private drawStateCloneUnderMovingObject(movingState: IStateGroup) {
    const stateGroup = this.drawStateRoot(movingState.getStateData(), {
      y: movingState.top,
      x: movingState.left
    });
    stateGroup.sendToBack();
  }

  private sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => this.render());
  }
}
