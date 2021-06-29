import { Line } from 'fabric/fabric-impl';

export interface IConnectPoint extends Line {
  getTop: () => number;
  getLeft: () => number;
}
