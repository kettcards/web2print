type ResizeBarsStorage = {
  bounds : {
    left   : number;
    width  : number;
    top    : number;
    height : number;
  };
  lockDir : number;
  $target : JQuery;
}

class ResizeBars {
  static $handles = $('#resize-handles');
  static visible = false;
  static storage : ResizeBarsStorage = {
    bounds : {
      left  : 0,
      width : 0,
      top   : 0,
      height: 0
    },
    lockDir : 0,
    $target : undefined,
  };

  static setBoundsToTarget() {
    const eStorage = Editor.storage;
    const $target = eStorage.$target;
    eStorage.x  = +$target.css('left').slice(0, -2);
    eStorage.y  = +$target.css('top') .slice(0, -2);
    eStorage.dx = 0;
    eStorage.dy = 0;
    ResizeBars.storage.bounds = {
      left  : eStorage.x,
      width : $target.width(),
      top   : eStorage.y,
      height: $target.height()
    };
  }
  static show() : void {
    ResizeBars.setBoundsToTarget();
    ResizeBars.$handles.css(
      Object.assign({
        visibility: 'visible',
        transform: ''
      }, ResizeBars.storage.bounds) as JQuery.PlainObject);
    ResizeBars.visible = true;
    ResizeBars.storage.$target = ResizeBars.$handles.add(Editor.storage.$target);
  }
  static hBarMDown(e : JQuery.MouseDownEvent) : void {
    Editor.state = EditorStates.EL_RESIZING;
    ResizeBars.setBoundsToTarget();
    const rStorage = ResizeBars.storage;
    switch($(e.delegateTarget).attr('id')) {
      case 'handle-top'   : rStorage.lockDir = 0b1010; Editor.setCursor('ns-resize'); break;
      case 'handle-right' : rStorage.lockDir = 0b0001; Editor.setCursor('ew-resize'); break;
      case 'handle-bottom': rStorage.lockDir = 0b0010; Editor.setCursor('ns-resize'); break;
      case 'handle-left'  : rStorage.lockDir = 0b0101; Editor.setCursor('ew-resize'); break;
    }
  }
  static resizeEl(dx : number, dy : number) : void {
    const eStorage = Editor.storage;
    const scale    = Editor.transform.scale;
    const rStorage = ResizeBars.storage;
    const bounds  = rStorage.bounds;
    if(rStorage.lockDir & 0b0100) {
      eStorage.dx += dx;
      ResizeBars.storage.$target.css({
        left : eStorage.x   + eStorage.dx / scale,
        width: bounds.width - eStorage.dx / scale
      });
    } else if(rStorage.lockDir & 0b0001) {
      eStorage.dx += dx;
      ResizeBars.storage.$target.css('width', bounds.width + eStorage.dx / scale);
    }

    if(rStorage.lockDir & 0b1000) {
      eStorage.dy += dy;
      ResizeBars.storage.$target.css({
        top   : eStorage.y    + eStorage.dy / scale,
        height: bounds.height - eStorage.dy / scale
      });
    } else if(rStorage.lockDir & 0b0010) {
      eStorage.dy += dy;
      ResizeBars.storage.$target.css('height', bounds.height + eStorage.dy / scale);
    }
  }
  static endResizeEl() : void {
    Editor.setCursor('auto');
    Editor.state = EditorStates.EL_FOCUSED;
  }
  static hide() : void {
    ResizeBars.$handles.css('visibility', 'collapse');
    ResizeBars.visible = false;
  }
}

ResizeBars.$handles.children().mousedown(ResizeBars.hBarMDown);