const getSelectedNodes = function (range: Range) : [Element, number, Element, number] {
  console.log('get', range);
  let startEl : Element, endEl : Element;
  let startOffs : number, endOffs : number;

  if (range.commonAncestorContainer.isA('#text')) {
    startEl = endEl = range.startContainer.parentNode as Element;
    startOffs = range.startOffset;
    endOffs = range.endOffset;
  } else if (range.commonAncestorContainer.isA('P') || (range.commonAncestorContainer as Element).className === 'text') {
    if (range.startContainer.isA('#text')) {
      startEl = range.startContainer.parentNode as Element;
      startOffs = range.startOffset;
    } else if (range.startContainer.isA('P')) {
      startEl = range.startContainer.childNodes[range.startOffset] as Element;
      startOffs = 0;
    } else if (range.startContainer.isA('SPAN')) {
      console.assert(range.startOffset === 0, "start offset should be 0 but is ", range.startOffset);
      startEl = range.startContainer as Element;
      startOffs = 0;
    } else if (range.startContainer.isA('DIV')) {
      startEl = range.startContainer.childNodes[range.startOffset].childNodes[0] as Element;
      startOffs = 0;
    } else
      console.warn('cant handle start', range);

    if (range.endContainer.isA('#text')) {
      endEl = range.endContainer.parentNode as Element;
      endOffs = range.endOffset;
    } else if (range.endContainer.isA('P')) {
      console.assert(range.endContainer.childNodes.length > 0, 'there must be at least one child', range);
      endEl = range.endContainer.childNodes[range.endOffset] as Element
        || range.endContainer.childNodes[range.endContainer.childNodes.length - 1] as Element;
      endOffs = endEl.textContent.length;
    } else if (range.endContainer.isA('SPAN')) {
      console.error('how did we get here', range);
    } else if (range.endContainer.isA('DIV')) {
      const pars = range.endContainer.childNodes;
      endEl = (pars[range.endOffset] || pars[pars.length - 1]).childNodes[0] as Element;
      endOffs = endEl.textContent.length;
    } else
      console.warn('cant handle end', range);
  } else
    console.warn('cant handle', range);

  return [startEl, startOffs, endEl, endOffs];
};

const makeNodesFromSelection = function (range: Range, foreachAction: Function) {
  let [startEl, startOffs, endEl, endOffs] = getSelectedNodes(range);

  let par = startEl.parentNode as Element;
  if (startEl === endEl && startOffs === endOffs) {
    startEl   = par.firstChild as Element;
    startOffs = 0;
    endEl   = par.childNodes[par.childNodes.length - 1] as Element;
    endOffs = endEl.textContent.length;
  }
  if (startEl === endEl) {
    const text = startEl.textContent;
    let sliced = false;
    if (startOffs > 0) {
      const before = startEl.cloneNode();
      before.appendChild(makeT(text.substr(0, startOffs)));
      par.insertBefore(before, startEl);
      sliced = true;
    }
    if (endOffs < text.length) {
      const after = startEl.cloneNode();
      after.appendChild(makeT(text.substr(endOffs)));
      par.insertBefore(after, startEl.nextSibling);
      sliced = true;
    }

    if (sliced) {
      const txt = <Node>makeT(text.substr(startOffs, endOffs - startOffs));
      startEl.firstChild.replaceWith(txt);

      range.setStart(txt, 0);
      range.setEnd(txt, endOffs - startOffs);
    } else {
      range.setStart(startEl.firstChild, 0);
      range.setEnd(startEl.firstChild, text.length);
    }

    if (foreachAction)
      foreachAction(startEl);
  } else {
    if (startOffs > 0) {
      const firstText = startEl.textContent;
      const before = startEl.cloneNode();
      before.appendChild(makeT(firstText.substr(0, startOffs)));
      par.insertBefore(before, startEl);
      const firstTxt = makeT(firstText.substr(startOffs))
      startEl.firstChild.replaceWith(firstTxt);
    }

    range.setStart(startEl.firstChild, 0);

    if (foreachAction)
      foreachAction(startEl);

    let curr = startEl;
    do {
      if (curr.nextSibling === null) {
        curr = curr.parentNode.nextSibling.firstChild as Element;
        par  = curr.parentNode as Element;
      } else {
        curr = curr.nextSibling as Element;
      }

      if (curr === endEl)
        break;

      console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && curr.firstChild.isA('#text'), 'illegal p child ', curr, range);

      if (foreachAction)
        foreachAction(curr);
    } while (true);

    if (endOffs < endEl.textContent.length) {
      const lastText = endEl.textContent;
      const after = endEl.cloneNode();
      after.appendChild(makeT(lastText.substr(endOffs)));
      par.insertBefore(after, endEl.nextSibling);
      const lastTxt = makeT(lastText.substr(0, endOffs));
      endEl.firstChild.replaceWith(lastTxt);
    }

    range.setEnd(endEl.firstChild, endEl.textContent.length);

    if (foreachAction)
      foreachAction(endEl);
  }

  return [startEl, endEl];
};