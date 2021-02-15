// tutorial
if(Cookie.getValue('tutorial') !== 'no') {
  const $tutOver = $('<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.66)"><div class="center" style="max-width:70%;max-height:70%;background-color:gray;padding:5px 5px 15px 5px;"><img src="./tutorial.gif" alt="" style="width:100%;height:100%;display:block;"><input type="checkbox" id="dont-show-again" style="margin:10px 2px 0 0;"><label for="dont-show-again">don\'t show again</label><button id="tutorial-btn" style="margin:5px 0 0 0;float: right;">Got It</button></div></div>');
  const dontShowAgain = <HTMLInputElement>$tutOver.find('input')[0];
  $tutOver.find('button').click(function(){
    if(dontShowAgain.checked) {
      Cookie.set('tutorial', 'no');
    }
    $tutOver.remove();
  });
  $body.append($tutOver);
}