export interface WorkflowStateData {
  StartAt: string;
  States: {
    [key: string]: WorkflowState;
  };
}

export interface WorkflowState {
  Type: string;
  Next?: string;
  Parameters: Partial<WorkflowStateParams>;
  Comment?: string;
  End?: boolean;
  Branches?: WorkflowStateData[];
}

export interface WorkflowStateParams {
  taskType: string;
  taskIcon?: string;
  stateId: string;
}
