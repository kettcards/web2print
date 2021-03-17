/// <reference path="../parameters.ts" />
/// <reference path="./Fonts.ts" />
/// <reference path="./UI.ts" />
/// <reference path="./Dialog.ts" />

$.get(`${web2print.links.apiUrl}card/${Parameters.card}`)
  .then(Editor.loadCard)
  .catch(function() {
    alert((Parameters.card
      ? 'Die Karte "'+Parameters.card+'" konnte nicht geladen werden!'
      : 'Es wurde keine Karte gefunden!') + '\nSie werden auf ' + web2print.links.redirectUrl + ' weitergeleitet.');
    location.href = web2print.links.redirectUrl;
  });

$.get(web2print.links.apiUrl+'fonts')
  .then(Fonts.loadFonts)
  .catch(function(e) {
    Dialogs.alert.showErrorHtml(`<p>Beim laden der Schriften ist ein fehler aufgetreten:</p><code>${JSON.stringify(e)}</code>`);
  });