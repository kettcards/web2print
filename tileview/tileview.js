var container = $('div.container');
var pictures = ['https://www.kettcards.de/img/grsubi071schwarz.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg', 'https://www.kettcards.de/img/bpanth004.jpg', 'https://www.kettcards.de/img/bpkegu001.jpg', 'https://www.kettcards.de/img/bppeak001.jpg'];
var names = ['grsubi071schwarz', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche', 'Weihnachts-Briefpapier: zwei Engelchen auf einer Wolke', 'Weihnachts-Briefpapier: Schönes Fest', 'Weihnachts-Briefpapier: Elche'];
var bestellnr = ['grsubi071schwarz', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001', 'bpanth004', 'bpkegu001', 'bppeak001'];

for(i = 0; i < pictures.length; i++) {
  let item = document.createElement('a');
  let name = document.createElement('span');
  let image = document.createElement('img');
  
  image.src = pictures[i];
  
  name.className = 'caption';
  name.textContent = names[i];
  
  item.href = 'https://bppraktikum.tk/front/front.html?card=' + bestellnr[i];
  item.className = 'item';
  item.append(image);
  item.append(name);
  container.append(item);
}

$('img.item').click(function() {
  console.log('CLICK');
});