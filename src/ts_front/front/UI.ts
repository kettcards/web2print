/// <reference path="./front.ts" />
/// <reference path="./Serializer.ts" />
/// <reference path="./TextEl.ts" />
{
  const $addBtnContainer = $('#add-el-btns');
  for(const el of Elements) {
    $addBtnContainer.append($(`<button class="addElBtn" onclick="hSpawnElBtnClick(event, '${el.serializedType}');">${el.displayName}</button>`));
  }
}

class UI {
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
  static hDesUpload(e : JQuery.ChangeEvent) {
    const file = e.target.files[0] as File;
    if (!file)
      return;

    file.text().then(Serializer.loadElementsCompressed.bind(null, true));
    $('#upl-des').val(null);//clearing the file list
  }
}

$(".alignment-btn").click(function(){
  Editor.storage.$target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".font-type-btn").click(hChangeFontType).mouseup(stopPropagation);

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
  .click(UI.$colorPicker.click.bind(undefined))

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