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
import { BranchItems } from './branch-items.model';
import { CoordsService } from '../services/coords.service';
import { passStateOffset } from '../configs/size.config';
import { IConnectPoint } from './interfaces/connect-point.interface';

export const StateGroup = fabric.util.createClass(fabric.Group, {
  type: ObjectTypes.state,
  _childrenBranches: [],
  _dropArea: null,
  _connectPoint: null,
  _topTiePoint: null,
  _bottomTiePoint: null,
  _rightTiePoint: null,
  _leftTiePoint: null,
  _active: false,

  initialize: function(
    stateData: WorkflowState,
    options: IObjectOptions = {},
    isStart: boolean,
    parentStateId: string,
  ) {
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
        parentStateId,
        stateId: (stateData.Parameters && stateData.Parameters.stateId) || '',
      },
    });
    this.set({
      originLeft: options.left,
      originTop: options.top,
    });
  },

  getTop(): number {
    return this.originTop || this.top || 0;
  },

  getLeft(): number {
    return this.originLeft || this.left || 0;
  },

  getCenterBottomCoords(): PointCoords {
    switch (this.data.Type) {
      case StateTypesEnum.Pass:
        return {
          x: Math.ceil(this.getLeft() + passStateOffset + this.width / 2),
          y: this.getTop() + this.height - 1,
        };
      default:
        return {
          x: Math.ceil(this.getLeft() + this.width / 2),
          y: this.getTop() + this.height - 1,
        };
    }
  },

  getCenterRightCoords(): PointCoords {
    return {
      x: this.getLeft() + this.width,
      y: Math.ceil(this.getTop() + this.height / 2),
    };
  },

  getCenterLeftCoords(): PointCoords {
    return {
      x: this.getLeft(),
      y: Math.ceil(this.getTop() + this.height / 2),
    };
  },

  getCenterTopCoords(): PointCoords {
    switch (this.data.Type) {
      case StateTypesEnum.Pass:
        return {
          x: Math.ceil(this.getLeft() + passStateOffset + this.width / 2),
          y: this.getTop(),
        };
      default:
        return {
          x: Math.ceil(this.getLeft() + this.width / 2),
          y: this.getTop(),
        };
    }
  },

  getStateData(): WorkflowState {
    const { stateId, Start, ...stateData } = this.data;
    return stateData;
  },

  isBranchRoot(): boolean {
    return !!this.data?.Branches?.length;
  },

  isMainRoot(): boolean {
    return this.data.Start && !this.data.parentStateId;
  },

  isInMainBranch(): boolean {
    return !this.data.parentStateId;
  },

  getDropArea(): IDropAreaGroup {
    return this._dropArea;
  },

  setDropArea(dropArea: IDropAreaGroup) {
    this._dropArea = dropArea;
  },

  getConnectPoint(): IConnectPoint {
    return this._connectPoint;
  },

  setConnectPoint(connectPoint: IConnectPoint) {
    this._connectPoint = connectPoint;
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

  setBranchItems(branchItems: BranchItems[]): void {
    this._childrenBranches = [...branchItems];
  },

  getBranchItems(): BranchItems[] {
    return this._childrenBranches || [];
  },

  getChildrenStates(): IStateGroup[] {
    let states: IStateGroup[] = [];
    const branches = (this._childrenBranches || []) as BranchItems[];
    branches.forEach((branch: BranchItems) => {
      states = [...states, ...(branch.states || [])];
    });
    return states;
  },

  getRightMostItemCoordsUnderChildren(passStateAsFullState: boolean = false): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterRightCoords(this.getChildrenStates(), passStateAsFullState);
  },

  getLeftMostItemCoordsUnderChildren(): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterLeftCoords(this.getChildrenStates());
  },

  getCenterBottomCoordsUnderChildren(): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterBottomCoords(this.getChildrenStates());
  },

  getCenterTopCoordsAboveChildren(): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterTopCoords(this.getChildrenStates());
  },

  alignCenter() {
    switch (this.data.Type) {
      case StateTypesEnum.Pass:
        const left = this.originLeft + passStateOffset;
        this.set({ left });
    }
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
    return options;
  },

  _render: function(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
  },
});
