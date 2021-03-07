// tutorial
if(Cookie.getValue('tutorial') !== 'no') {
  showTutorial();
}
function showTutorial(){

  const $tutOver = $('<div style="position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.66)">' +
      '<div class="center" style="white-space: normal; overflow: auto; width: 700px; max-width:70%; max-height:70%; background-color:lightgray; padding:5px 5px 15px 5px;">');

  $tutOver.load("./tutorial.html", function(){
    const dontShowAgain = $tutOver.find<HTMLInputElement>('#dont-show-again' as JQuery.Selector)[0];
    dontShowAgain.checked = Cookie.getValue('tutorial') === 'no';
    $tutOver.find('button').click(function(){
      if(dontShowAgain.checked) {
        Cookie.set('tutorial', 'no');
      }
      $tutOver.remove();
    });
  });

  $body.append($tutOver);
}