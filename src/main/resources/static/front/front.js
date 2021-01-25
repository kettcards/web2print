'use strict';

const make = function(spec, child) {
  const s = spec.split('.');
  const e = document.createElement(s[0]);
  if(s.length > 1){
    s.shift();
    e.classList.add(s);
  }
  if(child)
    e.appendChild(child);
  return e;
}
const makeT = document.createTextNode.bind(document);
const makeR = document.createRange.bind(document);
const get = document.getElementById.bind(document);
const getSel = document.getSelection.bind(document);
const stopPropagation = function(e){e.stopPropagation();};
const falsify = function() {return false;};
// (lucas) the remainder function in js does not work like the mathematical modulo,
//         this function does.
const mod = function(a, n) {return ((a % n) + n) % n;};
Node.prototype.isA = function(n) {return this.nodeName === n;};

const $toolBox = $('#toolBox');

const createFold = function(fold){
  if(fold.x1 === fold.x2){
    //vFold
    let vFold = $('<div class="vFold"></div>');
    vFold.css('left', fold.x1+'mm');
    return vFold;
  } else
  if(fold.y1 === fold.y2){
    //hFold
    let hFold = $('<div class="hFold"></div>');
    hFold.css('top', fold.y1+'mm');
    return hFold;
  } else {
    throw new Error("can't display diagonal folds for now");
  }
}

const bgStretchObjs = {
  STRETCH: {
    'background-size': 'cover',   
    'background-repeat': 'no-repeat ',
    'background-position': 'center center',
  },
  //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
};

const EditorTransform = {
  $transformAnchor: $('#transform-anchor'),
  scale: 1,
  translate: { x: 0, y: 0 },
  rotate: 0,
  apply: function() {
    // (lucas) cant use the proper matrix solution because the browser gets confused with the rotation direction :(
    this.$transformAnchor.css('transform', 'scale('+this.scale+', '+this.scale+') translate('+this.translate.x+'px,'+this.translate.y+'px) rotateY('+this.rotate+'deg)');
  }
};

const pages = {
  $outerPages: undefined,
  $innerPages: undefined
};
// [call once]
const loadCard = function(card){
  console.log('loading', card);

  document.querySelector('#preview-container>img').src
      = web2print.links.thumbnailUrl+card.thumbSlug;

  const width = card.cardFormat.width;
  const height = card.cardFormat.height;
  const $pageContainer = $("#page-container");
  // 55 additional pixels for the rulers
  EditorTransform.scale = Math.min(
      $pageContainer.width() * MMPerPx.x / (width + 55),
      $pageContainer.height() * MMPerPx.x / (height + 55)
  ) * 0.9;
  EditorTransform.apply();

  const pageFrag = get('page-template').content.cloneNode(true);
  const $newPage = $(pageFrag.childNodes[0]);
  $newPage.css(Object.assign({
    width: width+'mm',
    height: height+'mm',
    'background-image': 'url("'+web2print.links.materialUrl+card.material.textureSlug+'")',
  }, bgStretchObjs[card.material.tiling]));

  for(let fold of card.cardFormat.folds) {
    $newPage.find('.folds-layer').append(createFold(fold));
  }

  let mFront, mBack;
  for(const motive of card.motive) {
    switch(motive.side) {
      case 'FRONT': mFront = motive.textureSlug; break;
      case 'BACK':  mBack  = motive.textureSlug; break;
      default: throw new Error("unknown motive side '"+motive.side+"'");
    }
  }

  // (lucas 24.01.21) todo: outer = mBack?
  const outerFrag = pageFrag.cloneNode(true);
  $(pageFrag.childNodes[0]).find('.motive-layer')[0].src = mFront;
  pages.$innerPages = $('#inner').append(pageFrag).children();
  $(outerFrag.childNodes[0]).find('.motive-layer')[0].src = mBack;
  pages.$outerPages = $('#outer').append(outerFrag).children();

  //sadly the stepping needs to be done in js because the cumulative error of stacking css is noticeable
  const $topRuler  = $('.ruler.top');
  for(let i = 0; i < width; i+=5)
    $topRuler.append($(make('li')).css('left', i+'mm').attr('data-val', i/10));
  const $leftRuler = $('.ruler.left');
  for(let i = 0; i < height; i+=5)
    $leftRuler.append($(make('li')).css('top', i+'mm').attr('data-val', i/10));
};
//spawning new elements
const hElementsLayerClick = function(e, target) {
  if(!state.addOnClick)
    return;
  const el = state.addOnClick({left: e.offsetX, top: e.offsetY});
  $(target).append(el);
  state.addOnClick = undefined;
};

