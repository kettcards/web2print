import ChangeEvent = JQuery.ChangeEvent;

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

function submit(_export : boolean) : void {
  const data = serialize();

  console.log("sending", data);
  $.post(`${web2print.links.apiUrl}save/${Parameters.sId || ''}?export=${_export}`, 'data='+btoa(JSON.stringify(data)))
    .then(function(response : string) {
      Parameters.sId = response;
      window.history.replaceState({}, Editor.storage.loadedCard.name+" - Web2Print", stringifyParameters());
      alert('Daten gesendet!');
    }).catch(function(e){
    alert('Fehler beim Senden der Daten!\n'+JSON.stringify(e));
  });
}

function download() {
  const data     = serialize();
  const fileName = `${data.card}.des`;
  // (lucas) taken from
  // https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
    const file = new Blob([btoa(JSON.stringify(data))], { type: 'text/plain' });
  if (window.navigator.msSaveOrOpenBlob) { // IE10+
    window.navigator.msSaveOrOpenBlob(file, fileName);
  } else { // Others
    const a = make("a") as HTMLAnchorElement;
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }
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
      case 'DIV': target.push(Object.assign(Elements.TEXT .serialize($el), bounds)); break;
      case 'IMG': target.push(Object.assign(Elements.IMAGE.serialize($el), bounds)); break;

      default: console.warn('cannot serialize element', $el[0]);
    }
  }
}

function hUpload(e : ChangeEvent) {
  const file = e.target.files[0] as File;
  if (!file)
    return;

  renderStyleState.style.clear();
  delete Parameters.sId;
  window.history.replaceState({}, Editor.storage.loadedCard.name+" - Web2Print", stringifyParameters());
  file.text().then(loadElementsCompressed);
}

function loadElementsCompressed(b64data : string) : void {
  loadElements(JSON.parse(atob(b64data)));
}
function loadElements(data : PrintData) : void {
  console.log('loading data', data);

  loadSide('front', data.outerEls);
  loadSide('back' , data.innerEls);
}
function loadSide(side : 'front'|'back', boxes : Box[]) : void {
  const cardHeight = Editor.storage.loadedCard.cardFormat.height / MMPerPx.y;
  for(const box of boxes) {
    const bounds = {
      left  : box.x / MMPerPx.x,
      width : box.w / MMPerPx.x,
      top   : cardHeight - (box.y + box.h) / MMPerPx.y,
      height: box.h / MMPerPx.y
    };
    const page = renderStyleState.style.assocPage(side, bounds);
    let el : JQuery;
    switch(box.t) {
      case "i": {
        el = Elements.IMAGE.spawn(bounds);
        Elements.IMAGE.restore(el, box);
      } break;
      case "t": {
        el = Elements.TEXT.spawn(bounds);
        Elements.TEXT.restore(el, box);
      } break;
      default: throw new Error(`Can't deserialize box of type '${box['t']}'.`);
    }
    page.children('.elements-layer').append(el);
  }
}