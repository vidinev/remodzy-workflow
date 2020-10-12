import { Canvas, ICanvasOptions, IEvent } from 'fabric/fabric-impl';
import { RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawPositionService } from './draw-position.service';
import { data } from '../configs/data.config';
import { canvasSize, stateItemSize, tiePointSize } from '../configs/size.config';
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

/*
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
  private readonly manropeFont: FontFaceObserver = new FontFaceObserver('Manrope');
  private canvasEvents: CanvasEventsService;
  private animate: AnimateService;
  private tieLines: TieLinesService;
  private workflowData: WorkflowData;

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.workflowData = new WorkflowData(data);
    this.animate = new AnimateService(this.canvas);
    this.tieLines = new TieLinesService(this.canvas);
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
      x: Math.round(this.canvas.width! / 2),
      y: stateItemSize.verticalMargin
    };
    this.drawBranch(initialBranchPosition);
  }

  private drawBranch(startPosition: PointCoords) {
    const states = this.drawStates(startPosition);
    this.drawDropAreas(states);
    this.drawTiePoints(states);
    this.drawTieLines(states);
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

  private drawState(stateData: WorkflowState, position: PointCoords, isClone?: boolean): IStateGroup {
    const isStartEnd = stateData.End || stateData.Parameters?.stateId === this.workflowData.getStartStateId();

    if (stateData.Branches && stateData.Branches.length) {
      const widthForBranches = stateData.Branches.length
        * (stateItemSize.width + stateItemSize.horizontalMargin) - stateItemSize.horizontalMargin;
    }

    const stateGroup = new StateGroup(stateData, {
      left: position.x,
      top: position.y,
      hoverCursor: isStartEnd ? 'default' : 'pointer',
      selectable: !isStartEnd,
    });

    this.canvas.add(stateGroup);
    if (!isClone) {
      stateGroup.set('left', Math.round(stateGroup.left - stateGroup.width / 2));
    }
    return stateGroup;
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

  private drawTieLine(fromX: number, fromY: number, toX: number, toY: number) {
    this.canvas.add(new TieLine([fromX, fromY, toX, toY]));
  }

  private drawStates(startPosition: PointCoords): IStateGroup[] {
    const states: IStateGroup[] = [];
    let currentStateData = this.workflowData.getStartState();
    const drawPosition = new DrawPositionService(startPosition);
    while (!currentStateData.End) {
      const stateGroup = this.drawState(currentStateData, drawPosition.getCurrentPosition());
      currentStateData = this.workflowData.getStateById(currentStateData.Next!);
      drawPosition.moveBottom(stateItemSize.verticalMargin + stateGroup.height);
      states.push(stateGroup);
    }
    if (currentStateData.End) {
      const endStateGroup = this.drawState(currentStateData, drawPosition.getCurrentPosition());
      states.push(endStateGroup);
    }
    return states;
  }

  private drawDropAreas(states: IStateGroup[]) {
    states.forEach((stateGroup: IStateGroup) => {
      if (!stateGroup.data.End) {
        const { x: stateLeft,  y: stateBottom } = stateGroup.getCenterBottomCoords();
        const dropAreaTop = stateBottom + stateItemSize.verticalMargin / 2;
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
      if (stateGroup.data.stateId !== this.workflowData.getStartStateId()) {
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
    const stateGroup = this.drawState(movingState.getStateData(), {
      y: movingState.top,
      x: movingState.left
    }, true);
    stateGroup.sendToBack();
  }

  private sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => this.render());
  }
}
