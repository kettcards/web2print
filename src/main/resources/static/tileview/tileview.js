function setCards($container, cards, ref) {
  $container.empty();
  for (let c in cards) {
    let card = cards[c];
    console.log(card);
    let name = document.createElement('span');
    name.className = 'caption';
    name.textContent = card['name'];

    let image = document.createElement('img');
    image.src = card['thumbnail'];

    let item = document.createElement('a');
    item.href = ref(card);
    item.className = 'item';

    item.append(image);
    item.append(name);

    $container.append(item);
  }
}


//TODO remove url
//TODO add page support
window.addEventListener('load', function () {
  $.get("http://localhost:8080/web2print/api/cards", function (response) {
    console.log(response['page']);
    setCards($('div.container'),response['content'], function (card) {
      return 'http://localhost:8080/web2print/editor/' + card['orderId'];
    });
  });
});