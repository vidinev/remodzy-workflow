import { Object as CanvasObject } from 'fabric/fabric-impl';
import { IStateGroup } from './interfaces/state.interface';
import { IDropAreaGroup } from './interfaces/drop-area.interface';
import { PointCoords } from '../interfaces/point-coords.interface';
import { CoordsService } from '../services/coords.service';
import { IConnectPoint } from './interfaces/connect-point.interface';

export class BranchItems {
  private readonly coordsService: CoordsService;
  constructor(public states: IStateGroup[], public dropAreas: IDropAreaGroup[], public connectPoints: IConnectPoint[]) {
    this.coordsService = new CoordsService();
  }

  getAllItems(): CanvasObject[] {
    return [...this.states, ...this.dropAreas, ...this.connectPoints];
  }

  getCenterBottomCoords(): PointCoords {
    return this.coordsService.getCenterBottomCoords(this.states);
  }

  getCenterRightCoords(): PointCoords {
    if (this.connectPoints.length) {
      let rightMostConnectPoint = this.connectPoints[0];
      this.connectPoints.forEach((connectPoint: IConnectPoint) => {
        if (connectPoint.getLeft() > rightMostConnectPoint.getLeft()) {
          rightMostConnectPoint = connectPoint;
        }
      });
      return this.coordsService.getCenterRightCoords(this.states, false, rightMostConnectPoint);
    }
    return this.coordsService.getCenterRightCoords(this.states);
  }
}
