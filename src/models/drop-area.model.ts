import { ActiveSelection, IObjectOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../configs/colors.config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ObjectTypes } from '../configs/object-types.enum'

export const WorkflowDropArea = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.dropArea,
  _active: false,

  initialize: function(objects: ActiveSelection, options: IObjectOptions = { }) {
    this.callSuper('initialize', objects, options);
  },

  getCenterTopCoords(): PointCoords {
    return {
     x: (this.left || 0) + this.width / 2,
     y: this.top
    };
  },

  getCenterBottomCoords(): PointCoords {
    return {
      x: (this.left || 0) + this.width / 2,
      y: this.top + this.height
    };
  },

  toggleActive: function(toggle: boolean) {
    const borderColor = toggle
      ? remodzyColors.dropAreaActiveColor
      : remodzyColors.dropAreaStrokeColor;
    const textColor = toggle
      ? remodzyColors.dropAreaActiveColor
      : remodzyColors.dropAreaTextColor;
    this.active = toggle;
    this.item(0).setOptions({
      stroke: borderColor
    });
    this.item(1).setOptions({
      fill: textColor
    });
  },

  isActive() {
    return this.active;
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
