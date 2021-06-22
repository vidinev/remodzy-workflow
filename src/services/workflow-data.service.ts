import { WorkflowState, WorkflowStateData } from '../interfaces/state-language.interface';
import cloneDeep from 'lodash.clonedeep';

type WorkflowStates = { [key: string]: WorkflowState };

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

  private static getNewDataStructureFromDraft(workflowStateData: WorkflowStateData): WorkflowData {
    const data = workflowStateData;
    for (let key in data.States) {
      if (data.States.hasOwnProperty(key)) {
        if (data.States[key].BranchesData) {
          data.States[key].Branches = (data.States[key].BranchesData || []).map((branch: WorkflowData) => {
            const dataStructure = this.getNewDataStructureFromDraft(branch.dataDraft);
            return {
              StartAt: branch.getStartStateId(),
              States: dataStructure.dataDraft.States,
            } as WorkflowStateData;
          });
        }
      }
    }
    return new WorkflowData(data);
  }

  constructor(workflowStateData: WorkflowStateData, private parentStateId?: string) {
    this.data = WorkflowData.prepareWorkFlowData(workflowStateData);
    this.dataDraft = this.data;
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

  sortStates(activeStateId: string, stateBeforeDropId: string) {
    this.dataDraft = cloneDeep(this.data);
    const stateBeforeDrop = this.searchStateDeep(stateBeforeDropId);
    if (!stateBeforeDrop) {
      return;
    }
    const activeState = this.searchStateDeep(activeStateId);
    if (!activeState) {
      return;
    }
    const stateBeforeActive = this.searchPreviousStateDeep(activeStateId);
    if (!stateBeforeActive) {
      return;
    }

    const activeStateDraft = cloneDeep(activeState);
    this.removeStateFromOldPosition(activeStateDraft, stateBeforeActive);
    this.insertStateAfterState(stateBeforeDrop, activeStateDraft);
    const result = WorkflowData.getNewDataStructureFromDraft(this.dataDraft);
    this.data = result.data;
  }

  private insertStateAfterState(state: WorkflowState, activeState: WorkflowState) {
    const stateBranch = state.Parameters.stateId ? this.findStateBranch(state.Parameters.stateId) : null;
    if (stateBranch && activeState.Parameters.stateId) {
      stateBranch[activeState.Parameters.stateId] = activeState;
      if (state.End) {
        state.End = false;
        state.Next = activeState.Parameters.stateId;
        delete activeState.Next;
        activeState.End = true;
      } else if (state.Next) {
        activeState.Next = state.Next;
        state.Next = activeState.Parameters.stateId;
        activeState.End = false;
      }
    }
  }

  private removeStateFromOldPosition(activeState: WorkflowState, stateBeforeActive: WorkflowState) {
    const stateBranch = activeState.Parameters.stateId ? this.findStateBranch(activeState.Parameters.stateId) : null;
    if (stateBranch && activeState.Parameters.stateId && stateBeforeActive) {
      delete stateBranch[activeState.Parameters.stateId];
      if (activeState.End) {
        stateBeforeActive.End = true;
        delete stateBeforeActive.Next;
      } else if (activeState.Next) {
        stateBeforeActive.Next = activeState.Next;
      }
    }
  }

  sortStates1(movedStateId: string, stateBeforeNewPositionId: string) {
    const stateBeforeNewPosition = this.searchStateDeep(stateBeforeNewPositionId);
    if (!stateBeforeNewPosition) {
      return;
    }
    const movedState = this.searchStateDeep(movedStateId);
    if (!movedState) {
      return;
    }
    const stateBeforeMovedKey = Object.keys(this.dataDraft.States).find((key: string) => {
      return this.dataDraft.States[key].Next === movedStateId;
    });
    let stateBeforeMoved = null;
    if (stateBeforeMovedKey) {
      stateBeforeMoved = this.searchStateDeep(stateBeforeMovedKey);
    }

    if (stateBeforeNewPosition.Next) {
      const stateAfterNewPosition = this.searchStateDeep(stateBeforeNewPosition.Next);
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

  private findStateBranch(id: string, states: WorkflowStates = this.dataDraft.States): WorkflowStates | null {
    if (states[id]) {
      return states;
    }
    for (let key in states) {
      if (states.hasOwnProperty(key) && states[key].BranchesData) {
        for (let branch of states[key].BranchesData || []) {
          let states = this.findStateBranch(id, branch.dataDraft.States);
          if (states) {
            return states;
          }
        }
      }
    }
    return null;
  }

  private searchPreviousStateDeep(id: string, states: WorkflowStates = this.dataDraft.States): WorkflowState | null {
    for (let key in states) {
      if (states[key].Next === id && states.hasOwnProperty(key)) {
        return states[key];
      }
      if (states.hasOwnProperty(key) && states[key].BranchesData) {
        for (let branch of states[key].BranchesData || []) {
          let state = this.searchPreviousStateDeep(id, branch.dataDraft.States);
          if (state) {
            return state;
          }
        }
      }
    }
    return null;
  }

  private searchStateDeep(id: string, states: WorkflowStates = this.dataDraft.States): WorkflowState | null {
    if (states[id]) {
      return states[id];
    }
    for (let key in states) {
      if (states.hasOwnProperty(key) && states[key].BranchesData) {
        for (let branch of states[key].BranchesData || []) {
          let state = this.searchStateDeep(id, branch.dataDraft.States);
          if (state) {
            return state;
          }
        }
      }
    }
    return null;
  }
}
