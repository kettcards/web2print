declare interface EditorObj {
  loadedCard : Card;
  scale      : number;
  translate  : { x: number, y: number };
  rotate     : number;
  apply()    : void;
  fitToContainer() : void;
}

const Editor = {
  loadedCard: undefined,
  $transformAnchor: $('#transform-anchor'),
  $editorArea     : $("#editor-area"),
  scale: 1,
  translate: { x: 0, y: 0 },
  rotate: 0,
  apply: function() {
    // (lucas) cant use the proper matrix solution because the browser gets confused with the rotation direction :(
    this.$transformAnchor.css('transform', 'scale('+this.scale+', '+this.scale+') translate('+this.translate.x+'px,'+this.translate.y+'px) rotateY('+this.rotate+'deg)');
  },
  fitToContainer() {
    // 55 additional pixels for the rulers
    this.scale = Math.min(
      this.$editorArea.width() * MMPerPx.x / (this.loadedCard.cardFormat.width + 55),
      this.$editorArea.height() * MMPerPx.x / (this.loadedCard.cardFormat.height + 55)
    ) * 0.9;
    this.apply();
  }
} as EditorObj;