import { ObjectTypes } from '../configs/object-types.enum';
import {
  curveRoundPartSize,
  curvesPath,
  curveTieLineConfig,
  CurveTieLineDirection,
} from './configs/curve-tie-line-config';
import { CurveTieLineCorner } from './curve-tie-line-corner.model';
import { PointCoords } from '../interfaces/point-coords.interface';
import { TieLine } from './tie-line.model';
import { Group } from 'fabric/fabric-impl';

export const CurveTieLine = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.curveTieLine,
  _active: false,
  topCoords: null,
  bottomCoords: null,
  direction: null,

  initialize: function(direction: CurveTieLineDirection, topCoords: PointCoords, bottomCoords: PointCoords) {
    this.direction = direction;
    this.topCoords = topCoords;
    this.bottomCoords = bottomCoords;

    const group = this.createGroup();

    this.callSuper('initialize', group, {
      selectable: false,
      evented: false,
      ...topCoords
    });
  },

  createGroup(): Group[] {
    switch (this.direction) {
      case CurveTieLineDirection.topToLeft:
        return this.createTopToLeftGroup();
      case CurveTieLineDirection.topToRight:
        return this.createTopToRightGroup();
      default:
        return [];
    }
  },

  createTopToLeftGroup(): Group[] {
    const group: Group[] = [];
    const topCornerLeft = this.topCoords.x - curveRoundPartSize;
    const topCorner = new CurveTieLineCorner(curvesPath.topToLeft, {
      left: topCornerLeft,
      top: this.topCoords.y,
    });
    group.push(topCorner);
    const bottomCornerTop = this.topCoords.y + curveRoundPartSize;
    const bottomCorner = new CurveTieLineCorner(curvesPath.leftToTop, {
      left: this.bottomCoords.x,
      top: bottomCornerTop,
    });
    group.push(bottomCorner);
    const straightLine = new TieLine([
      this.bottomCoords.x + curveRoundPartSize,
      bottomCornerTop - curveTieLineConfig.strokeWidth! * 2,
      topCornerLeft + curveTieLineConfig.strokeWidth!,
      this.topCoords.y + curveRoundPartSize + curveTieLineConfig.strokeWidth! * 2
    ]);
    group.push(straightLine);
    return group;
  },

  createTopToRightGroup(): Group[] {
    const group: Group[] = [];
    const topCorner = new CurveTieLineCorner(curvesPath.topToRight, {
      left: this.topCoords.x,
      top: this.topCoords.y,
    });
    group.push(topCorner);
    const bottomCornerTop = this.topCoords.y + curveRoundPartSize;
    const bottomCorner = new CurveTieLineCorner(curvesPath.rightToTop, {
      left: this.bottomCoords.x,
      top: bottomCornerTop,
    });

    group.push(bottomCorner);
    const straightLine = new TieLine([
      this.topCoords.x + curveRoundPartSize,
      this.topCoords.y + curveRoundPartSize - curveTieLineConfig.strokeWidth! * 2,
      this.bottomCoords.x + curveTieLineConfig.strokeWidth!,
      this.topCoords.y + curveRoundPartSize + curveTieLineConfig.strokeWidth! * 2,
    ]);
    group.push(straightLine);
    return group;
  }
});
