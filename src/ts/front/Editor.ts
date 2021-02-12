declare interface EditorObj {
  loadedCard : Card;
  scale      : number;
  translate  : { x: number, y: number };
  rotate     : number;
  apply()    : void;
  fitToContainer() : void;
  createRuler() : void;

  isDragging  : boolean;
  beginDrag() : void;
  drag(dx : number, dy : number) : void;
  endDrag()   : void;
  scroll(steps : number) : void;
  enableTransition(enable : boolean) : void;
}

const Editor = {
  loadedCard: undefined,
  $transformAnchor: $('#transform-anchor'),
  $editorArea     : $("#editor-area"),
  $zoomLabel      : $('#zoom-val'),
  scale: 1,
  translate: { x: 0, y: 0 },
  rotate: 0,
  apply() {
    // (lucas) cant use the proper matrix solution because the browser gets confused with the rotation direction :(
    this.$zoomLabel.text(Math.round(this.scale * 100));
    this.$transformAnchor.css('transform', `scale(${this.scale}) translate(${this.translate.x}px,${this.translate.y}px) rotateY(${this.rotate}deg)`);
  },
  fitToContainer() {
    // 55 additional pixels for the rulers
    this.scale = Math.min(
      this.$editorArea.width() * MMPerPx.x / (this.loadedCard.cardFormat.width + 55),
      this.$editorArea.height() * MMPerPx.x / (this.loadedCard.cardFormat.height + 55)
    ) * 0.9;
    this.translate.x = 0;
    this.translate.y = 0;
    this.rotate      = 0;
    this.apply();
  },
  createRuler() {
    const $topRuler = $('.ruler.top');
    //sadly the stepping needs to be done in js because the cumulative error of stacking css is noticeable
    for(let i = 0; i < this.loadedCard.cardFormat.width; i += 5)
      $topRuler.append($(make('li')).css('left', i + 'mm').attr('data-val', i / 10));

    const $leftRuler = $('.ruler.left');
    for(let i = 0; i < this.loadedCard.cardFormat.height; i += 5)
      $leftRuler.append($(make('li')).css('top', i + 'mm').attr('data-val', i / 10));
  },
  isDragging: false,
  translateStore: { x: 0, y: 0 },
  deltaStore: { x: 0, y: 0 },
  beginDrag() {
    this.deltaStore.x     = 0;
    this.deltaStore.y     = 0;
    this.translateStore.x = this.translate.x;
    this.translateStore.y = this.translate.y;
    this.isDragging       = true;

    document.body.style.cursor = 'move';
  },
  drag(dx, dy) {
    this.deltaStore.x += dx;
    this.deltaStore.y += dy;

    this.translate.x = this.translateStore.x + this.deltaStore.x / this.scale;
    this.translate.y = this.translateStore.y + this.deltaStore.y / this.scale;
  },
  endDrag() {
    this.isDragging = false;
    document.body.style.cursor = 'default';
  },
  scroll(steps) {
    this.scale = Math.min(Math.max(this.scale + this.scale * steps * -0.01, 0.1), 5);
  },
  enableTransition(enable) {
    this.$transformAnchor.css('transition', enable ? 'transform 1s' : '');
  }

} as EditorObj;