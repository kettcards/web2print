'use strict';
const $toolBox       = $('#toolBox');
const imgTool        = $('#imgTool');
const $cardContainer = $('#card-container')
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('#nav-dots-container>ul');
const $pageLabel  = $('#nav-dots-container>span');

// [call once]
const loadCard = function(card : Card) : false | void {
  if(!card)
    return false;

  console.log('loading', card);

  document.querySelector<HTMLInputElement>('#preview-container>img').src
      = web2print.links.thumbnailUrl+card.thumbSlug;

  for(let i = 0; i < RenderStyles.length; i++) {
    const renderStyle = RenderStyles[i];
    if(!renderStyle.condition(card))
      continue;
    const frag = make('button.render-select');
    $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleChanged('+i+');');
    rsContainer.appendChild(frag);
  }

  Editor.loadedCard = card;
  Editor.fitToContainer();
  Editor.createRuler();

  hRenderStyleChanged(0);
};

// spawning new elements
// [called inline]
const hElementsLayerClick = function(e : MouseEvent, target : Node) {
  if(!state.addOnClick)
    return;
  const el = state.addOnClick({left: e.offsetX, top: e.offsetY});
  $(target).append(el);
  state.addOnClick = undefined;
};

interface StateObj {
  addOnClick(css : JQuery.Coordinates) : JQuery,
  target       : JQuery,
  dragging     : boolean,
  resizing     : boolean,
  dx           : number,
  dy           : number,
  range        : Range,
}

const state : StateObj = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  resizing: false,
  dx: 0,
  dy: 0,
  range: undefined
};

//(lucas 10.02.21) todo: rework this to generated elements and inline calls
const hAddElClick = function(e) {
  spawnNewEl($(e.target).attr('data-enum') as string);
}
const spawnNewEl = function(objectType : string) {
  state.addOnClick = ElementSpawners[objectType];
  // (lucas 10.02.21) todo: dont do this
  if(objectType === 'IMAGE') {
    $fileUpBtn.click();
  }
}

const hChangeFontType = function() {
  const classToAdd = $(this).val() as string;
  const range = getSel().getRangeAt(0);

  let shouldRemoveClass = true;
  const [startEl, endEl] = makeNodesFromSelection(range, function(curr) {
    if(shouldRemoveClass && !$(curr).hasClass(classToAdd))
      shouldRemoveClass = false;
  });

  for(let curr = startEl as Node;;) {
    console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && (curr.firstChild as Node).isA('#text'), 'illegal p child ', curr, range);

    $(curr)[shouldRemoveClass?'removeClass':'addClass'](classToAdd);

    if(curr === endEl)
      break;
    if(curr.nextSibling === null) {
      curr = curr.parentNode.nextSibling.firstChild;
    } else {
      curr = curr.nextSibling;
    }
  }
};

let $body = $('body').mousemove(function(e){
  if(!state.dragging && !state.resizing)
    return;

  const ev = e.originalEvent;
  state.dx += ev.movementX;
  state.dy += ev.movementY;

  if(state.resizing) {
    state.target.css({
      width: '+='+(ev.movementX),
      height: '+='+(ev.movementY),
    });
  } else if(state.dragging) {
    state.target.css('transform', 'translate('+state.dx/Editor.scale+'px, '+state.dy/Editor.scale+'px) rotate('+getRotation()+'deg)');
    $toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
    imgTool.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
  }
}).mouseup(function() {
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      state.target.css({
        left: '+='+state.dx/Editor.scale,
        top : '+='+state.dy/Editor.scale,
        transform: 'translate('+0+'px, '+0+'px) rotate('+getRotation()+'deg)',
      });
      $toolBox.css({
        left: '+='+state.dx,
        top : '+='+state.dy,
        transform: '',
      });
      imgTool.css({
        left: '+='+state.dx,
        top : '+='+state.dy,
        transform: '',
      });
      state.dx = 0;
      state.dy = 0;
    }
    state.dragging = false;
  } else if(state.resizing){
    state.resizing = false;
    state.dx = 0;
    state.dy = 0;
  } else {
    $toolBox.css('visibility', 'collapse');
    imgTool .css('visibility', 'collapse');
  }
});

interface RenderStyleState {
  style            : RenderStyle;
  currentDotIndex  : number;
  dots             : JQuery<Element>[];
  getActiveDot()   : JQuery;
  getActiveLabel() : string;
}

const renderStyleState : RenderStyleState = {
  style:           undefined,
  currentDotIndex: undefined,
  dots:            undefined,
  getActiveDot: function() {
    return this.dots[this.currentDotIndex];
  },
  getActiveLabel: function() {
    return this.style.pageLabels[this.currentDotIndex];
  }
};
// [called inline]
const hRenderStyleChanged = function(index : number) {
  renderStyleState.style = RenderStyles[index];
  renderStyleState.currentDotIndex = renderStyleState.style.initialDotIndex;
  renderStyleState.dots = new Array(renderStyleState.style.pageLabels.length);

  const range = makeR();
  range.selectNodeContents($navDotsUl[0]);
  range.deleteContents();
  for(let i = 0; i < renderStyleState.dots.length; i++) {
    const $el = $(make('li'));
    if(i === renderStyleState.currentDotIndex) {
      $el.addClass('active');
      $pageLabel.text(renderStyleState.getActiveLabel());
    }
    renderStyleState.dots[i] = $el;
    $navDotsUl.append($el);
  }

  range.selectNodeContents($cardContainer[0]);
  range.deleteContents();
  $cardContainer.append(renderStyleState.style.pageGen(Editor.loadedCard));
};

const hPageSwitch = function(direction) {
  renderStyleState.style.hPageChanged(direction);
  renderStyleState.getActiveDot().removeClass('active');
  renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
  renderStyleState.getActiveDot().addClass('active');
  $pageLabel.text(renderStyleState.getActiveLabel());
};
