type EditorState = {
  focusLvl       : number;
  isDraggingEl   : boolean;
  isDraggingSelf : boolean;
  isResizingEl   : boolean;
};
type EditorStorage = {
  loadedCard : Card;
  x          : number;
  y          : number;
  dx         : number;
  dy         : number;
  target     : HTMLElement | undefined;
  $target    : JQuery      | undefined;
  addOnClick : Spawner     | undefined;
  range      : Range;
};

class Editor {
  static $transformAnchor = $('#transform-anchor');
  static $editorArea      = $('#editor-area');
  static $zoomLabel       = $('#zoom-val');
  static transform = {
    scale     : 1,
    translateX: 0,
    translateY: 1,
    rotate    : 0
  };
  static state : EditorState = {
    focusLvl       : 0,
    isDraggingEl   : false,
    isDraggingSelf : false,
    isResizingEl   : false,
  };
  static storage : EditorStorage = {
    loadedCard : undefined,
    x          : 0,
    y          : 0,
    dx         : 0,
    dy         : 0,
    target     : undefined,
    $target    : undefined,
    addOnClick : undefined,
    range      : undefined,
  };

  static setTarget(t : HTMLElement) : void {
    Editor.storage.target  = t;
    Editor.storage.$target = $(t);
  }
  static clearTarget() : void {
    Editor.storage.target  = undefined;
    Editor.storage.$target = undefined;
    Editor.state.focusLvl  = 0;

    console.log('clear target');
  }

  static beginDragEl() : void {
    Editor.storage.dx = 0;
    Editor.storage.dy = 0;
  }
  static dragEl(dx : number, dy : number) : void {
    Editor.storage.dx += dx;
    Editor.storage.dy += dy;

    Editor.storage.$target.css('transform',
      `translate(${Editor.storage.dx / Editor.transform.scale}px, ${Editor.storage.dy / Editor.transform.scale}px)`);
  }
  static endDragEl() : void {
    Editor.state.isDraggingEl = false;

    const storage = Editor.storage;
    if(storage.dx === 0 && storage.dy === 0)
      return;

    Editor.storage.$target.css({
      top : `+=${storage.dy / Editor.transform.scale}`,
      left: `+=${storage.dx / Editor.transform.scale}`,
      transform: 'rotate('+getRotation()+'deg)',
    });

    storage.dx = 0;
    storage.dy = 0;
  }

  static beginDragSelf() : void {
    const storage = Editor.storage;
    storage.x  = 0;
    storage.y  = 0;
    storage.dx = 0;
    storage.dy = 0;
    Editor.state.isDraggingSelf = true;

    document.body.style.cursor = 'move';
  }
  static dragSelf(dx : number, dy : number) : void {
    const storage = Editor.storage;
    storage.dx += dx;
    storage.dy += dy;

    const transform = Editor.transform;
    transform.translateX = storage.x + storage.dx / transform.scale;
    transform.translateY = storage.y + storage.dy / transform.scale;
    Editor.applyTransform();
  }
  static endDragSelf() : void {
    Editor.state.isDraggingSelf = false;
    document.body.style.cursor  = 'default';
  }
  static zoom(steps) : void {
    const scale = Editor.transform.scale;
    Editor.transform.scale = Math.min(Math.max(scale + scale * steps * -0.01, 0.1), 5);
    Editor.applyTransform();
    Editor.displayZoom();
  }
  static fitToContainer() : void {
    // 55 additional pixels for the rulers
    Editor.transform.scale = Math.min(
      Editor.$editorArea. width() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.width  + 55),
      Editor.$editorArea.height() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.height + 55)
    ) * 0.9;
    Editor.transform.translateX = 0;
    Editor.transform.translateY = 0;
    Editor.transform.rotate     = 0;
    Editor.applyTransform();
    Editor.displayZoom();
  }
  static applyTransform() : void {
    const transform = Editor.transform;
    // (lucas) cant use the proper matrix solution because the browser gets confused with the rotation direction :(
    Editor.$transformAnchor.css('transform', `scale(${transform.scale}) translate(${transform.translateX}px,${transform.translateY}px) rotateY(${transform.rotate}deg)`);
  }

  static displayZoom() : void {
    Editor.$zoomLabel.text(Math.round(Editor.transform.scale * 100));
  }
  static enableTransition(enable) : void {
    this.$transformAnchor.css('transition', enable ? 'transform 1s' : '');
  }

  static createRuler() : void {
    const $topRuler = $('.ruler.top');
    //sadly the stepping needs to be done in js because the cumulative error of stacking css is noticeable
    for(let i = 0; i < Editor.storage.loadedCard.cardFormat.width; i += 5)
      $topRuler.append($(make('li')).css('left', i + 'mm').attr('data-val', i / 10));

    const $leftRuler = $('.ruler.left');
    for(let i = 0; i < Editor.storage.loadedCard.cardFormat.height; i += 5)
      $leftRuler.append($(make('li')).css('top', i + 'mm').attr('data-val', i / 10));
  }
}