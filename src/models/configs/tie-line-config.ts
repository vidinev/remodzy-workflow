import { ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';
import { strokeWidth } from '../../configs/size.config';

export const tieLineConfig: ILineOptions = {
  strokeWidth,
  fill: remodzyColors.tieLineColor,
  stroke: remodzyColors.tieLineColor,
  selectable: false,
  objectCaching: false,
  evented: false,
};
