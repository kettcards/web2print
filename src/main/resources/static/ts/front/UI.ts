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

$('#submitBtn').click(serialize);

const $fontSelect = $<HTMLSelectElement>('#fontSelect')
  .mouseup(stopPropagation)
  .change(hFontChanged);

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