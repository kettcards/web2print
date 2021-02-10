'use strict';
const $toolBox       = $('#toolBox');
const imgTool        = $('#imgTool');
const $cardContainer = $('#card-container')
const rsContainer = get('render-styles-container');
const $navDotsUl  = $('#nav-dots-container>ul');
const $pageLabel  = $('#nav-dots-container>span');

// [call once]
const loadCard = function(card : Card){
  console.log('loading', card);

  document.querySelector<HTMLInputElement>('#preview-container>img').src
      = web2print.links.thumbnailUrl+card.thumbSlug;

  Editor.loadedCard = card;

  Editor.fitToContainer();

  for(let i = 0; i < RenderStyles.length; i++) {
    const renderStyle = RenderStyles[i];
    if(!renderStyle.condition(card))
      continue;
    const frag = make('button.render-select');
    $(frag).text(renderStyle.name).attr('onclick', 'hRenderStyleChanged('+i+');');
    rsContainer.appendChild(frag);
  }

  hRenderStyleChanged(0);

  createRuler(card.cardFormat.width, card.cardFormat.height);
};
// spawning new elements
// [called inline]
const hElementsLayerClick = function(e : MouseEvent, target : Node) {
  if(!state.addOnClick)
    return;
  const el = state.addOnClick({left: e.offsetX, top: e.offsetY});
  $(target).append(el);
  state.addOnClick = undefined;
};

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

declare interface StateObj {
  addOnClick(css : { left : any, top : any }) : JQuery,
  target       : JQuery,
  dragging     : boolean,
  resizing     : boolean,
  dx           : number,
  dy           : number,
  range        : Range,
}

const state : StateObj = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  resizing: false,
  dx: 0,
  dy: 0,
  range: undefined
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
      n = n.parentNode.nextSibling.firstChild as Element;
    } else {
      n = n.nextSibling as Element;
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
  }, $target.offset()) as JQuery.PlainObject);
};
const hElPaste = async function(e) {
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
    const fileUp = $<HTMLInputElement>('#fileUpload');
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
  }, target.offset()) as  JQuery.PlainObject);
}

//changing text alignment
$(".alignmentBtn").click(function(){
  state.target.css('text-align', $(this).val() as string);
}).mouseup(stopPropagation);
$(".fontTypeButton").click(function(){
  const classToAdd = $(this).val() as string;
  const range = getSel().getRangeAt(0);

  let shouldRemoveClass = true;
  const [startEl, endEl] = makeNodesFromSelection(range, function(curr) {
    if(shouldRemoveClass && !$(curr).hasClass(classToAdd))
      shouldRemoveClass = false;
  });

  for(let curr = startEl as Node;;) {
    console.assert(curr.isA('SPAN') && curr.childNodes.length === 1 && (curr.firstChild as Node).isA('#text'), 'illegal p child ', curr, range);

    $(curr)[shouldRemoveClass?'removeClass':'addClass'](classToAdd);

    if(curr === endEl)
      break;
    if(curr.nextSibling === null) {
      curr = curr.parentNode.nextSibling.firstChild;
    } else {
      curr = curr.nextSibling;
    }
  }
}).mouseup(stopPropagation);

//function to return transform rotation angle of the state.target
const getRotation = function(){
  let transformMatrix = state.target.css('transform');
  let angle = 0;
  if(transformMatrix !== "none") {
    let mat = transformMatrix.split('(')[1].split(')')[0].split(',');
    let a = +mat[0];
    let b = +mat[1];
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

  const ev = e.originalEvent;
  state.dx += ev.movementX;
  state.dy += ev.movementY;

  if(state.resizing){
    state.target.css({
      width: '+='+(ev.movementX),
      height: '+='+(ev.movementY),
    });
  }else if(state.dragging) {
    state.target.css('transform', 'translate('+state.dx/Editor.scale+'px, '+state.dy/Editor.scale+'px) rotate('+getRotation()+'deg)');
    $toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
    imgTool.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
  }
}).mouseup(function(){
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      state.target.css({
        left: '+='+state.dx/Editor.scale,
        top : '+='+state.dy/Editor.scale,
        transform: 'translate('+0+'px, '+0+'px) rotate('+getRotation()+'deg)',
      });
      $toolBox.css({
        left: '+='+state.dx,
        top : '+='+state.dy,
        transform: '',
      });
      imgTool.css({
        left: '+='+state.dx,
        top : '+='+state.dy,
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

$('#submitBtn').click(serialize);

const FontStyleValues = {
  b: 0b001,
  i: 0b010,
  u: 0b100
};
const FontAttributeMap = {};
let defaultFont;

//font stuff
const applyFont = function() {
  const range = getSel().getRangeAt(0);
  const fName = $fontSelect.val() as string;
  makeNodesFromSelection(range, function(curr) {
    $(curr).css('font-family', fName);
  })
};

const $fontSelect = $<HTMLSelectElement>('#fontSelect')
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


declare interface IFontFace {
  s  : string;
  fs : 'normal' | 'italic';
  fw : number | 'bold';
  v  : number;
}
declare interface Font {
  name  : string;
  faces : IFontFace[];
}

// (lucas 04.01.21)
// compat: this might need to use another api, coverage is 93% but that has to mean nothing
const loadFont = function(font : Font) {
  let attribs = {};
  let promises = new Array(font.faces.length);
  for(let i = 0; i < font.faces.length; i++) {
    const face = font.faces[i];
    promises[i] = new FontFace(font.name, 'url('+web2print.links.fontUrl+face.s+')', {
      style: face.fs,
      weight: String(face.fw)
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

// changing pages
$('.right>.nav-btn-inner').click(function() {
  hPageSwitch(+1);
});
$('.left>.nav-btn-inner').click(function() {
  hPageSwitch(-1);
});

declare interface RenderStyleState {
  style            : RenderStyle;
  currentDotIndex  : number;
  dots             : JQuery<Element>[];
  getActiveDot()   : JQuery;
  getActiveLabel() : string;
}

const renderStyleState : RenderStyleState = {
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
  $cardContainer.append(renderStyleState.style.pageGen(Editor.loadedCard));
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
  const dontShowAgain = <HTMLInputElement>$tutOver.find('input')[0];
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