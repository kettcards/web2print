type SnapLineDef = {
  dir    : 'h'|'v';
  offset : number;
}
type SnapLine = SnapLineDef & {
  $t : JQuery;
};

class Snaplines {
  static readonly SNAP_DIST = 25;

  static LineMap : [page : HTMLElement, lines : SnapLine[]][];

  private static activeSet : SnapLine[];

  static makeLines($page : JQuery, defs : SnapLineDef[]) : [page : HTMLElement, lines : SnapLine[]] {
    const lines = [];
    const $container = $page.children('.snap-lines-layer');
    for(const def of defs) {
      lines.push(Snaplines.makeLine($container, def));
    }
    return [$page[0], lines];
  }

  static makeLine($container : JQuery, def : SnapLineDef) : SnapLine {
    const $el = $(make('div.'+def.dir)).css(def.dir === 'h'?'top':'left', def.offset);
    $container.append($el);

    return Object.assign({ $t: $el as JQuery }, def);
  }

  static activateRelevantLines(page : HTMLElement) : void {
    for(const tuple of Snaplines.LineMap) {
      if(tuple[0] === page) {
        Snaplines.activeSet = tuple[1];
        return;
      }
    }

    Snaplines.activeSet = undefined;
  }

  static maybeSnap(x : number, y : number, w : number, h : number) : [nx : number, ny : number] {
    const hw = w / 2;
    const hh = h / 2;
    const cx = x + hw;
    const cy = y + hh;
    const r = x + w;
    const b = y + h;

    for(const line of Snaplines.activeSet) {
      const lower = line.offset - Snaplines.SNAP_DIST;
      const upper = line.offset + Snaplines.SNAP_DIST;
      if(line.dir === 'h') {
        if(y > lower && y < upper) {
          y = line.offset;
          line.$t.addClass('visible');
        } else if(cy > lower && cy < upper) {
          y = line.offset - hh;
          line.$t.addClass('visible');
        } else if(b > lower && b < upper) {
          y = line.offset - h;
          line.$t.addClass('visible');
        } else {
          line.$t.removeClass('visible');
        }
      } else {
        if(x > lower && x < upper) {
          x = line.offset;
          line.$t.addClass('visible');
        } else if(cx > lower && cx < upper) {
          x = line.offset - hw;
          line.$t.addClass('visible');
        } else if(r > lower && r < upper) {
          x = line.offset - w;
          line.$t.addClass('visible');
        } else {
          line.$t.removeClass('visible');
        }
      }
    }

    return [x, y];
  }

  static hideAllLines() : void {
    for(const line of Snaplines.activeSet) {
      line.$t.removeClass('visible');
    }
  }
}