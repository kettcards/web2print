type Spawner = (css : JQuery.Coordinates) => JQuery;

const ElementSpawners : { [p: string]: Spawner; } = {
  TEXT: function(p){
    return $('<div class="text" contenteditable="true"><p><span>Ihr Text Hier!</span></p></div>')
      .mousedown(hTxtMDown)
      .mouseup(hTxtMUp)
      .click(hTxtClick)
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
        'font-size': '16pt'
      }, p) as JQuery.PlainObject);
  },
  IMAGE: function(p){
    return $("<img class='logo' src='"+web2print.links.apiUrl+"content/"+logoContentId+"' alt='"+logoContentId+"' draggable='false'>")
      .mousedown(function(e){
        state.target = $(e.delegateTarget);
        state.addOnClick = undefined;
        state.dragging = true;
      })
      .click(imgClick)
      .css(p as JQuery.PlainObject);
  }
};