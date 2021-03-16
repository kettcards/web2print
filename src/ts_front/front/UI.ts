/// <reference path="./front.ts" />
/// <reference path="./serialization.ts" />
/// <reference path="./textHandlers.ts" />
{
  const $addBtnContainer = $('#add-el-btns');
  for(const el of Elements) {
    $addBtnContainer.append($(`<button class="addElBtn" onclick="hSpawnElBtnClick(event, '${el.serializedType}');">${el.displayName}</button>`));
  }
}

class UI {
  static $fileUpBtn = $<HTMLInputElement>('#file-upload').change(ImageEl.hFileUploadChanged);
}

$("#logo-rotation").change(function(e){
  Editor.storage.$target.css('transform', 'rotate('+ $(this).val()+'deg)');
}).mouseup(stopPropagation);

$(".alignment-btn").click(function(){
  Editor.storage.$target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".font-type-btn").click(hChangeFontType).mouseup(stopPropagation);

$('#save-btn').click(function() {
  if(saveSelect.value === 'bei Kettcards') {
    submit(false);
  } else {
    download();
  }
});
const saveSelect = new SelectEx($('#save-select-ex'));
saveSelect.value = 'mein Rechner';

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

const $applyColor = $('#apply-color').mousedown(Editor.saveSelection).click(function(e){
  const sel = Editor.loadSelection();
  makeNodesFromSelection(sel.getRangeAt(0), function(curr){
    $(curr).css('color', Editor.storage.currentColor);
  })
});

const $colorpicker = $('#color-picker').change(function(e){
    const color = $colorpicker.val();
    if (typeof color === "string") {
        Editor.storage.currentColor = color;
        $applyColor.css("color", color);
        $applyColor.trigger("click");
    }
});

$("#color-tick").mousedown(Editor.saveSelection)
  .click(function () {
  $colorpicker.trigger("click");
})

const $fontSelect = $<HTMLDivElement>('#font-select')
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation);

Fonts.$options
  .mousedown(stopPropagation)
  .click(function(e) {
    if(e.target.nodeName !== 'P' || Editor.state !== EditorStates.EL_FOCUSED)
      return;

    Fonts.currentSelection = e.target.textContent;
    Fonts.displaySelected();
    Fonts.checkFontTypes();
    Editor.loadSelection();
    hFontChanged();
  });

$fontSelect.children('p').click(function(e) {
  e.stopPropagation();
  Fonts.$options.css('visibility', 'visible');
});

const $fontSizeSelect = $<HTMLInputElement>('#font-size-select')
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation)
  .change(function(e) {
    const fontSize = e.target.value;
    const sel = Editor.loadSelection();
    makeNodesFromSelection(sel.getRangeAt(0), function(curr) {
      $(curr).css('font-size', fontSize+'pt');
    });
  });

const $lhSpinner = $<HTMLInputElement>('#lh-spinner')
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation)
  .change(function(e) {
    const lineHeight = e.target.value;
    Editor.loadSelection();

    Editor.storage.$target.css('line-height', lineHeight);
  });

// flipping pages
$('.right>.nav-btn-inner').click(function() {
  hPageSwitch(+1);
});
$('.left>.nav-btn-inner').click(function() {
  hPageSwitch(-1);
});

$('#recenter-btn').click(function() {
  Editor.fitToContainer();
});

$(window).resize(Editor.hWindowResized)