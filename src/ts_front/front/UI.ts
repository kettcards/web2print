/// <reference path="./front.ts" />
/// <reference path="./serialization.ts" />
/// <reference path="./textHandlers.ts" />

$('.addElBtn').click(hAddElClick);

$("#resize").mousedown(function(e){
  state.resizing = true;
});

$("#logoRotation").change(function(e){
  state.target.css('transform', 'rotate('+ $(this).val()+'deg)');
}).mouseup(stopPropagation);

$(".alignmentBtn").click(function(){
  state.target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);

$(".fontTypeButton").click(hChangeFontType).mouseup(stopPropagation);

$('#moveBtn').mousedown(function(){
  state.dragging = true;
});

$('#submitBtn').click(submit);

const $fontSelect = $<HTMLSelectElement>('#font-select')
  .mouseup(stopPropagation)
  .change(hFontChanged);

Fonts.$options.click(function(e) {
  if(e.target.nodeName !== 'P')
    return;

  const fName = e.target.textContent;
  Fonts.currentSelection = fName;
  Fonts.$label.text(fName).css('font-family', fName);
  $fontSelect.trigger("change");
});

$fontSelect.children('p').click(function(e) {
  e.stopPropagation();
  Fonts.$options.css('visibility', 'visible');
});

const $fontSizeSelect = $<HTMLInputElement>('#fontSizeSelect')
  .mousedown(function(e){
    const s = getSel();
    if(s.rangeCount === 1)
      state.range = s.getRangeAt(0).cloneRange();
  })
  .mouseup(stopPropagation)
  .change(function(e) {
    const fontSize = e.target.value;
    const sel = getSel();
    sel.removeAllRanges();
    sel.addRange(state.range);
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