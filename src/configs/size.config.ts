import { MathService } from '../services/math.service'

export const stateItemSize = {
  width: 280,
  height: 64,
  dragDropAngle: 4,
  fontSize: 14,
  margin: 70
};

export const dropAreaSize = {
  width: 248,
  height: 32,
  fontSize: 13
};

export const topAngleOffset = stateItemSize.width
  * MathService.getTanDeg(stateItemSize.dragDropAngle) / 2;
export const leftAngleOffset = stateItemSize.height
  * MathService.getTanDeg(stateItemSize.dragDropAngle) / 2;
