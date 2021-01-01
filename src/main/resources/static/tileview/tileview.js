const $container = $('div.container');

function setCards(cards, cardId) {
  $container.empty();
  for (let card of cards) {
    console.log(card);
    let name = document.createElement('span');
    name.className = 'caption';
    name.textContent = card.name;

    let image = document.createElement('img');
    image.src = card.thumbnail;

    let item = document.createElement('a');
    item.href = web2print.links.basePath+'editor/editor.html?card='+cardId;
    item.className = 'item';

    item.append(image);
    item.append(name);

    $container.append(item);
  }
}

//TODO add page support
window.addEventListener('load', function () {
  $.get(web2print.links.apiUrl+"cards").then(function (response) {
    console.log(response.page);
    setCards(response.content, card.orderId);
  });
});