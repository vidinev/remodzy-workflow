import { ICircleOptions } from 'fabric/fabric-impl';
import { tiePointSize } from '../../configs/size.config';
import { remodzyColors } from '../../configs/colors.config';

export const tiePointConfig: ICircleOptions = {
  radius: tiePointSize.radius,
  fill: remodzyColors.canvasBg,
  stroke: remodzyColors.tiePointStrokeColor,
  strokeWidth: 1.5,
  selectable: false,
  evented: false,
  hoverCursor: 'default'
};
