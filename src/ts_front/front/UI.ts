/// <reference path="./front.ts" />
/// <reference path="./serialization.ts" />
/// <reference path="./textHandlers.ts" />

{
  const $addBtnContainer = $('#add-el-btns');
  for(const [k, v] of Object.entries(Elements)) {
    $addBtnContainer.append($(`<button class="addElBtn" onclick="spawnNewEl('${k}')">${v.displayName}</button>`));
  }
}

$("#logoRotation").change(function(e){
  Editor.storage.$target.css('transform', 'rotate('+ $(this).val()+'deg)');
}).mouseup(stopPropagation);

$(".alignmentBtn").click(function(){
  Editor.storage.$target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".fontTypeButton").click(hChangeFontType).mouseup(stopPropagation);

$('#save-btn').click(function() {
  // (lucas 17.02.21) todo: local saving
  submit(false);
});

$('#tutorial').click(showTutorial);

const $fontSelect = $<HTMLDivElement>('#font-select')
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation);

Fonts.$options
  .mousedown(stopPropagation)
  .click(function(e) {
    if(e.target.nodeName !== 'P')
      return;

    Fonts.currentSelection = e.target.textContent;
    Fonts.displaySelected();
    Editor.loadSelection();
    hFontChanged();
  });

$fontSelect.children('p').click(function(e) {
  e.stopPropagation();
  Fonts.$options.css('visibility', 'visible');
});

const $fontSizeSelect = $<HTMLInputElement>('#fontSizeSelect')
  .mousedown(Editor.saveSelection)
  .mouseup(stopPropagation)
  .change(function(e) {
    const fontSize = e.target.value;
    const sel = Editor.loadSelection();
    makeNodesFromSelection(sel.getRangeAt(0), function(curr) {
      $(curr).css('font-size', fontSize+'pt');
    });
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