const make  = document.createElement.bind(document);
const makeT = document.createTextNode.bind(document);

const holder = $('#holder>.center');

const toolBox = $('#toolBox');

/*Funktion um eine Seite einer Karte auf die noch groesst moegliche skalierung 
* zu bringen.
* @param pageWidth die Breite einer Karte in mm
* @param pageHeight die Hoehe einer Karte in mm
* @param container 
* @return tupel aus skalierter breite, hoehe
*/
function pageScale(container, pageWidth, pageHeight){
  let contentHeight = container.height();
  let contentWidth = container.width();
  let strech = Math.floor(contentHeight/pageHeight);
  let shownheight = pageHeight * strech; 
  let shownwidth = pageWidth * strech; 

  while(shownheight >= contentHeight || shownwidth >= contentWidth){ //falls eine Seite nicht in das Fensterpasst
    strech = strech - 1;                                             //wird der Streckungsfaktor verringert
    shownwidth = pageWidth * strech;
    shownheight = pageHeight * strech;
  }
  
  return [shownwidth, shownheight];
}

const bgStretchObjs = {
  STRETCH: {
    'background-size': 'cover',   
    'background-repeat': 'no-repeat ',
    'background-position': 'center center',
  },
  //todo: add more tiling modes, should work just fine - the fallback is just no special background styling, page dimensions are still correct
};

let $pages;
const loadPage = function(page){
  let scale = pageScale(holder.parent(), page.aspectRatio.width, page.aspectRatio.height);
  const newPage = $('<div class="page"></div>');
  newPage.css(Object.assign({
    width: scale[0],
    height: scale[1],
    'background-image': 'url("'+web2print.links.materialUrl+page.material.textureSlug+'")',
  }, bgStretchObjs[page.material.tiling]));
  holder.append(newPage);
  //spawning
  newPage.click(function(e){
    if(state.isEditing){
      return;
    }
    if(!state.addOnClick)
      return;
    const el = state.addOnClick({left: e.originalEvent.offsetX, top: e.originalEvent.offsetY});
    $(e.originalEvent.originalTarget || e.originalEvent.srcElement).append(el);
    state.addOnClick = undefined;
  });

  $pages = newPage;
};

const Parameters = (function(){
  let ret = {}, url = window.location.search;
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
 .catch(function(e) {
   if(Parameters.debug) { //nomerge - debug
     return {
       "orderId" : "grsubi071schwarz",
       "thumbSlug" : "grsubi071schwarz.jpg",
       "name" : "Test Grusskarte",
       "aspectRatio" : {
         "width" : 210,
         "height" : 297,
         "name" : "A4"
       },
       "material" : {
         "name" : "Grau",
         "textureSlug" : "grau.jpg",
         "tiling" : "STRETCH"
       },
       "folds" : [ {
         "cardId" : 1,
         "x1" : 0,
         "y1" : 0,
         "x2" : 0,
         "y2" : 0,
         "angle" : 0
       } ],
       "geometry" : [ {
         "cut" : 3,
         "name" : "NonExistenCut",
         "geometry" : "Imagine you have some nice shape data",
         "side" : "FRONT"
       } ],
       "motive" : [ {
         "textureSlug" : "grsubi071schwarz.jpg",
         "side" : "FRONT"
       } ]
     };
   } else throw e;
 })
 .then(function(data) { //(lucas 04.01.20) mbe moce this 'check' into loadPage
   return new Promise(function(resolve, reject){
     if(data) resolve(data);
     else     reject();
   })
 })
 .then(loadPage)
 .catch(function(){

   alert(Parameters.card
    ? 'Die Karte "'+Parameters.card+'" konnte nicht gefunden werden!'
    : 'Es wurde keine Karte gefunden!');
   location.href = web2print.links.basePath+'tileview/tileview.html';
 });

const Spawner = {
  TEXT: function(p){
    return $('<span class="text" contenteditable><span class="fontStyle">Ihr Text Hier!</span></span>')
      .mousedown(hElMDown)
      .click(hElClick)
      .on('input', hElInput)
      .css(p);
  },
  IMAGE: undefined,
  GEOM: undefined,
};

const state = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  isEditing: false,
  dx: 0,
  dy: 0,
};

const hElMDown = function(e){
  state.isEditing = true;
  state.target = $(e.delegateTarget);
};
const hElClick = function(e){
  e.stopPropagation();

  const target = $(e.delegateTarget);
  toolBox.css(Object.assign({
    visibility: 'visible',
  }, target.offset()));  
};
const hElInput = function(e){
  const box = e.delegateTarget;
  const runs = box.childNodes;
  //(lucas) if the user selects all (ctrl-a) and then starts typing the inner span is removed
  //        this solution isn't very clean but it works
  //(lucas 05.01.20) todo: would like to find a better way to do this
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
}).mouseup(function(e){  
  e.stopPropagation();
});
$(".fontTypeButton").click(function(){
  const classToAdd = $(this).val();
  const $nodes = $(makeNodesFromSelection());
  const shouldRemove = $nodes.filter('.'+classToAdd).length === $nodes.length;
  $nodes[shouldRemove ? 'removeClass' : 'addClass'](classToAdd);
}).mouseup(function(e){
  e.stopPropagation();
});

