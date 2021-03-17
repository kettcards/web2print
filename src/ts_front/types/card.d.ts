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
  texture   : {
    textureSlug : string;
    tiling      : 'STRETCH';
  };
  motives     : {
    front : string | undefined;
    back  : string | undefined;
  };
}