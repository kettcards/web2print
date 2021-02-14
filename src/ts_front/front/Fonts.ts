type FontAttribs = { [key: number]: number; }
interface FontsObj {
  defaultFont : string;
  FontNames   : string[];
  loadFonts(fontNames : string[]);
  FontStyleValues  : { [p: string]: number; };
  FontAttributeMap : { [key: string]: FontAttribs; };

  beginLoadFont(name: string) : void;
  loadFont(font : Font) : void;
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
      $options.append($(`<p style="font-family: ${fName};">${fName}</p>`));
      Fonts.beginLoadFont(fName);
    }

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
} as FontsObj;