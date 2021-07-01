import { ObjectTypes } from '../configs/object-types.enum';
import { PointCoords } from '../interfaces/point-coords.interface';
import { tieLineConfig } from './configs/tie-line-config';

export const BezierCurveTieLine = fabric.util.createClass(fabric.Path, {
  type: ObjectTypes.bezierCurveTieLine,
  _active: false,
  startCoords: null,
  endCoords: null,
  direction: null,

  initialize: function(startCoords: PointCoords, endCoords: PointCoords, mirror: boolean) {
    this.startCoords = startCoords;
    this.endCoords = endCoords;

    if (startCoords.x && startCoords.y && endCoords.x && endCoords.y) {
      const deltaLeft = Math.ceil(Math.abs(endCoords.x - startCoords.x) * 0.35);
      const deltaRight = Math.ceil(Math.abs(endCoords.x - startCoords.x) * 0.65);
      const curveStartControlPoint = mirror ? startCoords.x - deltaLeft : startCoords.x + deltaLeft;
      const curveEndControlPoint = mirror ? endCoords.x + deltaRight : endCoords.x - deltaRight;
      const startPath = `M${startCoords.x},${startCoords.y}`;
      const cubicPath = `C${curveStartControlPoint},${startCoords.y},${curveEndControlPoint},${endCoords.y},${endCoords.x},${endCoords.y}`;

      this.callSuper('initialize', `${startPath}${cubicPath}`, {
        ...tieLineConfig,
        fill: '',
      });
    }
  },
});
