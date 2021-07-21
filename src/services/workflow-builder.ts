import { Canvas, ICanvasOptions, IEvent, Point } from 'fabric/fabric-impl';
import { RemodzyWfDirection, RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { canvasSize, scrollBarPadding } from '../configs/size.config';
import { IDropAreaGroup } from '../models/interfaces/drop-area.interface';
import { WorkflowData } from './workflow-data.service';
import { TieLinesService } from './tie-lines/tie-lines.service';
import { IStateGroup } from '../models/interfaces/state.interface';
import { remodzyColors } from '../configs/colors.config';
import { DrawBranchService } from './draw-branch/draw-branch.service';
import { DrawBranchFactoryService } from './draw-branch/draw-branch-factory.service';
import { TieLinesFactoryService } from './tie-lines/tie-lines-factory.service';
import { WorkflowDimensions } from '../models/interfaces/workflow dimentions.interface';
import { tick } from './tick.service';
import {
  horizontalScrollBarClass,
  verticalScrollBarClass,
} from '../configs/scroll-bar.config';

/*
 * Fix drag drop, sorting
 * Disable canvas selection
 * Refactor, move functions to services
 * Correct size for bars, depending on canvas size
 * horizontal scroll

 * Scroll canvas by drag method (when space is hold)

 * Merge all js files into one
 * Test lib basic functionality
 * es5 -> es modules
 *
 */

export class RemodzyWorkflowBuilder {
  public isDragging: boolean = false;
  public lastPosX: number = 0;
  public lastPosY: number = 0;
  private readonly canvas: Canvas;
  private readonly canvasConfig: ICanvasOptions = {
    ...canvasSize,
    selection: false,
    imageSmoothingEnabled: false,
    renderOnAddRemove: false,
    backgroundColor: remodzyColors.canvasBg,
  };
  private readonly workflowSettings: Partial<RemodzyWFSettings> = {
    direction: RemodzyWfDirection.vertical,
  };
  private canvasEvents: CanvasEventsService;
  private animate: AnimateService;
  private tieLines: TieLinesService;
  private drawBranchService: DrawBranchService;
  private readonly canvasDimensions: WorkflowDimensions;
  private readonly workflowData: WorkflowData;
  private readonly manropeFont: FontFaceObserver = new FontFaceObserver('Manrope');

  constructor(settings: RemodzyWFSettings) {
    this.canvas = new fabric.Canvas(settings.elementId, this.canvasConfig);
    this.canvasEvents = new CanvasEventsService(this.canvas);
    this.animate = new AnimateService(this.canvas);
    const tieLinesFactory = new TieLinesFactoryService(this.canvas);
    this.tieLines = tieLinesFactory.getTieLinesService(this.workflowSettings.direction);
    this.workflowData = new WorkflowData(settings.data);
    const { data, ...workflowSettings } = settings;
    this.workflowSettings = {
      ...this.workflowSettings,
      ...workflowSettings,
    };

    this.canvasDimensions = this.getCanvasDimensions();
    this.canvas.setDimensions({
      width: 1000,
      height: 800,
    });

    this.scrollBars();

    const drawBranchFactory = new DrawBranchFactoryService(
      this.workflowData,
      this.canvas,
      { draft: false },
      this.canvasDimensions,
    );
    this.drawBranchService = drawBranchFactory.getDrawBranchService(this.workflowSettings.direction);
    this.setupCanvasEvents();
    this.initialize().then(() => {
      const dropAreas = this.drawBranchService.getDropAreas();
      this.canvasEvents.initialize(dropAreas);
    });

    this.canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (evt.altKey) {
        this.isDragging = true;
        this.canvas.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (this.isDragging) {
        const e = opt.e as MouseEvent;
        let vpt = this.canvas.viewportTransform!;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.canvas.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', () => {
      this.canvas.setViewportTransform(this.canvas.viewportTransform!);
      this.isDragging = false;
      this.canvas.selection = true;
    });
    this.canvas.on('mouse:wheel', (opt: IEvent) => {
      const event = opt.e as WheelEvent;
      let delta = event.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) {
        zoom = 20;
      }
      if (zoom < 0.01) {
        zoom = 0.01;
      }
      this.canvas.zoomToPoint({ x: event.offsetX, y: event.offsetY } as Point, zoom);
      this.canvas.requestRenderAll();
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  public async initialize() {
    await this.manropeFont.load();
    this.drawBranchService.drawBranch();
    this.canvas.requestRenderAll();
  }

  private scrollBars() {
    const canvasWrapper = this.canvas.getElement().parentElement;
    const horizontalScrollBar = document.createElement('div');
    const verticalScrollBar = document.createElement('div');
    horizontalScrollBar.className = horizontalScrollBarClass;
    verticalScrollBar.className = verticalScrollBarClass;
    if (canvasWrapper) {
      canvasWrapper.appendChild(horizontalScrollBar);
      canvasWrapper.appendChild(verticalScrollBar);
      this.dragElement(canvasWrapper, this.canvas, false);
      this.dragElement(canvasWrapper, this.canvas, true);
    }
  }

  private getCanvasDimensions(): WorkflowDimensions {
    const virtualCanvas = new fabric.Canvas(null);
    const drawBranchFactory = new DrawBranchFactoryService(this.workflowData, virtualCanvas, { draft: true });
    const service = drawBranchFactory.getDrawBranchService(this.workflowSettings.direction);
    service.drawBranch();
    return service.getBranchDimensions();
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDropAreaEvents();
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        if (event.target) {
          this.drawStateCloneUnderMovingObject(event.target as IStateGroup);
          this.animate.animateDragDrop(event, 1);
        }
      },
      dropCallback: async (event: IEvent, dropArea: IDropAreaGroup) => {
        if (event.target?.data.stateId) {
          await this.sortObjectsAfterDragAndDrop(dropArea, event.target.data.stateId);
        }
      },
    });
  }

  private drawStateCloneUnderMovingObject(movingState: IStateGroup) {
    const stateGroup = this.drawBranchService.drawStateRoot(movingState.getStateData(), {
      y: movingState.getTop(),
      x: movingState.getLeft(),
    });
    stateGroup.sendToBack();
  }

  private async sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    const tieLinesFactory = new TieLinesFactoryService(this.canvas);
    this.tieLines = tieLinesFactory.getTieLinesService(this.workflowSettings.direction);
    await tick();
    const canvasDimensions = this.getCanvasDimensions();
    this.canvas.setDimensions({
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    });
    const drawBranchFactory = new DrawBranchFactoryService(
      this.workflowData,
      this.canvas,
      { draft: false },
      canvasDimensions,
    );
    this.drawBranchService = drawBranchFactory.getDrawBranchService(this.workflowSettings.direction);
    await tick();
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => {
      this.drawBranchService.drawBranch();
      this.canvas.requestRenderAll();
      const dropAreas = this.drawBranchService.getDropAreas();
      this.canvasEvents.initialize(dropAreas);
    });
  }

  private dragElement(canvasWrapper: HTMLElement,
                      canvas: Canvas,
                      vertical: boolean) {
    let deltaDirectionY = 0;
    let deltaDirectionX = 0;
    let clientY = 0;
    let clientX = 0;
    const canvasHeight = canvas.getHeight();
    const canvasWidth = canvas.getWidth();
    const selector = vertical ? `.${verticalScrollBarClass}` : `.${horizontalScrollBarClass}`;
    const element = canvasWrapper.querySelector<HTMLElement>(selector)!;
    if (!element) {
      return;
    }
    element?.addEventListener('mousedown', dragMouseDown);
    let self = this;
    function dragMouseDown(event: MouseEvent) {
      event.preventDefault();
      clientY = event.clientY;
      clientX = event.clientX;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(event: MouseEvent) {
      event.preventDefault();

      deltaDirectionY = vertical ? clientY - event.clientY : 0;
      deltaDirectionX = vertical ? 0 : clientX - event.clientX;
      clientY = event.clientY;
      clientX = event.clientX;

      const transformString = (element.style.transform || '');
      const transformStringLength = (element.style.transform || '').length;
      let [transformX, transformY]  = transformString.substr(10, transformStringLength - 13).split('px, ');


      let currentTop = Number(transformY || 0);
      let currentLeft = Number(transformX || 0);
      if (currentTop - deltaDirectionY + element.offsetHeight + 10 > canvasWrapper.offsetHeight) {
        currentTop = canvasWrapper.offsetHeight - element.offsetHeight - 10 + deltaDirectionY;
      }
      if (currentLeft - deltaDirectionX + element.offsetWidth + 10 > canvasWrapper.offsetWidth) {
        currentLeft = canvasWrapper.offsetWidth - element.offsetWidth - 10 + deltaDirectionX;
      }

      let newTransformY = currentTop - deltaDirectionY;
      if (newTransformY < 0) {
        newTransformY = 0;
      }
      let newTransformX = currentLeft - deltaDirectionX;
      if (newTransformX < 0) {
        newTransformX = 0;
      }
      element.style.transform = `translate(${newTransformX}px, ${newTransformY}px)`;

      const availableHeight = canvasHeight - scrollBarPadding * 2 - (element.offsetHeight || 0);
      const availableWidth = canvasWidth - scrollBarPadding * 2 - (element.offsetWidth || 0);

      let deltaY = (currentTop - scrollBarPadding) / availableHeight;
      let deltaX = (currentLeft - scrollBarPadding) / availableWidth;

      let vpt = canvas.viewportTransform!;
      if (vertical) {
        vpt[5] = -(self.canvasDimensions.height - canvasHeight) * deltaY;
      } else {
        vpt[4] = -(self.canvasDimensions.width - canvasWidth) * deltaX;
      }
      canvas.requestRenderAll();
    }

    function closeDragElement() {
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
    }
  }
}

