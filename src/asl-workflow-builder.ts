import { RemodzyWorkflowBuilder } from './services/workflow-builder';
import { workflowTestData } from './configs/data.config';
import { RemodzyWfDirection } from './interfaces/workflow-settings.interface';

const a = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data: workflowTestData,
  direction: RemodzyWfDirection.horizontal
});
