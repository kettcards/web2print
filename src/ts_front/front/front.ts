'use strict';
import ScrollEvent = JQuery.ScrollEvent;

const $toolBox       = $('#toolBox');
const imgTool        = $('#imgTool');
const $cardContainer = $('#card-container')
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('.floater.bottom>ul');
const $pageLabel  = $('.floater.bottom>span');

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
  Editor.enableTransition(true);

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

let $body = $('body')
  .click(function() {
    $options.css('visibility', 'collapse');
  })
  .mousedown(function(e) {
    // (lucas 11.02.21) I know e.which is deprecated, but there is no suitable replacement as of now
    if(e.which === 2) {
      Editor.enableTransition(false);
      Editor.beginDrag();
      return false;
    }
  })
  .mousemove(function(e) {
    const ev = e.originalEvent;
    const dx = ev.movementX;
    const dy = ev.movementY;

    if(Editor.isDragging) {
      Editor.drag(dx, dy);
      Editor.apply();
    }

    if(!state.dragging && !state.resizing)
      return;

    state.dx += dx;
    state.dy += dy;

    if(state.resizing) {
      state.target.css({
        width: '+='+dx,
        height: '+='+dy,
      });
    } else if(state.dragging) {
      state.target.css('transform', 'translate('+state.dx/Editor.scale+'px, '+state.dy/Editor.scale+'px) rotate('+getRotation()+'deg)');
      $toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
      imgTool.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
    }
  }).mouseup(function() {
    if(Editor.isDragging) {
      Editor.endDrag();
      Editor.enableTransition(true);
    } else if(state.dragging){
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
  // disable default browser scroll
$(document)
  .keydown(function(e) {
    if(e.ctrlKey) {
      if(e.key === '-') {
        e.preventDefault();

        Editor.scroll( 10);
        Editor.apply();
      } else if(e.key === '+') {
        e.preventDefault();

        Editor.scroll( -10);
        Editor.apply();
      }
    }
  });

function preventScroll(e : WheelEvent) {
  if(e.ctrlKey) {
    e.preventDefault();

    // (lucas 11.02.21) todo: find a better way to actually use the mouse wheel movement
    // this sadly has to be done this way because the deltaY is inconsistent between browsers
    Editor.scroll(Math.sign(e.deltaY) * 10);
    Editor.apply();

    return false;
  }
}
// haha chrome, very funny.... cant prevent default on passive target...
document.addEventListener('wheel',          preventScroll, {passive: false});
document.addEventListener('mousewheel',     preventScroll, {passive: false});
document.addEventListener('DOMMouseScroll', preventScroll, {passive: false});


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
