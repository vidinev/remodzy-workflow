import { Canvas, IEvent, Object } from 'fabric/fabric-impl';
import { dropAreaSize, leftAngleOffset, stateItemSize, topAngleOffset } from '../configs/size.config';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { IStateGroup } from '../models/interfaces/state.interface';

interface DragDropCallbacks {
  dragStartCallback: (event: IEvent) => void;
  dropCallback: (event: IEvent, dropArea: IDropAreaGroup) => void;
}

export class CanvasEventsService {
  private currentDragTop: number;
  private dragTopDelta: number;
  private dragLeftDelta: number;
  private canvas: Canvas;
  private activeDropArea: IDropAreaGroup | null = null;

  static isDragEventAllowed(target?: Object) {
    return target && target.type === ObjectTypes.state && target.selectable;
  }

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.currentDragTop = 0;
    this.dragTopDelta = 0;
    this.dragLeftDelta = 0;
  }

  setupDropAreaEvents(dropAreas: IDropAreaGroup[]) {
    this.canvas.on('object:moving', (event: IEvent) => {
      this.activeDropArea = null;
      const left = (event.target?.left || 0) + this.dragLeftDelta;
      const top = (event.target?.top || 0) + this.dragTopDelta;
      const right = (event.target?.width || 0) + left;
      const bottom = (event.target?.height || 0) + top;

      const points = [
        {
          x: left + leftAngleOffset,
          y: top - topAngleOffset,
        },
        {
          x: right + leftAngleOffset,
          y: top + topAngleOffset,
        },
        {
          x: right - leftAngleOffset / 2,
          y: bottom + topAngleOffset,
        },
        {
          x: left - leftAngleOffset / 2,
          y: bottom - topAngleOffset,
        },
      ];

      // const polygon = new fabric.Polygon(points, {
      //   left,
      //   top,
      //   objectCaching: false,
      //   transparentCorners: false,
      //   visible: false,
      // });

      for (let i = 0; i < dropAreas.length; i++) {
        const hasIntersect = false;

        const a = fabric.Intersection.intersectPolygonRectangle(
          points.map((point) => new fabric.Point(point.x, point.y)),
          dropAreas[i].getLeft(),
          dropAreas[i].getTop() + dropAreaSize.height,
        );
        console.log(a);
        dropAreas[i].toggleActive(hasIntersect);
        if (hasIntersect) {
          this.activeDropArea = dropAreas[i];
          break;
        }
      }
    });
  }

  setupDragDropEvents(callbacks: DragDropCallbacks) {
    this.canvas.on('mouse:down', (event: IEvent) => {
      if (CanvasEventsService.isDragEventAllowed(event.target)) {
        const state = event?.target as IStateGroup;
        if (state?.data.stateId) {
          this.currentDragTop = state.getTop?.() || 0;
          this.dragTopDelta = state.getTop?.() - state.top;
          this.dragLeftDelta = state.getLeft?.() - state.left;
          callbacks.dragStartCallback(event);
        }
      }
    });
    this.canvas.on('mouse:up', (event: IEvent) => {
      const activeObject = this.canvas.getActiveObject();
      if (CanvasEventsService.isDragEventAllowed(event.target) && activeObject) {
        this.canvas.remove(activeObject);
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
        const left = (event.target.left || 0) + this.dragLeftDelta;
        const top = (event.target.top || 0) + this.dragTopDelta;
        if (left + stateItemSize.width + leftAngleOffset >= this.canvas.width!) {
          event.target.left = this.canvas.width! - stateItemSize.width - leftAngleOffset - this.dragLeftDelta;
        }
        if (left <= leftAngleOffset) {
          event.target.left = leftAngleOffset - this.dragLeftDelta;
        }
        if (top <= topAngleOffset) {
          event.target.top = 0 - this.dragTopDelta;
        }
        if (top + stateItemSize.height + topAngleOffset >= this.canvas.height!) {
          event.target.top = this.canvas.height! - stateItemSize.height - topAngleOffset * 2 - this.dragTopDelta;
        }
      }
    });
  }
}