const Parameters = (function(){
  const ret = {}, url = window.location.search;
  if(url){
    let split = url.substr(1).split('&'), subSplit;
    for(let s of split){
      subSplit = s.split('=');
      ret[subSplit[0]] = subSplit[1] || 'no_value';
    }
  }
  return ret;
})();

$.get(web2print.links.apiUrl+'card/'+Parameters.card)
 .then(function(data) { //(lucas 04.01.20) mbe move this 'check' into loadPage
   return new Promise(function(resolve, reject){
     if(data) resolve(data);
     else     reject();
   })
 })
 .then(loadCard)
 .catch(function(){

   alert(Parameters.card
    ? 'Die Karte "'+Parameters.card+'" konnte nicht gefunden werden!'
    : 'Es wurde keine Karte gefunden!');
   location.href = web2print.links.basePath+'tileview/tileview.html';
 });

const Spawner = {
  TEXT: function(p){
    return $('<span class="text"><span class="fontStyle">Ihr Text Hier!</span></span>')
      .mousedown(hTxtMDown)
      .mouseup(hTxtMUp)
      .click(hElClick)
      .on('paste',   hElPaste)
      .on('keydown', hElKeyDown)
      .on('keyup',   hElKeyUp)
        // (lucas 09.01.21)
        // this is a quick fix to disable the glitchy behaviour when dragging selected text.
        // unfortunately this also produces quite the rough experience when a user actually wants do use drag n drop
      .on("dragstart", falsify)
      .on("drop", falsify)
      .css(Object.assign({ 'font-family': defaultFont }, p));
  },
  IMAGE: undefined,
  GEOM: undefined,
};

const state = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  dx: 0,
  dy: 0,
};

const hTxtMDown = function(e){
  state.target = $(e.delegateTarget);
  state.addOnClick = undefined;
};

class RangeWrapper {
  range;
  box;
  startEl; startOffs;
    endEl;   endOffs;

  constructor(range) {
    this.range = range;

    if(range.startContainer.isA('#text')) {
      this.startEl   = range.startContainer.parentNode;
      this.startOffs = range.startOffset;
    } else if(range.startContainer.isA('SPAN')) {
      if(range.startContainer.className === 'text') {
        this.startEl   = range.startContainer.childNodes[range.startOffset];
        this.startOffs = 0;
      } else {
        this.startEl   = range.startContainer;
        this.startOffs = 0;
      }
    }
    this.box = this.startEl.parentNode;

    if(range.endContainer.isA('#text')) {
      this.endEl   = range.endContainer.parentNode;
      this.endOffs = range.endOffset;
    } else if(range.endContainer.isA('SPAN')) {
      if(range.endContainer.className === 'text') {
        this.endEl   = range.endContainer.childNodes[range.endOffset]
          || range.endContainer.childNodes[range.endContainer.childNodes.length - 1];
        this.endOffs = this.endEl.textContent.length;
      } else {
        this.endEl   = range.endContainer;
        this.endOffs = this.endEl.textContent.length;
      }
    }
  }

  iterateSpans() {
    const arr = [];
    for(let n = this.startEl;; n = n.nextSibling) {
      if(n.isA('SPAN'))
        arr.push(n);
      if(n === this.endEl)
        break;
    }
    return arr;
  }
  iterate() {
    const arr = [];
    for(let n = this.startEl;; n = n.nextSibling) {
      arr.push(n);
      if(n === this.endEl)
        break;
    }
    return arr;
  }

  findReference() {
    if(this.startEl.isA('BR')) {
      let curr = this.startEl;
      while(curr = curr.previousSibling) {
        if(!curr.isA('BR'))
          break;
      }
      if(curr)
        return curr;

      curr = this.startEl;
      while(curr = curr.nextSibling) {
        if(!curr.isA('BR'))
          break;
      }
      if(curr)
        return curr;

      throw new Error("not implemented 22");
    }

    return this.startEl;
  }
}

