import { Group } from 'fabric/fabric-impl';

export interface WorkflowDropAreaGroup extends Group {
  toggleActive: (toggle: boolean) => void;
}
