import { RemodzyWorkflowBuilder } from './services/workflow-builder';
import {
  workflowTestData0,
  workflowTestData2,
  workflowTestData3,
  workflowTestData4,
  workflowTestData5
} from './configs/data.config';
import { RemodzyWfDirection } from './interfaces/workflow-settings.interface';

const a = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data: workflowTestData0,
  direction: RemodzyWfDirection.vertical,
});
