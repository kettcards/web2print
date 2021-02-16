type ResizeBarsStorage = {
  bounds : {
    left   : number;
    width  : number;
    top    : number;
    height : number;
  };
  preserveRatio : boolean;
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
    preserveRatio : false,
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
  static show(preserveRatio : boolean) : void {
    const rStorage = ResizeBars.storage;
    rStorage.preserveRatio = preserveRatio;
    ResizeBars.setBoundsToTarget();
    ResizeBars.$handles.css(
      Object.assign({
        visibility: 'visible',
        transform: ''
      }, rStorage.bounds) as JQuery.PlainObject)
    [rStorage.preserveRatio?'addClass':'removeClass']('preserve-ratio');

    ResizeBars.visible = true;
    rStorage.$target = ResizeBars.$handles.add(Editor.storage.$target);
  }
  static hBarMDown(e : JQuery.MouseDownEvent) : void {
    Editor.state = EditorStates.EL_RESIZING;
    ResizeBars.setBoundsToTarget();
    const rStorage = ResizeBars.storage;
    const id = $(e.delegateTarget).attr('id');
    switch(id) {
      case 'handle-top'   : rStorage.lockDir = 0b0001; Editor.setCursor('ns-resize'); break;
      case 'handle-right' : rStorage.lockDir = 0b0010; Editor.setCursor('ew-resize'); break;
      case 'handle-bottom': rStorage.lockDir = 0b0100; Editor.setCursor('ns-resize'); break;
      case 'handle-left'  : rStorage.lockDir = 0b1000; Editor.setCursor('ew-resize'); break;
    }
    if(rStorage.preserveRatio) {
      // (lucas 16.02.21) todo: might need to block clicks on the actual bars and not the nobs here if preserve is set
      rStorage.lockDir |= (rStorage.lockDir >> 1) || 0b1000;
      switch(id) {
        case 'handle-top'   : Editor.setCursor('nw-resize'); break;
        case 'handle-right' : Editor.setCursor('ne-resize'); break;
        case 'handle-bottom': Editor.setCursor('se-resize'); break;
        case 'handle-left'  : Editor.setCursor('sw-resize'); break;
      }
    }
  }
  static resizeEl(dx : number, dy : number) : void {
    const eStorage = Editor.storage;
    const scale    = Editor.transform.scale;
    const rStorage = ResizeBars.storage;
    const bounds   = rStorage.bounds;

    const css : JQuery.PlainObject = {};
    if(rStorage.preserveRatio) {
      if(Math.abs(dx) > Math.abs(dy)) {
        dy = dx;
        // (lucas 16.02.21) todo: find clean mathematical solution
        if(rStorage.lockDir === 0b0011 || rStorage.lockDir === 0b1100){
          dy *= -1;
        }
      } else {
        dx = dy;
        if(rStorage.lockDir === 0b0011 || rStorage.lockDir === 0b1100){
          dx *= -1;
        }
      }
    }

    if(rStorage.lockDir & 0b0001) {
      eStorage.dy += dy;
      Object.assign(css, {
        top   : eStorage.y    + eStorage.dy / scale,
        height: bounds.height - eStorage.dy / scale
      });
    } else if(rStorage.lockDir & 0b0100) {
      eStorage.dy += dy;
      Object.assign(css, { height: bounds.height + eStorage.dy / scale })
    }
    if(rStorage.lockDir & 0b0010) {
      eStorage.dx += dx;
      Object.assign(css, { width: bounds.width + eStorage.dx / scale });
    } else if(rStorage.lockDir & 0b1000) {
      eStorage.dx += dx;
      Object.assign(css, {
        left : eStorage.x   + eStorage.dx / scale,
        width: bounds.width - eStorage.dx / scale
      });
    }

    ResizeBars.storage.$target.css(css);
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