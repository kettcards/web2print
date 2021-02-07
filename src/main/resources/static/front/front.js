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

const $toolBox       = $('#toolBox');
const imgTool        = $('#imgTool');
const $editorArea    = $("#editor-area");
const $cardContainer = $('#card-container')
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('#nav-dots-container>ul');
const $pageLabel  = $('#nav-dots-container>span');

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

let cardData;
// [call once]
const loadCard = function(card){
  console.log('loading', card);

  document.querySelector('#preview-container>img').src
      = web2print.links.thumbnailUrl+card.thumbSlug;

  cardData = card;

  for(let i = 0; i < RenderStyles.length; i++) {
    const renderStyle = RenderStyles[i];
    if(!renderStyle.condition(card))
      continue;
    const frag = make('button.render-select');
    $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleChanged('+i+');');
    rsContainer.appendChild(frag);
  }

  hRenderStyleChanged(0);
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
    return $('<div class="text" contenteditable="true"><p><span>Ihr Text Hier!</span></p></div>')
      .mousedown(hTxtMDown)
      .mouseup(hTxtMUp)
      .click(hElClick)
      .on('paste', hElPaste)
      .on('keydown', hElKeyDown)
      .on('keyup', hElKeyUp)
        // (lucas 09.01.21)
        // this is a quick fix to disable the glitchy behaviour when dragging selected text.
        // unfortunately this also produces quite the rough experience when a user actually wants do use drag n drop
      .on("dragstart", falsify)
      .on("drop", falsify)
      .css(Object.assign({
        'font-family': defaultFont,
        'font-size': '16pt'
      }, p));
  },
  IMAGE: function(p){
    return $("<img class='logo' src='"+web2print.links.apiUrl+"content/"+logoContentId+"' alt='"+logoContentId+"' draggable='false'>")
        .mousedown(function(e){
          state.target = $(e.delegateTarget);
          state.addOnClick = undefined;
          state.dragging = true;
          $toolBox.css(Object.assign({
            visibility: 'hidden',
          }));
        })
        .click(imgClick)
        .css(p);
  },
  GEOM: undefined,
};

const state = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  resizing: false,
  dx: 0,
  dy: 0,
};

const hTxtMDown = function(e){
  state.target = $(e.delegateTarget);
  state.addOnClick = undefined;
};

const hTxtMUp = function(){
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
      n = n.parentNode.nextSibling.firstChild;
    } else {
      n = n.nextSibling;
    }
  }

  $fontSelect[0].selectedIndex = index || FontNames.indexOf(fontFam);

  $fontSizeSelect.val(Math.round(fontSize / 96 * 72));
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
  return;
  const ev  = e.originalEvent;
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
    console.log('cant paste that', ev.clipboardData.types);
};

const hElKeyDown = function(e) {
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

const hElKeyUp = function(e) {
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
    hTxtMUp();
  }
};

var logoContentId;
$('.addElBtn').click(function(e){
  let targetData = $(e.target).data('enum');
  state.addOnClick = Spawner[targetData];
  //trigger Fileupload
  if(targetData === 'IMAGE'){
    const fileUp = $('#fileUpload');
    fileUp.change(function (evt){
      //file Upload code
      let file = evt.target.files[0];
      console.log(file.type);
      //send to server
      let fd = new FormData();
      fd.append("file", file);
      let req = jQuery.ajax({
        url: web2print.links.apiUrl + "content",
        method: "POST",
        data: fd,
        processData: false,
        contentType: false
      });
      req.then(function (response) {
        logoContentId = JSON.parse(response).contentId;
      }, function (xhr) {
        console.error('failed to fetch xhr', xhr)
      });

    });
    fileUp.click();
  }
});

$("#resize").mousedown(function(e){
  state.resizing = true;
});

$("#logoRotation").change(function(e){
  state.target.css('transform', 'rotate('+ $(this).val()+'deg)');
}).mouseup(function(e){
  e.stopPropagation();
})

const imgClick = function(e){
  e.stopPropagation();

  const target = $(e.delegateTarget);
  imgTool.css(Object.assign({
    visibility: 'visible',
  }, target.offset()));
}

