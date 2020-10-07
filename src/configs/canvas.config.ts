import { IRectOptions, ITextboxOptions } from 'fabric/fabric-impl';
import { remodzyColors } from './colors.config';
import { dropAreaSize } from './size.config';

export const canvasConfig = {
  width: 1200,
  height: 800,
  backgroundColor: remodzyColors.canvasBg,
};

export const dropAreaConfig: IRectOptions = {
  fill: 'transparent',
  width: dropAreaSize.width,
  height: dropAreaSize.height,
  hoverCursor: 'default',
  rx: 8,
  ry: 8,
  stroke: remodzyColors.dropAreaStrokeColor,
  strokeDashArray: [4, 4],
  strokeWidth: 1.5,
  selectable: false,
};

export const dropAreaTextConfig: ITextboxOptions = {
  width: dropAreaSize.width,
  fontSize: dropAreaSize.fontSize,
  top: Math.round(dropAreaSize.height / 2 - dropAreaSize.fontSize / 2),
  selectable: false,
  hoverCursor: 'default',
  fontFamily: 'Manrope',
  fontWeight: 400,
  textAlign: 'center',
  fill: remodzyColors.dropAreaTextColor,
};
