import { Canvas, Object as CanvasObject } from 'fabric/fabric-impl';
import { IStateGroup } from '../models/interfaces/state.interface';
import { ObjectTypes } from '../configs/object-types.enum';

export class UtilsService {
  static forEachState(canvas: Canvas, callback: (state: IStateGroup) => void) {
    canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.type === ObjectTypes.state) {
        callback(canvasObject as IStateGroup);
      }
    });
  }
}