//changing text alignment
$(".alignmentBtn").click(function(){
  state.target.css('text-align', $(this).val());
}).mouseup(stopPropagation);
$(".fontTypeButton").click(function(){
  const classToAdd = $(this).val();
  const range = getSel().getRangeAt(0);

  let shouldRemoveClass = true;
  const [startEl, endEl] = makeNodesFromSelection(range, function(curr) {
    if(shouldRemoveClass && !$(curr).hasClass(classToAdd))
      shouldRemoveClass = false;
  });


  let par = startEl.parentNode;
  for(let curr = startEl;;) {
    console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && curr.firstChild.isA('#text'), 'illegal p child ', curr, range);

    $(curr)[shouldRemoveClass?'removeClass':'addClass'](classToAdd);

    if(curr === endEl)
      break;
    if(curr.nextSibling === null) {
      curr = curr.parentNode.nextSibling.firstChild;
      par  = curr.parentNode;
    } else {
      curr = curr.nextSibling;
    }
  }

}).mouseup(stopPropagation);

const makeNodesFromSelection = function(range, foreachAction) {
  const [startEl, startOffs, endEl, endOffs] = getSelectedNodes(range);

  let par = startEl.parentNode;
  if(startEl === endEl) {
    const text = startEl.textContent;
    const before = startEl.cloneNode();
    before.appendChild(makeT(text.substr(0, startOffs)));
    par.insertBefore(before, startEl);
    const after = startEl.cloneNode();
    after.appendChild(makeT(text.substr(endOffs)));
    par.insertBefore(after, startEl.nextSibling);

    const txt = makeT(text.substr(startOffs, endOffs - startOffs));
    startEl.firstChild.replaceWith(txt);

    range.setStart(txt, 0);
    range.setEnd(txt, endOffs - startOffs);

    if(foreachAction)
      foreachAction(startEl);
  } else
  for(let curr = startEl;;) {
    console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && curr.firstChild.isA('#text'), 'illegal p child ', curr, range);

     if(curr === startEl) {
      const text = startEl.textContent;
      const before = startEl.cloneNode();
      before.appendChild(makeT(text.substr(0, startOffs)));
      par.insertBefore(before, startEl);
      const txt = makeT(text.substr(startOffs))
      startEl.firstChild.replaceWith(txt);

      range.setStart(txt, 0);
    } else if(curr === endEl) {
      const text = endEl.textContent;
      const after = endEl.cloneNode();
      after.appendChild(makeT(text.substr(endOffs)));
      par.insertBefore(after, endEl.nextSibling);
      const txt = makeT(text.substr(0, endOffs));
      endEl.firstChild.replaceWith(txt);

      range.setEnd(txt, txt.textContent.length);
    }

    if(foreachAction)
      foreachAction(curr);

    if(curr === endEl)
      break;
    if(curr.nextSibling === null) {
      curr = curr.parentNode.nextSibling.firstChild;
      par  = curr.parentNode;
    } else {
      curr = curr.nextSibling;
    }
  }

  return [startEl, endEl];
};

const getSelectedNodes = function(range) {
  console.log('get', range);
  let startEl  , endEl  ;
  let startOffs, endOffs;

  if(range.commonAncestorContainer.isA('#text')) {
    startEl = endEl = range.startContainer.parentNode;
    startOffs = range.startOffset;
    endOffs   = range.endOffset;
  } else if(range.commonAncestorContainer.isA('P') || range.commonAncestorContainer.className === 'text') {
    if(range.startContainer.isA('#text')){
      startEl   = range.startContainer.parentNode;
      startOffs = range.startOffset;
    } else if(range.startContainer.isA('P')){
      startEl   = range.startContainer.childNodes[range.startOffset];
      startOffs = 0;
    } else if(range.startContainer.isA('SPAN')) {
      console.assert(range.startOffset === 0, "start offset should be 0 but is ", range.startOffset);
      startEl   = range.startContainer;
      startOffs = 0;
    } else if(range.startContainer.isA('DIV')) {
      startEl   = range.startContainer.childNodes[range.startOffset].childNodes[0];
      startOffs = 0;
    } else
      console.warn('cant handle start', range);

    if(range.endContainer.isA('#text')){
      endEl   = range.endContainer.parentNode;
      endOffs = range.endOffset;
    } else if(range.endContainer.isA('P')){
      console.assert(range.endContainer.childNodes.length > 0, 'there must be at least one child', range);
      endEl   = range.endContainer.childNodes[range.endOffset]
        || range.endContainer.childNodes[range.endContainer.childNodes.length - 1];
      endOffs = endEl.textContent.length;
    } else if(range.endContainer.isA('SPAN')) {
      console.error('how did we get here', range);
    } else if(range.endContainer.isA('DIV')) {
      const pars = range.endContainer.childNodes;
      endEl    = (pars[range.endOffset] || pars[pars.length - 1]).childNodes[0];
      endOffs  = endEl.textContent.length;
    } else
      console.warn('cant handle end', range);
  } else
    console.warn('cant handle', range);

  return [startEl, startOffs, endEl, endOffs];
};

