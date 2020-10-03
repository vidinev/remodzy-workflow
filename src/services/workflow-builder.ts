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
import { dropAreaSize, stateItemSize } from '../configs/size.config';
import { WorkflowState } from '../interfaces/state-language.interface';
import { WorkflowDropArea } from 'src/models/drop-area.model';
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area';
import { ObjectTypes } from '../configs/object-types.enum';

/*
 * Fix mutable data
 * Drop basic bounding lines
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

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.setupCanvasEvents();
    this.animate = new AnimateService(this.canvas);
    this.drawOffset = new DrawOffsetService();
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
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        this.drawState(data.States[event?.target?.data.id], event?.target?.top || 0);
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

    const isStartEnd = stateData.End || stateData.Parameters?.stateKey === data.StartAt;

    const stateGroup = new fabric.Group([stateContainerObject, stateTextObject], {
      left: Math.round(this.canvas.width! / 2 - stateItemSize.width / 2),
      top: topOffset || this.drawOffset.getTopOffset(),
      hasControls: false,
      hasBorders: false,
      hoverCursor: isStartEnd ? 'default' : 'pointer',
      selectable: !isStartEnd,
      data: {
        type: ObjectTypes.state,
        id: (stateData.Parameters && stateData.Parameters.stateKey) || '',
      },
    });

    this.canvas.add(stateGroup);
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

  private drawStates() {
    let currentState = data.States[data.StartAt];
    this.drawOffset.setTopOffset(stateItemSize.margin);
    while (!currentState.End) {
      this.drawState(currentState);
      currentState = data.States[currentState.Next!];
      this.drawOffset.addTopOffset(stateItemSize.margin + stateItemSize.height);
    }
    if (currentState.End) {
      this.drawState(currentState);
    }
  }

  private drawDropAreas() {
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.state && !data.States[canvasObject.data.id].End) {
        const endOfStateTop = (canvasObject.top || 0) + (canvasObject.height || 0);
        const dropAreaTop = endOfStateTop + (stateItemSize.margin - dropAreaSize.height) / 2;
        this.drawDropArea(canvasObject.data.id, dropAreaTop);
      }
    });
  }

  private sortObjectsAfterDragAndDrop(dropArea: WorkflowDropAreaGroup, id: string) {
    const stateBeforeDropArea = data.States[dropArea.data.stateId];
    const stateAfterDropArea = data.States[stateBeforeDropArea.Next!];
    const stateDropped = data.States[id];

    if (id === dropArea.data.stateId || id === stateBeforeDropArea.Next) {
      return;
    }

    const stateKeyAfterDroppedState = stateDropped.Next;
    const stateKeyBeforeDropped = Object.keys(data.States).find((key: string) => {
      return data.States[key].Next === stateDropped.Parameters.stateKey;
    });

    if (stateKeyBeforeDropped) {
      const stateBeforeDropped = data.States[stateKeyBeforeDropped];
      stateBeforeDropArea.Next = stateDropped.Parameters.stateKey;
      stateDropped.Next = stateAfterDropArea.Parameters.stateKey;
      stateBeforeDropped.Next = stateKeyAfterDroppedState;
      this.canvas.clear();
      this.canvas.setBackgroundColor(canvasConfig.backgroundColor, () => this.render())
    }
  }
}
