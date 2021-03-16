interface IRenderStyle {
  name : string;
  condition(card : Card) : boolean;
  pageGen(card: Card) : DocumentFragment | JQuery<DocumentFragment>;
  pageLabels : string[];
  initialDotIndex : number;
  hPageChanged(direction: -1|0|1) : void;
  clear() : void;

  assocPage(side : 'front'|'back', bounds : JQuery.Coordinates) : JQuery<HTMLDivElement>;
  getOffsetForTarget() : number;
  fitElement(target : JQuery, bounds : JQuery.Coordinates & { width : number, height : number }) : void;
}

const RenderStyles : IRenderStyle[] = [{
  name: 'Druckbogen',
  condition(card){ return true; },
  BgStretchObjs: {
    stretch: {
      'background-size': 'cover',
      'background-repeat': 'no-repeat ',
      'background-position': 'center center',
    },
    //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
  },
  pageGen(card) {
    const width = card.cardFormat.width;
    const height = card.cardFormat.height;

    const $bundle = $(get('page-template').content.firstElementChild.cloneNode(true));
    $bundle.css({
      width:  width+'mm',
      height: height+'mm',
    });

    $bundle.children().css(Object.assign({
      'background-image': 'url("'+web2print.links.textureUrl+card.texture.textureSlug+'")',
    }, this.BgStretchObjs[card.texture.tiling]));


    const $foldslayers = $bundle.find('.folds-layer' as JQuery.Selector);
    for(const fold of card.cardFormat.folds) {
      if (fold.x1 === fold.x2) {
        $(make('div.v-fold')).css('left', fold.x1+'mm').appendTo($foldslayers);
      } else if (fold.y1 === fold.y2) {
        $(make('div.h-fold')).css('top', fold.y1 + 'mm').appendTo($foldslayers);
      } else {
        console.warn("can't display diagonal folds for now");
      }
    }

    const $back  = $bundle.children('.back');
    const $front = $bundle.children('.front');

    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': $front.children('.motive-layer')[0].src = web2print.links.motiveUrl+motive.textureSlug; break;
        case 'BACK' : $back .children('.motive-layer')[0].src = web2print.links.motiveUrl+motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    //snaplines for all axis aligned folds
    const lineDefs : SnapLineDef[] = [];
    let lx = 0;
    let ly = 0;
    for(const fold of card.cardFormat.folds) {
      if(fold.x1 === fold.x2) {
        lineDefs.push({
          dir   : 'v',
          offset: (lx + (fold.x1 - lx) / 2) / MMPerPx.x,
        })
        lx = fold.x1;
      } else if (fold.y1 === fold.y2) {
        lineDefs.push({
          dir   : 'h',
          offset: (ly + (fold.y1 - ly) / 2) / MMPerPx.y,
        })
        ly = fold.y1;
      } else {
        console.log("can't create snapline from none axis aligned fold");
      }
    }
    lineDefs.push({
      dir   : 'v',
      offset: (lx + (width - lx) / 2) / MMPerPx.x,
    })
    lineDefs.push({
      dir   : 'h',
      offset: (ly + (height - ly) / 2) / MMPerPx.y,
    })
    Snaplines.LineMap = [
      Snaplines.makeLines($front, lineDefs),
      Snaplines.makeLines($back , lineDefs),
    ];

    //intrinsic colliders
    const $collLayer = $bundle.find('.colliders-layer' as JQuery.Selector)
      .append(
        make('div.intrinsic.top'),
        make('div.intrinsic.right'),
        make('div.intrinsic.bottom'),
        make('div.intrinsic.left'),
      );

    // (lucas) this only exists because you can't move move elements across pages in the foldable view
    // and should be removed if the issue is ever resolved
    for(const fold of card.cardFormat.folds) {
      if(fold.x1 === fold.x2) {
        $collLayer.append($(make('div')).css({
          left  : (fold.x1 - 5)+"mm",
          width : "10mm",
          top   : "-50mm",
          height: "calc(100% + 100mm)",
        }));
      } else if(fold.y1 === fold.y2) {
        $collLayer.append($(make('div')).css({
          left  : "-50mm",
          width : "calc(100% + 100mm)",
          top   : (fold.y1 - 5)+"mm",
          height: "10mm",
        }));
      } else {
        console.warn("Can't create collider for angled folds.");
      }
    }

    // (lucas 12.03.21) todo: this should be generated from geometry data from the server
    $bundle.find('.front>.colliders-layer' as JQuery.Selector)
      .append($(make('div')).css({
        left  : "-50mm",
        width : "calc(100% + 100mm)",
        top   : "-50mm",
        height: "calc(100% + 100mm)",
      }));


    this.data.rot     = 0;
    this.data.$bundle = $bundle;

    return $bundle;
  },
  clear() : void {
    this.data.$bundle.find('.elements-layer').html('');
  },
  assocPage(side, _) {
    return this.data.$bundle.children('.'+side);
  },
  fitElement(_, bounds) {
    const ar = bounds.width / bounds.height;
    const cardFormat = Editor.storage.loadedCard.cardFormat;

    //find which collider 'section' will house the element
    const mmPos = {
      x: bounds.left * MMPerPx.x,
      y: bounds.top  * MMPerPx.y
    };
    const mmSect = {
      l: 0,
      r: cardFormat.width,
      t: 0,
      b: cardFormat.height
    };

    for(const fold of cardFormat.folds) {
      if(fold.x1 === fold.x2) {
        if(mmPos.x < fold.x1) {
          if(fold.x1 < mmSect.r)
            mmSect.r = fold.x1;
        } else {
          if(fold.x1 > mmSect.l)
            mmSect.l = fold.x1;
        }
      } else if(fold.y1 === fold.y2) {
        if(mmPos.y < fold.y1) {
          if(fold.y1 < mmSect.b)
            mmSect.b = fold.y1
        } else {
          if(fold.y1 > mmSect.t)
            mmSect.t = fold.y1
        }
      } else {
        console.warn('Ignoring angled folds for el fitting.')
      }
    }

    const maxRight  = (mmSect.l + (mmSect.r - mmSect.l) * 0.95) / MMPerPx.x;
    const maxBottom = (mmSect.t + (mmSect.b - mmSect.t) * 0.95) / MMPerPx.y;

    if(bounds.left + bounds.width > maxRight) {
      bounds.width  = maxRight - bounds.left;
      bounds.height = bounds.width / ar;
    }
    if(bounds.top + bounds.height > maxBottom) {
      bounds.height = maxBottom - bounds.top;
      bounds.width  = bounds.height * ar;
    }
  },
  getOffsetForTarget() : number {
    return 0;
  },
  pageLabels: [
    'Innenseite',
    'Außenseite'
  ],
  initialDotIndex: 0,
  hPageChanged(direction) {
    this.data.rot += direction * 180;
    this.data.$bundle.css('transform', 'rotateY('+this.data.rot+'deg)');
  },
  data: {
    $bundle: undefined,
    rot: 0
  }
} as IRenderStyle, {
  name: 'einzelne Seiten',
  condition(card){
    const folds = card.cardFormat.folds;
    return folds.length === 1 && folds[0].x1 === folds[0].x2;
  },
  BgStretchObjs: {
    stretch: function(xOffset) { return {
      'background-size': 'cover',
      'background-repeat': 'no-repeat ',
      'background-position': 'center center',
    };
    },
    //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
  },
  pageGen(card) {
    const cardWidth  = card.cardFormat.width;
    const cardHeight = card.cardFormat.height;
    const w1 = card.cardFormat.folds[0].x1;
    const w2 = cardWidth - w1;

    const template = get('page-template').content.firstElementChild;

    const $page1 = this.data.$page1 = $(template.cloneNode(true)).css({
      width: w1+'mm',
      height: card.cardFormat.height+'mm',
      'transform-origin': 'right center',
    });
    const $page2 = this.data.$page2 = $(template.cloneNode(true)).css({
      width: w2+'mm',
      height: card.cardFormat.height+'mm',
      'transform-origin': 'left center',
    });
    $page2[0].dataset.xOffset = String(w1);

    const $both = $page1.add($page2);

    $both.children().css(Object.assign({
      'background-image': 'url("'+web2print.links.textureUrl+card.texture.textureSlug+'")'
    }, this.BgStretchObjs[card.texture.tiling]));

    let mFront, mBack;
    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': mFront = motive.textureSlug; break;
        case  'BACK': mBack  = motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    if(mFront) {
      $page1.find<HTMLImageElement>('.front>.motive-layer' as JQuery.Selector).css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
      $page2.find<HTMLImageElement>('.front>.motive-layer' as JQuery.Selector).css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
    }

    if(mBack) {
      $page1.find<HTMLImageElement>('.back>.motive-layer' as JQuery.Selector).css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
      $page2.find<HTMLImageElement>('.back>.motive-layer' as JQuery.Selector).css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
    }

    //intrinsic colliders
    $both.find('.colliders-layer' as JQuery.Selector)
      .append(make('div.intrinsic.top')   )
      .append(make('div.intrinsic.bottom'));
    const $rightInnerCollider = $(make('div')).css({
      right : `-${cardWidth / 2 + 50}mm`,
      width :  `${cardWidth / 2 + 55}mm`,
      top   :  `-50mm`,
      height:  `calc(100% + 100mm)`,
    });
    const $leftInnerCollider = $(make('div')).css({
      left  : `-${cardWidth / 2 + 50}mm`,
      width :  `${cardWidth / 2 + 55}mm`,
      top   :  `-50mm`,
      height:  `calc(100% + 100mm)`,
    });
    $page1.find('.back>.colliders-layer' as JQuery.Selector)
      .append(make('div.intrinsic.left')  )
      .append($rightInnerCollider.clone() );
    $page1.find('.front>.colliders-layer' as JQuery.Selector)
      .append(make('div.intrinsic.right') )
      .append($leftInnerCollider.clone()  );
    $page2.find('.back>.colliders-layer' as JQuery.Selector)
      .append(make('div.intrinsic.right') )
      .append($leftInnerCollider          );
    $page2.find('.front>.colliders-layer' as JQuery.Selector)
      .append(make('div.intrinsic.left')  )
      .append($rightInnerCollider         );


    // (lucas 12.03.21) todo: this should be generated from geometry data from the server
    $both.find('.front>.colliders-layer' as JQuery.Selector)
      .append($(make('div')).css({
        left  : "-50mm",
        width : "calc(100% + 100mm)",
        top   : "-50mm",
        height: "calc(100% + 100mm)",
      }));

    Snaplines.LineMap = [];
    for(const $p of [$page1, $page2]) {
      for(const side of [".front", ".back"]) {
        Snaplines.LineMap.push(Snaplines.makeLines($p.children(side), [{
          dir   : 'h',
          offset: cardHeight / MMPerPx.y / 2,
        }, {
          dir   : 'v',
          offset: cardWidth  / MMPerPx.x * 0.25,
        }]));
      }
    }

    this.data.p1r = 0;
    this.data.p2r = 0;
    this.data.state = 1;

    return $(document.createDocumentFragment()).append($page1, $page2);
  },
  clear() : void {
    this.data.$page1.add(this.data.$page2).find('.elements-layer').html('');
  },
  assocPage(side, bounds) {
    let leftPage, rightPage;
    if(side === 'back') {
      leftPage  = this.data.$page1;
      rightPage = this.data.$page2;
    } else {
      rightPage = this.data.$page1;
      leftPage  = this.data.$page2;
    }

    const fold = Editor.storage.loadedCard.cardFormat.folds[0].x1 / MMPerPx.x;
    if(bounds.left > fold) {
      bounds.left -= fold;
      // (lucas 16.02.21) todo: this might get slow without caching
      return rightPage.children('.'+side);
    } else {
      return leftPage.children('.'+side);
    }
  },
  fitElement($target, bounds) {
    const ar = bounds.width / bounds.height;

    const maxRight  = $target.width()  * 0.95;
    const maxBottom = $target.height() * 0.95;

    if(bounds.left + bounds.width > maxRight) {
      bounds.width  = maxRight - bounds.left;
      bounds.height = bounds.width / ar;
    }
    if(bounds.top + bounds.height > maxBottom) {
      bounds.height = maxBottom - bounds.top;
      bounds.width  = bounds.height * ar;
    }
  },
  getOffsetForTarget() : number {
    // (lucas) this assumes that you never select elements on paged not visible in the current state
    switch(this.data.state) {
      case 0: return 0;
      case 1: return +Editor.storage.$target.parents('.page-bundle').attr('data-x-offset') / MMPerPx.x;
      case 2: return Editor.storage.loadedCard.cardFormat.width / 2 / MMPerPx.x;
    }
  },
  pageLabels: [
    'Rückseite',
    'Innenseite',
    'Vorderseite'
  ],
  initialDotIndex: 1,
  hPageChanged(direction) {
    this.data.state = mod(this.data.state + direction, 3);

    let p1z = 0, p2z = 0;

    if(direction === 1) {
      switch(this.data.state) {
        case 0: this.data.p1r += 180; this.data.p2r += 180; p2z = 1; break;
        case 1:                       this.data.p2r += 180;          break;
        case 2: this.data.p1r += 180;                       p1z = 1; break;
      }
    } else if(direction === -1) {
      switch(this.data.state) {
        case 0:                        this.data.p2r += -180; p2z = 1; break;
        case 1: this.data.p1r += -180;                                 break;
        case 2: this.data.p1r += -180; this.data.p2r += -180; p1z = 1; break;
      }
    }
    this.data.$page1.css({
      transform: 'rotateY('+this.data.p1r+'deg)',
      'z-index': p1z
    });
    this.data.$page2.css({
      transform: 'rotateY('+this.data.p2r+'deg)',
      'z-index': p2z
    });
  },
  data: {
    state: 1,
    $page1: undefined,
    $page2: undefined,
    p1r: 0,
    p2r: 0
  }
} as IRenderStyle];