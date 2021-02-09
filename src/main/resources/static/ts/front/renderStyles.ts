declare interface RenderStyle {
  name: string;
  condition(card : Card): boolean;
  pageGen(card: Card): DocumentFragment | JQuery;
  pageLabels: string[];
  initialDotIndex: number;
  hPageChanged(direction: -1 | 0 | 1): void;
}

const RenderStyles = [{
  name: 'Simple',
  condition: function(card){ return true; },
  BgStretchObjs: {
    stretch: {
      'background-size': 'cover',
      'background-repeat': 'no-repeat ',
      'background-position': 'center center',
    },
    //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
  },
  pageGen: function(card) {
    const width = card.cardFormat.width;
    const height = card.cardFormat.height;

    const $bundle = $(get('page-template').content.firstElementChild.cloneNode(true));
    $bundle.css({
      width:  width+'mm',
      height: height+'mm',
    });

    $bundle.children().css(Object.assign({
      'background-image': 'url("'+web2print.links.materialUrl+card.material.textureSlug+'")',
    }, this.BgStretchObjs[card.material.tiling]));

    for(let fold of card.cardFormat.folds) {
      $bundle.find('.folds-layer').append(createFold(fold));
    }

    let mFront, mBack;
    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': mFront = motive.textureSlug; break;
        case 'BACK':  mBack  = motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    if(mBack)
      $bundle.find('.back>.motive-layer') [0].src = web2print.links.motiveUrl+mBack;
    if(mFront)
      $bundle.find('.front>.motive-layer')[0].src = web2print.links.motiveUrl+mFront;

    this.data.rot     = 0;
    this.data.$bundle = $bundle;

    return $bundle;
  },
  pageLabels: [
    'Inside',
    'Outside'
  ],
  initialDotIndex: 0,
  hPageChanged: function(direction) {
    this.data.rot += direction * 180;
    this.data.$bundle.css('transform', 'rotateY('+this.data.rot+'deg)');
  },
  data: {
    $bundle: undefined,
    rot: 0
  }
} as RenderStyle, {
  name: 'simple_foldable',
  condition: function(card){
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
  pageGen: function(card) {
    const cardWidth = card.cardFormat.width;
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

    $page1.add($page2).children().css(Object.assign({
      'background-image': 'url("'+web2print.links.materialUrl+card.material.textureSlug+'")'
    }, this.BgStretchObjs[card.material.tiling]));

    let mFront, mBack;
    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': mFront = motive.textureSlug; break;
        case  'BACK': mBack  = motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    if(mFront) {
      $page1.find('.front>.motive-layer').css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
      $page2.find('.front>.motive-layer').css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
    }

    if(mBack) {
      $page1.find('.back>.motive-layer').css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
      $page2.find('.back>.motive-layer').css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
    }

    this.data.p1r = 0;
    this.data.p2r = 0;
    this.data.state = 1;

    return $(document.createDocumentFragment()).append($page1, $page2);
  },
  pageLabels: [
    'Back',
    'Inside',
    'Front'
  ],
  initialDotIndex: 1,
  hPageChanged: function(direction) {
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
} as RenderStyle];