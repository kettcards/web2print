class Dialog {
  static $blinds  = $('#overlay-blinds');
  static template = get('dialog-tmpl') as HTMLTemplateElement;
  static activeDialogs : Dialog[] = [];

  source  : string;
  loaded  : boolean = false;
  visible : boolean = false;

  $target : JQuery;

  constructor(source : string | JQuery) {
    if(typeof(source) == "string")
      this.source = source;
    else {
      this.loaded  = true;
      this.$target = source;
    }

    this.show       = this._show.bind(this);
    this.hide       = this._hide.bind(this);
    this.setVisible = this._setVisible.bind(this);
  }

  show : () => void;
  protected _show() : void {
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
    this.visible = true;
  }
  private _load() {
    return jQuery.get(this.source)
      .then(function(fragmentTxt : string) {
        const doc = new DOMParser().parseFromString(fragmentTxt, "text/html");
        const $dialogInst = $(Dialog.template.content.cloneNode(true) as DocumentFragment);
        this.$target = $($dialogInst[0].firstElementChild as HTMLDivElement);

        const lSlash = this.source.lastIndexOf('/') + 1;
        const fDot   = Math.min(this.source.indexOf('.', lSlash), this.source.length);
        $dialogInst[0].firstElementChild.id = this.source.substr(lSlash, fDot - lSlash)+'-dialog';

        const title = doc.getElementById('title') as HTMLTemplateElement;
        if(title)
          $dialogInst.find('.dialog-title' as JQuery.Selector).html(title.content);

        const body  = doc.getElementById('body')  as HTMLTemplateElement;
        $dialogInst.find('.dialog-body' as JQuery.Selector).html(body.content);

        const ctrls = doc.getElementById('ctrls') as HTMLTemplateElement;
        const $ctrlsContainer = this._attach();
        if(ctrls)
          // JQ straight up breaks here
          $ctrlsContainer[0].insertBefore(ctrls.content, $ctrlsContainer[0].firstChild);

        Dialog.$blinds.append($dialogInst);
      }.bind(this))
      .catch(function(e) {
        console.error('dialog load', e);
        alert("A dialog could not be loaded!");
      });
  }
  protected _attach() : JQuery {
    const $container = this.$target.find('.dialog-ctrls' as JQuery.Selector);
    $container.children('.close-btn').click(this.hide);
    return $container;
  }

  hide : () => void;
  protected _hide() {
    if(!this.visible)
      return;

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

class ProgressDialog extends Dialog {
  private $bar = $<HTMLProgressElement>('#prog-bar');

  constructor() {
    super($('#progress-dialog'));
    this.show   = this._show.bind(this);
    this.setVal = this._setVal.bind(this);
  }

  show : () => void;
  protected _show() : void {
    this.$bar.val(0);
    super._show();
  }

  setVal : (val : number) => void;
  private _setVal(val : number) : void {
    this.$bar.val(val);
  }
}

class OrderDialog extends Dialog {
  $reqFields : JQuery<HTMLInputElement>;
  $submitBtn : JQuery;

  constructor() {
    super($('#order-dialog'));
    const $ctrls = this._attach();
    this.$target.parent().submit(this._submit.bind(this));

    this.$submitBtn = $ctrls.children('input[type="submit"]');
    this.$reqFields = this.$target.find<HTMLInputElement>('input[required]' as JQuery.Selector)
      .on('input', this._hFieldChanged.bind(this))
      .after(make('span.req-marker', makeT('*')));
  }

  private _hFieldChanged() : void {
    let disabled = false;
    for(let i = 0; i < this.$reqFields.length; i++) {
      if(this.$reqFields[i].value === '') {
        disabled = true;
        break;
      }
    }

    this.$submitBtn.prop('disabled', disabled);
  }

  private _submit(e : JQuery.SubmitEvent) : void {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    if(!form.checkValidity()) {
      Dialogs.alert.showHtml("Ungültige Daten", "Bitte tragen Sie g&uuml;ltige Datein ein!");
      return;
    }

    const array = $(e.target).serializeArray();
    const data = {};
    for(const entry of array) {
      data[entry.name] = entry.value;
    }
    this._hide();
    submit(true, data);
  }
}

class AlertDialog extends Dialog {
  $titleEl : JQuery;
  $bodyEl  : JQuery;

  constructor() {
    super($('#alert-dialog'));
    this._attach();

    this.$titleEl = this.$target.children('.dialog-title');
    this.$bodyEl  = this.$target.children('.dialog-body');

    this.showHtml      = this._showHtml     .bind(this);
    this.showError     = this._showError    .bind(this);
    this.showErrorHtml = this._showErrorHtml.bind(this);
  }

  showHtml : (title : string, html : string) => void;
  private _showHtml(title : string, html : string) : void {
    this.$titleEl.text(title);
    this.$bodyEl.html(html);
    this._show();
  }
  showError : (text : string, obj ?: any) => void;
  private _showError(text : string, obj ?: any) : void {
    console.error(text, obj);
    this.$titleEl.text('Error');
    this.$bodyEl.text(text);
    this._show();
  }
  showErrorHtml : (html : string, consoleErr ?: string, obj ?: any) => void;
  private _showErrorHtml(html : string, consoleErr ?: string, obj ?: any) : void {
    console.error(consoleErr || html, obj);
    this.$titleEl.text('Error');
    this.$bodyEl.html(html);
    this._show();
  }
}

class Dialogs {
  static alert    = new AlertDialog();
  static tutorial = new Dialog('./tutorial.frag.html');
  static dsgvo    = new Dialog('./dsgvo.frag.html');
  static progress = new ProgressDialog();
  static order    = new OrderDialog();
  static loading  = new Dialog($('#loading-dialog'));
}

if(Cookie.getValue('tutorial') !== 'no') {
  Dialogs.tutorial.show();
}