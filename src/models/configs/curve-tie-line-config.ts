import { ILineOptions } from 'fabric/fabric-impl';
import { remodzyColors } from '../../configs/colors.config';
import { strokeWidth } from '../../configs/size.config';

export const curveTieLineConfig: ILineOptions = {
  strokeWidth,
  fill: '',
  stroke: remodzyColors.tieLineColor,
  objectCaching: false,
  selectable: false,
  evented: false,
};

export enum CurveTieLineDirection {
  topToRight = 'topToRight',
  topToLeft = 'topToLeft',
  bottomToLeft = 'bottomToLeft',
  bottomToRight = 'bottomToRight'
}

export const curvesPath = {
  topToLeft: 'M 14 0 L 14 3 Q 14 14 3 14 L 0 14',
  topToRight: 'M 1 0 L 1 3 Q 1 14 12 14 L 15 14',
  leftToTop: 'M 15 1 L 12 1 Q 1 1 1 12 L 1 15',
  rightToTop: 'M 0 1 L 3 1 Q 14 1 14 12 L 14 15',
};
