import { Point2d, Size2d } from '@/types/engine';

export class Rect {
  left: number;
  top: number;
  width: number;
  height: number;
  constructor(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  static fromTopLeft(topLeft: Point2d, size: Size2d) {
    return new this(topLeft.x, topLeft.y, size.width, size.height);
  }

  static fromBlock(blockPos: Point2d, blockSize: Size2d) {
    return new this(blockPos.x * blockSize.width, blockPos.y * blockSize.height, blockSize.width, blockSize.height);
  }

  overwrap(rect: Rect): boolean {
    if (this.right <= rect.left) return false;
    if (this.left >= rect.right) return false;
    if (this.bottom <= rect.top) return false;
    if (this.top >= rect.bottom) return false;
    return true;
  }

  get right() {
    return this.left + this.width;
  }

  get bottom() {
    return this.top + this.height;
  }

  get topLeft() {
    return { x: this.left, y: this.top };
  }

  shift(diff: Point2d) {
    return new Rect(this.left + diff.x, this.top + diff.y, this.width, this.height);
  }

  relational(anchor: Point2d) {
    return this.shift({ x: -anchor.x, y: -anchor.y });
  }
}
