import { WorkflowData } from '../services/workflow-data.service';
import { WorkflowDimensions } from '../models/interfaces/workflow dimentions.interface';

export interface BranchConfiguration extends WorkflowDimensions {
  data: WorkflowData;
}
