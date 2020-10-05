import { Canvas, Object as CanvasObject } from 'fabric/fabric-impl'
import { TieLinesStructure } from '../interfaces/tie-lines-structure.interface'
import { ObjectTypes } from '../configs/object-types.enum'
import { WorkflowDropAreaGroup } from '../interfaces/workflow-drop-area.interface'

export class TieLinesService {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  getTieLinesStructure(): TieLinesStructure {
    const tieLinesStructure: TieLinesStructure = { };
    this.canvas.forEachObject((canvasObject: CanvasObject) => {
      if (canvasObject.data.type === ObjectTypes.tiePoint) {
        if (!(tieLinesStructure[canvasObject.data.stateId] && tieLinesStructure[canvasObject.data.stateId].tieStart)) {
          tieLinesStructure[canvasObject.data.stateId] = {
            ...(tieLinesStructure[canvasObject.data.stateId] || { }),
            tieStart: canvasObject
          };
        }
        if (tieLinesStructure[canvasObject.data.stateId] && tieLinesStructure[canvasObject.data.stateId].tieStart) {
          tieLinesStructure[canvasObject.data.stateId] = {
            ...(tieLinesStructure[canvasObject.data.stateId] || { }),
            tieEnd: canvasObject
          };
        }
      }
      if (canvasObject.data.type === ObjectTypes.dropArea) {
        tieLinesStructure[canvasObject.data.stateId]= {
          ...(tieLinesStructure[canvasObject.data.stateId] || { }),
          dropArea: canvasObject as WorkflowDropAreaGroup
        };
      }
    });
    return tieLinesStructure;
  }
}
