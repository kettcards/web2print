interface PrintData {
  v        : '0.2';
  card     : string;
  outerEls : Box[];
  innerEls : Box[];
}
type Box = TextBox | ImageBox;
interface TextBox extends BoundingBox {
  t : "t";
  a : 'l' | 'r' | 'c' | 'j';
  r : TextRun[];
}
type TextRun = 'br' | ActualTextRun;
interface ActualTextRun {
  f : string;
  s : number;
  a : number;
  t : string;
}
interface ImageBox extends BoundingBox {
  t : "i";
  s : string;
}
interface BoundingBox {
  x : number;
  y : number;
  w : number;
  h : number;
}

function submit() : void {
  const data = serialize();

  console.log("sending", data);
  const _export = true;
  $.post(`${web2print.links.apiUrl}save/${Parameters.sId || ''}?export=${_export}`, 'data='+btoa(JSON.stringify(data)))
    .then(function(response : string) {
      Parameters.sId = response;
      // nomerge todo: todo merge with the new editor
      window.history.replaceState({}, Editor.loadedCard.name+" - Web2Print", stringifyParameters());
      alert('Daten gesendet!');
    }).catch(function(e){
    alert('Fehler beim Senden der Daten!\n'+JSON.stringify(e));
  });
}

function serialize() : PrintData {
  const data : PrintData = {
    v: '0.2',
    card: Parameters.card,
    outerEls: [],
    innerEls: []
  };

  const $bundles = $cardContainer.children();
  for(let i = 0; i < $bundles.length; i++) {
    const $b = $bundles.eq(i);
    const offs = +$b[0].dataset.xOffset;
    serializeSide($b.find('.front>.elements-layer' as JQuery.Selector).children(), offs, data.outerEls);
    serializeSide($b.find('.back>.elements-layer' as JQuery.Selector).children() , offs, data.innerEls);
  }

  return data;
}

function serializeSide($els : JQuery, xOffs : number, target : Box[]) : void {
  for(let j = 0; j < $els.length; j++) {
    const $el = $els.eq(j);
    const bounds : BoundingBox = {
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
        }, bounds) as TextBox;
        let $innerChildren = $el.children();
        for (let j = 0; j < $innerChildren.length; j++) {
          let $iel = $innerChildren.eq(j);
          if(($iel[0] as Node).isA('P')) {
            const $spans = $iel.children();
            for(let k = 0; k < $spans.length; k++) {
              const $span = $spans.eq(k);
              if(($span[0] as Node).isA('SPAN')) {
                let attributes = 0;
                for(const [c, v] of Object.entries(Fonts.FontStyleValues))
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
          s: ($el[0] as HTMLImageElement).alt,
        }, bounds) as ImageBox;
        target.push(box);
      } break;

      default: console.warn('cannot serialize element', $el[0]);
    }
  }
}

function loadElementsCompressed(b64data : string) : void {
  loadElements(JSON.parse(atob(b64data)));
}
function loadElements(data : PrintData) : void {
  loadSide('front', data.outerEls);
  loadSide('back' , data.innerEls);
}
function loadSide(side : 'front'|'back', boxes : Box[]) : void {
  for(const box of boxes) {
    const bounds = {
      left  : box.x,
      width : box.w,
      top   : box.y,
      height: box.h
    };
    let el : JQuery;
    switch(box.t) {
      case "i": {
        el = ElementSpawners['IMAGE'](bounds);
      } break;
      case "t": {
        el = ElementSpawners['TEXT'](bounds);
      } break;
      default: throw new Error(`Can't deserialize box of type '${box['t']}'.`);
    }
    renderStyleState.style.assocPage(side, bounds).children('.elements-layer').append(el);
  }
}