import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { tieLineConfig } from './configs/tie-line-config';
import { strokeWidth } from '../configs/size.config';

export const ConnectPoint = fabric.util.createClass(fabric.Line, {
  type: ObjectTypes.connectPoint,
  _active: false,

  initialize: function(x: number, y: number, options: IObjectOptions = {}) {
    this.callSuper('initialize', [x, y, x + strokeWidth, y], {
      ...tieLineConfig,
      ...options,
      stroke: 'transparent',
    });
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  },
});
