const createFold = function (fold: { x1: Number, x2: Number, y1: Number, y2: Number }) : JQuery {
  if (fold.x1 === fold.x2) {
    //vFold
    let vFold = $('<div class="vFold"></div>');
    vFold.css('left', fold.x1 + 'mm');
    return vFold;
  } else if (fold.y1 === fold.y2) {
    //hFold
    let hFold = $('<div class="hFold"></div>');
    hFold.css('top', fold.y1 + 'mm');
    return hFold;
  } else {
    throw new Error("can't display diagonal folds for now");
  }
}