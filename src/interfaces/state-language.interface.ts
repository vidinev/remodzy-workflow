export interface WorkflowStateData {
  StartAt: string;
  States: {
    [key: string]: WorkflowState;
  };
}

export interface WorkflowState {
  Type: string;
  Next?: string;
  Parameters: WorkflowStateParams;
  Comment?: string;
  End?: boolean;
}

export interface WorkflowStateParams {
  taskType: string;
  taskIcon: string;
  stateKey: string;
}
