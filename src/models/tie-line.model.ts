import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { tieLineConfig } from './configs/tie-line-config';
import { tieLineSize } from '../configs/size.config';
import { RemodzyWfDirection } from '../interfaces/workflow-settings.interface';

export const TieLine = fabric.util.createClass(fabric.Line, {
  type: ObjectTypes.tieLine,
  _active: false,

  initialize: function([fromX, fromY, toX, toY]: number[],
                       marginStart: number = tieLineSize.margin,
                       marginEnd: number = tieLineSize.margin,
                       direction: RemodzyWfDirection,
                       options: IObjectOptions = { }) {
    // TODO remove direction logic
    const coords = direction === RemodzyWfDirection.horizontal
      ? [fromX + marginStart, fromY, toX - marginEnd, toY]
      : [fromX, fromY + marginStart, toX, toY - marginEnd];
    this.callSuper('initialize', coords, {
      ...tieLineConfig,
      ...options
    });
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
