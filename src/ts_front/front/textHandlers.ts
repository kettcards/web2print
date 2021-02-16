/// <reference path="../macros.ts" />
/// <reference path="../nodesFromSelection.ts" />

class TextEl {
  static hMDown(e : JQuery.MouseDownEvent) : void {
    switch(Editor.state) {
      case EditorStates.EL_FOCUSED:
      case EditorStates.TXT_EDITING:
        if(Editor.storage.target === e.delegateTarget) {
          Editor.state = EditorStates.TXT_EDITING;
          e.stopPropagation();
          break;
        }
      default:
        El.hMDown(e);
    }
  }
  static hMUp(e : JQuery.MouseUpEvent) : void {
    switch(Editor.state) {
      case EditorStates.TXT_EDITING:
        break;
      default:
        El.hMUp(e);
    }
  }
  static displaySelectedProperties() : void {
    const [startEl, _, endEl, __] = getSelectedNodes(getSel().getRangeAt(0));

    let fontFam  =  $(startEl).css('font-family');
    let fontSize = +$(startEl).css('font-size').slice(0, -2);
    let index;
    for(let n = startEl;;){
      const nextFam  =  $(n).css('font-family');
      const nextSize = +$(n).css('font-size').slice(0, -2);
      if(fontFam !== nextFam){
        index = -1;
      }
      if(nextSize < fontSize) {
        fontSize = nextSize;
      }

      if(n === endEl)
        break;
      if(n.nextSibling === null) {
        n = n.parentNode.nextSibling.firstChild as Element;
      } else {
        n = n.nextSibling as Element;
      }
    }

    $fontSelect[0].selectedIndex = index || Fonts.FontNames.indexOf(fontFam);

    $fontSizeSelect.val(Math.round(fontSize / 96 * 72));
  }
}

const hTxtKeyDown = function(e : JQuery.KeyDownEvent) {
  const ev = e.originalEvent;
  const key = ev.keyCode;

  if(ev.shiftKey && key === 13) {
    // (lucas 25.01.21) shift return
    // todo: dont just block it, resolve it properly
    e.preventDefault();
  } else if(ev.ctrlKey && key === 90) {
    // (lucas 25.01.21) ctrl z
    // todo: dont just block it, resolve it properly
    e.preventDefault();
  }
};

const hTxtKeyUp = function(e : JQuery.KeyUpEvent) {
  e.preventDefault();
  const key = e.originalEvent.keyCode;

  const range = getSel().getRangeAt(0);
  if(range.collapsed && range.startContainer.isA("#text")) {
    if(range.startContainer.parentNode.isA('P')) {
      const p = range.startContainer.parentNode;
      const insertTarget = range.startContainer.nextSibling;
      const txt = p.removeChild(range.startContainer);
      const w = make('span', txt);
      p.insertBefore(w, insertTarget);
      range.setEnd(txt, txt.textContent.length);
      range.collapse();
    } else if(range.startContainer.parentNode.isA('DIV')) {
      const box = range.startContainer.parentNode;
      const insertTarget = range.startContainer.nextSibling;
      const txt = box.removeChild(range.startContainer);
      const span = make('span', txt);
      box.insertBefore(make('p', span), insertTarget);
      if(insertTarget && insertTarget.isA('BR'))
        box.removeChild(insertTarget);

      range.setEnd(txt, txt.textContent.length);
      range.collapse();
    }
  }

  if((key >= 37 && key <= 40) || (key >= 33 && key <= 36)) {
    TextEl.displaySelectedProperties();
  }
};

const hTxtPaste = async function(e) {
  e.preventDefault();
  /*const ev  = e.originalEvent;
  const box = e.delegateTarget;

  const data = ev.clipboardData.getData('text');
  if(data.length > 0) {
    const rangeW = makeNodesFromSelection();
    const insertTarget = rangeW.endEl.nextSibling;
    let styleSource = rangeW.startEl.previousSibling;
    if(styleSource && styleSource.isA('BR'))
      styleSource = styleSource.previousSibling;
    if(!styleSource || styleSource.isA('BR')) {
      styleSource = insertTarget;
      if(styleSource && styleSource.isA('BR')) {
        styleSource = styleSource.nextSibling;
        if(!styleSource || styleSource.isA('BR'))
          styleSource = undefined;
      }
    }
    const genFn = styleSource ? function(child) {
      const el = styleSource.cloneNode();
      el.appendChild(child);
      return el;
    } : function(child) {
      return make('span', child);
    };
    rangeW.range.deleteContents();

    const lines = data.split("\n");
    box.insertBefore(genFn(makeT(lines[0])), insertTarget);
    for(let i = 1; i < lines.length; i++) {
      box.insertBefore(make('br'), insertTarget);
      box.insertBefore(genFn(makeT(lines[i])), insertTarget);
    }

    const newRange = makeR();
    if(insertTarget)
      newRange.setEndBefore(insertTarget);
    else
      newRange.setEndAfter(box.childNodes[box.childNodes.length - 1]);
    newRange.collapse();
    const selection = getSel();
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else
    console.log('cant paste that', ev.clipboardData.types);*/
};

//font stuff
const hFontChanged = function(e) {
  const range = getSel().getRangeAt(0);
  const fName = $fontSelect.val() as string;
  makeNodesFromSelection(range, function(curr) {
    $(curr).css('font-family', fName);
  })
};