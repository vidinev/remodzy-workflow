import { Canvas, ICanvasOptions, IEvent } from 'fabric/fabric-impl';
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
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area'

/*
 * Fix drop (without changes, element disappears)
 * Drop basic bounding lines
 * Use main state object to keep info about all canvas objects
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
  private dropAreas: WorkflowDropAreaGroup[] = [];

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.setupCanvasEvents();
    this.animate = new AnimateService(this.canvas);
    this.drawOffset = new DrawOffsetService();
    this.render().then(() => {
      this.canvasEvents.setupDropAreaEvents(this.dropAreas);
    });
  }

  public async render() {
    await this.manropeFont.load();
    let currentState = data.States[data.StartAt];
    this.drawOffset.setTopOffset(stateItemSize.margin);
    while (!currentState.End) {
      this.drawState(currentState);
      this.drawDropArea(currentState);
      currentState = data.States[currentState.Next!];
      this.drawOffset.addTopOffset(stateItemSize.margin + stateItemSize.height);
    }
    if (currentState.End) {
      this.drawState(currentState);
    }
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        this.drawState(data.States[event?.target?.data.id], event?.target?.top || 0);
        this.animate.animateDragDrop(event, 1);
      },
      dropCallback: (event: IEvent, dropArea: WorkflowDropAreaGroup) => {
        if (event.target?.data.id) {
          const stateBeforeDropArea = data.States[dropArea.data.stateId];
          const stateAfterDropArea = data.States[stateBeforeDropArea.Next!];
          const stateDropped = data.States[event.target.data.id];

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
            this.canvas.setBackgroundColor(canvasConfig.backgroundColor, async () => {
              await this.render();
            })
          }
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
        id: (stateData.Parameters && stateData.Parameters.stateKey) || '',
      },
    });

    this.canvas.add(stateGroup);
  }

  private drawDropArea(stateData: WorkflowState) {
    const currentDrawOffset = this.drawOffset.getTopOffset();
    const dropAreaOffset = currentDrawOffset + stateItemSize.height + stateItemSize.margin / 2;
    const centeredOffset = dropAreaOffset - dropAreaSize.height / 2;
    const dropArea = new fabric.Rect(dropAreaConfig);

    const dropAreaText = new fabric.Textbox('Drop here', dropAreaTextConfig);

    const dropAreaGroup = new WorkflowDropArea([dropArea, dropAreaText], {
      left: Math.round(this.canvas.width! / 2 - dropAreaSize.width / 2),
      top: centeredOffset,
      selectable: false,
      hoverCursor: 'default',
      data: {
        stateId: (stateData.Parameters && stateData.Parameters.stateKey) || '',
      },
    });
    this.dropAreas.push(dropAreaGroup);
    this.canvas.add(dropAreaGroup);
  }
}