const hTxtMUp = function(){
  const rangeW = new RangeWrapper(getSel().getRangeAt(0));
  let $initialSource = $(rangeW.findReference());

  let fontFam  =  $initialSource.css('font-family');
  let fontSize = +$initialSource.css('font-size').slice(0, -2);
  let index;
  for(let n = rangeW.startEl;; n = n.nextSibling){
    const nextFam  =  $(n).css('font-family');
    const nextSize = +$(n).css('font-size').slice(0, -2);
    if(fontFam !== nextFam){
      index = -1;
    }
    if(nextSize < fontSize) {
      fontSize = nextSize;
    }
    if(n === rangeW.endEl)
      break;
  }

  $fontSelect[0].selectedIndex = index || FontNames.indexOf(fontFam);

  $fontSizeSelect.val(fontSize);
};
const hElClick = function(e){
  e.stopPropagation();

  const $target = $(e.delegateTarget);
  $toolBox.css(Object.assign({
    visibility: 'visible'
  }, $target.offset()));
};
const hElPaste = async function(e) {
  e.preventDefault();
  const ev  = e.originalEvent;
  const box = e.delegateTarget;
  // (lucas 21.01.21)
  // this could be the beforeinput event, but sadly you have to explicitly allow it in the config under firefox

  // (lucas) dont bother with trying to get teh html, its just not worth the hassle of converting the structure
  //         firefox doesnt give you a proper fragment, it generates tags around the fragment.
  //         I could extract the comment tags and go from there, but ist just not worth it.
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
      return make('span.fontStyle', child);
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
    console.log('cant paste that', ev.clipboardData.types);
};

const hElKeyDown = function(e) {
  const ev = e.originalEvent;
  const key = ev.keyCode;

  const selection = getSel();
  const range = selection.getRangeAt(0);

  if(ev.ctrlKey) {
    //ctrl+z
    if(key === 90){
      // (lucas) since we do a lot of manual changes the default undo wont work at all and we have to just block it for now
      e.preventDefault();
    }
    // dont try to meddle with commands except ctrl z
    return;
  }

    // arrow keys               // shift | ctrl | alt
  if((key < 37 || e.keyCode > 40) && (key < 16 || key > 18)
    // img up/down  pos1/end       //caps      //osright     //ctxmen
    && (key < 33 || key > 36) && key !== 20 && key !== 91 && key !== 93) {
    const box = e.delegateTarget;

    const fixCtrlA = function() {
      let save;
      for (const c of box.childNodes)
        if (c.isA('SPAN')) {
          save = c.cloneNode();
          break;
        }
      if (!save)
        save = make('span.fontStyle');
      const txt = makeT('');
      save.appendChild(txt);

      const remRange = makeR();
      remRange.selectNodeContents(box);
      remRange.deleteContents();

      box.appendChild(save);
      const selRange = makeR();
      selRange.setEndAfter(txt);
      selRange.collapse();
      selection.removeAllRanges();
      selection.addRange(selRange);

      if (key === 8 || key === 46) {//backspace / del
        e.preventDefault();
      }
    };

    if($(range.startContainer).is('span.text') && $(range.endContainer).is('span.text')) {
      // (lucas)
      // if the user selects all (ctrl-a) and then starts typing the inner span is removed
      // we would overwrite the whole textbox, but this removes the inner span - so we dont
      if (range.startOffset === 0 && range.endOffset === box.childNodes.length) {
        fixCtrlA();
      } else if(key === 13) {
        e.preventDefault();
        if(range.collapsed) {
          const br = make('BR');
          box.insertBefore(br, box.childNodes[range.startOffset]);

          const newCursor = makeR();
          newCursor.setEndAfter(br);
          newCursor.collapse();
          selection.removeAllRanges();
          selection.addRange(newCursor);
        } else {
          // (lucas 24.01.21) todo
          console.error('not implemented 1');
        }
      } else {
        if (key !== 8 && key !== 46) {
          const insertTarget = box.childNodes[range.endOffset];
          const styleSource = new RangeWrapper(range).findReference();
          const txt = makeT('');
          const span = make('span.fontStyle', txt);
          $(span).css($(styleSource).css(['font-family', 'font-size']));
          range.deleteContents();
          box.insertBefore(span, insertTarget);

          range.setEndAfter(txt);
          range.collapse();
        }
      }
    } else if(box.childNodes.length === 1 && range.startContainer.isA('#text') && range.endContainer.isA('#text')
      && range.startOffset === 0 && range.endOffset === range.endContainer.textContent.length) {
      // ctrl-a for crome
      fixCtrlA();
    }  else if (key === 13) {
      //just prevent it in all cases
      e.preventDefault();
      if(range.startContainer.isA('#text') && range.endContainer.isA('#text')) {
        if(range.collapsed) {
          const span = range.startContainer.parentNode;
          const offs = range.startOffset;
          if(offs === 0) {
            box.insertBefore(make('BR'), span);
            return;
          } else if(offs === range.startContainer.textContent.length) {
            const br = make('BR');
            const insertTarget = span.nextSibling;
            box.insertBefore(br, insertTarget);

            const newCursor = makeR();

            // (lucas) if the br is the last element it gets ignored, this is however not the expected behaviour of en editor
            if(!insertTarget) {
              box.insertBefore(make('BR'), insertTarget);
            }
            newCursor.setEndAfter(br);
            newCursor.collapse();
            selection.removeAllRanges();
            selection.addRange(newCursor);
            return;
          }
        }

        const rangeW = makeNodesFromSelection();
        box.insertBefore(make('BR'), rangeW.startEl);
        rangeW.range.setStartBefore(rangeW.startEl);
        // (lucas 24.01.21) todo: move end ?
        rangeW.range.deleteContents();
      }
    }
  }
};
const hElKeyUp = function(e) {
  const ev = e.originalEvent;
  const key = ev.keyCode;

  if((key >= 37 && key <= 40) || (key >= 33 && key <= 36)) {
    hTxtMUp();
  }
}

