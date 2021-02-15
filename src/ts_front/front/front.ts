'use strict';

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

  Editor.storage.loadedCard = card;
  Editor.fitToContainer();
  Editor.createRuler();
  Editor.enableTransition(true);

  hRenderStyleChanged(0);
};

// spawning new elements
// [called inline]
const hElementsLayerClick = function(e : MouseEvent, target : Node) {
  if(!Editor.storage.addOnClick)
    return;
  e.stopPropagation();

  const el = Editor.storage.addOnClick({left: e.offsetX, top: e.offsetY});
  $(target).append(el);
  Editor.storage.addOnClick = undefined;
};

//(lucas 10.02.21) todo: rework this to generated elements and inline calls
const hAddElClick = function(e) {
  spawnNewEl($(e.target).attr('data-enum') as string);
}
const spawnNewEl = function(objectType : string) {
  Editor.storage.addOnClick = ElementSpawners[objectType];
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
  .mousedown(function(e) {
    // (lucas 11.02.21) I know e.which is deprecated, but there is no suitable replacement as of now
    if(e.which === 2) {
      Editor.enableTransition(false);
      Editor.beginDragSelf();
      return false;
    }
  }).mousemove(function(e) {
    const ev = e.originalEvent;
    const dx = ev.movementX;
    const dy = ev.movementY;

    if(Editor.state.isDraggingSelf) {
      Editor.dragSelf(dx, dy);
      return;
    }

    if(Editor.state.isDraggingEl) {
      Editor.dragEl(dx, dy);
      imgTool.css('transform', 'translate('+Editor.storage.dx+'px, '+Editor.storage.dy+'px)');
      return;
    }

    if(Editor.state.isResizingEl) {
      Editor.storage.dx += dx;
      Editor.storage.dy += dy;

      Editor.storage.$target.css({
        width:  '+='+dx,
        height: '+='+dy,
      });
    }
  }).mouseup(function() {
    const storage = Editor.storage;
    const state   = Editor.state;
    if(state.isDraggingSelf) {
      Editor.endDragSelf();
      Editor.enableTransition(true);
    }
    if(state.isDraggingEl) {
      if(storage.dx !== 0 || storage.dy !== 0){
        imgTool.css({
          left: '+='+storage.dx,
          top : '+='+storage.dy,
          transform: '',
        });
      }
      Editor.endDragEl();
    }
    if(state.isResizingEl) {
      state.isResizingEl = false;
      storage.dx = 0;
      storage.dy = 0;
    }

    imgTool.css('visibility', 'collapse');
  }).click(Editor.clearTarget);

// disable default browser scroll
$(document)
  .keydown(function(e) {
    if(e.ctrlKey) {
      if(e.key === '-') {
        e.preventDefault();
        Editor.zoom( 10);
      } else if(e.key === '+') {
        e.preventDefault();
        Editor.zoom(-10);
      }
    }
  });

function preventScroll(e : WheelEvent) {
  if(e.ctrlKey) {
    e.preventDefault();
    // (lucas 11.02.21) todo: find a better way to actually use the mouse wheel movement
    // this sadly have to just be hardcoded steps because the deltaY is inconsistent between browsers
    Editor.zoom(Math.sign(e.deltaY) * 10);
    return false;
  }
}
// haha chrome, very funny.... cant prevent default on passive target...
document.addEventListener('wheel',          preventScroll, { passive: false });
document.addEventListener('mousewheel',     preventScroll, { passive: false });
document.addEventListener('DOMMouseScroll', preventScroll, { passive: false });


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
  $cardContainer.append(renderStyleState.style.pageGen(Editor.storage.loadedCard));
};

const hPageSwitch = function(direction) {
  renderStyleState.style.hPageChanged(direction);
  renderStyleState.getActiveDot().removeClass('active');
  renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
  renderStyleState.getActiveDot().addClass('active');
  $pageLabel.text(renderStyleState.getActiveLabel());
};
