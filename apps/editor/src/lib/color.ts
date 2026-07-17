import { RGBA } from '@sharedTypes/util/color';

export const rgbaToCss = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${a / 255})`;
