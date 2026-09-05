import type { ImageLayer } from '@sharedTypes/engine';
import { PreviewResourceBase } from './base';

export class PreviewDummy extends PreviewResourceBase<any> {
  static async loadDeps() {}
  resolveLayers(_: number): ImageLayer[] {
    return [];
  }
}
