type FontAttribs = { [key: number]: number; }
interface FontsObj {
  defaultFont : string;
  FontNames   : string[];
  $options    : JQuery;
  $label      : JQuery;
  currentSelection  : string;
  loadFonts(fontNames : string[]);
  FontStyleValues  : { [p: string]: number; };
  FontAttributeMap : { [key: string]: FontAttribs; };

  beginLoadFont(name: string) : void;
  loadFont(font : Font) : void;

  displaySelected() : void;
}

interface IFontFace {
  s  : string;
  fs : 'normal' | 'italic';
  fw : number | 'bold';
  v  : number;
}
interface Font {
  name  : string;
  faces : IFontFace[];
}

const Fonts = {
  FontNames: undefined,
  defaultFont: undefined,
  $options: $('#font-options'),
  $label: $('#font-label'),
  currentSelection: undefined,
  FontStyleValues: {
    b: 0b001,
    i: 0b010,
    u: 0b100
  },
  FontAttributeMap: {},
  loadFonts(fontNames) {
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
  },
  beginLoadFont: function(name : string) {
    return $.get(web2print.links.apiUrl+'font/'+name)
      .then(Fonts.loadFont)
      .catch(function(e) {
        alert('[error] could not load font: '+JSON.stringify(e));
      });
  },
  // (lucas 04.01.21)
  // compat: this might need to use another api, coverage is 93% but that has to mean nothing
  loadFont: function(font : Font) {
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
      Fonts.FontAttributeMap[font.name] = attribs;
    });
  },
  displaySelected() {
    const fName = Fonts.currentSelection;
    const boldBtn = $('.fontTypeButton[value=b]');
    const italicBtn = $('.fontTypeButton[value=i]');
    boldBtn.css('visibility', 'visible');
    italicBtn.css('visibility', 'visible');
    Fonts.$label.text(fName).css('font-family', fName);
    if(fName === "" || !Fonts.FontAttributeMap[fName][1]){
      console.log('no bold');
      boldBtn.css('visibility', 'hidden');
    }
    if(fName === "" || !Fonts.FontAttributeMap[fName][2]){
      console.log('no italic');
      italicBtn.css('visibility', 'hidden');
    }
  }
} as FontsObj;