$('.addElBtn').click(function(e){
  state.addOnClick = Spawner[$(e.target).data('enum')];
});

//changing text alignment
$(".alignmentBtn").click(function(){
  state.target.css('text-align', $(this).val());
}).mouseup(stopPropagation);
$(".fontTypeButton").click(function(){
  const classToAdd = $(this).val();
  const $nodes = $(makeNodesFromSelection().iterateSpans());
  const shouldRemove = $nodes.filter('.'+classToAdd).length === $nodes.length;
  $nodes[shouldRemove ? 'removeClass' : 'addClass'](classToAdd);
}).mouseup(stopPropagation);

const makeNodesFromSelection = function() {
  const selection = getSel();
  // (lucas 09.01.21)
  // todo: loop over all ranges to support multi select,
  //       this then also needs to be respected while saving / restoring the selection
  const range = selection.getRangeAt(0);
  const rangeW = new RangeWrapper(range);
  const { startEl: startEl, endEl: endEl, startOffs: startOffs, endOffs: endOffs, box: box } = rangeW;

  if(startEl.isA('SPAN') && startEl === endEl) {
    let modified = false;
    let text = startEl.textContent;
    if(startOffs > 0) {
      const w = startEl.cloneNode();
      w.appendChild(makeT(text.substr(0, startOffs)));
      box.insertBefore(w, startEl);
      modified = true;
    }
    if(endOffs < text.length) {
      const w = startEl.cloneNode();
      w.appendChild(makeT(text.substr(endOffs)));
      box.insertBefore(w, startEl.nextSibling);
      modified = true;
    }

    if(modified) {
      const txt = makeT(text.substr(startOffs, endOffs - startOffs));
      startEl.childNodes[0].replaceWith(txt);
      range.setStart(txt, 0);
      range.setEnd(txt, txt.textContent.length);
    }
  } else {
    if(startEl.isA('SPAN')) {
      const text = startEl.textContent;
      if (startOffs > 0) {
        const c = startEl.cloneNode();
        c.appendChild(makeT(text.substr(0, startOffs)));
        box.insertBefore(c, startEl);
        const txt = makeT(text.substr(startOffs));;
        startEl.childNodes[0].replaceWith(txt);
        range.setStart(txt, 0);
      }
    }

    if(endEl.isA('SPAN')) {
      const text = endEl.textContent;
      if (endOffs < text.length) {
        const c = endEl.cloneNode();
        c.appendChild(makeT(text.substr(endOffs)));
        box.insertBefore(c, endEl.nextSibling);
        const txt = makeT(text.substr(0, endOffs));
        endEl.childNodes[0].replaceWith(txt);
        range.setEnd(txt, txt.textContent.length);
      }
    }
  }

  return rangeW;
};

//dragging
$('#moveBtn').mousedown(function(){
  state.dragging = true;
});

