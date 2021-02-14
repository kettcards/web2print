// tutorial
if(Cookie.getValue('tutorial') !== 'no') {
  const $tutOver = $('<div style="position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.66)">' +
      '<div class="center" style="white-space: normal; overflow: auto; max-width:70%; max-height:70%; background-color:lightgray; padding:5px 5px 15px 5px;">' +
        '<div>' +
          '<h3>Hinzufügen von Text:</h3>' +
          '<img src="./TextTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
          '<p>Um Text hinzuzufügen klicken Sie zuerst auf "Text".<br>' +
          'Danach können Sie den Text mit einem klick auf der Karte platzieren.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>' +
          '<h3>Hinzufügen von Bildern:</h3>' +
          '<img src="./ImageTut.gif" alt="tut" width="45%" height="45%" style="float: left; padding-right: 5px">' +
          '<p>Um ein Bild zu laden klicken Sie zuerst auf "Bild/Logo".<br>' +
          'Es öffnet sich eine Dateiauswahl, wählen Sie hier die gewünschte Datei aus.<br>' +
          'Um schließlich das Bild zu platzieren klicken Sie auf die Karte.</p>' +
        '</div>' +
        '<br style="clear: left">' +
        '<div>'+
          '<h3>Zoomen und Bewegen der Karte:</h3>'+
          '<p>Durch gedrückt halten vom Mausrad (Maustaste 3) kann die Karte im Editor bewegt werden.<br>'+
          'Halten Sie die Steuerungstaste (STRG/CTRL) und scrollen Sie gleichzeitig, so können Sie in der Karte zoomen.<br>' +
          'Um auf den Anfangszustand zu kommen können Sie auf "Zentrieren" drücken.</p>'+
        '</div>'+
        '<input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;">' +
        '<label for="dont-show-again">nicht erneut anzeigen</label>' +
        '<button style="margin:5px 0 0 0;float: right;">Ok</button></div></div>');
  const dontShowAgain = <HTMLInputElement>$tutOver.find('input')[0];
  $tutOver.find('button').click(function(){
    if(dontShowAgain.checked) {
      Cookie.set('tutorial', 'no');
    }
    $tutOver.remove();
  });
  $body.append($tutOver);
}