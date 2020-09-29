import { RemodzyWorkflowBuilder } from './services/workflow-builder';
import { data } from './configs/data.config';

const a = new RemodzyWorkflowBuilder({
  elementId: 'main-canvas',
  data
});
console.log(a);