//function to return transform rotation angle of the state.target
const getRotation = function(){
  let transformMatrix = state.target.css('transform');
  let angle = 0;
  if(transformMatrix !== "none") {
    let mat = transformMatrix.split('(')[1].split(')')[0].split(',');
    let a = mat[0];
    let b = mat[1];
    let radians = Math.atan2(b, a);
    if (radians < 0) {
      radians += (2 * Math.PI);
    }
    angle = Math.round(radians * (180 / Math.PI));
  }
  return angle;
};


//dragging
$('#moveBtn').mousedown(function(){
  state.dragging = true;
});

let $body = $('body').mousemove(function(e){
  if(!state.dragging && !state.resizing)
    return;
  state.dx += e.originalEvent.movementX;
  state.dy += e.originalEvent.movementY;

  if(state.resizing){
    state.target.css({
      width: '+='+(e.originalEvent.movementX),
      height: '+='+(e.originalEvent.movementY),
    });
  }else if(state.dragging) {
    state.target.css('transform', 'translate('+state.dx/EditorTransform.scale+'px, '+state.dy/EditorTransform.scale+'px) rotate('+getRotation()+'deg)');
    $toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
    imgTool.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
  }
}).mouseup(function(){
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      state.target.css({
        left: '+='+state.dx/EditorTransform.scale,
        top: '+='+state.dy/EditorTransform.scale,
        transform: 'translate('+0+'px, '+0+'px) rotate('+getRotation()+'deg)',
      });
      $toolBox.css({
        left: '+='+state.dx,
        top: '+='+state.dy,
        transform: '',
      });
      imgTool.css({
        left: '+='+state.dx,
        top: '+='+state.dy,
        transform: '',
      });
      state.dx = 0;
      state.dy = 0;
    }
    state.dragging = false;
  }else if(state.resizing){
    state.resizing = false;
    state.dx = 0;
    state.dy = 0;
  }else {
    $toolBox.css('visibility', 'collapse');
    imgTool.css('visibility', 'hidden');
  }
});

const MMPerPx = (function(){
  const $resTester = $('<div style="height:100mm;width:100mm;visibility:collapse;"></div>')
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
  const data = {
    v: '0.2',
    card: Parameters.card,
    outerEls: [],
    innerEls: []
  };

  const $bundles = $cardContainer.children();
  for(let i = 0; i < $bundles.length; i++) {
    const $b = $bundles.eq(i);
    const offs = +$b[0].dataset.xOffset;
    serializeSide($b.find('.front>.elements-layer').children(), offs, data.outerEls);
    serializeSide($b.find('.back>.elements-layer').children() , offs, data.innerEls);
  }

  console.log("sending", data);
  const _export = true;
  $.post(web2print.links.apiUrl+'save/'+(Parameters.sId || '')+'?export='+_export, 'data='+btoa(JSON.stringify(data)))
    .then(function() {
      alert('Sent data!');
    }).catch(function(e){
      alert('Send failed: \n'+JSON.stringify(e));
    });
});

const serializeSide = function($els, xOffs, target) {
  for(let j = 0; j < $els.length; j++) {
    const $el = $els.eq(j);
    const bounds = {
      x: xOffs + $el[0].offsetLeft * MMPerPx.x,
      y: ($el.parent().height() - ($el[0].offsetTop + $el.height())) * MMPerPx.y,
      w: $el.width() * MMPerPx.x,
      h: $el.height() * MMPerPx.y
    };
    switch($el[0].nodeName){
      case 'DIV': {
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
          if($iel[0].isA('P')) {
            const $spans = $iel.children();
            for(let k = 0; k < $spans.length; k++) {
              const $span = $spans.eq(k);
              if($span[0].isA('SPAN')) {
                let attributes = 0;
                for(const [c, v] of Object.entries(FontStyleValues))
                  if ($span.hasClass(c))
                    attributes |= v;
                box.r.push({
                  f: $span.css('font-family'),
                  s: Math.round((+$span.css('font-size').slice(0,-2)) / 96 * 72),
                  a: attributes,
                  t: $span.text()
                });
              } else {
                console.warn('cannot serialize element', $span[0]);
              }
            }
            box.r.push('br');
          } else {
            console.warn('cannot serialize element', $iel[0]);
          }
        }
        target.push(box);
      } break;

      case 'IMG':{
        let box = Object.assign({
          t: "i",
          s: $el[0].alt,
        }, bounds);
        target.push(box);
      } break;

      default: console.warn('cannot serialize element', $el[0]);
    }
  }
};

