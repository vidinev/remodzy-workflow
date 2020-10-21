import { Object as CanvasObject } from 'fabric/fabric-impl';
import { IStateGroup } from './interfaces/state.interface';
import { IDropAreaGroup } from './interfaces/drop-area.interface';

export class BranchItems {
  constructor(public states: IStateGroup[],
              public dropAreas: IDropAreaGroup[]) {
  }

  getAllItems(): CanvasObject[] {
    return [...this.states, ...this.dropAreas];
  }

  getFirstChild(): IStateGroup {
    return this.states[0];
  }
}
