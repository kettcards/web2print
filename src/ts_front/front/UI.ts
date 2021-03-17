/// <reference path="./Serializer.ts" />
/// <reference path="./TextEl.ts" />
{
  const $addBtnContainer = $('#add-el-btns');
  for(const el of Elements) {
    $addBtnContainer.append($(`<button class="addElBtn" onclick="UI.hSpawnElBtnClick(event, '${el.serializedType}');">${el.displayName}</button>`));
  }
}

class UI {
  static $cardContainer = $('#card-container')
  static $navDotsUl  = $('.floater.bottom>ul');
  static $pageLabel  = $('.floater.bottom>span');

  static $fileUpBtn  = $<HTMLInputElement>('#file-upload')
    .change(ImageEl.hFileUploadChanged);
  static saveSelect  = new SelectEx($('#save-select-ex'));
  static $applyColor = $('#apply-color');
  static $fontSelect = $<HTMLDivElement>('#font-select')
    .mousedown(Editor.saveSelection)
    .mouseup(stopPropagation);
  static $colorPicker = $('#color-picker');
  static $fontSizeSelect = $<HTMLInputElement>('#font-size-select');
  static $lhSpinner  = $<HTMLInputElement>('#lh-spinner');

  // [called inline]
  static hDesUpload(e : JQuery.ChangeEvent) : void {
    const file = e.target.files[0] as File;
    if (!file)
      return;

    file.text().then(Serializer.loadElementsCompressed.bind(null, true));
    $('#upl-des').val(null);//clearing the file list
  }

  // spawning new elements
  // [called inline]
  static hElementsLayerClick(e : MouseEvent, target : HTMLElement) : void {
    if(!Editor.storage.addOnClick)
      return;
    e.stopPropagation();

    const $target = $(target);
    const spawnerData = Editor.storage.addOnClick;
    const el = spawnerData[0]($target, {left: e.offsetX, top: e.offsetY}, true);
    el[0].dataset.typeId = spawnerData[1];
    $target.append(el);
    Editor.storage.addOnClick = undefined;
  }

  // [called inline]
  static hSpawnElBtnClick(e : MouseEvent, id : string) : void {
    if(Editor.storage.spawnBtn)
      Editor.storage.spawnBtn.removeClass('active');

    const $toggledBtn = $<HTMLButtonElement>(e.target as HTMLButtonElement);
    Editor.storage.spawnBtn = $toggledBtn;
    $toggledBtn.addClass('active');

    Editor.storage.addOnClick = [ElementMap[id].getSpawner(), id];
  }

  static hChangeFontType() : void {
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

  // [called inline]
  static hRenderStyleBtnClick(index : number) : void {
    const data = Serializer.serialize();
    RenderStyleState.changeRenderStyle(index);
    Serializer.loadElements(data);
  }


}

$(".alignment-btn").click(function(){
  Editor.storage.$target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".font-type-btn").click(UI.hChangeFontType).mouseup(stopPropagation);

UI.saveSelect.value = 'mein Rechner';
$('#save-btn').click(function() {
  if(UI.saveSelect.value === 'bei Kettcards') {
    Serializer.submit(false);
  } else {
    Serializer.download();
  }
});

$('#del-btn')
  .mouseup(stopPropagation)
  .click(function () {
    switch (Editor.state) {
      case EditorStates.EL_FOCUSED:
      case EditorStates.TXT_EDITING:
        Editor.deleteElement();
        break;
    }
  });

UI.$applyColor
  .mousedown(Editor.saveSelection)
  .click(function(e) {
    const sel = Editor.loadSelection();
    makeNodesFromSelection(sel.getRangeAt(0), function(curr) {
      $(curr).css('color', Editor.storage.currentColor);
    })
  });

UI.$colorPicker
  .change(function(e){
    const color = UI.$colorPicker.val();
    if(typeof(color) === "string") {
      Editor.storage.currentColor = color;
      UI.$applyColor.css("color", color);
      UI.$applyColor.trigger("click");
    }
  });

$("#color-tick").mousedown(Editor.saveSelection)
  .click(function() { UI.$colorPicker.click(); });

Fonts.$options
  .mousedown(stopPropagation)
  .click(function(e) {
    if(e.target.nodeName !== 'P' || Editor.state !== EditorStates.EL_FOCUSED)
      return;

    Fonts.currentSelection = e.target.textContent;
    Fonts.displaySelected();
    Fonts.checkFontTypes();
    Editor.loadSelection();
    TextEl.hFontChanged();
  });

UI.$fontSelect.children('p')
  .click(function(e) {
    e.stopPropagation();
    Fonts.$options.css('visibility', 'visible');
  });

UI.$fontSizeSelect
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation)
  .change(function(e) {
    const fontSize = e.target.value;
    const sel = Editor.loadSelection();
    makeNodesFromSelection(sel.getRangeAt(0), function(curr) {
      $(curr).css('font-size', fontSize+'pt');
    });
  });

UI.$lhSpinner
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation)
  .change(function(e) {
    const lineHeight = e.target.value;
    Editor.loadSelection();

    Editor.storage.$target.css('line-height', lineHeight);
  });

{

  // flipping pages
  $('.right>.nav-btn-inner').click(function() {
    RenderStyleState.hPageSwitch(+1);
  });
  $('.left>.nav-btn-inner').click(function() {
    RenderStyleState.hPageSwitch(-1);
  });
}
$('#recenter-btn').click(function() {
  Editor.fitToContainer();
});

$(window).resize(Editor.hWindowResized)

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

{
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
}

$('body')
  .click(function() {
    Fonts.$options.css('visibility', 'collapse');
    UI.saveSelect.close();
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