//font stuff
const applyFont = function() {
  const range = getSel().getRangeAt(0);
  const fName = $fontSelect.val();
  makeNodesFromSelection(range, function(curr) {
    $(curr).css('font-family', fName);
  })
};

const $fontSelect = $('#fontSelect')
  .mouseup(stopPropagation)
  .change(applyFont);
let FontNames;

$.get(web2print.links.apiUrl+'fonts')
 .then(function(data) {
   FontNames = data;
   let $options = new Array(data.length);
   for(let i = 0; i < data.length; i++) {
     const fName = data[i];
     $options[i] = $('<option value="'+fName+'" style="font-family: '+fName+';">'+fName+'</option>');
     beginLoadFont(fName);
   }
   $fontSelect.append($options);

   //(lucas 18.01.21) todo: be more elegant about this, mbe explicitly spec it ?
   defaultFont = data[0];
 }).catch(function(e) {
  alert('[fatal] something went wrong loading fonts: '+JSON.stringify(e));
 });

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
  const fontSize = e.target.value;
  const sel = getSel();
  sel.removeAllRanges();
  sel.addRange(state.range);
  makeNodesFromSelection(sel.getRangeAt(0), function(curr) {
    $(curr).css('font-size', fontSize+'pt');
  });
});

// changing pages
$('.right>.nav-btn-inner').click(function() {
  hPageSwitch(+1);
});
$('.left>.nav-btn-inner').click(function() {
  hPageSwitch(-1);
});

