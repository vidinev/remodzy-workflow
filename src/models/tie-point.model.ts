import { IObjectOptions } from 'fabric/fabric-impl';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { tiePointConfig } from './configs/tie-point-config';

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

  getCenterRightCoords(): PointCoords {
    return {
      x: (this.left || 0) + this.width,
      y: Math.ceil((this.top || 0) + this.height / 2),
    };
  },

  getCenterLeftCoords(): PointCoords {
    return {
      x: (this.left || 0),
      y: Math.ceil((this.top || 0) + this.height / 2),
    };
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
