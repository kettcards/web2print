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

const bgStrechObjs = {
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
  }, bgStrechObjs[page.material.tiling]));
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
 .then(function(data) {
   return new Promise(function(resolve, reject){
     if(data) resolve(data);
     else     reject();
   })
 })
 .then(loadPage)
 .catch(function(){
   if(Parameters.debug) {
     loadPage({
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
     });
     return;
   }
   alert(Parameters.card
    ? 'Die Karte "'+Parameters.card+'" konnte nicht gefunden werden!'
    : 'Es wurde keine Karte gefunden!');
   location.href = web2print.links.basePath+'tileview/tileview.html';
 });

const Spawner = {
  TEXT: function(p){
    return $('<span class="text" contenteditable>test</span>')
      .mousedown(hElMDown)
      .click(hElClick)
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
  state.target = $(e.target);
};
const hElClick = function(e){
  e.stopPropagation();

  const target = $(e.target);
  toolBox.css(Object.assign({
    visibility: 'visible',
  }, target.offset()));  
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
  let selection = document.getSelection();
  if(selection.isCollapsed || selection.rangeCount < 1)
    return;
  
  let range = selection.getRangeAt(0);  
  let _itter = document.createNodeIterator(
    range.commonAncestorContainer, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) { 
        return (n.nodeName === 'BR') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; 
      }
    });
  let nodes = [];
  while(_itter.nextNode()){
    let ref = _itter.referenceNode;
    if(nodes.length < 1 && ref !== range.startContainer)
        continue;    
    nodes.push(ref);
    if(ref === range.endContainer)
      break;
  }

  const tag = $(this).val();
  const upper = tag.toUpperCase();
  let make = function(){ return document.createElement(tag); };
  let wrap = function(t){ let d=make();d.appendChild(document.createTextNode(t));return d; };
  let hasFormat = function(n){
    let current = n.parentNode;
    while(current.nodeName !== 'DIV'){
      if(current.nodeName === upper)
        return true;
        current = current.parentNode;
    }
    return false;
  };
  if(nodes.length === 1){ /*start and end are in the same node*/
    let node = nodes[0];
    if(hasFormat(node))
      return;
    let txt = node.textContent;
    
    let first = txt.substr(0, range.startOffset);
    node.parentNode.insertBefore(document.createTextNode(first), node);
    let wrapped = wrap(txt.substr(range.startOffset, range.endOffset - range.startOffset));
    node.parentNode.insertBefore(wrapped, node);
    let end = txt.substr(range.endOffset);
    node.replaceWith(end);
  } else if (nodes.length > 1) { /*seperate start and end*/
    let node = nodes[0];
    if(!hasFormat(node)){
      if(range.startOffset > 0){
        let txt = node.textContent;
        node.parentElement.insertBefore(wrap(txt.substr(range.startOffset)), node.nextSibling);
        node.replaceWith(txt.substr(0, range.startOffset));
      } else {
        $(node).wrap(make());
      }
    }

    if(nodes.length > 2){ /*additional nodes in the middle*/
      for(let i = 1; i < nodes.length - 1; i++)
        if(!hasFormat(nodes[i]))
          $(nodes[i]).wrap(make());
    }

    node = nodes[nodes.length - 1];
    let txt = node.textContent;
    if(!hasFormat(node)){
      if(range.endOffset < txt.length - 1){
        node.parentElement.insertBefore(wrap(txt.substr(0, range.endOffset)), node);
        node.replaceWith(txt.substr(range.endOffset));
      } else {
        $(node).wrap(make());
      }
    }
  }
}).mouseup(function(e){  
  e.stopPropagation();
});

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

// (lucas 03.01.20) mbe generate this form the api
const FontAttributeMap = {
  'b': 0b001,
  'i': 0b010,
  'u': 0b100,
};

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
  //send data
});