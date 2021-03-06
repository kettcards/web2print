type SnapLineDef = {
  dir    : 'h'|'v';
  offset : number;
}
type SnapLine = SnapLineDef & {
  $t : JQuery;
};

class Snaplines {
  static LineMap : [page : JQuery, lines : SnapLine[]][];

  static makeLines($page : JQuery, defs : SnapLineDef[]) : [page : JQuery, lines : SnapLine[]] {
    const lines = [];
    const $container = $page.children('.snap-lines-layer');
    for(const def of defs) {
      lines.push(Snaplines.makeLine($container, def));
    }
    return [$page, lines];
  }

  static makeLine($container : JQuery, def : SnapLineDef) : SnapLine {
    const $el = $(make('div.'+def.dir)).css(def.dir === 'h'?'top':'left', def.offset);
    $container.append($el);

    return Object.assign({ $t: $el as JQuery }, def);
  }
}