import { Canvas } from 'fabric/fabric-impl';
import { RemodzyWfDirection } from '../../interfaces/workflow-settings.interface';
import { TieLinesHorizontalService } from './tie-lines-horizontal.service';
import { TieLinesVerticalService } from './tie-lines-vertical.service';

export class TieLinesFactoryService {
  constructor(protected canvas: Canvas) {}

  getTieLinesService(direction?: RemodzyWfDirection) {
    switch (direction) {
      case RemodzyWfDirection.horizontal:
        return new TieLinesHorizontalService(this.canvas);
      default:
        return new TieLinesVerticalService(this.canvas);
    }
  }
}