let $body = $('body').mousemove(function(e){
  if(!state.dragging)
    return;
  state.dx += e.originalEvent.movementX;
  state.dy += e.originalEvent.movementY;
  
  state.target.css('transform', 'translate('+state.dx/EditorTransform.scale+'px, '+state.dy/EditorTransform.scale+'px)');
  $toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
}).mouseup(function(){
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      state.target.css({
        left: '+='+state.dx/EditorTransform.scale,
        top: '+='+state.dy/EditorTransform.scale,
        transform: '',
      });
      $toolBox.css({
        left: '+='+state.dx,
        top: '+='+state.dy,
        transform: '',
      });
      state.dx = 0;
      state.dy = 0;
    }
    state.dragging = false;
  } else 
    $toolBox.css('visibility', 'collapse');
});

const MMPerPx = (function(){
  const $resTester = $('<div style="height:100mm;width:100mm;display:none;"></div>')
  $body.append($resTester);
  const ret = { x: 100/$resTester.width(), y: 100/$resTester.height() };
  $resTester.remove();
  return ret;
})();

const FontStyleValues = {
  b: 0b001,
  i: 0b010,
  u: 0b100
};
const FontAttributeMap = {};
let defaultFont;

//serialize data
$('#submitBtn').click(function(){
  let data = {
    v: '0.2',
    card: Parameters.card,
    outerEls: [],
    innerEls: []
  };

  serializeSide(pages.$outerPages.find('.elements-layer').children(), data.outerEls);
  serializeSide(pages.$innerPages.find('.elements-layer').children(), data.innerEls);

  console.log("sending", data);
  const _export = true;
  $.post(web2print.links.apiUrl+'save/'+(Parameters.sId || '')+'?export='+_export, 'data='+btoa(JSON.stringify(data)))
    .then(function() {
      alert('Sent data!');
    }).catch(function(e){
      alert('Send failed: \n'+JSON.stringify(e));
    });
});

const serializeSide = function($els, target) {
  for(let i = 0; i < $els.length; i++) {
    const $el  = $els.eq(i);
    const pos = $el.position();
    const bounds = {
      x: pos.left * MMPerPx.x,
      y: ($el.parent().height() - (pos.top + $el.height())) * MMPerPx.y,
      w: $el.width() * MMPerPx.x,
      h: $el.height() * MMPerPx.y
    };
    switch($el[0].nodeName){
      case 'SPAN': {
        let align = $el.css('text-align');
        switch (align) {
          case 'justify': align = 'j'; break;
          case 'right':   align = 'r'; break;
          case 'center':  align = 'c'; break;
          default:        align = 'l';
        }
        let box = Object.assign({
          t: "t",
          a: align,
          r: []
        }, bounds);
        let $innerChildren = $el.children();
        for (let j = 0; j < $innerChildren.length; j++) {
          let $iel = $innerChildren.eq(j);
          switch ($iel[0].nodeName) {
            case 'SPAN': {
              let attributes = 0;
              //(lucas 05.01.20) compat: 93.42%  destructuring ... might need to do this differently
              for(const [c, v] of Object.entries(FontStyleValues))
                if ($iel.hasClass(c))
                  attributes |= v;
              box.r.push({
                f: $iel.css('font-family'),
                s: +$iel.css('font-size').slice(0,-2),
                a: attributes,
                t: $iel.text()
              });
            } break;
            case 'BR':
              box.r.push('br');
              break;
            default: console.warn('cannot serialize element', $iel[0]);
          }
        }
        target.push(box);
      } break;
      /* (lucas 02.01.20) deferred todo: add handling for images here
      case 'IMG':{

      } break;
      */
      default: console.warn('cannot serialize element', $el[0]);
    }
  }
};

//font stuff
const $fontSelect = $('#fontSelect').mouseup(stopPropagation);
let FontNames;

$.get(web2print.links.apiUrl+'fonts')
 .then(function(data) {
   FontNames = data;
   let $options = new Array(data.length);
   for(let i = 0; i < data.length; i++) {
     const fName = data[i];
     $options[i] = $('<option value="'+fName+'">'+fName+'</option>');
   }
   $fontSelect.append($options);
   $fontSelect.change(applyFont);

   //(lucas 18.01.21) todo: be more elegant about this, mbe explicitly spec it ?
   defaultFont = data[0];
   beginLoadFont(defaultFont);
 }).catch(function(e) {
  alert('[fatal] something went wrong loading fonts: '+JSON.stringify(e));
 });

