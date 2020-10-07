import { WorkflowDropAreaGroup } from './workflow-drop-area.interface';
import { WorkflowTiePointCircle } from './workflow-tie-point.interface';

export interface TieLineStructure {
  tieStart: WorkflowTiePointCircle;
  tieEnd: WorkflowTiePointCircle;
  dropArea: WorkflowDropAreaGroup;
}
