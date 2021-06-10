import { Canvas } from 'fabric/fabric-impl';
import { RemodzyWfDirection } from '../../interfaces/workflow-settings.interface';
import { DrawBranchHorizontalService } from './draw-branch-horizontal.service';
import { DrawBranchVerticalService } from './draw-branch-vertical.service';
import { WorkflowData } from '../workflow-data.service';
import { DrawBranchOptions } from '../../interfaces/draw-branch-options.interface';
import { WorkflowDimensions } from '../../models/interfaces/workflow dimentions.interface';
import { marginSize, stateItemSize } from '../../configs/size.config';

export class DrawBranchFactoryService {
  constructor(protected workflowData: WorkflowData,
              protected canvas: Canvas,
              protected options?: DrawBranchOptions,
              protected dimensions?: WorkflowDimensions) {
  }

  getDrawBranchService(direction?: RemodzyWfDirection) {
    switch (direction) {
      case RemodzyWfDirection.horizontal:
        if (this.dimensions) {
          const startPosition = {
            x: this.dimensions.startPoint.x,
            y: this.dimensions.leftSideWidth - stateItemSize.height / 2 + marginSize.verticalMargin
          };
          return new DrawBranchHorizontalService(this.workflowData, this.canvas, this.options, startPosition);
        }
        return new DrawBranchHorizontalService(this.workflowData, this.canvas, this.options);
      default:
        if (this.dimensions) {
          const startPosition = {
            x: this.dimensions.leftSideWidth - stateItemSize.width / 2  + marginSize.horizontalMargin,
            y: this.dimensions.startPoint.y
          };
          return new DrawBranchVerticalService(this.workflowData, this.canvas, this.options, startPosition);
        }
        return new DrawBranchVerticalService(this.workflowData, this.canvas, this.options);
    }
  }
}
