type PrintData = {
  v        : '0.2';
  card     : string;
  outerEls : Box[];
  innerEls : Box[];
}
type Box = TextBox | ImageBox;
type TextBox = BoundingBox & {
  t  : "t";
  a  : 'l' | 'r' | 'c' | 'j';
  lh : number;
  r  : TextRun[];
};
type TextRun = 'br' | ActualTextRun;
type ActualTextRun = {
  f : string;
  s : number;
  a : number;
  t : string;
  c : string;
}
type ImageBox = BoundingBox & {
  r : number;
  t : "i";
  s : string;
};
type BoundingBox = {
  x : number;
  y : number;
  w : number;
  h : number;
};

class Serializer {
  static submit(_export : boolean, additionalData ?: any) : void {
    Dialogs.loading.show();
    const data = Serializer.serialize();

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
        Dialogs.loading.hide();
        Dialogs.alert.showHtml("Erfolg!", txt);
      }).catch(function(e) {
        Dialogs.loading.hide();
        Dialogs.alert.showErrorHtml(`<p>Fehler beim Senden der Daten:</p><code>${JSON.stringify(e)}</code>`, "error while sending data: ", e);
      });
  }

  static download() : void {
    const data     = Serializer.serialize();
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

  static serialize() : PrintData {
    const data : PrintData = {
      v: '0.2',
      card: Parameters.card,
      outerEls: [],
      innerEls: []
    };

    const $bundles = UI.$cardContainer.children();
    for(let i = 0; i < $bundles.length; i++) {
      const $b = $bundles.eq(i);
      const offs = +$b[0].dataset.xOffset;
      Serializer.serializeSide($b.find('.front>.elements-layer' as JQuery.Selector).children(), offs, data.outerEls);
      Serializer.serializeSide($b.find('.back>.elements-layer'  as JQuery.Selector).children(), offs, data.innerEls);
    }

    return data;
  }

  private static serializeSide($els : JQuery, xOffs : number, target : Box[]) : void {
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

  static loadElementsCompressed(fileSource : Boolean, b64data : string) : void {
    const data : PrintData = JSON.parse(atob(b64data));
    if(Parameters.card !== data.card) {
      // (lucas) todo: allow loading of designs associated with a different card
      // We could prompt here if the user just wants to change the card layout.
      // The problem with this idea is that we cant easily store the data if we actually navigate to the different address
      // and the loadCard method is not designed to be called multiple times, so we cant just call it again arnd replace the history.

      Dialogs.alert.showHtml("Falsche Karte", `Das Design kann nicht geladen werden, da es zu einer anderen Karte gehört (${data.card}).<br/>Klicken Sie <a href="${window.location.href.split('?')[0]}?card=${data.card}">hier</a> um die aktuelle karte zu schlie&szlig;en und die Karte ${data.card} zu &ouml;ffnen.`);
      throw new Error('invalid card format');
    }

    if(fileSource) {
      RenderStyleState.style.clear();
      delete Parameters.sId;
    }

    window.history.replaceState({}, Editor.storage.loadedCard.name+" - Web2Print", stringifyParameters());

    Serializer.loadElements(data);
  }

  static loadElements(data : PrintData) : void {
    console.log('loading data', data);

    Serializer.loadSide('front', data.outerEls);
    Serializer.loadSide('back' , data.innerEls);
  }

  private static loadSide(side : 'front'|'back', boxes : Box[]) : void {
    const cardHeight = Editor.storage.loadedCard.cardFormat.height / MMPerPx.y;
    for(const box of boxes) {
      const bounds = {
        left  : box.x / MMPerPx.x,
        width : box.w / MMPerPx.x,
        top   : cardHeight - (box.y + box.h) / MMPerPx.y,
        height: box.h / MMPerPx.y
      };
      const $elLayer = RenderStyleState.style.assocPage(side, bounds).children('.elements-layer');

      const elType = ElementMap[box.t];
      if(!elType) {
        throw new Error(`Can't deserialize box of type '${box['t']}'.`);
      }

      const $el = elType.spawn($elLayer, bounds, false);
      elType.restore($el, box);
      $el[0].dataset.typeId = box.t;

      $elLayer.append($el);
    }
  }
}
