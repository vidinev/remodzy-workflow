import { IRectOptions, ITextboxOptions, Shadow } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';
import { stateItemSize } from '../../configs/size.config';

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
