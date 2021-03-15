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
  addOnClick : SpawnerData | undefined;
  range      : Range;
  currentColor : string;
  spawnBtn   : JQuery<HTMLButtonElement>;
};

enum EditorStates {
  NONE,
  SELF_DRAGGING,
  EL_BEGIN_FOCUS,
  EL_FOCUSED,
  EL_DRAGGING,
  EL_RESIZING,
  TXT_EDITING,
}

class Editor {
  static $transformAnchor = $('#transform-anchor');
  static $editorArea      = $('#editor-area');
  static $zoomLabel       = $('#zoom-val');
  static transform = {
    scale     : 1,
    translateX: 0,
    translateY: 1,
    rotate    : 0,
    manuallyModified : false,
  };
  static state : EditorStates = EditorStates.NONE;
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
    currentColor : "#000000",
    spawnBtn   : undefined
  };

  static setTarget(t : HTMLElement) : void {
    Editor.storage.target  = t;
    Editor.storage.$target = $(t);
  }
  static clearTarget() : void {
    Editor.storage.target  = undefined;
    Editor.storage.$target = undefined;
    ResizeBars.hide();
    Editor.state = EditorStates.NONE;

    console.log('clear target');
  }

  static beginDragEl() : void {
    Editor.state = EditorStates.EL_DRAGGING;
    Editor.setCursor('move');
    Editor.storage.$target.addClass('no-select');

    Colliders.beginDrag();
  }
  static dragEl(dx, dy) {
    const [x, y] = Colliders.drag(dx, dy);
    ResizeBars.storage.$target.css({
      left: x,
      top : y,
    });
  }
  static endDragEl() : void {
    Editor.state = EditorStates.EL_FOCUSED;
    Editor.setCursor('auto');
    Snaplines.hideAllLines();
    Colliders.hideAllColliders();

    Editor.storage.$target.removeClass('no-select');
  }

  static beginDragSelf() : void {
    const storage = Editor.storage;
    storage.x  = Editor.transform.translateX;
    storage.y  = Editor.transform.translateY;
    storage.dx = 0;
    storage.dy = 0;
    Editor.state = EditorStates.SELF_DRAGGING;
    Editor.transform.manuallyModified = true;

    Editor.setCursor('move');
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
    Editor.state = EditorStates.NONE;
    Editor.setCursor('auto');
  }

  static zoom(steps : number) : void {
    const scale = Editor.transform.scale;
    Editor.transform.scale = Math.min(Math.max(scale + scale * steps * -0.01, 0.1), 5);
    Editor.transform.manuallyModified = true;
    Editor.applyTransform();
    Editor.displayZoom();
  }
  static fitToContainer() : void {
    const transform = Editor.transform;
    // 55 additional pixels for the rulers
    transform.scale = Math.min(
      Editor.$editorArea. width() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.width  + 55),
      Editor.$editorArea.height() * MMPerPx.x / (Editor.storage.loadedCard.cardFormat.height + 55)
    ) * 0.9;
    transform.translateX = 0;
    transform.translateY = 0;
    transform.rotate     = 0;
    transform.manuallyModified = false;
    Editor.applyTransform();
    Editor.displayZoom();
  }
  static applyTransform() : void {
    const transform = Editor.transform;
    // (lucas) cant use the proper matrix solution because the browser gets confused with the rotation direction :(
    Editor.$transformAnchor.css('transform', `scale(${transform.scale}) translate(${transform.translateX}px,${transform.translateY}px) rotateY(${transform.rotate}deg)`);
  }

  static hWindowResized() : void {
    if(!Editor.transform.manuallyModified)
      Editor.fitToContainer();
  }

  static showHandlesOnTarget(): void {
    ResizeBars.show((Editor.storage.target as Node).isA('IMG'));
  }

  static setCursor(cursor : string) {
    document.body.style.cursor = cursor;
  }
  static displayZoom() : void {
    Editor.$zoomLabel.text(Editor.transform.scale.toFixed(2));
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

  static saveSelection() : void {
    const s = getSel();
    if(s.rangeCount === 1)
      Editor.storage.range = s.getRangeAt(0).cloneRange();
  }
  static loadSelection() : Selection {
    const sel = getSel();
    sel.removeAllRanges();
    sel.addRange(Editor.storage.range);

    return sel;
  }

  static deleteElement() : void {
    if(confirm("Wollen Sie das Element wirklich löschen?")) {
      const target = Editor.storage.target;
      target.parentElement.removeChild(target);
      ResizeBars.hide();
      Editor.state = EditorStates.NONE;
    }
  }

  static displayLineheight() : void {
    $lhSpinner[0].value = Editor.storage.target.style.lineHeight;
  }
}