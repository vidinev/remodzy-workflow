import { RemodzyWorkflowBuilder } from './services/workflow-builder';
import {
  workflowTestData1,
  workflowTestData2,
  workflowTestData3,
  workflowTestData4,
  workflowTestData5,
} from './configs/data.config';
import { RemodzyWfDirection } from './interfaces/workflow-settings.interface';

const a = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data: workflowTestData1,
  direction: RemodzyWfDirection.vertical,
});
