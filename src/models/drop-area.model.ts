import { IObjectOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../configs/colors.config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { ObjectTypes } from '../configs/object-types.enum';
import { dropAreaPlusConfig, dropAreaPlusSize, dropAreaRoundConfig } from './configs/drop-area-group-config';
import { UtilsService } from '../services/utils.service';

export const DropAreaGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.dropArea,
  _active: false,

  initialize: function(options: IObjectOptions = {}, draft: boolean) {
    const dropArea = new fabric.Circle(dropAreaRoundConfig);
    let items = draft ? [dropArea] : [dropArea, ...this.drawPlus()];
    this.callSuper('initialize', items, {
      ...options,
      left: Math.floor(options.left || 0),
      top: Math.floor(options.top || 0),
      selectable: false,
      hoverCursor: 'default',
    });
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

  getCenterTopCoords(): PointCoords {
    if (this.centerTopCoords) {
      return this.centerTopCoords;
    }
    this.centerTopCoords = {
      x: this.getLeft() + this.width / 2,
      y: this.getTop(),
    };
    return this.centerTopCoords;
  },

  getCenterBottomCoords(): PointCoords {
    if (this.centerBottomCoords) {
      return this.centerBottomCoords;
    }
    this.centerBottomCoords = {
      x: this.getLeft() + this.width / 2,
      y: this.getTop() + this.height,
    };
    return this.centerBottomCoords;
  },

  cacheCoords() {
    this.absoluteTop = UtilsService.getAbsolute(this, 'top');
    this.absoluteLeft = UtilsService.getAbsolute(this, 'left');
    this.centerBottomCoords = {
      x: this.getLeft() + this.width / 2,
      y: this.getTop() + this.height,
    };
    this.centerTopCoords = {
      x: this.getLeft() + this.width / 2,
      y: this.getTop(),
    };
  },

  moveToCenter() {
    const left = Math.round(this.getLeft() - this.width / 2);
    const top = Math.ceil(this.getTop() - this.height / 2);
    this.set({
      left,
      top,
    });
  },

  toggleActive: function(toggle: boolean) {
    const borderColor = toggle ? remodzyColors.dropAreaActiveColor : remodzyColors.tieLineColor;
    this.active = toggle;
    this.item(0).setOptions({
      stroke: borderColor,
    });
    this.item(1).setOptions({
      fill: borderColor,
      stroke: borderColor,
    });
    this.item(2).setOptions({
      fill: borderColor,
      stroke: borderColor,
    });
  },

  drawPlus() {
    const verticalLine = new fabric.Line(
      [
        dropAreaRoundConfig.radius!,
        dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize * 2,
        dropAreaRoundConfig.radius!,
        dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize,
      ],
      dropAreaPlusConfig,
    );
    const horizontalLine = new fabric.Line(
      [
        dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize * 2,
        dropAreaRoundConfig.radius!,
        dropAreaRoundConfig.radius! * 2 - dropAreaPlusSize,
        dropAreaRoundConfig.radius!,
      ],
      dropAreaPlusConfig,
    );
    return [verticalLine, horizontalLine];
  },

  isActive() {
    return this.active;
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  },
});
