/// <reference path="./types/jq/index.d.ts" />
/// <reference path="./macros.ts" />

class SelectEx {
  $target  : JQuery;
  $options : JQuery;
  $label   : JQuery;
  value    : string;

  constructor($target : JQuery, onChange ?: (newVal : string) => void) {
    const This = this;
    This.$target  = $target;
    This.$options = $target.children('.select-ex-options');

    const $p = $target.children('p')
      .click(function(e) {
        e.stopPropagation();
        This.$options.css('visibility', 'visible');
      });

    This.$label = $p.children('.select-ex-label');

    This.$options
      .mousedown(stopPropagation)
      .click(function(e) {
        if(e.target.nodeName !== 'P')
          return;

        This.value = e.target.textContent;
        This.$label.text(This.value);
        if(onChange)
          onChange(This.value);
      });
  }

  close() {
    this.$options.css('visibility', 'collapse');
  }
}