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
import { ObjectTypes } from '../configs/object-types.enum';

/*
 * Implement zoom
 * Scroll canvas by drag method (when space is hold)

 * Merge all js files into one
 * Test lib basic functionality
 * es5 -> es modules
 *
 */

const padding = 5;

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

    const canvasDimensions = this.getCanvasDimensions();
    this.canvas.setDimensions({
      width: 1000,
      height: 800,
    });

    this.scrollBars();

    const drawBranchFactory = new DrawBranchFactoryService(
      this.workflowData,
      this.canvas,
      { draft: false },
      canvasDimensions,
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

    this.canvas.on('mouse:up', (opt) => {
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
      this.canvas.renderAll();
      opt.e.preventDefault();
      opt.e.stopPropagation();
      console.log(this.canvas.viewportTransform);
    });
  }

  public async initialize() {
    await this.manropeFont.load();
    this.drawBranchService.drawBranch();
    this.canvas.requestRenderAll();
  }

  private scrollBars() {
    const verticalBar = new fabric.Rect({
      width: 10,
      height: 100,
      fill: 'grey',
      opacity: 0.8,
      hasControls: false,
      hasBorders: false,
      objectCaching: false,
      left: this.canvas.getWidth() - padding - 10,
      top: padding,
      type: ObjectTypes.scrollBar
    });
    this.canvas.add(verticalBar);
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
}

function scrollZoom(container: HTMLDivElement, canvas: Canvas) {
  const maxScale = 10;
  const factor = 0.25;
  const target = container.firstElementChild as HTMLDivElement;
  const computedStyle = getComputedStyle(target as HTMLDivElement, null);
  const size = { w: Number(computedStyle.width), h: Number(computedStyle.height) };
  const pos = { x: 0, y: 0 };
  const zoomTarget = { x: 0, y: 0 };
  const zoomPoint = { x: 0, y: 0 };
  let scale = 1;

  target.addEventListener('wheel', scrolled);
  target.style.transformOrigin = '0 0';

  function scrolled(event: WheelEvent) {
    console.log('scrolled');
    const offset = getOffset(container);

    zoomPoint.x = event.pageX - offset.left;
    zoomPoint.y = event.pageY - offset.top;

    event.preventDefault();
    let delta = event.deltaY * -1;
    if (delta === undefined) {
      delta = event.detail;
    }
    delta = Math.max(-1, Math.min(1, delta));

    // determine the point on where the slide is zoomed in
    zoomTarget.x = (zoomPoint.x - pos.x) / scale;
    zoomTarget.y = (zoomPoint.y - pos.y) / scale;

    // apply zoom
    scale += delta * factor * scale;
    scale = Math.max(1, Math.min(maxScale, scale));

    // calculate x and y based on zoom
    pos.x = -zoomTarget.x * scale + zoomPoint.x;
    pos.y = -zoomTarget.y * scale + zoomPoint.y;

    // Make sure the slide stays in its container area when zooming out
    if (pos.x > 0) {
      pos.x = 0;
    }
    if (pos.x + size.w * scale < size.w) {
      pos.x = -size.w * (scale - 1);
    }
    if (pos.y > 0) {
      pos.y = 0;
    }
    if (pos.y + size.h * scale < size.h) {
      pos.y = -size.h * (scale - 1);
    }
    update();
  }

  function update() {
    target.style.transform = `translate(${pos.x}, ${pos.x}) scale(1, 1)`;
    target.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px) scale(' + scale + ',' + scale + ')';
  }
}

function getOffset(element: HTMLDivElement) {
  if (!element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  if (!win) {
    return { top: 0, left: 0 };
  }
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}
