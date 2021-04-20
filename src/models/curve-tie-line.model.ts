import { ObjectTypes } from '../configs/object-types.enum';
import { curvesPath, curveTieLineConfig, CurveTieLineDirection } from './configs/curve-tie-line-config';
import { CurveTieLineCorner } from './curve-tie-line-corner.model';
import { PointCoords } from '../interfaces/point-coords.interface';
import { TieLine } from './tie-line.model';
import { Group } from 'fabric/fabric-impl';
import { curveRoundPartSize, tieLineSize } from '../configs/size.config';

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
      ...topCoords,
    });
  },

  createGroup(): Group[] {
    switch (this.direction) {
      case CurveTieLineDirection.topToLeft:
        return this.createTopToLeftGroup();
      case CurveTieLineDirection.topToRight:
        return this.createTopToRightGroup();
      case CurveTieLineDirection.bottomToLeft:
        return this.createBottomToLeftGroup();
      case CurveTieLineDirection.bottomToRight:
        return this.createBottomToRightGroup();
      default:
        return [];
    }
  },

  createBottomToRightGroup(): Group[] {
    const group: Group[] = [];
    const bottomCornerLeft = this.topCoords.x - curveRoundPartSize;
    const bottomCornerTop = this.topCoords.y - curveRoundPartSize - this.getCurveLineTopMargin();
    const bottomCorner = new CurveTieLineCorner(curvesPath.leftToTop, {
      left: bottomCornerLeft + curveRoundPartSize,
      top: bottomCornerTop,
    });
    group.push(bottomCorner);

    const topCorner = new CurveTieLineCorner(curvesPath.topToLeft, {
      left: this.bottomCoords.x - curveRoundPartSize,
      top: bottomCornerTop - curveRoundPartSize,
    });

    group.push(topCorner);

    const straightLine = new TieLine([
      this.bottomCoords.x - curveRoundPartSize,
      bottomCornerTop,
      bottomCornerLeft + curveRoundPartSize * 2,
      bottomCornerTop,
    ]);

    group.push(straightLine);

    return group;
  },

  createBottomToLeftGroup(): Group[] {
    const group: Group[] = [];
    const bottomCornerLeft = this.topCoords.x - curveRoundPartSize;
    const bottomCornerTop = this.topCoords.y - curveRoundPartSize - this.getCurveLineTopMargin();
    const bottomCorner = new CurveTieLineCorner(curvesPath.rightToTop, {
      left: bottomCornerLeft,
      top: bottomCornerTop,
    });
    group.push(bottomCorner);

    const topCorner = new CurveTieLineCorner(curvesPath.topToRight, {
      left: this.bottomCoords.x,
      top: bottomCornerTop - curveRoundPartSize,
    });

    group.push(topCorner);

    const straightLine = new TieLine([
      this.bottomCoords.x + curveRoundPartSize,
      bottomCornerTop,
      bottomCornerLeft + curveTieLineConfig.strokeWidth!,
      bottomCornerTop,
    ]);

    group.push(straightLine);

    return group;
  },

  createTopToLeftGroup(): Group[] {
    const group: Group[] = [];
    const topCornerLeft = this.topCoords.x - curveRoundPartSize;
    const top = this.topCoords.y + this.getCurveLineTopMargin();
    const topCorner = new CurveTieLineCorner(curvesPath.topToLeft, {
      left: topCornerLeft,
      top,
    });
    group.push(topCorner);
    const bottomCornerTop = top + curveRoundPartSize;
    const bottomCorner = new CurveTieLineCorner(curvesPath.leftToTop, {
      left: this.bottomCoords.x,
      top: bottomCornerTop,
    });
    group.push(bottomCorner);
    const straightLine = new TieLine([
      this.bottomCoords.x + curveRoundPartSize,
      bottomCornerTop,
      topCornerLeft + curveTieLineConfig.strokeWidth!,
      top + curveRoundPartSize,
    ]);
    group.push(straightLine);
    return group;
  },

  createTopToRightGroup(): Group[] {
    const group: Group[] = [];
    const top = this.topCoords.y + this.getCurveLineTopMargin();
    const topCorner = new CurveTieLineCorner(curvesPath.topToRight, {
      left: this.topCoords.x,
      top: top,
    });
    group.push(topCorner);
    const bottomCornerTop = this.topCoords.y + curveRoundPartSize + this.getCurveLineTopMargin();
    const bottomCorner = new CurveTieLineCorner(curvesPath.rightToTop, {
      left: this.bottomCoords.x - curveRoundPartSize,
      top: bottomCornerTop,
    });

    group.push(bottomCorner);
    const straightLine = new TieLine([
      this.topCoords.x + curveRoundPartSize,
      top + curveRoundPartSize,
      this.bottomCoords.x + curveTieLineConfig.strokeWidth! - curveRoundPartSize,
      top + curveRoundPartSize,
    ]);
    group.push(straightLine);
    return group;
  },

  getCurveLineTopMargin() {
    return tieLineSize.margin + 1;
  },
});
