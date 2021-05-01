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

/*
 * Avoid using offsetY, draw curves to line object coords
 * Test with different cases
 * Add some branch inside branch, improve calculating to support all levels of inheritance.
 * Fix  drag and drop, and sorting between levels
 *
 * Fix 2 drop area highlight at the same time
 * Fix drag and drop for 2 level

 * Test lib basic functionality
 * Merge all js files into one
 *
 * Set simple state instead pass state in branches ?
 * Set simple state in root branch ?
 */

export class RemodzyWorkflowBuilder {
  private readonly canvas: Canvas;
  private readonly canvasConfig: ICanvasOptions = {
    ...canvasSize,
    selection: false,
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
    const drawBranchFactory = new DrawBranchFactoryService(this.workflowData, this.canvas);
    this.drawBranchService = drawBranchFactory.getDrawBranchService(this.workflowSettings.direction);
    this.setupCanvasEvents();
    this.initialize().then(() => {
      this.canvasEvents.setupDropAreaEvents();
    });
  }

  public async initialize() {
    await this.manropeFont.load();
    this.drawBranchService.drawBranch();
  }

  private setupCanvasEvents() {
    this.canvasEvents.setupDragDropEvents({
      dragStartCallback: (event: IEvent) => {
        if (event.target) {
          this.drawStateCloneUnderMovingObject(event.target as IStateGroup);
          this.animate.animateDragDrop(event, 1);
        }
      },
      dropCallback: (event: IEvent, dropArea: IDropAreaGroup) => {
        if (event.target?.data.stateId) {
          this.sortObjectsAfterDragAndDrop(dropArea, event.target.data.stateId);
        }
      },
    });
  }

  private drawStateCloneUnderMovingObject(movingState: IStateGroup) {
    const stateGroup = this.drawBranchService.drawStateRoot(movingState.getStateData(), {
      y: movingState.top,
      x: movingState.left,
    });
    stateGroup.sendToBack();
  }

  private sortObjectsAfterDragAndDrop(dropArea: IDropAreaGroup, id: string) {
    this.workflowData.sortStates(id, dropArea.data.stateId);
    this.canvas.clear();
    this.canvas.setBackgroundColor(remodzyColors.canvasBg, () => {
      const tieLinesFactory = new TieLinesFactoryService(this.canvas);
      this.tieLines = tieLinesFactory.getTieLinesService(this.workflowSettings.direction);
      const drawBranchFactory = new DrawBranchFactoryService(this.workflowData, this.canvas);
      this.drawBranchService = drawBranchFactory.getDrawBranchService(this.workflowSettings.direction);
      this.drawBranchService.drawBranch();
    });
  }
}
