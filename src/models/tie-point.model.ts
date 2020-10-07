import { IObjectOptions } from 'fabric/fabric-impl';
import { PointCoords } from '../interfaces/point-coords.interface';
import { tiePointConfig } from '../configs/canvas.config';
import { ObjectTypes } from '../configs/object-types.enum';

export const WorkflowTiePoint = fabric.util.createClass(fabric.Circle, {
  type: ObjectTypes.tiePoint,
  _active: false,

  initialize: function(options: IObjectOptions = { }) {
    this.callSuper('initialize', {
      ...tiePointConfig,
      selectable: false,
      hoverCursor: 'default',
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