const makeNodesFromSelection = function() {
  let selection = document.getSelection();
  if(selection.isCollapsed || selection.rangeCount < 1)
    return;

  let range = selection.getRangeAt(0);
  let _iter = document.createNodeIterator(
    range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        return (n.nodeName === 'BR') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  let nodes = [];
  // (lucas) iterate over all _text_ nodes in the selection and save their parents (spans)
  while(_iter.nextNode()) {
    let ref = _iter.referenceNode;
    if(nodes.length < 1 && ref !== range.startContainer)
      continue;
    nodes.push(ref.parentNode);
    if(ref === range.endContainer)
      break;
  }

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
  return nodes;
};

//dragging
$('#moveBtn').mousedown(function(){
  state.dragging = true;
  state.isEditing = false;
});

let $body = $('body').mousemove(function(e){
  if(!state.dragging)
    return;
  state.dx += e.originalEvent.movementX;
  state.dy += e.originalEvent.movementY;
  
  state.target.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
  toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
}).mouseup(function(){
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      toolBox.add(state.target).css({
        left: '+='+state.dx,
        top: '+='+state.dy,
        transform: '',
      });
      state.dx = 0;
      state.dy = 0;
    }
    state.dragging = false;
  } else 
    toolBox.css('visibility', 'hidden');
});

const MMPerPx = (function(){
  const $resTester = $('<div style="height:100mm;width:100mm;display:none;"></div>')
  $body.append($resTester);
  return { x: 100/$resTester.width(), y: 100/$resTester.height() };
})();

const FontAttributeMap = {};

//serialize data
$('#submitBtn').click(function(){
  let data = {
    v: '0.1',
    card: Parameters.card,
    texts: []
  };

  let $children = $pages.children();
  for(let i = 0; i < $children.length; i++) {
    let $el = $children.eq(i);
    let offs = $el.position();
    let bounds = {
      x: offs.left * MMPerPx.x,
      y: (offs.top + $el.height()) * MMPerPx.y,
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
          a: align,
          r: []
        }, bounds);
        let $innerChildren = $el.contents();
        for (let j = 0; j < $innerChildren.length; j++) {
          let $iel = $innerChildren.eq(j);
          switch ($iel[0].nodeName) {
            case '#text': {
              box.r.push({
                f: $el.css('font-family'),
                s: $el.css('font-size'),
                a: 0,
                t: $iel.text()
              });
            } break;
            case 'SPAN': {
              let attributes = 0;
              for(const [k, v] of Object.entries(FontAttributeMap))
                if ($iel.hasClass(k))
                  attributes |= v;
              box.r.push({
                f: $iel.css('font-family'),
                s: $iel.css('font-size'),
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
        data.texts.push(box);
      } break;
      /* (lucas 02.01.20) deferred todo: add handling for images here
      case 'IMG':{

      } break;
      */
      default: console.warn('cannot serialize element', $el[0]);
    }
  }

  console.log(data);
  //(lucas) todo: send data
});

//font stuff
const $fontSelect = $('#fontSelect').mouseup(function(e){e.stopPropagation();});

$.get(web2print.links.apiUrl+'fonts')
 .catch(function() { //nomerge - debug
   if(Parameters.debug){
     return ['no test font', 'test_font', 'test font 2'];
   }
   alert('[fatal] failed to obtain data form fonts api');
 })
 .then(function(data) {
   let $options = new Array(data.length);
   for(let i = 0; i < data.length; i++) {
     const fName = data[i];
     $options[i] = $('<option value="'+fName+'">'+fName+'</option>');
   }
   $fontSelect.append($options);
   $fontSelect.change(applyFont)
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
    .catch(function(e){ //nomerge - debug
      if(Parameters.debug && name === 'test_font') {
        return {
          name: 'test_font',
          faces: [
            { v: 0b000, fs: 'normal', fw: 400, s: 'OpenSans/OpenSans-Regular.ttf' },
            { v: 0b001, fs: 'normal', fw: 'bold', s: 'OpenSans/OpenSans-Bold.ttf' },
            { v: 0b010, fs: 'italic', fw: 400, s: 'OpenSans/OpenSans-Italic.ttf' },
            { v: 0b011, fs: 'italic', fw: 'bold', s: 'OpenSans/OpenSans-BoldItalic.ttf' },
          ]
        }
      } else throw e;
    }).then(loadFont)
    .catch(function(e) {
      alert('[error] could not load font: '+JSON.stringify(e));
    });
};

// (lucas 04.01.21) this might need to use another api, coverage is 93% but that has to mean nothing
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
    .then(function(f){ //(lucas) cant call .then(document.fonts.add) for some reason
      document.fonts.add(f);
      attribs[face.v] = face.n;
    })
    .catch(function(e) {
      alert('[error] could not load font: '+JSON.stringify(e));
    });
  }
  return Promise.allSettled(promises).then(function() {
    FontAttributeMap[font.name] = attribs;
  });
};