import { MathService } from '../services/math.service';

export const canvasSize = {
  width: 2400,
  height: 1200,
};

export const stateItemSize = {
  width: 280,
  height: 64,
  dragDropAngle: 4,
  fontSize: 14,
};

export const passStateItemSize = {
  width: 144,
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

export const marginSize = {
  verticalMargin: 76,
  horizontalMargin: 40,
  stateToBranchMargin: tieLineSize.margin * 2 + tiePointSize.radius + curveRoundPartSize * 2 + 3,
};

export const topAngleOffset = (stateItemSize.width * MathService.getTanDeg(stateItemSize.dragDropAngle)) / 2;
export const leftAngleOffset = (stateItemSize.height * MathService.getTanDeg(stateItemSize.dragDropAngle)) / 2;
