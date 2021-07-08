import { IObjectOptions } from 'fabric/fabric-impl';
import { ObjectTypes } from '../configs/object-types.enum';
import { WorkflowState } from '../interfaces/state-language.interface';
import {
  draftPassRectConfig,
  draftRectConfig,
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
import { UtilsService } from '../services/utils.service';

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
    draft: boolean,
  ) {
    const rectConfig = this._getConfig(stateData.Type, draft);
    const stateContainerObject = new fabric.Rect(rectConfig);
    const stateText = stateData.Comment || stateData.Parameters?.taskType || '';
    const items: any[] = [stateContainerObject];
    if (!draft) {
      items.push(new fabric.Textbox(stateText, this._getTextConfig(stateData.Type)));
    }

    this.callSuper('initialize', items, {
      hasControls: false,
      hasBorders: false,
      ...options,
      left: Math.floor(options.left || 0),
      top: Math.floor(options.top || 0),
      data: {
        ...stateData,
        Branches: stateData.Branches || null,
        Start: isStart,
        parentStateId,
        stateId: (stateData.Parameters && stateData.Parameters.stateId) || '',
      },
    });
  },

  getTop(): number {
    if (this.absoluteTop) {
      return this.absoluteTop;
    }
    this.absoluteTop = UtilsService.getAbsolute(this, 'top');
    return this.absoluteTop;
  },

  getLeft(): number {
    if (this.absoluteLeft) {
      return this.absoluteLeft;
    }
    this.absoluteLeft = UtilsService.getAbsolute(this, 'left');
    return this.absoluteLeft;
  },

  getCenterBottomCoords(): PointCoords {
    if (this.centerBottomCoords) {
      return this.centerBottomCoords;
    }
    this.centerBottomCoords = {
      x: Math.ceil(this.getLeft() + this.width / 2),
      y: this.getTop() + this.height - 1,
    };
    return this.centerBottomCoords;
  },

  getCenterRightCoords(): PointCoords {
    if (this.centerRightCoords) {
      return this.centerRightCoords;
    }
    this.centerRightCoords = {
      x: this.getLeft() + this.width,
      y: Math.ceil(this.getTop() + this.height / 2),
    };
    return this.centerRightCoords;
  },

  getCenterLeftCoords(): PointCoords {
    if (this.centerLeftCoords) {
      return this.centerLeftCoords;
    }
    this.centerLeftCoords = {
      x: this.getLeft(),
      y: Math.ceil(this.getTop() + this.height / 2),
    };
    return this.centerLeftCoords;
  },

  getCenterTopCoords(): PointCoords {
    if (this.centerTopCoords) {
      return this.centerTopCoords;
    }
    this.centerTopCoords = {
      x: Math.ceil(this.getLeft() + this.width / 2),
      y: this.getTop(),
    };
    return this.centerTopCoords;
  },

  cacheCoords() {
    this.absoluteTop = UtilsService.getAbsolute(this, 'top');
    this.absoluteLeft = UtilsService.getAbsolute(this, 'left');
    this.centerTopCoords = {
      x: Math.ceil(this.getLeft() + this.width / 2),
      y: this.getTop(),
    };
    this.centerLeftCoords = {
      x: this.getLeft(),
      y: Math.ceil(this.getTop() + this.height / 2),
    };
    this.centerBottomCoords = {
      x: Math.ceil(this.getLeft() + this.width / 2),
      y: this.getTop() + this.height - 1,
    };
    this.centerRightCoords = {
      x: this.getLeft() + this.width,
      y: Math.ceil(this.getTop() + this.height / 2),
    };
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
    if (this.isBranchRoot()) {
      const branches = (this._childrenBranches || []) as BranchItems[];
      branches.forEach((branch: BranchItems) => {
        states.push(...branch.states);
        branch.states.forEach((state: IStateGroup) => {
          states.push(...state.getChildrenStates());
        });
      });
    }
    return states;
  },

  getRightMostItemCoordsUnderChildren(passStateAsFullState: boolean = false): PointCoords {
    const coordsService = new CoordsService();
    const connectPoint = this.getConnectPoint?.();
    return coordsService.getCenterRightCoords(this.getChildrenStates(), passStateAsFullState, connectPoint);
  },

  getLeftMostItemCoordsUnderChildren(): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterLeftCoords(this.getChildrenStates());
  },

  getCenterBottomCoordsUnderChildren(passStateAsFullState: boolean = false): PointCoords {
    const coordsService = new CoordsService();
    const dropArea = this.getDropArea?.();
    return coordsService.getCenterBottomCoords(this.getChildrenStates(), passStateAsFullState, dropArea);
  },

  getCenterTopCoordsAboveChildren(): PointCoords {
    const coordsService = new CoordsService();
    return coordsService.getCenterTopCoords(this.getChildrenStates());
  },

  alignCenter() {
    switch (this.data.Type) {
      case StateTypesEnum.Pass:
        const left = this.getLeft() + passStateOffset;
        this.set({ left });
    }
  },

  shouldHaveTiePoint(): boolean {
    const isMainBranchEnd = this.isInMainBranch() && this.data.End;
    return !isMainBranchEnd && this.data.Type !== StateTypesEnum.Pass;
  },

  _getConfig(type: string, draft: boolean) {
    switch (type) {
      case StateTypesEnum.Pass:
        return draft ? draftPassRectConfig : passStateRectConfig;
      default:
        return draft ? draftRectConfig : stateRectConfig;
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
