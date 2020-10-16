import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowState } from '../interfaces/state-language.interface';
import { stateRectConfig, stateTextConfig } from './configs/state-group-config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { IDropAreaGroup } from './interfaces/drop-area.interface';
import { ITiePointCircle } from './interfaces/tie-point.interface';

export const StateGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.state,
  _dropArea: null,
  _topTiePoint: null,
  _bottomTiePoint: null,
  _active: false,

  initialize: function(stateData: WorkflowState, options: IObjectOptions = { }, isStart: boolean) {
    const stateContainerObject = new fabric.Rect(stateRectConfig);
    const stateText = stateData.Comment || stateData.Parameters?.taskType || '';
    const stateTextObject = new fabric.Textbox(stateText, stateTextConfig);

    this.callSuper('initialize', [stateContainerObject, stateTextObject], {
      hasControls: false,
      hasBorders: false,
      ...options,
      data: {
        ...stateData,
        Start: isStart,
        stateId: (stateData.Parameters && stateData.Parameters.stateId) || '',
      },
    });
  },

  getCenterBottomCoords(): PointCoords {
    return {
      x: Math.ceil((this.left || 0) + this.width / 2),
      y: this.top + this.height - 1
    };
  },

  getStateData(): WorkflowState {
    const { stateId, Start, ...stateData } = this.data;
    return stateData;
  },

  isBranchRoot(): boolean {
    return !!this.data?.Branches?.length;
  },

  getDropArea(): IDropAreaGroup {
    return this._dropArea;
  },

  setDropArea(dropArea: IDropAreaGroup) {
    this._dropArea = dropArea;
  },

  setTopTiePoint(tiePoint: ITiePointCircle) {
    this._topTiePoint = tiePoint;
  },

  getTopTiePoint(): ITiePointCircle {
    return this._topTiePoint;
  },

  setBottomTiePoint(tiePoint: ITiePointCircle) {
    this._bottomTiePoint = tiePoint;
  },

  getBottomTiePoint(): ITiePointCircle {
    return this._bottomTiePoint;
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
