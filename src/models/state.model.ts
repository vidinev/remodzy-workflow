import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowState } from '../interfaces/state-language.interface';
import {
  passStateRectConfig,
  passStateTextConfig,
  stateRectConfig,
  stateTextConfig,
} from './configs/state-group-config';
import { PointCoords } from '../interfaces/point-coords.interface';
import { IDropAreaGroup } from './interfaces/drop-area.interface';
import { ITiePointCircle } from './interfaces/tie-point.interface';
import { IStateGroup } from './interfaces/state.interface';
import { StateTypesEnum } from '../configs/state-types.enum';

export const StateGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.state,
  _childrenStates: [],
  _dropArea: null,
  _topTiePoint: null,
  _bottomTiePoint: null,
  _rightTiePoint: null,
  _leftTiePoint: null,
  _active: false,

  initialize: function(stateData: WorkflowState, options: IObjectOptions = { }, isStart: boolean) {
    const rectConfig = this._getConfig(stateData.Type);
    const stateContainerObject = new fabric.Rect(rectConfig);
    const stateText = stateData.Comment || stateData.Parameters?.taskType || '';
    const stateTextObject = new fabric.Textbox(stateText, this._getTextConfig(stateData.Type));

    this.callSuper('initialize', [stateContainerObject, stateTextObject], {
      hasControls: false,
      hasBorders: false,
      ...this._getOptions(stateData.Type, options),
      data: {
        ...stateData,
        Branches: stateData.Branches || null,
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

  getCenterRightCoords(): PointCoords {
    return {
      x: (this.left || 0) + this.width,
      y: Math.ceil((this.top || 0) + this.height / 2),
    };
  },

  getCenterLeftCoords(): PointCoords {
    return {
      x: (this.left || 0),
      y: Math.ceil((this.top || 0) + this.height / 2),
    };
  },

  getCenterTopCoords(): PointCoords {
    return {
      x: (this.left || 0) + this.width / 2,
      y: this.top
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

  setLeftTiePoint(tiePoint: ITiePointCircle) {
    this._leftTiePoint = tiePoint;
  },

  getLeftTiePoint(): ITiePointCircle {
    return this._leftTiePoint;
  },

  setRightTiePoint(tiePoint: ITiePointCircle) {
    this._rightTiePoint = tiePoint;
  },

  getRightTiePoint(): ITiePointCircle {
    return this._rightTiePoint;
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

  addChildState(state: IStateGroup): void {
    if (state && state.type === ObjectTypes.state) {
      this._childrenStates.push(state);
    }
  },

  getChildrenStates(): IStateGroup[] {
    return this._childrenStates;
  },

  getCenterBottomCoordsUnderChildren(): PointCoords {
    let lowerItem: IStateGroup = { } as IStateGroup;
    this._childrenStates.forEach((state: IStateGroup) => {
      if ((state.top || 0) > (lowerItem?.top || 0)) {
        lowerItem = state;
      }
    });
    return lowerItem.getCenterBottomCoords();
  },

  _getConfig(type: string) {
    switch (type) {
      case StateTypesEnum.Pass:
        return passStateRectConfig;
      default:
        return stateRectConfig;
    }
  },

  _getTextConfig(type: string) {
    switch (type) {
      case StateTypesEnum.Pass:
        return passStateTextConfig;
      default:
        return stateTextConfig;
    }
  },

  _getOptions(type: string, options: IObjectOptions) {
    switch (type) {
      case StateTypesEnum.Pass:
        const passStateOffset = (stateRectConfig.width! - passStateRectConfig.width!) / 2;
        return {
          ...options,
          left: (options.left || 0) + passStateOffset
        };
      default:
        return options;
    }
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  }
});
