declare interface Fold {
  x1 : number;
  x2 : number;
  y1 : number;
  y2 : number;
}

declare interface Card {
  name       : string;
  thumbSlug  : string;
  cardFormat : {
    width  : number;
    height : number;
    folds  : Fold[];
  };
  material   : {
    textureSlug : string;
    tiling      : 'STRETCH';
  };
  motive     : {
    side : 'BACK' | 'FRONT';
    textureSlug : string;
  }[];
}