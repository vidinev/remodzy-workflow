import { Canvas, IEvent, Object } from 'fabric/fabric-impl';
import { leftAngleOffset, stateItemSize, topAngleOffset } from '../configs/size.config';
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area';
import { ObjectTypes } from '../configs/object-types.enum';

interface DragDropCallbacks {
  dragStartCallback: (event: IEvent) => void;
  dropCallback: (event: IEvent, dropArea: WorkflowDropAreaGroup) => void;
}

export class CanvasEventsService {
  private currentDragTop: number;
  private canvas: Canvas;
  private activeDropArea: WorkflowDropAreaGroup|null = null;

  static isDragEventAllowed(target?: Object) {
    return target && target.selectable;
  }

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.currentDragTop = 0;
  }

  setupDropAreaEvents() {
    this.canvas.on('object:moving', (event: IEvent) => {
      this.activeDropArea = null;
      this.canvas.forEachObject((canvasObject: Object) => {
        if (canvasObject.data.type === ObjectTypes.dropArea) {
          const dropArea = canvasObject as WorkflowDropAreaGroup;
          event.target?.setCoords();
          const hasIntersect = Boolean(event.target?.intersectsWithObject(dropArea));
          dropArea.toggleActive(hasIntersect)
          if (hasIntersect) {
            this.activeDropArea = dropArea;
          }
        }
      });
    });
  }

  setupDragDropEvents(callbacks: DragDropCallbacks) {
    this.canvas.on('mouse:down', (event: IEvent) => {
      if (CanvasEventsService.isDragEventAllowed(event.target)) {
        if (event?.target?.data.id) {
          this.currentDragTop = event?.target?.get('top') || 0;
          callbacks.dragStartCallback(event);
        }
      }
    });
    this.canvas.on('object:moved', (event: IEvent) => {
      this.currentDragTop = 0;
      this.canvas.remove(this.canvas.getActiveObject());
      if (this.activeDropArea) {
        callbacks.dropCallback(event, this.activeDropArea);
        this.activeDropArea.toggleActive(false);
        this.activeDropArea = null;
      }
    });
    this.setupDragOverflowEvents();
  }

  private setupDragOverflowEvents() {
    this.canvas.on('object:moving', (event: IEvent) => {
      if (event.target && this.currentDragTop && CanvasEventsService.isDragEventAllowed(event.target)) {
        const { left = 0, top = 0 } = event.target;
        if (left + stateItemSize.width + leftAngleOffset >= this.canvas.width!) {
          event.target.left = this.canvas.width! - stateItemSize.width - leftAngleOffset;
        }
        if (left <= leftAngleOffset) {
          event.target.left = leftAngleOffset;
        }
        if (top <= topAngleOffset) {
          event.target.top = topAngleOffset;
        }
        if (top + stateItemSize.height + topAngleOffset >= this.canvas.height!) {
          event.target.top = this.canvas.height! - stateItemSize.height - topAngleOffset;
        }
        event.target.set({
          top: (event.target.get('top') || 0) - topAngleOffset,
          left: (event.target.get('left') || 0) + leftAngleOffset,
        });
      }
    });
  }
}
