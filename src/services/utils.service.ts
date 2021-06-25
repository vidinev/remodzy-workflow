import { Object as CanvasObject } from 'fabric/fabric-impl';

export class UtilsService {
  static getAbsolute(state: CanvasObject, key: 'top'|'left'|'angle'|'scaleX'|'scaleY') {
    if (state.group) {
      if (key === 'top') {
        return state.calcTransformMatrix()[5];
      } else if (key === 'left') {
        return state.calcTransformMatrix()[4];
      } else if (key === 'angle') {
        return (state.angle || 0) + (state.group.angle || 0);
      } else if (key === 'scaleX') {
        return (state.scaleX || 0) * (state.group.scaleX || 0);
      } else if (key === 'scaleY') {
        return (state.scaleY || 0) * (state.group.scaleY || 0);
      }
    }
    return state[key];
  }
}
