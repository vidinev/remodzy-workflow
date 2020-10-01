import { ActiveSelection, IObjectOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../configs/colors.config';

export const WorkflowDropArea = fabric.util.createClass(fabric.Group, {
  type: 'workflowDropArea',
  _active: false,

  initialize: function(objects: ActiveSelection, options: IObjectOptions) {
    options || ( options = { });
    this.callSuper('initialize', objects, options);
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
