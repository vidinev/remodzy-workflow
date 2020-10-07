import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { tieLineConfig } from './configs/tie-line-config';
import { tieLineSize } from '../configs/size.config';

export const TieLine = fabric.util.createClass(fabric.Line, {
  type: ObjectTypes.tieLine,
  _active: false,

  initialize: function([fromX, fromY, toX, toY]: number[], options: IObjectOptions = { }) {
    this.callSuper('initialize', [fromX, fromY + tieLineSize.margin, toX, toY - tieLineSize.margin], {
      ...tieLineConfig,
      ...options
    });
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
