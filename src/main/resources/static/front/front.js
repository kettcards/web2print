'use strict';

const make  = document.createElement.bind(document);
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
const hTxtMUp = function(e){
  //(lucas 05.01.20)
  // compat: 93.42%  destructuring ... might need to do this differently
  const [nodes, range] = getNodesFromSelection();
  const $initialTarget = $(range.startContainer).parent();
  let fontFam = $initialTarget.css('font-family');
  let fontSize = +$initialTarget.css('font-size').slice(0, -2);
  let index;
  const $nodes = $(nodes);
  for(let i = 1; i < $nodes.length; i++){
    const nextFam  = $nodes.eq(i).css('font-family');
    const nextSize = +$nodes.eq(i).css('font-size').slice(0, -2);
    if(fontFam !== nextFam){
      index = -1;
    }
    if(nextSize < fontSize) {
      fontSize = nextSize;
    }
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
  const data = ev.clipboardData.getData('text/html');
  let frag   = document.createRange().createContextualFragment(data);
  //prepare the fragment to only contain the actual fragment
  const innerTextFrag = frag.querySelector('.text');
  if(innerTextFrag) {
    frag = innerTextFrag;
  }

  const nodes = makeNodesFromSelection();
  if(nodes.length > 0) {
    const box = e.delegateTarget;
    const spawnTarget = nodes[nodes.length - 1].nextSibling;
    for(const run of nodes)
      box.removeChild(run);
    for(const run of frag.childNodes) {
      console.log('inserting', run, run.textContent);
      box.insertBefore(run, spawnTarget);
    }
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
    const inner = make('span');
    inner.classList.add('fontStyle');
    box.appendChild(inner);
    return;
  } else if (runs.length === 1) {
    switch (runs[0].nodeName) {
      case 'BR': box.removeChild(runs[0]); return;
      case '#text': {
        const inner = make('span');
        inner.classList.add('fontStyle');
        inner.appendChild(box.removeChild(runs[0]));
        box.appendChild(inner);
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
        //(lucas) if the last node is a ber promote it and delete the original run, else dont do anything
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
  const $nodes = $(makeNodesFromSelection());
  const shouldRemove = $nodes.filter('.'+classToAdd).length === $nodes.length;
  $nodes[shouldRemove ? 'removeClass' : 'addClass'](classToAdd);
}).mouseup(function(e){
  e.stopPropagation();
});

const getNodesFromSelection = function() {
  const selection = document.getSelection();
  if(selection.rangeCount < 1)
    return [[], undefined];

  //(lucas 09.01.21)
  // todo: loop over all ranges to support multi select,
  //       this then also needs to be respected while saving / restoring the selection
  let range = selection.getRangeAt(0);
  if(range.collapsed)
    return[[], range];

  const container = range.commonAncestorContainer;
  let start = range.startContainer;
  let end = range.endContainer;
  const $start = $(start);
  //(lucas) this fixes a selection bug when selecting a whole line / the whole block of text
  //        where the endContainer becomes the parent of the container itself
  if($start.hasClass('text')){
    let el = container.childNodes[0];
    while (el.nodeName === 'BR' && el !== end.parentNode)
      el = el.nextSibling;
    start = el.childNodes[0];
    range.setStart(start, 0);
  } else if($start.hasClass('fontStyle')) {
    start = start.childNodes[0];
    range.setStart(start, range.startOffset);
  } else if(range.startOffset === start.textContent.length) {
    const next = start.parentNode.nextSibling;
    start = next.nodeName === 'BR' ? next : next.childNodes[0];
    range.setStart(start, 0);
  }
  const $end = $(end);
  if($end.hasClass('text')){
    let el = container.childNodes[range.endOffset];
    if (!el) {
      el = container.childNodes[container.childNodes.length - 1];
    }
    while (el.nodeName === 'BR' && el !== start.parentNode)
      el = el.previousSibling;
    end = el.childNodes[0];
    range.setEnd(end, end.textContent.length);
  } else if($end.hasClass('fontStyle')) {
    end = end.childNodes[0];
    range.setEnd(end, range.endOffset);
  } else if (range.endOffset === 0) {
    end = end.parentNode.previousSibling.childNodes[0];
    range.setEnd(end, end.textContent.length);
  }
  let _iter = document.createNodeIterator(
      container, NodeFilter.SHOW_TEXT, {
        acceptNode: function(n) {
          return (n.nodeName === 'BR') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
  );
  let nodes = [];
  // (lucas) iterate over all _text_ nodes in the selection and save their parents (spans)
  while(_iter.nextNode()) {
    let ref = _iter.referenceNode;
    if(nodes.length < 1 && ref !== start)
      continue;
    nodes.push(ref.parentNode);
    if(ref === end)
      break;
  }

  return [nodes, range];
}

const makeNodesFromSelection = function() {
  // (lucas 05.01.20)
  // compat: 93.42%  destructuring ... might need to do this differently
  const [nodes, range] = getNodesFromSelection();

  if(nodes.length === 1) {
    const node = nodes[0];

    const txt = node.textContent;
    const parent = node.parentNode;
    let slice = false;
    if(range.startOffset !== 0) {
      const w = node.cloneNode();
      w.appendChild(makeT(txt.substr(0, range.startOffset)));
      parent.insertBefore(w, node);
      slice = true;
    }
    if(range.endOffset !== txt.length) {
      const w = node.cloneNode();
      w.appendChild(makeT(txt.substr(range.endOffset)));
      parent.insertBefore(w, node.nextSibling);
      slice = true;
    }

    if(slice) {
      node.childNodes[0].replaceWith(txt.substr(range.startOffset, range.endOffset - range.startOffset));
    }
  } else if (nodes.length > 1) {
    const first = nodes[0];
    let txt = first.textContent;
    if(range.startOffset === txt.length){
      nodes.shift();
    } else if(range.startOffset !== 0) {
      const c = first.cloneNode();
      c.appendChild(makeT(txt.substr(0, range.startOffset)));
      first.parentNode.insertBefore(c, first);
      first.childNodes[0].replaceWith(txt.substr(range.startOffset));
    }

    const last = nodes[nodes.length - 1];
    txt = last.textContent;
    if(range.endOffset === 0){
      nodes.pop();
    } else if(range.endOffset !== txt.length) {
      const c = last.cloneNode();
      c.appendChild(makeT(txt.substr(range.endOffset)));
      last.parentNode.insertBefore(c, last.nextSibling);
      last.childNodes[0].replaceWith(txt.substr(0, range.endOffset));
    }
  }

  //(lucas) restore selection after creating new nodes
  const selection = document.getSelection();
  let newRange = new Range();
  newRange.setStart(nodes[0].childNodes[0], 0);
  let lastNode = nodes[nodes.length - 1].childNodes[0];
  newRange.setEnd(lastNode, lastNode.textContent.length);
  selection.removeAllRanges();
  selection.addRange(newRange);

  return nodes;
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
  const nodes = makeNodesFromSelection();
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
  $(makeNodesFromSelection()).css('font-size', e.target.value+'px');
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

