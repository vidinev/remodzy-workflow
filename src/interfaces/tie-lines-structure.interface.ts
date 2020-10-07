import { Object as CanvasObject } from 'fabric/fabric-impl';
import { WorkflowDropAreaGroup } from './workflow-drop-area.interface';

export interface TieLineStructure {
  tieStart: CanvasObject;
  tieEnd: CanvasObject;
  dropArea: WorkflowDropAreaGroup;
}
