
export interface Card extends CardOverview {
  cardFormat: CardFormat;
  material: CardMaterial;
}

export interface CardOverview {
  orderId: string;
  thumbSlug: string;
}

export interface CardFormat {
  id: number;
  width: number;
  height: number;
  folds: CardFold[];
  defaultBackMotive: CardMotive;
  defaultFrontMotive: CardMotive;
}

export interface CardFold {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
}

export interface CardMotive {
  id?: number;
  side?: Side;
  textureSlug?: string;
}

export interface CardMaterial {
  id?: number;
  name: string;
  textureSlug: string;
  tiling: string;
}

export enum Tiling {
  STRETCH = ('stretch'),
  REPEAT = ('repeat')
}

export enum Side {
  FRONT= ('FRONT'),
  BACK= ('BACK')
}
