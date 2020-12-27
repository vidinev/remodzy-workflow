import { ObjectTypes } from '../configs/object-types.enum';
import { IObjectOptions } from 'fabric/fabric-impl';
import { curveRoundPartSize, tieLineSize } from '../configs/size.config';
import { tieLineConfig } from './configs/tie-line-config';
import { PointCoords } from '../interfaces/point-coords.interface';

interface MiddleTieLineOptions {
  topCoords: PointCoords;
  bottomCoords: PointCoords;
}

export const MiddleTieLine = fabric.util.createClass(fabric.Line, {
  type: ObjectTypes.middleTieLine,
  _active: false,

  initialize: function({ topCoords, bottomCoords }: MiddleTieLineOptions, options: IObjectOptions = { }) {
    this.callSuper('initialize', [
      topCoords.x,
      topCoords.y + tieLineSize.margin,
      bottomCoords.x,
      topCoords.y + tieLineSize.margin + curveRoundPartSize * 2 + 1
    ], {
      ...tieLineConfig,
      ...options
    });
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }

});
