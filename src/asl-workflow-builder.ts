import { RemodzyWorkflowBuilder } from './services/workflow-builder';
import { RemodzyWfDirection } from './interfaces/workflow-settings.interface';
import * as data from './configs/test-data';

const builder = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data: data.threeBranchesInTheEnd,
  direction: RemodzyWfDirection.vertical,
});
