import { WorkflowStateData } from './state-language.interface';

export enum RemodzyWfDirection {
  horizontal = 'horizontal',
  vertical = 'vertical',
}

export interface RemodzyWFSettings {
  elementId: string;
  data: WorkflowStateData;
  direction?: RemodzyWfDirection;
}
