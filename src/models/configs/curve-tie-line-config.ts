import { ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';

export const curveTieLineConfig: ILineOptions = {
  strokeWidth: 1.5,
  fill: '',
  stroke:  remodzyColors.tieLineColor,
  objectCaching: false,
  selectable: false,
  evented: false,
};

export const curvesPath = {
  topToLeft: 'M 14 0 L 14 3 Q 14 14 3 14 L 0 14',
  topToRight: 'M 1 0 L 1 3 Q 1 14 12 14 L 15 14',
};
