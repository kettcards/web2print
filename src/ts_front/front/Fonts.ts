type FontAttribs = { [key: number]: number; };

type TFontFace = {
  s  : string;
  fs : 'normal' | 'italic';
  fw : number | 'bold';
  v  : number;
};
type Font = {
  name  : string;
  faces : TFontFace[];
};

class Fonts {
  static FontNames   : string[];
  static defaultFont : string;
  static $options =  $('#font-options');
  static $label   = $('#font-label');
  static $boldBtn   = $('.font-type-btn[value=b]');
  static $italicBtn = $('.font-type-btn[value=i]');
  static currentSelection : string;
  static FontStyleValues = {
    b: 0b001,
    i: 0b010,
    u: 0b100
  };
  static FontAttributeMap : { [key: string]: FontAttribs; } = {};
  static loadFonts(fontNames : string[]) : void {
    Fonts.FontNames = fontNames;
    for(let i = 0; i < fontNames.length; i++) {
      const fName = fontNames[i];
      Fonts.$options.append($(`<p style="font-family: ${fName};">${fName}</p>`));
      Fonts.beginLoadFont(fName);
    }

    console.log();
    const fontOptions = document.getElementById("font-options");
    fontOptions.style.minWidth = "0";
    fontOptions.style.width = document.getElementById("font-select").offsetWidth + "px";
    //(lucas 18.01.21) todo: be more elegant about this, mbe explicitly spec it ?
    Fonts.defaultFont = fontNames[0];
  };
  private static beginLoadFont(name : string) {
    return $.get(web2print.links.apiUrl+'font/'+name)
      .then(Fonts.loadFont)
      .catch(function(e) {
        Dialogs.alert.showErrorHtml(`<p>Schriftart konnte nicht geladen werden:</p><code>${JSON.stringify(e)}</code>`, "error loading fonts", e);
      });
  };
  // (lucas 04.01.21)
  // compat: this might need to use another api, coverage is 93% but that has to mean nothing
  static loadFont(font : Font) : Promise<void | any[]> {
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
          Dialogs.alert.showError('Schriftart konnte nicht geladen werden: '+JSON.stringify(e), e);
        });
    }
    return Promise.allSettled(promises).then(function() {
      Fonts.FontAttributeMap[font.name] = attribs;
    });
  };
  static displaySelected() : void {
    const fName = Fonts.currentSelection;

    Fonts.$label.text(fName).css('font-family', fName);
  };
  static checkFontTypes() : void {
    if(!Fonts.FontAttributeMap[Fonts.currentSelection][Fonts.FontStyleValues.b]) {
      Fonts.$boldBtn.prop('disabled', true);
    } else {
      Fonts.$boldBtn.prop('disabled', false);
    }
    if(!Fonts.FontAttributeMap[Fonts.currentSelection][Fonts.FontStyleValues.i]) {
      Fonts.$italicBtn.prop('disabled', true);
    } else {
      Fonts.$italicBtn.prop('disabled', false);
    }
  }
}