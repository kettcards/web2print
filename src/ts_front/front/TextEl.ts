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
      case EditorStates.EL_DRAGGING:
      case EditorStates.EL_BEGIN_FOCUS:
        Editor.displayLineheight();
        TextEl.displaySelectedProperties();
      default:
        El.hMUp(e);
    }
  }
  static displaySelectedProperties() : void {
    const [startEl, _, endEl, __] = getSelectedNodes(getSel().getRangeAt(0));

    let fontFam  =  $(startEl).css('font-family');
    let fontSize = +$(startEl).css('font-size').slice(0, -2);
    if(!Fonts.FontAttributeMap[fontFam][Fonts.FontStyleValues.b]){
      Fonts.$boldBtn.prop('disabled', true);
    } else {
      Fonts.$boldBtn.prop('disabled', false);
    }
    if(!Fonts.FontAttributeMap[fontFam][Fonts.FontStyleValues.i]){
      Fonts.$italicBtn.prop('disabled', true);
    } else {
      Fonts.$italicBtn.prop('disabled', false);
    }
    for(let n = startEl;;){
      const nextFam  =  $(n).css('font-family');
      if(!Fonts.FontAttributeMap[nextFam][Fonts.FontStyleValues.b]) {
        Fonts.$boldBtn.prop('disabled', true);
      }
      if(!Fonts.FontAttributeMap[nextFam][Fonts.FontStyleValues.i]) {
        Fonts.$italicBtn.prop('disabled', true);
      }
      const nextSize = +$(n).css('font-size').slice(0, -2);
      if(fontFam !== nextFam) {
        fontFam = '';
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

    Fonts.currentSelection = fontFam;
    Fonts.displaySelected();

    UI.$fontSizeSelect.val(Math.round(fontSize / 96 * 72));
  }

  static hKeyDown(e : JQuery.KeyDownEvent) : void {
    const ev = e.originalEvent;
    const key = ev.keyCode;

    if(Editor.state == EditorStates.EL_FOCUSED && key !== 46) //key 46 is delete key
      Editor.state = EditorStates.TXT_EDITING;
    if(ev.shiftKey && key === 13) {
      // (lucas 25.01.21) shift return
      // todo: dont just block it, resolve it properly
      e.preventDefault();
    } else if(ev.ctrlKey && key === 90) {
      // (lucas 25.01.21) ctrl z
      // todo: dont just block it, resolve it properly
      e.preventDefault();
    } else if(key === 9) {
      // tab
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp');
    } else if(key >= 33 && key <= 34) {
      //page up and page down shifted the card which breaks the editor
      e.preventDefault();
    }
  }

  static hKeyUp(e : JQuery.KeyUpEvent) : void {
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

    if(key >= 33 && key <= 40) {//33: pageUp, 34: pageDown, 35: end, 36: home, 37-40: arrow keys
      TextEl.displaySelectedProperties();
    }
  }

  static /*async*/ hPaste(e) : void {
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
  }

  static hFontChanged() : void {
    const range = getSel().getRangeAt(0);
    const fName = Fonts.currentSelection;
    makeNodesFromSelection(range, function(curr) {
      const cur = $(curr);
      cur.css('font-family', fName);
      if(!Fonts.FontAttributeMap[fName][Fonts.FontStyleValues.b]){
        cur.removeClass('b');
      }
      if(!Fonts.FontAttributeMap[fName][Fonts.FontStyleValues.i]){
        cur.removeClass('i');
      }
    })
  }
}
