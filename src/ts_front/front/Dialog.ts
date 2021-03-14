class Dialog {
  static $blinds  = $('#overlay-blinds');
  static template = get('dialog-tmpl') as HTMLTemplateElement;
  static activeDialogs : Dialog[] = [];

  source  : string;
  loaded  : boolean = false;

  $target : JQuery;

  constructor(source : string) {
    this.source     = source;
    this.show       = this._show.bind(this);
    this.hide       = this._hide.bind(this);
    this.setVisible = this._setVisible.bind(this);
  }

  show : () => void;
  private _show() : void {
    const ads = Dialog.activeDialogs;
    if(ads.length > 0) {
      ads[ads.length - 1].setVisible(false);
    } else {
      Dialog.$blinds.css('visibility', 'visible');
    }
    Dialog.activeDialogs.push(this);

    if(!this.loaded) {
      this._load().then(this._setVisible.bind(this, true));
    } else {
      this._setVisible(true);
    }
  }
  private _load() {
    return jQuery.get(this.source)
      .then(function(fragmentTxt : string) {
        const doc = new DOMParser().parseFromString(fragmentTxt, "text/html");
        const $dialogInst = $(Dialog.template.content.cloneNode(true) as DocumentFragment);

        const lSlash = this.source.lastIndexOf('/') + 1;
        const fDot   = Math.min(this.source.indexOf('.', lSlash), this.source.length);
        $dialogInst[0].firstElementChild.id = this.source.substr(lSlash, fDot - lSlash)+'-dialog';

        const title = doc.getElementById('title') as HTMLTemplateElement;
        if(title)
          $dialogInst.find('.dialog-title' as JQuery.Selector).html(title.content);

        const body  = doc.getElementById('body')  as HTMLTemplateElement;
        $dialogInst.find('.dialog-body' as JQuery.Selector).html(body.content);

        const ctrls = doc.getElementById('ctrls') as HTMLTemplateElement;
        const $ctrlsContainer = $dialogInst.find('.dialog-ctrls' as JQuery.Selector);
        if(ctrls)
          // JQ straight up breaks here
          $ctrlsContainer[0].insertBefore(ctrls.content, $ctrlsContainer[0].firstChild);

        $ctrlsContainer.children('.close-btn').click(this.hide);


        this.$target = $($dialogInst[0].firstElementChild as HTMLDivElement);
        Dialog.$blinds.append($dialogInst);
      }.bind(this))
      .catch(function(e) {
        console.error('dialog load', e);
        alert("A dialog could not be loaded!");
      });
  }

  hide : () => void;
  private _hide() {
    this._setVisible(false);
    const ads = Dialog.activeDialogs;
    ads.pop();
    if(ads.length > 0) {
      ads[ads.length - 1].setVisible(true);
    } else {
      Dialog.$blinds.css('visibility', 'collapse');
    }
  }

  setVisible : (visible : boolean) => void;
  private _setVisible(visible : boolean) : void {
    this.$target.css('visibility', visible?'visible':'collapse');
  }
}

class Dialogs {
  static tutorial = new Dialog('./tutorial.frag.html');
  static dsgvo    = new Dialog('./dsgvo.frag.html');
}

if(Cookie.getValue('tutorial') !== 'no') {
  Dialogs.tutorial.show();
}