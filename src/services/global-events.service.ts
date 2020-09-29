import { Canvas, IEvent, Object } from 'fabric/fabric-impl';
import { leftAngleOffset, stateItemSize, topAngleOffset } from '../configs/size.config';

interface DragDropCallbacks {
  dragStartCallback: (event: IEvent) => void;
  dragEndCallback: (event: IEvent) => void;
}

export class GlobalEventsService {
  private currentDragTop: number;
  private canvas: Canvas;

  static isDragEventAllowed(target?: Object) {
    return target && target.selectable;
  }

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.currentDragTop = 0;
  }

  setupDragDropEvents(callbacks: DragDropCallbacks) {
    this.canvas.on('mouse:down', (event: IEvent) => {
      if (GlobalEventsService.isDragEventAllowed(event.target)) {
        if (event?.target?.data.id) {
          this.currentDragTop = event?.target?.get('top') || 0;
          callbacks.dragStartCallback(event);
        }
      }
    });
    this.canvas.on('mouse:up', (event: IEvent) => {
      if (GlobalEventsService.isDragEventAllowed(event.target)) {
        if (event?.target?.data.id) {
          this.currentDragTop = 0;
          this.canvas.remove(this.canvas.getActiveObject());
          callbacks.dragEndCallback(event);
        }
      }
    });
    this.canvas.on('object:moved', () => {
      this.canvas.remove(this.canvas.getActiveObject());
    });
    this.setupDragOverflowEvents();
  }

  private setupDragOverflowEvents() {
    this.canvas.on('object:moving', (event: IEvent) => {
      if (event.target
        && this.currentDragTop
        && GlobalEventsService.isDragEventAllowed(event.target)) {
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
          left: (event.target.get('left') || 0) + leftAngleOffset
        });
      }
    });
  }

}
