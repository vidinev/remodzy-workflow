import { ICircleOptions } from 'fabric/fabric-impl';
import { strokeWidth, tiePointSize } from '../../configs/size.config';
import { remodzyColors } from '../../configs/colors.config';

export const tiePointConfig: ICircleOptions = {
  radius: tiePointSize.radius,
  fill: remodzyColors.canvasBg,
  stroke: remodzyColors.tiePointStrokeColor,
  strokeWidth,
  selectable: false,
  evented: false,
  hoverCursor: 'default',
  objectCaching: false,
};
