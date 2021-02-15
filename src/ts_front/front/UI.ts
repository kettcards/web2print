/// <reference path="./front.ts" />
/// <reference path="./serialization.ts" />
/// <reference path="./textHandlers.ts" />

$('.addElBtn').click(hAddElClick);

$("#resize").mousedown(function(e){
  Editor.state.isResizingEl = true;
});

$("#logoRotation").change(function(e){
  Editor.storage.$target.css('transform', 'rotate('+ $(this).val()+'deg)');
}).mouseup(stopPropagation);

$(".alignmentBtn").click(function(){
  Editor.storage.$target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".fontTypeButton").click(hChangeFontType).mouseup(stopPropagation);

$('#submitBtn').click(serialize);

const $fontSelect = $<HTMLSelectElement>('#fontSelect')
  .mouseup(stopPropagation)
  .change(hFontChanged);

const $fontSizeSelect = $<HTMLInputElement>('#fontSizeSelect')
  .mousedown(function(e){
    const s = getSel();
    if(s.rangeCount === 1)
      Editor.storage.range = s.getRangeAt(0).cloneRange();
  })
  .mouseup(stopPropagation)
  .change(function(e) {
    const fontSize = e.target.value;
    const sel = getSel();
    sel.removeAllRanges();
    sel.addRange(Editor.storage.range);
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