// tutorial
if(Cookie.getValue('tutorial') !== 'no') {
  const $tutOver = $('<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.66)">' +
      '<div class="center" style="overflow: scroll;max-width:70%;max-height:70%;background-color:gray;padding:5px 5px 15px 5px;">' +
        '<span>Hinzufügen von Text:</span><br>'+
        '<span>Um einen Text hinzuzufügen klicken Sie zuerst auf "Text".<br>' +
        'Danach können Sie den Text mit einem klick auf der Karte platzieren.</span>'+
        '<img src="./tutorial.gif" alt="" style="width:100%;height:100%;display:block;"><br>' +
        '<span>Hinzufügen von Bildern:</span><br>'+

        '<input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;">' +
        '<label for="dont-show-again">nicht erneut anzeigen</label>' +
        '<button style="margin:5px 0 0 0;float: right;">Ok</button>' +
      '</div>' +
    '</div>');
  const dontShowAgain = <HTMLInputElement>$tutOver.find('input')[0];
  $tutOver.find('button').click(function(){
    if(dontShowAgain.checked) {
      Cookie.set('tutorial', 'no');
    }
    $tutOver.remove();
  });
  $body.append($tutOver);
}