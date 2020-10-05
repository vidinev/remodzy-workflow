import { Group } from 'fabric/fabric-impl';

export interface WorkflowDropAreaGroup extends Group {
  isActive: () => boolean;
  toggleActive: (toggle: boolean) => void;
}