const applyFont = function() {
  const nodes = makeNodesFromSelection().iterateSpans();
  const fName = $fontSelect.val();
  (!FontAttributeMap[fName] ? beginLoadFont(fName) : Promise.resolve())
  .then(function() {
    $(nodes).css('font-family', fName);
  });
};

const beginLoadFont = function(name) {
  return $.get(web2print.links.apiUrl+'font/'+name)
    .then(loadFont)
    .catch(function(e) {
      alert('[error] could not load font: '+JSON.stringify(e));
    });
};

// (lucas 04.01.21)
// compat: this might need to use another api, coverage is 93% but that has to mean nothing
const loadFont = function(font) {
  let attribs = {};
  let promises = new Array(font.faces.length);
  for(let i = 0; i < font.faces.length; i++) {
    const face = font.faces[i];
    promises[i] = new FontFace(font.name, 'url('+web2print.links.fontUrl+face.s+')', {
      style: face.fs,
      weight: face.fw
    })
    .load()
    .then(function(f){
      document.fonts.add(f);
      //todo dont just use b = bold, set the fontweights explicitly
      attribs[face.v] = face.fw;
    })
    .catch(function(e) {
      alert('[error] could not load font: '+JSON.stringify(e));
    });
  }
  return Promise.allSettled(promises).then(function() {
    FontAttributeMap[font.name] = attribs;
  });
};

const $fontSizeSelect = $('#fontSizeSelect')
.mousedown(function(e){
  const s = getSel();
  if(s.rangeCount === 1)
    state.range = s.getRangeAt(0).cloneRange();
})
.mouseup(stopPropagation)
.change(function(e) {
  //restore selection
  const selection = getSel();
  selection.removeAllRanges();
  selection.addRange(state.range);
  $(makeNodesFromSelection().iterateSpans()).css('font-size', e.target.value+'pt');
});

// changing pages
$('.right>.nav-btn-inner').click(function() {
  EditorTransform.rotate += 180;
  EditorTransform.apply();
  hPageSwitch(+1);
});
$('.left>.nav-btn-inner').click(function() {
  EditorTransform.rotate -= 180;
  EditorTransform.apply();
  hPageSwitch(-1);
});

//changing render style
const RenderStyles = [{
  name: 'Simple',
  pageGen: function(card) {

  },
  pageLabels: [
    'Inside',
    'Outside'
  ],
  initialDotIndex: 0
}];

const rsBtnTmpl   = get('render-style-btn-tmpl');
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('#nav-dots-container>ul');
const $pageLabel  = $('#nav-dots-container>span');
for(let i = 0; i < RenderStyles.length; i++) {
  const renderStyle = RenderStyles[i];
  const frag = rsBtnTmpl.content.cloneNode(true);
  $(frag.childNodes[0]).text(renderStyle.name).data('style-index', i);
  rsContainer.appendChild(frag);
}

const renderStyleState = {
  style:           undefined,
  currentDotIndex: undefined,
  dots:            undefined,
  getActiveDot: function() {
    return this.dots[this.currentDotIndex];
  },
  getActiveLabel: function() {
    return this.style.pageLabels[this.currentDotIndex];
  }
};
const hRenderStyleChanged = function(index) {
  renderStyleState.style = RenderStyles[index];
  renderStyleState.currentDotIndex = renderStyleState.style.initialDotIndex;
  renderStyleState.dots = new Array(renderStyleState.style.pageLabels.length);

  const range = makeR();
  range.selectNodeContents($navDotsUl[0]);
  range.deleteContents();
  for(let i = 0; i < renderStyleState.dots.length; i++) {
    const $el = $(make('li'));
    if(i === renderStyleState.currentDotIndex) {
      $el.addClass('active');
      $pageLabel.text(renderStyleState.getActiveLabel());
    }
    renderStyleState.dots[i] = $el;
    $navDotsUl.append($el);
  }
};
hRenderStyleChanged(0);

const hPageSwitch = function(direction) {
  renderStyleState.getActiveDot().removeClass('active');
  renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
  renderStyleState.getActiveDot().addClass('active');
  $pageLabel.text(renderStyleState.getActiveLabel());
};

