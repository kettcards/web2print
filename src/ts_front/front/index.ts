/// <reference path="../parameters.ts" />
/// <reference path="./front.ts" />
/// <reference path="./Fonts.ts" />
/// <reference path="./UI.ts" />

$.get(web2print.links.apiUrl+'card/'+Parameters.card)
  .then(loadCard)
  .catch(function() {
    alert(Parameters.card
      ? 'Die Karte "'+Parameters.card+'" konnte nicht geladen werden!'
      : 'Es wurde keine Karte gefunden!');
    location.href = web2print.links.basePath+'tileview/tileview.html';
  });

$.get(web2print.links.apiUrl+'fonts')
  .then(Fonts.loadFonts)
  .then(function(fonts) {
    $fontSelect.append(fonts);
  })
  .catch(function(e) {
    alert('[fatal] something went wrong loading fonts: '+JSON.stringify(e));
  });