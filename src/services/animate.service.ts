import { Canvas, IEvent, IUtilAnimationOptions } from 'fabric/fabric-impl';
import { stateItemSize } from '../configs/size.config';

export class AnimateService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  animateDragDrop(event: IEvent, dir: number) {
    const duration = 50;
    const opacityDelta = 0.5;
    const angleDelta = dir ? stateItemSize.dragDropAngle : -stateItemSize.dragDropAngle;
    if (event.target) {
      const angle = event.target.get('angle') || 0;
      fabric.util.animate({
        startValue: angle,
        endValue: angle + angleDelta,
        duration,
        onChange: (value) => {
          if (event.target) {
            event.target.rotate(value);
            this.canvas.renderAll();
          }
        },
        easing: fabric.util.ease.easeOutSine,
      } as IUtilAnimationOptions);
      const opacity = event.target.get('opacity') || 0;
      fabric.util.animate({
        startValue: opacity,
        endValue: opacity + (dir ? -opacityDelta : opacityDelta),
        duration,
        onChange: (value) => {
          if (event.target) {
            event.target.setOptions({ opacity: value });
            this.canvas.renderAll();
          }
        },
      } as IUtilAnimationOptions);
    }
  }
}
