import { MathService } from '../services/math.service';
import { MarginSize } from '../interfaces/margin-size.interface';

export const canvasSize = {
  width: 3000,
  height: 1600,
};

export const strokeWidth = 1.5;

export const stateItemSize = {
  width: 280,
  height: 64,
  dragDropAngle: 4,
  fontSize: 14,
};

export const passStateItemSize = {
  width: 160,
  height: 36,
  fontSize: stateItemSize.fontSize,
  dragDropAngle: stateItemSize.dragDropAngle,
};

export const dropAreaSize = {
  width: 248,
  height: 32,
  fontSize: 13,
};

export const tiePointSize = {
  radius: 6,
};

export const tieLineSize = {
  margin: 3,
};

export const curveRoundPartSize = 14;

const margins = {
  verticalMargin: 76,
  horizontalMargin: 80,
  branchesMargin: 0,
  stateToBranchMargin: tieLineSize.margin * 2 + tiePointSize.radius + curveRoundPartSize * 2,
};

const marginForCustomDropArea = dropAreaSize.height + strokeWidth * 2 + margins.verticalMargin / 2;

export const marginSize: MarginSize = {
  ...margins,
  marginForCustomDropArea,
};

export const topAngleOffset = (stateItemSize.width * MathService.getTanDeg(stateItemSize.dragDropAngle)) / 2;
export const leftAngleOffset = (stateItemSize.height * MathService.getTanDeg(stateItemSize.dragDropAngle)) / 2;

export const passStateOffset = (stateItemSize.width! - passStateItemSize.width!) / 2;
