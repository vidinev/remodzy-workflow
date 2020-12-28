import { ICircleOptions, ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';

export const dropAreaPlusConfig: ILineOptions = {
  fill: remodzyColors.tieLineColor,
  stroke: remodzyColors.tieLineColor,
  strokeWidth: 1.5,
  selectable: false,
  evented: false,
};

export const dropAreaRoundConfig: ICircleOptions = {
  fill: 'transparent',
  radius: 16,
  stroke: remodzyColors.tieLineColor,
  strokeWidth: 1.5,
  selectable: false,
  hoverCursor: 'default',
};

export const dropAreaPlusSize = 10;
