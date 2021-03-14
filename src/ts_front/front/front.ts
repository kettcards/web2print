'use strict';

import ClickEvent = JQuery.ClickEvent;

const $cardContainer = $('#card-container')
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('.floater.bottom>ul');
const $pageLabel  = $('.floater.bottom>span');

// [call once]
const loadCard = function(card : Card) : void {
  if(!card)
    throw new Error("Keine Karte ausgewählt.");

  console.log('loading', card);
  window.history.replaceState({}, card.name+" - Web2Print", stringifyParameters());

  document.querySelector<HTMLInputElement>('#preview-container>img').src
      = web2print.links.thumbnailUrl+card.thumbSlug;

  for(let i = 0; i < RenderStyles.length; i++) {
    const renderStyle = RenderStyles[i];
    if(!renderStyle.condition(card))
      continue;
    const frag = make('button.render-select');
    $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleBtnClick('+i+');');
    rsContainer.appendChild(frag);
  }

  Editor.storage.loadedCard = card;
  Editor.fitToContainer();
  Editor.createRuler();
  Editor.enableTransition(true);

  changeRenderStyle(0);

  if(Parameters.sId)
    $.get(`${web2print.links.apiUrl}load/${Parameters.sId}`)
      .then(loadElementsCompressed.bind(null, false))
      .catch(function(e) {
        alert('Es gab einen Fehler beim laden der Elemente!\n'+JSON.stringify(e));
      });
};

// spawning new elements
// [called inline]
const hElementsLayerClick = function(e : MouseEvent, target : Node) {
  if(!Editor.storage.addOnClick)
    return;
  e.stopPropagation();

  const spawnerData = Editor.storage.addOnClick;
  const el = spawnerData[0]({left: e.offsetX, top: e.offsetY});
  el[0].dataset.typeId = spawnerData[1];
  $(target).append(el);
  Editor.storage.addOnClick = undefined;
};

const hSpawnElBtnClick = function(e : ClickEvent, id : string) {
  if(Editor.storage.spawnBtn)
    Editor.storage.spawnBtn.removeClass('active');

  const $toggledBtn = $<HTMLButtonElement>(e.target);
  Editor.storage.spawnBtn = $toggledBtn;
  $toggledBtn.addClass('active');

  Editor.storage.addOnClick = [ElementMap[id].getSpawner(), id];
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

  ResizeBars.show(false);
};

$('body')
  .click(function() {
    Fonts.$options.css('visibility', 'collapse');
    saveSelect.close();
  })
  .mousedown(function(e) {
    // (lucas 11.02.21) I know e.which is deprecated, but there is no suitable replacement as of now
    if(e.which === 2) {
      switch(Editor.state) {
        case EditorStates.EL_BEGIN_FOCUS:
        case EditorStates.EL_FOCUSED:
        case EditorStates.NONE:
          Editor.enableTransition(false);
          Editor.beginDragSelf();
          return false;
      }
    } else
      switch(Editor.state) {
        case EditorStates.TXT_EDITING:
          Editor.state = EditorStates.EL_FOCUSED;
          break;
      }
  }).mousemove(function(e) {
    const ev = e.originalEvent;
    const dx = ev.movementX;
    const dy = ev.movementY;

    switch(Editor.state) {
      case EditorStates.SELF_DRAGGING:
        Editor.dragSelf(dx, dy);
        break;
      case EditorStates.EL_BEGIN_FOCUS:
        Editor.beginDragEl();
      case EditorStates.EL_DRAGGING:
        Editor.dragEl(dx, dy);
        break;
      case EditorStates.EL_RESIZING:
        ResizeBars.resizeEl(dx, dy);
        break;

    }
  }).mouseup(function() {
    switch(Editor.state) {
      case EditorStates.SELF_DRAGGING:
        Editor.endDragSelf();
        Editor.enableTransition(true);
        break;
      case EditorStates.EL_DRAGGING:
        Editor.endDragEl();
        break;
      case EditorStates.EL_RESIZING:
        ResizeBars.endResizeEl();
        break;
      case EditorStates.TXT_EDITING:
        TextEl.displaySelectedProperties();
        break;
      case EditorStates.NONE:
        break;
      default:
        Editor.clearTarget();
    }
  });

// disable default browser scroll
$(document)
  .keydown(function(e) {
    if(e.keyCode === 46) {
      switch (Editor.state) {
        case EditorStates.EL_FOCUSED:
          Editor.deleteElement();
          break;
      }
    }
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
function hRenderStyleBtnClick(index : number) {
  const data = serialize();
  changeRenderStyle(index);
  loadElements(data);
}

function changeRenderStyle(newIndex : number) {
  renderStyleState.style = RenderStyles[newIndex];
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

  //(lucas 02.03.21) todo: could cache these per renderstyle or even let them cache it internally
  Colliders.colliders = [];
}

const hPageSwitch = function(direction) {
  renderStyleState.style.hPageChanged(direction);
  renderStyleState.getActiveDot().removeClass('active');
  renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
  renderStyleState.getActiveDot().addClass('active');
  $pageLabel.text(renderStyleState.getActiveLabel());
};
