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
const get = document.getElementById.bind(document);
const stopPropagation = function(e){e.stopPropagation();};
const falsify = function() {return false;}
// (lucas) the remainder function in js does not work like the mathematical modulo,
//         this function does.
const mod = function(a, n) {return ((a % n) + n) % n;}

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
    return $('<span class="text" contenteditable><span class="fontStyle">Ihr Text Hier!</span></span>')
      .mousedown(hTxtMDown)
      .mouseup(hTxtMUp)
      .click(hElClick)
      .on('paste', hElPaste)
      .on('input', hElInput)
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
  start;
  end;

  constructor(range) {
    this.start = range.startContainer.nodeName === 'BR' ? range.startContainer : range.startContainer.parentNode;
    this.end   = range.endContainer.nodeName === 'BR' ? range.endContainer : range.endContainer.parentNode;
    this.range = range;
  }

  setStart(newStart, offset) {
    if(offset) {
      this.range.setStart(newStart.childNodes[0], offset);
    } else {
      if(newStart.nodeName === 'BR')
        this.range.setStartBefore(newStart);
      else
        this.range.setStart(newStart.childNodes[0], 0);
    }
    this.start = newStart;
  }
  setEnd(newEnd) {
    if(newEnd.nodeName === 'BR')
      this.range.setEndAfter(newEnd);
    else
      this.range.setEnd(newEnd.childNodes[0], newEnd.textContent.length);
    this.end = newEnd;
  }

  iterateSpans() {
    const arr = [];
    for(let n = this.start;; n = n.nextSibling) {
      if(n.nodeName === 'SPAN')
        arr.push(n);
      if(n === this.end)
        break;
    }
    return arr;
  }
  iterate() {
    const arr = [];
    for(let n = this.start;; n = n.nextSibling) {
      arr.push(n);
      if(n === this.end)
        break;
    }
    return arr;
  }
}

const hTxtMUp = function(e){
  const rangeW = getNodesFromSelection();
  let $initialSource;
  if(rangeW.start.nodeName === 'BR') {
    let curr = rangeW.start;
    while(curr = curr.previousSibling) {
      if(curr.nodeName !== 'BR')
        break;
    }
    if(curr) {
      $initialSource = $(curr);
    } else {
      curr = rangeW.start;
      while(curr = curr.nextSibling) {
        if(curr.nodeName !== 'BR')
          break;
      }
      if(curr) {
        $initialSource = $(curr);
      } else
        throw new Error("HOW DID WE GET HERE?");
    }
  } else {
    $initialSource = $(rangeW.start);
  }

  let fontFam  =  $initialSource.css('font-family');
  let fontSize = +$initialSource.css('font-size').slice(0, -2);
  let index;
  for(let n = rangeW.start;; n = n.nextSibling){
    const nextFam  =  $(n).css('font-family');
    const nextSize = +$(n).css('font-size').slice(0, -2);
    if(fontFam !== nextFam){
      index = -1;
    }
    if(nextSize < fontSize) {
      fontSize = nextSize;
    }
    if(n === rangeW.end)
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
  const ev = e.originalEvent;
  // (lucas 21.01.21)
  // this could be the beforeinput event, but sadly you have to explicitly allow it in the config under firefox

  // try html first
  let data = ev.clipboardData.getData('text/html');
  if(data.length > 0) {
    let frag = document.createRange().createContextualFragment(data);
    //prepare the fragment to only contain the actual fragment
    const innerTextFrag = frag.querySelector('.text');
    if(innerTextFrag) {
      frag = innerTextFrag;
    }

    const rangeW = makeNodesFromSelection();
    const insertTarget = rangeW.end.nextSibling;
    rangeW.range.deleteContents();
    for(const run of frag.childNodes) {
      if(run.nodeName === 'BR' || (run.nodeName === 'SPAN' && $(run).hasClass('fontStyle')))
        insertTarget.parentNode.insertBefore(run, insertTarget);
      else if(run.nodeName === '#text' && run.textContent.length > 0) {
        insertTarget.parentNode.insertBefore(make('span.fontStyle', run), insertTarget);
      } else
        console.log('skipping insertion of', run);
    }
  } else {
    //if we cant get html we try for text
    data = ev.clipboardData.getData('text');
    if(data.length > 0) {
      const rangeW = makeNodesFromSelection();
      const insertTarget = rangeW.end.nextSibling;
      rangeW.range.deleteContents();
      const box = insertTarget.parentNode;

      const lines = data.split("\n");
      box.insertBefore(make('span.fontStyle', lines[0]), insertTarget);
      for(let i = 1; i < lines.length; i++) {
        box.insertBefore(make('br'), insertTarget);
        box.insertBefore(make('span.fontStyle', lines[i]), insertTarget);
      }
    } else
      console.log('cant paste that', ev.clipboardData.types);
  }
};

const hElInput = function(e){
  const box = e.delegateTarget;
  const runs = box.childNodes;
  // (lucas)
  // if the user selects all (ctrl-a) and then starts typing the inner span is removed
  // this solution isn't very clean but it works
  // (lucas 05.01.20)
  // todo: would like to find a better way to do this
  if(runs.length === 0){
    box.appendChild(make('span.fontStyle'));
    return;
  } else if (runs.length === 1) {
    switch (runs[0].nodeName) {
      case 'BR': box.removeChild(runs[0]); return;
      case '#text': {
        box.appendChild(make('span.fontStyle', box.removeChild(runs[0])));
      } return;
    }
  }
  //(lucas) need to detect if the user inserts a new line, since it needs to be promoted to maintain a flat structure
  if(e.originalEvent.inputType === 'insertParagraph'){
    for(const run of runs){
      const nodes = run.childNodes;
      if(nodes.length === 3) {
        //(lucas) cant guarantee that the middle node is br
        do {
          if(nodes[0].nodeName === 'BR') {
            box.insertBefore(run.removeChild(nodes[0]), run);
          } else {
            const c = run.cloneNode();
            c.appendChild(run.removeChild(nodes[0]));
            box.insertBefore(c, run);
          }
        } while(nodes.length > 1);
        //(lucas) if the last node is a br promote it and delete the original run, else dont do anything
        if(nodes[0].nodeName === 'BR') {
          box.insertBefore(run.removeChild(nodes[0]), run);
          box.removeChild(run);
        }
      } else if(nodes.length === 2) {
        box.insertBefore(run.removeChild(nodes[0]), run);
      }
    }
  }
};

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
}).mouseup(function(e){
  e.stopPropagation();
});

