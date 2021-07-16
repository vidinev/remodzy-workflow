import { Canvas, ICanvasOptions, IEvent, Point } from 'fabric/fabric-impl';
import { RemodzyWfDirection, RemodzyWFSettings } from '../interfaces/workflow-settings.interface';
import { CanvasEventsService } from './canvas-events.service';
import { AnimateService } from './animate.service';
import { canvasSize } from '../configs/size.config';
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

/*
 * remove object type scrollbar
 * Fix delta, should be in range 0 - 1 (scroll percent)
 * optimize calculations
 * Refactor, move functions to services
 * fix TODO get values from config
 * horizontal scroll

 * Implement zoom
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
    horizontalScrollBar.className = 'horizontal-scroll-bar';
    if (canvasWrapper) {
      canvasWrapper.appendChild(horizontalScrollBar);
      this.dragElement(horizontalScrollBar, canvasWrapper, this.canvas);
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

  private dragElement(element: HTMLElement, canvasWrapper: HTMLElement, canvas: Canvas) {
    let deltaDirection = 0;
    let clientY = 0;
    element.addEventListener('mousedown', dragMouseDown);
    let self = this;
    function dragMouseDown(event: MouseEvent) {
      event.preventDefault();
      clientY = event.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(event: MouseEvent) {
      event.preventDefault();
      // calculate the new cursor position:
      deltaDirection = clientY - event.clientY;
      clientY = event.clientY;
      const currentTopMath = (element.style.transform || '').match(/translate\(\d+px,\s?(\d+)px\)/);
      let currentTop = Number(currentTopMath && currentTopMath[1] || 0);
      if (currentTop - deltaDirection + element.offsetHeight + 10 > canvasWrapper.offsetHeight) {
        currentTop = canvasWrapper.offsetHeight - element.offsetHeight - 10 + deltaDirection;
      }
      if (currentTop < 0) {
        currentTop = 0;
      }
      element.style.transform = `translate(0, ${currentTop - deltaDirection}px)`;

      // TODO get values from config
      const padding = 5;

      const availableHeight = canvas.getHeight() - padding * 2 - (element.offsetHeight || 0);

      const delta = (currentTop - padding) / availableHeight;
      console.log(self.canvasDimensions);

      let vpt = canvas.viewportTransform!;
      vpt[5] = -(self.canvasDimensions.height - canvas.getHeight()) * delta;
      canvas.requestRenderAll();

    }

    function closeDragElement() {
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
    }
  }
}

