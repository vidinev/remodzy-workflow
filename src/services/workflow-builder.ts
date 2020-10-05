import { Canvas, ICanvasOptions, IEvent, Object as CanvasObject } from 'fabric/fabric-impl';
import { RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import {
  canvasConfig,
  dropAreaConfig,
  dropAreaTextConfig,
  stateRectConfig,
  stateTextConfig,
  tiePointConfig
} from '../configs/canvas.config'
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { DrawOffsetService } from './draw-offset.service';
import { data } from '../configs/data.config';
import { dropAreaSize, stateItemSize, tiePointSize } from '../configs/size.config'
import { WorkflowState } from '../interfaces/state-language.interface';
import { WorkflowDropArea } from 'src/models/drop-area.model';
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowData } from './workflow-data.service';
import { TieLinesService } from './tie-lines.service';

/*
 * Drop basic bounding lines
 * Create separate draw service
 * Test lib basic functionality
 * Merge all js files into one
 * StateKey, stateId, id => stateId
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
    // this.drawTieLines();
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
    const tiePoint = new fabric.Circle({
      ...tiePointConfig,
      left: Math.round(this.canvas.width! / 2 - tiePointSize.radius),
      top,
      data: {
        stateId,
        type: ObjectTypes.tiePoint
      }
    });
    this.canvas.add(tiePoint);
  }

  // private drawTieLines() {
  //   const tieLinesStructure = this.tieLines.getTieLinesStructure();
  //   console.log(tieLinesStructure);
  //   Object.keys(tieLinesStructure).forEach((stateId: string) => {
  //     const fromX = tieLinesStructure[stateId].tieStart.left || 0;
  //     const fromY = tieLinesStructure[stateId].tieStart.top || 0;
  //     const toX = tieLinesStructure[stateId].dropArea.left || 0;
  //     const toY = tieLinesStructure[stateId].dropArea.top || 0;
  //     this.drawTieLine(fromX, fromY, toX, toY);
  //   });
  // }

  // private drawTieLine(fromX: number, fromY: number, toX: number, toY: number) {
  //   const fabricLine = new fabric.Line([fromX, fromY, toX, toY], {
  //     fill: remodzyColors.tieLineColor,
  //     stroke:  remodzyColors.tieLineColor,
  //     strokeWidth: 1,
  //     selectable: false,
  //     evented: false,
  //   });
  //   this.canvas.add(fabricLine);
  // }

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
        const endOfStateTop = (canvasObject.top || 0) + (canvasObject.height || 0);
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
        const tiePointBottom = tiePointTop + (canvasObject.height || 0);
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
