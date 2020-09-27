import { Canvas, IEvent, IRectOptions, IUtilAnimationOptions, Object } from 'fabric/fabric-impl'
import { MathService } from './services/math.service'
import { data } from './configs/data.config'

// Fix drop area highlight
// Replace functions with arrow
// Remove ! and ? where we don't need it
// Add interfaces, remove any
// Merge all js files into one
// Highlight drop area when drag over it correctly
// Drop basic bounding lines
// move colors to constant
// Move logic to lib
// Refactor oop
// Use main state object to keep info about all canvas objects
// Test lib basic functionality

const stateItemSize = {
  width: 280,
  height: 64,
  dragDropAngle: 4,
  fontSize: 14,
  margin: 70
};

const dropAreaSize = {
  width: 248,
  height: 32,
  fontSize: 13,
  idPrefix: 'DropArea'
};

const canvasConfig = {
  width: 1200,
  height: 800,
  backgroundColor: '#f8f9fb'
};

const topOffset = stateItemSize.width * MathService.getTanDeg(stateItemSize.dragDropAngle) / 2;
const leftOffset = stateItemSize.height * MathService.getTanDeg(stateItemSize.dragDropAngle) / 2;
let currentOffset = stateItemSize.margin;

const canvas: Canvas = new fabric.Canvas('main-canvas', canvasConfig);
const dropAreas: Object[] = [];

let currentDragTop: number|null;
canvas.on('mouse:down', (event: IEvent) => {
  if (isDragEventAllowed(event.target)) {
    if (event?.target?.data.id) {
      drawState(event.target.top, data.States[event.target.data.id]);
    }
    currentDragTop = event?.target?.get('top') || null;
    animate(event, 1);
  }
});
canvas.on('mouse:up', function(event: IEvent) {
  if (isDragEventAllowed(event.target)) {
    currentDragTop = null;
    canvas.remove(canvas.getActiveObject());
    animate(event, 0);
  }
});
canvas.on('object:moved', function () {
  canvas.remove(canvas.getActiveObject());
});
canvas.on('dragenter', function (e) {
  console.log(e);
});
canvas.on('object:moving', function(event: IEvent) {
  if (event.target && currentDragTop && isDragEventAllowed(event.target)) {
    const { left = 0, top = 0 } = event.target;
    if (left + stateItemSize.width + leftOffset >= canvas.width!) {
      event.target.left = canvas.width! - stateItemSize.width - leftOffset;
    }
    if (left <= leftOffset) {
      event.target.left = leftOffset;
    }
    if (top <= topOffset) {
      event.target.top = topOffset;
    }
    if (top + stateItemSize.height + topOffset >= canvas.height!) {
      event.target.top = canvas.height! - stateItemSize.height - topOffset;
    }
    event.target.set({
      top: (event.target.get('top') || 0) - topOffset,
      left: (event.target.get('left') || 0) + leftOffset
    });
  }
  if (event.target) {
    dropAreas.forEach((obj: Object) => {
      event.target!.setCoords();
      obj.set('opacity', event.target!.intersectsWithObject(obj) ? 0.5 : 1);
    });
  }
});

const manropeFont = new FontFaceObserver('Manrope');

(async () => {
  await manropeFont.load();
  let currentState = data.States[data.StartAt];
  while (!currentState.End) {
    drawState(currentOffset, currentState);
    drawDropArea(currentOffset, currentState);
    currentState = data.States[currentState.Next];
    currentOffset += stateItemSize.margin + stateItemSize.height;
  }
})();

function drawState(topOffset: number = 0, stateData: any) {
  const stateContainer = new fabric.Rect({
    fill: '#fff',
    width: stateItemSize.width,
    height: stateItemSize.height,
    rx: 12,
    ry: 12,
    selectable: false,
    shadow: {
      color: 'rgba(0, 0, 0, .005)',
      blur: 10,
      offsetY: 4
    }
  } as IRectOptions);

  const stateText = new fabric.Textbox(stateData.Comment || stateData.Parameters.taskType, {
    width: stateItemSize.width,
    top: Math.round(stateItemSize.height / 2 - stateItemSize.fontSize / 2),
    fontSize: stateItemSize.fontSize,
    selectable: false,
    fontFamily: 'Manrope',
    fontWeight: 400,
    textAlign: 'center',
    fill: '#202B3D'
  });

  const stateGroup = new fabric.Group([ stateContainer, stateText ], {
    left: Math.round(canvas.width! / 2 - stateItemSize.width / 2),
    top: topOffset,
    hasControls: false,
    hasBorders: false,
    hoverCursor: 'pointer',
    data: {
      id: stateData.Parameters && stateData.Parameters.current || ''
    }
  });

  canvas.add(stateGroup);
}

function drawDropArea(topOffset: number = 0, stateData: any) {
  const top = topOffset + stateItemSize.height + stateItemSize.margin / 2 - dropAreaSize.height / 2;
  const dropArea = new fabric.Rect({
    fill: 'transparent',
    width: dropAreaSize.width,
    height: dropAreaSize.height,
    hoverCursor: 'default',
    rx: 8,
    ry: 8,
    stroke: 'rgba(44, 73, 122, 0.1)',
    strokeDashArray: [4, 4],
    strokeWidth: 1.5,
    selectable: false
  });

  const dropAreaText = new fabric.Textbox('Drop here', {
    width: dropAreaSize.width,
    fontSize: dropAreaSize.fontSize,
    top: Math.round(dropAreaSize.height / 2 - dropAreaSize.fontSize / 2),
    selectable: false,
    hoverCursor: 'default',
    fontFamily: 'Manrope',
    fontWeight: 400,
    textAlign: 'center',
    fill: '#929CAD'
  });

  const dropAreaGroup = new fabric.Group([ dropArea, dropAreaText ], {
    left: Math.round(canvas.width! / 2 - dropAreaSize.width / 2),
    top,
    selectable: false,
    hoverCursor: 'default',
    data: {
      id: `${dropAreaSize.idPrefix}${stateData.Parameters && stateData.Parameters.current || ''}`
    }
  });

  canvas.add(dropAreaGroup);
}

function animate(e: IEvent, dir: number) {
  if (e.target) {
    fabric.util.animate({
      startValue: e.target.get('angle')!,
      endValue: e.target.get('angle')! + (dir ? stateItemSize.dragDropAngle : -stateItemSize.dragDropAngle),
      duration: 80,
      onChange: function(value) {
        e.target?.rotate(value);
        canvas.renderAll();
      },
      easing: fabric.util.ease.easeOutSine
    } as IUtilAnimationOptions);
    fabric.util.animate({
      startValue: e.target.get('opacity')!,
      endValue: e.target.get('opacity')! + (dir ? -.5 : .5),
      duration: 80,
      onChange: function(value) {
        e.target?.setOptions({ opacity: value });
        canvas.renderAll();
      }
    } as IUtilAnimationOptions);
  }
}

function isDragEventAllowed(target?: Object) {
  return target && target.selectable;
}
