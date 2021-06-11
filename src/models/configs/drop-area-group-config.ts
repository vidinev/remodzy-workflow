import { ICircleOptions, ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';
import { strokeWidth } from '../../configs/size.config';

export const dropAreaPlusConfig: ILineOptions = {
  fill: remodzyColors.tieLineColor,
  stroke: remodzyColors.tieLineColor,
  strokeWidth,
  selectable: false,
  evented: false,
  objectCaching: false,
};

export const dropAreaRoundConfig: ICircleOptions = {
  fill: 'transparent',
  radius: 16,
  stroke: remodzyColors.tieLineColor,
  strokeWidth,
  selectable: false,
  hoverCursor: 'default',
  objectCaching: false,
};

export const dropAreaPlusSize = 10;
