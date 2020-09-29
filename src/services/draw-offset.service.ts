export class DrawOffsetService {
  private top: number = 0;

  getTopOffset(): number {
    return this.top;
  }

  setTopOffset(offset: number) {
    this.top = offset;
  }

  addTopOffset(offset: number) {
    this.top += offset;
  }
}
