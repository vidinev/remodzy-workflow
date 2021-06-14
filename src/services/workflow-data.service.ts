import { WorkflowState, WorkflowStateData } from '../interfaces/state-language.interface';
import cloneDeep from 'lodash.clonedeep';

export class WorkflowData {
  private data: WorkflowStateData;
  private dataDraft: WorkflowStateData;
  private readonly endStateId: string;

  private static prepareWorkFlowData(workflowStateData: WorkflowStateData): WorkflowStateData {
    const data = {
      ...workflowStateData,
      States: cloneDeep(workflowStateData.States),
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
    this.dataDraft = cloneDeep(this.data)
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
    const stateBeforeNewPosition = this.searchStateDeep(this.dataDraft.States, stateBeforeNewPositionId);
    if (!stateBeforeNewPosition) {
      return;
    }
    const movedState = this.searchStateDeep(this.dataDraft.States, movedStateId);
    if (!movedState) {
      return;
    }
    const stateBeforeMovedKey = Object.keys(this.dataDraft.States).find((key: string) => {
      return this.dataDraft.States[key].Next === movedStateId;
    });
    let stateBeforeMoved = null;
    if (stateBeforeMovedKey) {
      stateBeforeMoved = this.searchStateDeep(this.dataDraft.States, stateBeforeMovedKey);
    }

    if (stateBeforeNewPosition.Next) {
      const stateAfterNewPosition = this.searchStateDeep(this.dataDraft.States, stateBeforeNewPosition.Next);
      if (movedStateId === stateBeforeNewPosition?.Next || movedStateId === stateBeforeNewPositionId) {
        return;
      }
      if (stateAfterNewPosition && stateBeforeMoved) {
        const stateAfterMoved = movedState.Next;
        stateBeforeNewPosition.Next = movedStateId;
        movedState.Next = stateAfterNewPosition.Parameters.stateId;
        stateBeforeMoved.Next = stateAfterMoved;
      }
    } else {
      // TODO no next state
    }

    this.data = {
      ...this.data,
      States: this.dataDraft.States,
    };
  }

  private searchStateDeep(states: { [key: string]: WorkflowState }, id: string): WorkflowState | null {
    if (states[id]) {
      return states[id];
    }
    for (let key in states) {
      if (states.hasOwnProperty(key) && states[key].Branches) {
        for (let branch of (states[key].Branches || [])) {
          let state = this.searchStateDeep(branch.States, id);
          if (state) {
            return state;
          }
        }
      }
    }
    return null;
  }
}
