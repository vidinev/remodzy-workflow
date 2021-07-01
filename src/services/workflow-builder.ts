import { Canvas, ICanvasOptions, IEvent } from 'fabric/fabric-impl';
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
 * Test 4 parallel case, with couple sub branches
 * Test sorting cases with horizontal
 * Implement zoom

 * Merge all js files into one
 * Test lib basic functionality
 * es5 -> es modules
 *
 * Discuss using Pass state in workflow
 * Support using simple state (Non Pass type) for root of the branch ?
 * http://jsfiddle.net/maCmB/1/
 */

export class RemodzyWorkflowBuilder {
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
    this.setupCanvasEvents();
    this.initialize().then(() => {
      const dropAreas = this.drawBranchService.getDropAreas();
      this.canvasEvents.initialize(dropAreas);
    });
  }

  public async initialize() {
    await this.manropeFont.load();
    this.drawBranchService.drawBranch();
    this.canvas.requestRenderAll();
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
