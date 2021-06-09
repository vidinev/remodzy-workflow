import { Canvas } from 'fabric/fabric-impl';
import { RemodzyWfDirection } from '../../interfaces/workflow-settings.interface';
import { DrawBranchHorizontalService } from './draw-branch-horizontal.service';
import { DrawBranchVerticalService } from './draw-branch-vertical.service';
import { WorkflowData } from '../workflow-data.service';
import { DrawBranchOptions } from '../../interfaces/draw-branch-options.interface';

export class DrawBranchFactoryService {
  constructor(protected workflowData: WorkflowData,
              protected canvas: Canvas,
              protected options?: DrawBranchOptions) {}

  getDrawBranchService(direction?: RemodzyWfDirection) {
    switch (direction) {
      case RemodzyWfDirection.horizontal:
        return new DrawBranchHorizontalService(this.workflowData, this.canvas, this.options);
      default:
        return new DrawBranchVerticalService(this.workflowData, this.canvas, this.options);
    }
  }
}
