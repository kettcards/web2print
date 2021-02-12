/// <reference path="./types/jq/index.d.ts" />

declare interface MMPerPx {
  x : number;
  y : number;
}

const MMPerPx : MMPerPx = (function() {
  const $resTester = $('<div style="height:100mm;width:100mm;visibility:collapse;"></div>')
  $('body').append($resTester);
  const ret = { x: 100/$resTester.width(), y: 100/$resTester.height() };
  $resTester.remove();
  return ret;
})();