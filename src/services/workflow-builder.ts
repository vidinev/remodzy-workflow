import { Canvas, ICanvasOptions, IEvent, Object as CanvasObject } from 'fabric/fabric-impl';
import { RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import {
  canvasConfig,
  dropAreaConfig,
  dropAreaTextConfig,
  stateRectConfig,
  stateTextConfig,
} from '../configs/canvas.config';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawOffsetService } from './draw-offset.service';
import { data } from '../configs/data.config';
import { dropAreaSize, stateItemSize, tiePointSize } from '../configs/size.config';
import { WorkflowState } from '../interfaces/state-language.interface';
import { TieLineStructure } from '../interfaces/tie-lines-structure.interface';
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area.interface';
import { WorkflowDropArea } from 'src/models/drop-area.model'
import { WorkflowTiePoint } from '../models/tie-point.model';
import { WorkflowTieLine } from '../models/tie-line.model';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowData } from './workflow-data.service';
import { TieLinesService } from './tie-lines.service';

/*
 * Create model for state
 * Refactor drop area move logic to constructor
 * Replace drop area data.type to just type
 * Replace state to just type
 * Tie line padding should be configured in model
 * StateKey, stateId, id => stateId
 * Create models folder in interfaces
 * Create separate draw service
 * Test lib basic functionality
 * Merge all js files into one
 */

export class RemodzyWorkflowBuilder {
  private readonly canvas: Canvas;
  private readonly canvasConfig: ICanvasOptions = canvasConfig;
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
        this.drawState(this.workflowData.getStateById(event?.target?.data.id), event?.target?.top || 0);
        this.animate.animateDragDrop(event, 1);
      },
      dropCallback: (event: IEvent, dropArea: WorkflowDropAreaGroup) => {
        if (event.target?.data.id) {
          this.sortObjectsAfterDragAndDrop(dropArea, event.target.data.id);
        }
      },
    });
  }

  private drawState(stateData: WorkflowState, topOffset?: number) {
    const stateContainerObject = new fabric.Rect(stateRectConfig);
    const stateText = stateData.Comment || stateData.Parameters?.taskType || '';
    const stateTextObject = new fabric.Textbox(stateText, stateTextConfig);

    const isStartEnd = stateData.End || stateData.Parameters?.stateKey === this.workflowData.getStartStateId();

    const stateGroup = new fabric.Group([stateContainerObject, stateTextObject], {
      left: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
      top: topOffset || this.drawOffset.getTopOffset(),
      hasControls: false,
      hasBorders: false,
      hoverCursor: isStartEnd ? 'default' : 'pointer',
      selectable: !isStartEnd,
      data: {
        next: stateData.Next,
        end: stateData.End || false,
        type: ObjectTypes.state,
        id: (stateData.Parameters && stateData.Parameters.stateKey) || '',
      },
    });

    this.canvas.add(stateGroup);
    stateGroup.sendToBack();
  }

  private drawDropArea(stateId: number, top: number) {
    const dropArea = new fabric.Rect(dropAreaConfig);
    const dropAreaText = new fabric.Textbox('Drop here', dropAreaTextConfig);
    const dropAreaGroup = new WorkflowDropArea([dropArea, dropAreaText], {
      left: Math.round(this.canvas.width! / 2 - dropAreaSize.width / 2),
      top,
      selectable: false,
      hoverCursor: 'default',
      data: {
        type: ObjectTypes.dropArea,
        stateId,
      },
    });
    this.canvas.add(dropAreaGroup);
  }

  private drawTiePoint(stateId: number, top: number) {
    this.canvas.add(new WorkflowTiePoint({
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
    this.canvas.add(new WorkflowTieLine([fromX, fromY, toX, toY]));
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
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.state && !canvasObject.data.end) {
        const endOfStateTop = canvasObject.top! + canvasObject.height! - 1;
        const dropAreaTop = endOfStateTop + (stateItemSize.margin - dropAreaSize.height) / 2;
        this.drawDropArea(canvasObject.data.id, dropAreaTop);
      }
    });
  }

  private drawTiePoints() {
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.state) {
        const stateTop = (canvasObject.top || 0);
        const tiePointTop = stateTop - tiePointSize.radius;
        const tiePointBottom = tiePointTop + canvasObject.height!;
        if (canvasObject.data.id !== this.workflowData.getStartStateId()) {
          this.drawTiePoint(canvasObject.data.id, tiePointTop);
        }
        if (!canvasObject.data.end) {
          this.drawTiePoint(canvasObject.data.id, tiePointBottom);
        }
      }
    });
  }

  private sortObjectsAfterDragAndDrop(dropArea: WorkflowDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(canvasConfig.backgroundColor, () => this.render());
  }
}
