type ResizeBarsStorage = {
  bounds : {
    left   : number;
    width  : number;
    top    : number;
    height : number;
  };
  lockDir : number;
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
  };

  static setBoundsToTarget() {
    const $target = Editor.storage.$target;
    const scale   = Editor.transform.scale;
    ResizeBars.storage.bounds = Object.assign({
      width :  $target.width()  * scale,
      height:  $target.height() * scale
    }, $target.offset());
  }
  static show() : void {
    ResizeBars.setBoundsToTarget();
    ResizeBars.$handles.css(
      Object.assign({ visibility: 'visible' }, ResizeBars.storage.bounds) as JQuery.PlainObject);
    ResizeBars.visible = true;
  }
  static hBarMDown(e : JQuery.MouseDownEvent) : void {
    Editor.state.isResizingEl = true;
    ResizeBars.setBoundsToTarget();
    Editor.storage.x  = +Editor.storage.$target.css('left').slice(0, -2);
    Editor.storage.y  = +Editor.storage.$target.css('top') .slice(0, -2);
    Editor.storage.dx = 0;
    Editor.storage.dy = 0;
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
      ResizeBars.$handles.css({
        left : bounds.left  + eStorage.dx,
        width: bounds.width - eStorage.dx
      });
      Editor.storage.$target.css({
        left : eStorage.x    + eStorage.dx  / scale,
        width: (bounds.width - eStorage.dx) / scale
      });
    } else if(rStorage.lockDir & 0b0001) {
      eStorage.dx += dx;
      ResizeBars.$handles   .css('width', bounds.width + eStorage.dx);
      Editor.storage.$target.css('width', (bounds.width + eStorage.dx) / scale);
    }

    if(rStorage.lockDir & 0b1000) {
      eStorage.dy += dy;
      ResizeBars.$handles.css({
        top   : bounds.top    + eStorage.dy,
        height: bounds.height - eStorage.dy
      });
      Editor.storage.$target.css({
        top   : eStorage.y     + eStorage.dy  / scale,
        height: (bounds.height - eStorage.dy) / scale
      });
    } else if(rStorage.lockDir & 0b0010) {
      eStorage.dy += dy;
      ResizeBars.$handles   .css('height', bounds.height + eStorage.dy);
      Editor.storage.$target.css('height', (bounds.height + eStorage.dy) / scale);
    }
  }
  static endResizeEl() : void {
    Editor.setCursor('auto');
    Editor.state.isResizingEl = false;
  }
  static hide() : void {
    ResizeBars.$handles.css('visibility', 'collapse');
    ResizeBars.visible = false;
  }
}

ResizeBars.$handles.children().mousedown(ResizeBars.hBarMDown);