//changing render style
const RenderStyles = [{
  name: 'Simple',
  condition: function(card){ return true; },
  BgStretchObjs: {
    stretch: {
      'background-size': 'cover',
      'background-repeat': 'no-repeat ',
      'background-position': 'center center',
    },
    //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
  },
  pageGen: function(card) {
    const width = card.cardFormat.width;
    const height = card.cardFormat.height;
    // 55 additional pixels for the rulers
    EditorTransform.scale = Math.min(
      $editorArea.width() * MMPerPx.x / (width + 55),
      $editorArea.height() * MMPerPx.x / (height + 55)
    ) * 0.9;
    EditorTransform.apply();

    const $bundle = $(get('page-template').content.firstElementChild.cloneNode(true));
    $bundle.css({
       width:  width+'mm',
      height: height+'mm',
    });

    $bundle.children().css(Object.assign({
      'background-image': 'url("'+web2print.links.materialUrl+card.material.textureSlug+'")',
    }, this.BgStretchObjs[card.material.tiling]));

    for(let fold of card.cardFormat.folds) {
      $bundle.find('.folds-layer').append(createFold(fold));
    }

    let mFront, mBack;
    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': mFront = motive.textureSlug; break;
        case 'BACK':  mBack  = motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    if(mBack)
      $bundle.find('.back>.motive-layer') [0].src = web2print.links.motiveUrl+mBack;
    if(mFront)
      $bundle.find('.front>.motive-layer')[0].src = web2print.links.motiveUrl+mFront;

    createRuler(width, height);

    this.data.rot     = 0;
    this.data.$bundle = $bundle;

    return $bundle;
  },
  pageLabels: [
    'Inside',
    'Outside'
  ],
  initialDotIndex: 0,
  hPageChanged: function(direction) {
    this.data.rot += direction * 180;
    this.data.$bundle.css('transform', 'rotateY('+this.data.rot+'deg)');
  },
  data: {
    $bundle: undefined,
    rot: 0
  }
}, {
  name: 'simple_foldable',
  condition: function(card){
    const folds = card.cardFormat.folds;
    return folds.length === 1 && folds[0].x1 === folds[0].x2;
  },
  BgStretchObjs: {
    stretch: function(xOffset) { return {
        'background-size': 'cover',
        'background-repeat': 'no-repeat ',
        'background-position': 'center center',
      };
    },
    //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
  },
  pageGen: function(card) {
    const cardWidth = card.cardFormat.width;
    const cardHeight = card.cardFormat.height;
    const w1 = card.cardFormat.folds[0].x1;
    const w2 = cardWidth - w1;

    const template = get('page-template').content.firstElementChild;

    const $page1 = this.data.$page1 = $(template.cloneNode(true)).css({
      width: w1+'mm',
      height: card.cardFormat.height+'mm',
      'transform-origin': 'right center',
    });
    const $page2 = this.data.$page2 = $(template.cloneNode(true)).css({
      width: w2+'mm',
      height: card.cardFormat.height+'mm',
      'transform-origin': 'left center',
    });
    $page2[0].dataset.xOffset = w1;

    $page1.add($page2).children().css(Object.assign({
      'background-image': 'url("'+web2print.links.materialUrl+card.material.textureSlug+'")'
    }, this.BgStretchObjs[card.material.tiling]));

    let mFront, mBack;
    for(const motive of card.motive) {
      switch(motive.side) {
        case 'FRONT': mFront = motive.textureSlug; break;
        case  'BACK': mBack  = motive.textureSlug; break;
        default: throw new Error("unknown motive side '"+motive.side+"'");
      }
    }

    if(mFront) {
      $page1.find('.front>.motive-layer').css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
      $page2.find('.front>.motive-layer').css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mFront;
    }

    if(mBack) {
      $page1.find('.back>.motive-layer').css({ left:           0, width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
      $page2.find('.back>.motive-layer').css({ left: '-'+w1+'mm', width: cardWidth+'mm' })[0].src = web2print.links.motiveUrl+mBack;
    }

    this.data.p1r = 0;
    this.data.p2r = 0;
    this.data.state = 1;

    createRuler(cardWidth, cardHeight);

    return $(document.createDocumentFragment()).append($page1, $page2);
  },
  pageLabels: [
    'Back',
    'Inside',
    'Front'
  ],
  initialDotIndex: 1,
  hPageChanged: function(direction) {
    this.data.state = mod(this.data.state + direction, 3);

    let p1z = 0, p2z = 0;

    if(direction === 1) {
      switch(this.data.state) {
        case 0: this.data.p1r += 180; this.data.p2r += 180; p2z = 1; break;
        case 1:                       this.data.p2r += 180;          break;
        case 2: this.data.p1r += 180;                       p1z = 1; break;
      }
    } else if(direction === -1) {
      switch(this.data.state) {
        case 0:                        this.data.p2r += -180; p2z = 1; break;
        case 1: this.data.p1r += -180;                                 break;
        case 2: this.data.p1r += -180; this.data.p2r += -180; p1z = 1; break;
      }
    }
    this.data.$page1.css({
      transform: 'rotateY('+this.data.p1r+'deg)',
      'z-index': p1z
    });
    this.data.$page2.css({
      transform: 'rotateY('+this.data.p2r+'deg)',
      'z-index': p2z
    });
  },
  data: {
    state: 1,
    $page1: undefined,
    $page2: undefined,
    p1r: 0,
    p2r: 0
  }
}];

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

  range.selectNodeContents($cardContainer[0]);
  range.deleteContents();
  $cardContainer.append(renderStyleState.style.pageGen(cardData));
};

const hPageSwitch = function(direction) {
  renderStyleState.style.hPageChanged(direction);
  renderStyleState.getActiveDot().removeClass('active');
  renderStyleState.currentDotIndex = mod(renderStyleState.currentDotIndex + direction, renderStyleState.dots.length);
  renderStyleState.getActiveDot().addClass('active');
  $pageLabel.text(renderStyleState.getActiveLabel());
};

// tutorial
if(Cookie.getValue('tutorial') !== 'no') {
  const $tutOver = $('<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.66)"><div class="center" style="max-width:70%;max-height:70%;background-color:gray;padding:5px 5px 15px 5px;"><img src="./tutorial.gif" alt="" style="width:100%;height:100%;display:block;"><input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;"><label for="dont-show-again">don\'t show again</label><button style="margin:5px 0 0 0;float: right;">Got It</button></div></div>');
  const dontShowAgain = $tutOver.find('input')[0];
  $tutOver.find('button').click(function(){
    if(dontShowAgain.checked) {
      Cookie.set('tutorial', 'no');
    }
    $tutOver.remove();
  });
  $body.append($tutOver);
}

let rulerRendered = false;
function createRuler(width, height) {
  if(!rulerRendered) {
    const $topRuler = $('.ruler.top');
    //sadly the stepping needs to be done in js because the cumulative error of stacking css is noticeable
    for(let i = 0; i < width; i += 5)
      $topRuler.append($(make('li')).css('left', i + 'mm').attr('data-val', i / 10));

    const $leftRuler = $('.ruler.left');
    for(let i = 0; i < height; i += 5)
      $leftRuler.append($(make('li')).css('top', i + 'mm').attr('data-val', i / 10));
    rulerRendered = true;
  }
}