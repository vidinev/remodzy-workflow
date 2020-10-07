import { ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';

export const tieLineConfig: ILineOptions = {
  strokeWidth: 1.5,
  fill: remodzyColors.tieLineColor,
  stroke:  remodzyColors.tieLineColor,
  selectable: false,
  evented: false,
};
