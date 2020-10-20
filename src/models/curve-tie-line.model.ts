import { ObjectTypes } from '../configs/object-types.enum';
import { curveTieLineConfig } from './configs/curve-tie-line-config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { IObjectOptions } from 'fabric/fabric-impl';

export const CurveTieLine = fabric.util.createClass(fabric.Path, {
  type: ObjectTypes.curveTieLine,
  _active: false,

  initialize: function(path: string, options: IObjectOptions = { }) {
    this.callSuper('initialize', path, {
      ...curveTieLineConfig,
      ...options
    });
  },

  getBottomLeftCoords(): PointCoords {
    return {
      x: this.left || 0,
      y: this.top + this.height
    };
  },

  getBottomRightCoords(): PointCoords {
    return {
      x: (this.left || 0) + this.width,
      y: this.top + this.height
    }
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
