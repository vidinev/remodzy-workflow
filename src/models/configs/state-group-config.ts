import { IRectOptions, ITextboxOptions, Shadow } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';
import { passStateItemSize, stateItemSize } from '../../configs/size.config';

export const stateRectConfig: IRectOptions = {
  fill: remodzyColors.rectBgColor,
  width: stateItemSize.width,
  height: stateItemSize.height,
  rx: 12,
  ry: 12,
  selectable: false,
  objectCaching: false,
  shadow: {
    color: 'rgba(0, 0, 0, .005)',
    blur: 10,
    offsetY: 4,
  } as Shadow,
};

export const draftRectConfig: IRectOptions = {
  width: stateItemSize.width,
  height: stateItemSize.height,
  selectable: false,
  objectCaching: false,
};

export const passStateRectConfig: IRectOptions = {
  ...stateRectConfig,
  width: passStateItemSize.width,
  height: passStateItemSize.height,
  rx: 8,
  ry: 8,
  objectCaching: false,
};

export const draftPassRectConfig: IRectOptions = {
  width: passStateItemSize.width,
  height: passStateItemSize.height,
  selectable: false,
  objectCaching: false,
};

export const stateTextConfig: ITextboxOptions = {
  width: stateItemSize.width,
  top: Math.round(stateItemSize.height / 2 - stateItemSize.fontSize / 2),
  fontSize: stateItemSize.fontSize,
  selectable: false,
  fontFamily: 'Manrope',
  fontWeight: 400,
  strokeWidth: 0.1,
  textAlign: 'center',
  fill: remodzyColors.rectTextColor,
  objectCaching: false,
};

export const passStateTextConfig: ITextboxOptions = {
  ...stateTextConfig,
  width: passStateItemSize.width,
  top: Math.round(passStateItemSize.height / 2 - passStateItemSize.fontSize / 2),
  objectCaching: false,
};
