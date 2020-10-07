import { ICircleOptions, IObjectOptions } from 'fabric/fabric-impl';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { tiePointSize } from '../configs/size.config';
import { remodzyColors } from '../configs/colors.config';

export const tiePointConfig: ICircleOptions = {
  radius: tiePointSize.radius,
  fill: remodzyColors.canvasBg,
  stroke: remodzyColors.tiePointStrokeColor,
  strokeWidth: 1.5,
  selectable: false,
  evented: false,
  hoverCursor: 'default'
};

export const TiePointCircle = fabric.util.createClass(fabric.Circle, {
  type: ObjectTypes.tiePoint,
  _active: false,

  initialize: function(options: IObjectOptions = { }) {
    this.callSuper('initialize', {
      ...tiePointConfig,
      ...options
    });
  },

  getCenterTopCoords(): PointCoords {
    return {
      x: Math.ceil((this.left || 0) + this.width / 2),
      y: this.top
    };
  },

  getCenterBottomCoords(): PointCoords {
    return {
      x: Math.ceil((this.left || 0) + this.width / 2),
      y: this.top + this.height
    };
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
