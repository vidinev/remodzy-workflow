import { Object as CanvasObject } from 'fabric/fabric-impl';
import { IStateGroup } from './interfaces/state.interface';
import { IDropAreaGroup } from './interfaces/drop-area.interface';
import { PointCoords } from '../interfaces/point-coords.interface';
import { CoordsService } from '../services/coords.service';

export class BranchItems {
  private readonly coordsService: CoordsService;
  constructor(public states: IStateGroup[], public dropAreas: IDropAreaGroup[]) {
    this.coordsService = new CoordsService();
  }

  getAllItems(): CanvasObject[] {
    return [...this.states, ...this.dropAreas];
  }

  getCenterBottomCoords(): PointCoords {
    return this.coordsService.getCenterBottomCoords(this.states);
  }

  getCenterRightCoords(): PointCoords {
    return this.coordsService.getCenterRightCoords(this.states);
  }
}
