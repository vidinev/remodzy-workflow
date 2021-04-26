import { ObjectTypes } from '../configs/object-types.enum';
import { PointCoords } from '../interfaces/point-coords.interface';
import { tieLineConfig } from './configs/tie-line-config';

export const BezierCurveTieLine = fabric.util.createClass(fabric.Path, {
  type: ObjectTypes.bezierCurveTieLine,
  _active: false,
  startCoords: null,
  endCoords: null,
  direction: null,

  initialize: function(startCoords: PointCoords, endCoords: PointCoords) {
    this.startCoords = startCoords;
    this.endCoords = endCoords;

    if (startCoords.x && startCoords.y && endCoords.x && endCoords.y) {
      const curveStartControlPoint = startCoords.x + Math.ceil(Math.abs(endCoords.x - startCoords.x) * 0.3);
      const curveEndControlPoint = endCoords.x - Math.ceil(Math.abs(endCoords.x - startCoords.x) * 0.7);
      const startPath = `M${startCoords.x},${startCoords.y}`;
      const cubicPath = `C${curveStartControlPoint},${startCoords.y},${curveEndControlPoint},${endCoords.y},${endCoords.x},${endCoords.y}`;

      this.callSuper('initialize', `${startPath}${cubicPath}`, {
        ...tieLineConfig,
        fill: '',
      });
    }
  },
});
