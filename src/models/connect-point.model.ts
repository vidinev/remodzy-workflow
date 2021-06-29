import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { tieLineConfig } from './configs/tie-line-config';
import { strokeWidth } from '../configs/size.config';
import { UtilsService } from '../services/utils.service';

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


  getTop(): number {
    if (this.absoluteTop) {
      return this.absoluteTop;
    }
    this.absoluteTop = UtilsService.getAbsolute(this, 'top');
    return this.absoluteTop;
  },

  getLeft(): number {
    if (this.absoluteLeft) {
      return this.absoluteLeft;
    }
    this.absoluteLeft = UtilsService.getAbsolute(this, 'left');
    return this.absoluteLeft;
  },

  cacheCoords() {
    this.absoluteTop = UtilsService.getAbsolute(this, 'top');
    this.absoluteLeft = UtilsService.getAbsolute(this, 'left');
  }

});
