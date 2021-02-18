declare interface PrintData {
  v        : '0.2';
  card     : string;
  outerEls : Box[];
  innerEls : Box[];
}
declare type Box = TextBox | ImageBox;
declare interface TextBox extends BoundingBox {
  t : "t";
  a : 'l' | 'r' | 'c' | 'j';
  r : TextRun[];
}
declare type TextRun = 'br' | ActualTextRun;
declare interface ActualTextRun {
  f : string;
  s : number;
  a : number;
  t : string;
  c : string;
}
declare interface ImageBox extends BoundingBox {
  t : "i";
  s : string;
}
declare interface BoundingBox {
  x : number;
  y : number;
  w : number;
  h : number;
}

const serialize = function() {
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

  console.log("sending", data);
  const _export = true;
  $.post(web2print.links.apiUrl+'save/'+(Parameters.sId || '')+'?export='+_export, 'data='+btoa(JSON.stringify(data)))
    .then(function() {
      alert('Sent data!');
    }).catch(function(e){
    alert('Send failed: \n'+JSON.stringify(e));
  });
}

const serializeSide = function($els : JQuery, xOffs : number, target : Box[]) {
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
                  t: $span.text(),
                  c: $span.css('color')
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
};