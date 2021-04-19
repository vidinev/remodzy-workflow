import { WorkflowState, WorkflowStateData } from '../interfaces/state-language.interface';

export class WorkflowData {
  private data: WorkflowStateData;
  private readonly endStateId: string;

  private static getStatesDraft(States: { [key: string]: WorkflowState }) {
    const statesDraft = { ...States };
    for (let key in statesDraft) {
      if (statesDraft.hasOwnProperty(key)) {
        statesDraft[key] = {
          ...statesDraft[key],
        };
      }
    }
    return statesDraft;
  }

  private static prepareWorkFlowData(workflowStateData: WorkflowStateData): WorkflowStateData {
    const data = {
      ...workflowStateData,
      States: WorkflowData.getStatesDraft(workflowStateData.States),
    };

    for (let key in data.States) {
      if (data.States.hasOwnProperty(key)) {
        data.States[key].Parameters = {
          ...data.States[key].Parameters,
          stateId: key,
        };
        if (data.States[key].Branches) {
          data.States[key].BranchesData = (data.States[key].Branches || []).map(
            (branch: WorkflowStateData) => new WorkflowData(branch, data.States[key].Parameters.stateId),
          );
        }
      }
    }
    return data;
  }

  constructor(workflowStateData: WorkflowStateData, private parentStateId?: string) {
    this.data = WorkflowData.prepareWorkFlowData(workflowStateData);
    this.endStateId = Object.keys(this.data.States).find((key: string) => this.data.States[key].End) || '';
  }

  getStateById(stateId: string) {
    return this.data.States[stateId];
  }

  getStartStateId(): string {
    return this.data.StartAt;
  }

  getEndStateId(): string | null {
    return this.endStateId;
  }

  getStartState() {
    return this.data.States[this.data.StartAt];
  }

  isMainRoot() {
    return !this.parentStateId;
  }

  getParentStateId(): string | null {
    return this.parentStateId || null;
  }

  sortStates(movedStateId: string, stateBeforeNewPositionId: string) {
    const statesDraft = WorkflowData.getStatesDraft(this.data.States);

    const stateBeforeNewPosition = statesDraft[stateBeforeNewPositionId];
    const stateAfterNewPosition = statesDraft[stateBeforeNewPosition.Next!];
    const movedState = statesDraft[movedStateId];

    const stateBeforeMovedKey = Object.keys(statesDraft).find((key: string) => {
      return statesDraft[key].Next === movedStateId;
    });
    const stateBeforeMoved = stateBeforeMovedKey ? statesDraft[stateBeforeMovedKey] : statesDraft[movedStateId];
    if (movedStateId === stateBeforeNewPosition.Next || movedStateId === stateBeforeNewPositionId) {
      return;
    }

    const stateAfterMoved = movedState.Next;
    stateBeforeNewPosition.Next = movedStateId;
    movedState.Next = stateAfterNewPosition.Parameters.stateId;
    stateBeforeMoved.Next = stateAfterMoved;

    this.data = {
      ...this.data,
      States: statesDraft,
    };
  }
}
