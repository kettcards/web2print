type Spawner = (p : JQuery.PlainObject, restrictSize : boolean) => JQuery;
type SpawnerData = [fn : Spawner, id : string];

interface IElement {
  displayName    : string;
  getSpawner()   : Spawner;
  spawn          : Spawner;
  serializedType : 't' | 'i';
  serialize($instance : JQuery) : any;
  restore($ownInstance : JQuery, data : any) : void;
}

const Elements : IElement[] = [{
  displayName: 'Text',
  getSpawner(): Spawner {
    return this.spawn;
  },
  spawn(css, _) : JQuery<HTMLDivElement> {
    if(Editor.storage.spawnBtn) Editor.storage.spawnBtn.toggleClass('active');
    Editor.storage.spawnBtn = undefined;
    return $<HTMLDivElement> ('<div class="text" contenteditable="true" style="line-height: 1.2;"><p><span>Ihr Text hier!</span></p></div>')
      .mousedown(TextEl.hMDown)
      .mouseup(TextEl.hMUp)
      .click(stopPropagation)
      .on('paste', hTxtPaste)
      .on('keydown', hTxtKeyDown)
      .on('keyup', hTxtKeyUp)
      // (lucas 09.01.21)
      // this is a quick fix to disable the glitchy behaviour when dragging selected text.
      // unfortunately this also produces quite the rough experience when a user actually wants do use drag n drop
      .on("dragstart", falsify)
      .on("drop", falsify)
      .css(Object.assign({
        'font-family': Fonts.defaultFont,
        'font-size': '16pt',
        'color': Editor.storage.currentColor,
      }, css) as JQuery.PlainObject);
  },
  serializedType: 't',
  serialize($instance: JQuery) : any {
    let align = $instance.css('text-align');
    switch (align) {
      case 'justify': align = 'j'; break;
      case 'right':   align = 'r'; break;
      case 'center':  align = 'c'; break;
      default:        align = 'l';
    }
    let data = {
      t : "t",
      a : align,
      lh: +$instance[0].style.lineHeight,
      r : [],
    };
    let $innerChildren = $instance.children();
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
            data.r.push({
              f: $span.css('font-family'),
              s: Math.round((+$span.css('font-size').slice(0,-2)) / 96 * 72),
              a: attributes,
              t: $span.text(),
              c: colorStringToRGB($span.css('color')),
            });
          } else {
            console.warn('cannot serialize element', $span[0]);
          }
        }
        data.r.push('br');
      } else {
        console.warn('cannot serialize element', $iel[0]);
      }
    }
    return data;
  },
  restore($ownInstance: JQuery, data: TextBox) : void {
    $ownInstance.html('');
    let align;
    switch (data.a) {
      case 'j': align = 'justify'; break;
      case 'r': align = 'right'  ; break;
      case 'c': align = 'center' ; break;
    }
    if(align)
      $ownInstance.css('text-align', align);

    let $currentP = $(make('p'));
    for(const run of data.r) {
      if(run === 'br') {
        if($currentP.children().length < 1)
          $currentP.append(make('span'));
        $ownInstance.append($currentP);
        $currentP = $(make('p'));
      } else {
        let classString = '';
        for(const [c, v] of Object.entries(Fonts.FontStyleValues))
          if(run.a & v)
            classString += '.'+c;

        $currentP.append($(make('span'+classString, makeT(run.t))).css({
          'font-family': run.f,
          'font-size'  : run.s+'pt',
          'color'      : run.c,
        }));
      }
    }
  }
}, {
  displayName: 'Bild / Logo',
  getSpawner(): Spawner {
    UI.$fileUpBtn.click();
    return this.spawn;
  },
  spawn(p: JQuery.PlainObject, restrictSize : boolean) : JQuery<HTMLImageElement> {
    if(Editor.storage.spawnBtn) Editor.storage.spawnBtn.toggleClass('active');
    Editor.storage.spawnBtn = undefined;

    const img = new Image();
    img.className = 'logo';
    img.draggable = false;
    img.alt = ImageEl.contentId;
    img.onload = function() {
      const ar = img.width / img.height;
      img.dataset.aspectRatio = String(ar);

      const dims = {
        width : img.width,
        height: img.height,
      }

      if(restrictSize) {
        const maxRight  = Editor.storage.loadedCard.cardFormat.width  * 0.9 / MMPerPx.x;
        const maxBottom = Editor.storage.loadedCard.cardFormat.height * 0.9 / MMPerPx.y;

        if(p.left + img.width > maxRight) {
          dims.width  = maxRight - p.left;
          dims.height = dims.width / ar;
        }
        if(p.top + dims.height > maxBottom) {
          dims.height = maxBottom - p.top;
          dims.width  = dims.height * ar;
        }
      }

      $(img).css(dims);

      img.onload = undefined;
    };
    img.src = `${web2print.links.apiUrl}content/${ImageEl.contentId}`;

    return $<HTMLImageElement>(img)
      .mousedown(ImageEl.hMDown)
      .mouseup(El.hMUp)
      // as above so below
      .on("dragstart", falsify)
      .on("drop", falsify)
      .click(stopPropagation)
      .css(p as JQuery.PlainObject);
  },
  serializedType: 'i',
  serialize($instance: JQuery<HTMLImageElement>) : any {
    return {
      t: "i",
      s: ($instance[0] as HTMLImageElement).alt,
      r: +($instance[0] as HTMLImageElement).dataset.aspectRatio,
    };
  },
  restore($ownInstance: JQuery, data: ImageBox) : void {
    const img = ($ownInstance as JQuery<HTMLImageElement>)[0];
    img.src = `${web2print.links.apiUrl}content/${data.s}`;
    img.alt = data.s;
    img.dataset.aspectRatio = String(data.r);
  }
}];
function colorStringToRGB(string){
  let rgb = string.slice(string.lastIndexOf("(")+1, string.lastIndexOf(")")).split(",");
  let hex = "#";
  for(let channel of rgb){
    channel = parseInt(channel).toString(16);
    if(channel.length < 2){
      channel = "0"+channel;
    }
    hex = hex + channel;
  }
  return hex;
}

const ElementMap : {[p : string] : IElement} = {}
for(const el of Elements) {
  ElementMap[el.serializedType] = el;
}
