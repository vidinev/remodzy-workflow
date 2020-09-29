import { IRectOptions, ITextboxOptions, Shadow } from 'fabric/fabric-impl';
import { remodzyColors } from './colors.config';
import { dropAreaSize, stateItemSize } from './size.config';

export const canvasConfig = {
  width: 1200,
  height: 800,
  backgroundColor: remodzyColors.canvasBg,
};

export const stateRectConfig: IRectOptions = {
  fill: remodzyColors.rectBgColor,
  width: stateItemSize.width,
  height: stateItemSize.height,
  rx: 12,
  ry: 12,
  selectable: false,
  shadow: {
    color: 'rgba(0, 0, 0, .005)',
    blur: 10,
    offsetY: 4,
  } as Shadow,
};

export const stateTextConfig: ITextboxOptions = {
  width: stateItemSize.width,
  top: Math.round(stateItemSize.height / 2 - stateItemSize.fontSize / 2),
  fontSize: stateItemSize.fontSize,
  selectable: false,
  fontFamily: 'Manrope',
  fontWeight: 400,
  textAlign: 'center',
  fill: remodzyColors.rectTextColor,
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

export const dropAreaTextConfig = {
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
