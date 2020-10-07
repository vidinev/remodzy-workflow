import { Canvas, ICanvasOptions, IEvent } from 'fabric/fabric-impl';
import { RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawOffsetService } from './draw-offset.service';
import { data } from '../configs/data.config';
import { canvasSize, dropAreaSize, stateItemSize, tiePointSize } from '../configs/size.config';
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
import { UtilsService } from './utils.service';
import { remodzyColors } from '../configs/colors.config';

/*
 * Tie line padding should be configured in model
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
  private drawOffset: DrawOffsetService;
  private tieLines: TieLinesService;
  private workflowData: WorkflowData;

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.workflowData = new WorkflowData(data);
    this.animate = new AnimateService(this.canvas);
    this.tieLines = new TieLinesService(this.canvas);
    this.drawOffset = new DrawOffsetService();
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
    this.drawStates();
    this.drawDropAreas();
    this.drawTiePoints();
    this.drawTieLines();
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        this.drawState(this.workflowData.getStateById(event?.target?.data.stateId), event?.target?.top || 0);
        this.animate.animateDragDrop(event, 1);
      },
      dropCallback: (event: IEvent, dropArea: IDropAreaGroup) => {
        if (event.target?.data.stateId) {
          this.sortObjectsAfterDragAndDrop(dropArea, event.target.data.stateId);
        }
      },
    });
  }

  private drawState(stateData: WorkflowState, topOffset?: number) {
    const isStartEnd = stateData.End || stateData.Parameters?.stateId === this.workflowData.getStartStateId();

    const stateGroup = new StateGroup(stateData, {
      left: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
      top: topOffset || this.drawOffset.getTopOffset(),
      hoverCursor: isStartEnd ? 'default' : 'pointer',
      selectable: !isStartEnd,
    });

    this.canvas.add(stateGroup);
    stateGroup.sendToBack();
  }

  private drawDropArea(stateId: string, top: number) {
    const dropAreaGroup = new DropAreaGroup({
      left: Math.round(this.canvas.width! / 2 - dropAreaSize.width / 2),
      top,
      data: {
        stateId,
      }
    });
    this.canvas.add(dropAreaGroup);
  }

  private drawTiePoint(stateId: string, top: number) {
    this.canvas.add(new TiePointCircle({
      top,
      left: Math.round((this.canvas.width || 0) / 2 - tiePointSize.radius),
      data: {
        stateId
      }
    }));
  }

  private drawTieLines() {
    const tieLinesStructure = this.tieLines.getTieLinesStructure();
    tieLinesStructure.forEach((tieLineStructure: TieLineStructure) => {
      const { x, y: fromTieY } = tieLineStructure.tieStart.getCenterBottomCoords();
      const { y: toTieY } = tieLineStructure.tieEnd.getCenterTopCoords();
      const { y: toDropY } = tieLineStructure.dropArea.getCenterTopCoords();
      const { y: fromDropY } = tieLineStructure.dropArea.getCenterBottomCoords();
      this.drawTieLine(x, fromTieY, x, toDropY);
      this.drawTieLine(x, fromDropY, x, toTieY);
    })
  }

  private drawTieLine(fromX: number, fromY: number, toX: number, toY: number) {
    this.canvas.add(new TieLine([fromX, fromY, toX, toY]));
  }

  private drawStates() {
    let currentState = this.workflowData.getStartState();
    this.drawOffset.setTopOffset(stateItemSize.margin);
    while (!currentState.End) {
      this.drawState(currentState);
      currentState = this.workflowData.getStateById(currentState.Next!);
      this.drawOffset.addTopOffset(stateItemSize.margin + stateItemSize.height);
    }
    if (currentState.End) {
      this.drawState(currentState);
    }
  }

  private drawDropAreas() {
    UtilsService.forEachState(this.canvas, (canvasObject: IStateGroup) => {
      if (!canvasObject.data.End) {
        const { y: stateBottom } = canvasObject.getCenterBottomCoords();
        const dropAreaTop = stateBottom + (stateItemSize.margin - dropAreaSize.height) / 2;
        this.drawDropArea(canvasObject.data.stateId, dropAreaTop);
      }
    })
  }

  private drawTiePoints() {
    UtilsService.forEachState(this.canvas, (canvasObject: IStateGroup) => {
      const stateTop = (canvasObject.top || 0);
      const tiePointTop = stateTop - tiePointSize.radius;
      const tiePointBottom = tiePointTop + canvasObject.height!;
      if (canvasObject.data.stateId !== this.workflowData.getStartStateId()) {
        this.drawTiePoint(canvasObject.data.stateId, tiePointTop);
      }
      if (!canvasObject.data.End) {
        this.drawTiePoint(canvasObject.data.stateId, tiePointBottom);
      }
    })
  }

  private sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => this.render());
  }
}
