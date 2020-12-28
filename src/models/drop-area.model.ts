import { IObjectOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../configs/colors.config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { dropAreaPlusConfig, dropAreaPlusSize, dropAreaRoundConfig } from './configs/drop-area-group-config';

export const DropAreaGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.dropArea,
  _active: false,

  initialize: function(options: IObjectOptions = { }) {
    const dropArea = new fabric.Circle(dropAreaRoundConfig);
    this.callSuper('initialize', [dropArea, ...this.drawPlus()], {
      ...options,
      selectable: false,
      hoverCursor: 'default',
    });
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
      : remodzyColors.tieLineColor;
    this.active = toggle;
    this.item(0).setOptions({
      stroke: borderColor
    });
    this.item(1).setOptions({
      fill: borderColor,
      stroke: borderColor
    });
    this.item(2).setOptions({
      fill: borderColor,
      stroke: borderColor
    });
  },

  drawPlus() {
    const verticalLine = new fabric.Line([
      dropAreaRoundConfig.radius!,
      dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize * 2,
      dropAreaRoundConfig.radius!,
      dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize
    ], dropAreaPlusConfig);
    const horizontalLine = new fabric.Line([
      dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize * 2,
      dropAreaRoundConfig.radius!,
      dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize,
      dropAreaRoundConfig.radius!
    ], dropAreaPlusConfig);
    return [verticalLine, horizontalLine];
  },

  isActive() {
    return this.active;
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
