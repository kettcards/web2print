
interface IOverlay {
  isLoaded : boolean;
  $container : JQuery;
  show() : void;
}

class Overlay{
  static tutorial : IOverlay = {
    $container: $('<div style="visibility: hidden"></div>'),
    isLoaded: false,
    show() {
      const This  = Overlay.tutorial;
      if(!This.isLoaded){
        This.$container.load('./tutorial.html', function(){
          const center = $('#tutCenter');
          $('#closeTut').css({
            top: center.offset().top,
            left: center.offset().left + center.outerWidth(),
          });
          const dontShowAgain = This.$container.find<HTMLInputElement>('#dont-show-again' as JQuery.Selector)[0];
          dontShowAgain.checked = Cookie.getValue('tutorial') === 'no';
          This.$container.find('button').click(function(){
            if(dontShowAgain.checked) {
              Cookie.set('tutorial', 'no');
            }else{
              Cookie.set('tutorial', 'yes');
            }
            This.$container.css('visibility', 'hidden');
          });
        });
        $body.append(This.$container);
        This.isLoaded = true;
      }
      This.$container.css('visibility', 'visible');
    },
  };

  static dsgvo : IOverlay = {
    $container: $('<div style="visibility: hidden"></div>'),
    isLoaded: false,
    show() {
      const This = Overlay.dsgvo;
      if(!This.isLoaded){
        This.$container.load('./datenschutzerklaerung.html', function(){
          const center = $('#dsgvoCenter');
          $('#closeDsgvo').css({
            top: center.offset().top,
            left: center.offset().left + center.outerWidth(),
          });
          This.$container.find('button').click(function(){
            This.$container.css('visibility', 'hidden');
          });
        });
        $body.append(This.$container);
        This.isLoaded = true;
      }
      This.$container.css('visibility', 'visible');
    }
  }

}