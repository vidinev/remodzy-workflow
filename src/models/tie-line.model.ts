import { ILineOptions, IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { remodzyColors } from '../configs/colors.config';

export const tieLineConfig: ILineOptions = {
  strokeWidth: 1.5,
  fill: remodzyColors.tieLineColor,
  stroke:  remodzyColors.tieLineColor,
  selectable: false,
  evented: false,
};

export const TieLine = fabric.util.createClass(fabric.Line, {
  type: ObjectTypes.tieLine,
  _active: false,

  initialize: function([fromX, fromY, toX, toY]: number[], options: IObjectOptions = { }) {
    this.callSuper('initialize', [fromX, fromY, toX, toY], {
      ...tieLineConfig,
      ...options
    });
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