const getNodesFromSelection = function() {
  const selection = document.getSelection();
  if(selection.rangeCount < 1)
    return new RangeWrapper();

  // (lucas 09.01.21)
  // todo: loop over all ranges to support multi select,
  //       this then also needs to be respected while saving / restoring the selection
  const range = selection.getRangeAt(0).cloneRange();
  const rangeW = new RangeWrapper(range);

  if(range.collapsed) {
    if(range.startContainer.nodeName === 'SPAN' && $(range.startContainer).hasClass('text')) {
      rangeW.setStart(range.startContainer.childNodes[range.startOffset]);
      rangeW.setEnd(range.endContainer.childNodes[range.endOffset]);
    }
    return rangeW;
  }

  // (lucas)
  // this section tries to unify behaviour of the selection.
  // the problem arises from the fact that depending on the specific position selected
  // and even how it was selected doc.getSelection() returns different values
  const $start = $(range.startContainer);
  if($start.hasClass('text')){
    const newStart = range.startContainer.childNodes[range.startOffset];
    rangeW.setStart(newStart);
  } else if($start.hasClass('fontStyle')) {
    rangeW.setStart(range.startContainer, range.startOffset);
  } else if(range.startOffset === range.startContainer.textContent.length && range.startContainer.nodeName === '#text') {
    const next = range.startContainer.parentNode.nextSibling;
    rangeW.setStart(next);
  }
  const $end = $(range.endContainer);
  if($end.hasClass('text')){
    const children = range.endContainer.childNodes;
    const el = children[range.endOffset];
    rangeW.setEnd(el || children[children.length - 1]);
  } else if($end.hasClass('fontStyle')) {
    rangeW.setEnd(range.endContainer, range.endOffset);
  } else if (range.endOffset === 0 && range.endContainer.nodeName === '#text') {
    const prev = range.endContainer.parentNode.previousSibling;
    rangeW.setEnd(prev);
  }

  console.log('get returned', rangeW.iterate());
  return rangeW;
}

const makeNodesFromSelection = function() {
  const rangeW = getNodesFromSelection();
  let modified = false;

  if(rangeW.start.nodeName !== 'BR' && rangeW.start === rangeW.end) {
    const node = rangeW.start;

    let txt = node.textContent;
    const startOffs = rangeW.range.startOffset;
    const endOffs   = rangeW.range.endOffset;
    if(startOffs !== 0) {
      const w = node.cloneNode();
      w.appendChild(makeT(txt.substr(0, startOffs)));
      node.parentNode.insertBefore(w, node);
      modified = true;
    }
    if(endOffs !== txt.length) {
      const w = node.cloneNode();
      w.appendChild(makeT(txt.substr(endOffs)));
      node.parentNode.insertBefore(w, node.nextSibling);
      modified = true;
    }

    if(modified) {
      node.childNodes[0].replaceWith(txt.substr(startOffs, endOffs - startOffs));
      rangeW.setStart(node);
      rangeW.setEnd(node);
    }
  } else {
    const first = rangeW.start;
    if(first.nodeName !== 'BR') {
      const txt = first.textContent;
      if (rangeW.range.startOffset !== 0) {
        const c = first.cloneNode();
        c.appendChild(makeT(txt.substr(0, rangeW.range.startOffset)));
        first.parentNode.insertBefore(c, first);
        first.childNodes[0].replaceWith(txt.substr(rangeW.range.startOffset));
        rangeW.setStart(first);
        modified = true;
      }
    }

    const last = rangeW.end;
    if(last.nodeName !== 'BR') {
      const txt = last.textContent;
      if (rangeW.range.endOffset !== txt.length) {
        const c = last.cloneNode();
        c.appendChild(makeT(txt.substr(rangeW.range.endOffset)));
        last.parentNode.insertBefore(c, last.nextSibling);
        last.childNodes[0].replaceWith(txt.substr(0, rangeW.range.endOffset));
        rangeW.setEnd(last);
        modified = true;
      }
    }
  }

  //(lucas) restore selection after creating new nodes
  if(modified) {
    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeW.range);
  }

  console.log('make returned', rangeW.iterate());
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
const $fontSelect = $('#fontSelect').mouseup(function(e){e.stopPropagation();});
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
  const s = document.getSelection();
  if(s.rangeCount === 1)
    state.range = s.getRangeAt(0).cloneRange();
})
.mouseup(stopPropagation)
.change(function(e) {
  //restore selection
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(state.range);
  $(makeNodesFromSelection().iterateSpans()).css('font-size', e.target.value+'px');
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

  const range = document.createRange();
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

