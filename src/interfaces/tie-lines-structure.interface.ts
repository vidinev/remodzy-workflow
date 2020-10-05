import { Object as CanvasObject } from 'fabric/fabric-impl'
import { WorkflowDropAreaGroup } from './workflow-drop-area.interface'

export interface TieLinesStructure {
  [key: string]: TieLineObjectsInfo;
}

export interface TieLineObjectsInfo {
  tieStart: CanvasObject;
  tieEnd: CanvasObject;
  dropArea: WorkflowDropAreaGroup;
}
