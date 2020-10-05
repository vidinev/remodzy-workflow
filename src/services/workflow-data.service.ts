import { WorkflowState, WorkflowStateData } from '../interfaces/state-language.interface';

export class WorkflowData {
  private data: WorkflowStateData;

  private static getStatesDraft(States: { [key: string]: WorkflowState }) {
    const statesDraft = { ...States };
    for (let key in statesDraft) {
      if (statesDraft.hasOwnProperty(key)) {
        statesDraft[key] = {
          ...statesDraft[key]
        };
      }
    }
    return statesDraft;
  }

  private static prepareWorkFlowData(workflowStateData: WorkflowStateData): WorkflowStateData {
    const data = {
      ...workflowStateData,
      States: WorkflowData.getStatesDraft(workflowStateData.States)
    };

    for (let key in data.States) {
      if (data.States.hasOwnProperty(key)) {
        data.States[key].Parameters = {
          ...data.States[key].Parameters,
          stateKey: key
        };
      }
    }
    return data;
  }

  constructor(workflowStateData: WorkflowStateData) {
    this.data = WorkflowData.prepareWorkFlowData(workflowStateData);
  }

  getStateById(stateId: string) {
    return this.data.States[stateId];
  }

  getStartStateId() {
    return this.data.StartAt;
  }

  getStartState() {
    return this.data.States[this.data.StartAt];
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
    movedState.Next = stateAfterNewPosition.Parameters.stateKey;
    stateBeforeMoved.Next = stateAfterMoved;

    this.data = {
      ...this.data,
      States: statesDraft
    };
  }
}
