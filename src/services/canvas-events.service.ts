import { Canvas, IEvent, Object, Polygon } from 'fabric/fabric-impl';
import debounce from 'lodash.debounce';
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
  private dropAreasAndPolygons: { area: IDropAreaGroup; polygon: Polygon }[] = [];
  private readonly updateCheckDebounceTime = 100;

  static isDragEventAllowed(target?: Object) {
    return target && target.type === ObjectTypes.state && target.selectable;
  }

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.currentDragTop = 0;
    this.dragTopDelta = 0;
    this.dragLeftDelta = 0;
  }

  initialize(dropAreas: IDropAreaGroup[]) {
    this.dropAreasAndPolygons = this.prepareDropAreaPolygons(dropAreas);
    this.currentDragTop = 0;
    this.dragTopDelta = 0;
    this.dragLeftDelta = 0;
  }

  setupDropAreaEvents() {
    let timeout: number;
    this.canvas.on('object:moving', (event: IEvent) => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(() => {
        if (this.activeDropArea) {
          this.activeDropArea.toggleActive(false);
        }
        this.activeDropArea = null;
        const statePolygon = this.getStatePolygon(event?.target as IStateGroup);
        for (let i = 0; i < this.dropAreasAndPolygons.length; i++) {
          const hasIntersect = statePolygon.intersectsWithObject(this.dropAreasAndPolygons[i].polygon);
          if (hasIntersect) {
            this.activeDropArea = this.dropAreasAndPolygons[i].area as IDropAreaGroup;
            this.activeDropArea.toggleActive(true);
            break;
          }
        }
      });
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
      if (CanvasEventsService.isDragEventAllowed(event.target) && activeObject && !this.canvas.selection) {
        this.canvas.remove(activeObject);
      }
    });
    this.canvas.on(
      'after:render',
      debounce(() => {
        this.dropAreasAndPolygons.forEach(({ area }: any) => {
          if (area.isActive()) {
            if (!this.canvas.getActiveObject()) {
              area.toggleActive(false);
              this.canvas.renderAll();
            }
          }
        });
      }, this.updateCheckDebounceTime),
    );
    this.canvas.on('object:moved', (event: IEvent) => {
      this.currentDragTop = 0;
      if (CanvasEventsService.isDragEventAllowed(event.target)) {
        this.canvas.remove(this.canvas.getActiveObject());
        if (this.activeDropArea) {
          callbacks.dropCallback(event, this.activeDropArea);
          this.activeDropArea.toggleActive(false);
          this.activeDropArea = null;
        }
      }
    });
    this.setupDragOverflowEvents();
  }

  private prepareDropAreaPolygons(dropAreas: IDropAreaGroup[]): { area: IDropAreaGroup; polygon: Polygon }[] {
    return dropAreas.map((dropArea: IDropAreaGroup) => {
      const dropAreaLeft = dropArea.getLeft();
      const dropAreaTop = dropArea.getTop();
      const dropAreaPoints = [
        {
          x: dropAreaLeft,
          y: dropAreaTop,
        },
        {
          x: dropAreaLeft + dropAreaSize.width,
          y: dropAreaTop,
        },
        {
          x: dropAreaLeft + dropAreaSize.width,
          y: dropAreaTop + dropAreaSize.height,
        },
        {
          x: dropAreaLeft,
          y: dropAreaTop + dropAreaSize.height,
        },
      ];
      return {
        area: dropArea,
        polygon: new fabric.Polygon(dropAreaPoints, {
          left: dropAreaLeft,
          top: dropAreaTop,
          objectCaching: false,
          transparentCorners: false,
          visible: false,
        }),
      };
    });
  }

  private getStatePolygon(state?: IStateGroup): Polygon {
    const left = (state?.left || 0) + this.dragLeftDelta;
    const top = (state?.top || 0) + this.dragTopDelta;
    const right = (state?.width || 0) + left;
    const bottom = (state?.height || 0) + top;

    const statePoints = [
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

    return new fabric.Polygon(statePoints, {
      left,
      top,
      objectCaching: false,
      transparentCorners: false,
      visible: false,
    });
  }

  private setupDragOverflowEvents() {
    this.canvas.on('object:moving', (event: IEvent) => {
      if (event.target && this.currentDragTop && CanvasEventsService.isDragEventAllowed(event.target)) {
        const left = (event.target.left || 0) + this.dragLeftDelta;
        const top = (event.target.top || 0) + this.dragTopDelta;
        const leftViewportOffset = this.canvas.viewportTransform?.[4] || 0;
        const topViewportOffset = this.canvas.viewportTransform?.[5] || 0;
        const zoomCoefficient = this.canvas.viewportTransform?.[0] || 1;
        const leftBorder = (leftAngleOffset - leftViewportOffset) / zoomCoefficient;
        const rightBorder =  (this.canvas.width! - leftViewportOffset) / zoomCoefficient;
        const bottomBorder = (this.canvas.height! - topViewportOffset) / zoomCoefficient;
        const topBorder = (0 - topViewportOffset) / zoomCoefficient;
        if (left + stateItemSize.width + leftAngleOffset >= rightBorder) {
          event.target.left = rightBorder - stateItemSize.width - leftAngleOffset - this.dragLeftDelta;
        }
        if (left <= leftBorder) {
          event.target.left = leftBorder - this.dragLeftDelta;
        }
        if (top <= topBorder) {
          event.target.top = topBorder - this.dragTopDelta;
        }
        if (top + stateItemSize.height + topAngleOffset >= bottomBorder) {
          event.target.top = bottomBorder - stateItemSize.height - topAngleOffset * 2 - this.dragTopDelta;
        }
      }
    });
  }
}
