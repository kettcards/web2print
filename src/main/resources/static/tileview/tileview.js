const $container = $('div.container');

function setCards(cards) {
  $container.empty();
  for (let card of cards) {
    let name = document.createElement('span');
    name.className = 'caption';
    name.textContent = card.name;

    let image = document.createElement('img');
    image.src = web2print.links.thumbnailUrl + card.thumbSlug;

    let item = document.createElement('a');
    item.href = web2print.links.basePath+'front/front.html?card='+card.orderId;
    item.className = 'item';

    item.append(image);
    item.append(name);

    $container.append(item);
  }
}

//TODO add page support
window.addEventListener('load', function () {
  $.get(web2print.links.apiUrl+"cards").then(function (response) {
    setCards(response.content);
  });
});