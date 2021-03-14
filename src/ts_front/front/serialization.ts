interface PrintData {
  v        : '0.2';
  card     : string;
  outerEls : Box[];
  innerEls : Box[];
}
type Box = TextBox | ImageBox;
interface TextBox extends BoundingBox {
  t  : "t";
  a  : 'l' | 'r' | 'c' | 'j';
  lh : number;
  r  : TextRun[];
}
type TextRun = 'br' | ActualTextRun;
interface ActualTextRun {
  f : string;
  s : number;
  a : number;
  t : string;
  c : string;
}
interface ImageBox extends BoundingBox {
  r: number;
  t : "i";
  s : string;
}
interface BoundingBox {
  x : number;
  y : number;
  w : number;
  h : number;
}

function submit(_export : boolean, additionalData ?: any) : void {
  const data = serialize();

  console.log("sending", data);
  let postData = "data="+btoa(JSON.stringify(data));
  if(additionalData) {
    console.log('also sending', additionalData);
    postData += "&form="+btoa(JSON.stringify(additionalData));
  }

  $.post(`${web2print.links.apiUrl}save/${Parameters.sId || ''}?export=${_export}`, postData)
    .then(function(response : string) {
      Parameters.sId = response;
      window.history.replaceState({}, Editor.storage.loadedCard.name+" - Web2Print", stringifyParameters());
      let txt = 'Daten erfolgreich gesendet!';
      if(!_export)
        txt += ` Sie befinden sich nun auf \n${window.location}\n Besuchen Sie diese Addresse später erneut wird das gespeicherte Design automatisch geladen.`;
      alert(txt);
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
    target.push(Object.assign(ElementMap[$el[0].dataset.typeId].serialize($el), bounds));
  }
}

function hUpload(e : JQuery.ChangeEvent) {
  const file = e.target.files[0] as File;
  if (!file)
    return;

  file.text().then(loadElementsCompressed.bind(null, true));
}

function loadElementsCompressed(fileSource : Boolean, b64data : string) : void {
  const data : PrintData = JSON.parse(atob(b64data));
  if(Parameters.card !== data.card) {
    // (lucas) todo: allow loading of designs associated with a different card
    // We could prompt here if the user just wants to change the card layout.
    // The problem with this idea is that we cant easily store the data if we actually navigate to the different address
    // and the loadCard method is not designed to be called multiple times, so we cant just call it again arnd replace the history.

    alert(`Das Design kann nicht geladen werden, da es zu einer anderen Karte gehört (${data.card}).`);
    throw new Error('invalid card format');
  }

  if(fileSource) {
    renderStyleState.style.clear();
    delete Parameters.sId;
  }

  window.history.replaceState({}, Editor.storage.loadedCard.name+" - Web2Print", stringifyParameters());

  loadElements(data);
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

    const elType = ElementMap[box.t];
    if(!elType) {
      throw new Error(`Can't deserialize box of type '${box['t']}'.`);
    }

    const $el = elType.spawn(bounds);
    elType.restore($el, box);
    $el[0].dataset.typeId = box.t;

    page.children('.elements-layer').append($el);
  }
}