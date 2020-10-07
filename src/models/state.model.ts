import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowState } from '../interfaces/state-language.interface';
import { stateRectConfig, stateTextConfig } from './configs/state-group-config';
import { PointCoords } from '../interfaces/point-coords.interface';

export const StateGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.state,
  _active: false,

  initialize: function(stateData: WorkflowState, options: IObjectOptions = { }) {
    const stateContainerObject = new fabric.Rect(stateRectConfig);
    const stateText = stateData.Comment || stateData.Parameters?.taskType || '';
    const stateTextObject = new fabric.Textbox(stateText, stateTextConfig);

    this.callSuper('initialize', [stateContainerObject, stateTextObject], {
      hasControls: false,
      hasBorders: false,
      ...options,
      data: {
        ...stateData,
        stateId: (stateData.Parameters && stateData.Parameters.stateKey) || '',
      },
    });
  },

  getCenterBottomCoords(): PointCoords {
    return {
      x: Math.ceil((this.left || 0) + this.width / 2),
      y: this.top + this.height - 1
    };
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
