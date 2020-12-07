const holder = $('#holder>.center');

const toolBox = $('<div id="toolBox"><button id="moveBtn">M</button></div>');

const pages = [
  {w:300, h:400, i:'https://www.kreativ-offensive.de/gfx/artibalta/WD109.jpg', g:''},
  {w:200, h:400, i:'', g:''},  
]

for(var p of pages){
  const newPage = $('<div class="page"></div>');
  newPage.css({
    width: p.w,
    height: p.h,
    'background-image': 'url('+p.i+')',
  });
  holder.append(newPage);
}

const Spawner = {
  TEXT: function(p){
    return $('<span class="text" contenteditable>test</span>')
      .mousedown(hElMDown)
      .click(hElClick)
      .css(p);
  },
  IMAGE: undefined,
  GEOM: undefined,
};

const state = {
  addOnClick: undefined,
  target: undefined,
  dragging: false,
  isEditing: false,
  dx: 0,
  dy: 0,
};

const hElMDown = function(e){
  state.isEditing = true;
  state.target = $(e.target);
};
const hElClick = function(e){
  e.stopPropagation();

  const target = $(e.target);
  toolBox.css(Object.assign({
    visibility: 'visible',
    width: target.width(),
  }, target.offset()));  
};

$('.addElBtn').click(function(e){
  state.addOnClick = Spawner[$(e.target).data('enum')];
});

//dragging
toolBox.children('#moveBtn').mousedown(function(){
  state.dragging = true;
  state.isEditing = false;
});

$('body').mousemove(function(e){
  if(!state.dragging)
    return;
  state.dx += e.originalEvent.movementX;
  state.dy += e.originalEvent.movementY;
  
  state.target.css('transform', 'translate('+state.dx+'px, '+state.dy+'px)');
  toolBox.css('transform', 'translate('+state.dx+'px, calc(-100% + '+state.dy+'px))');
}).mouseup(function(){
  if(state.dragging){
    if(state.dx !== 0 || state.dy !== 0){
      toolBox.add(state.target).css({
        left: '+='+state.dx,
        top: '+='+state.dy,
        transform: '',
      });
      state.dx = 0;
      state.dy = 0;
    }
    state.dragging = false;
  } else 
    toolBox.css('visibility', 'hidden');
}).append(toolBox);

//spawning
$('.page').click(function(e){
  if(state.isEditing){
    return;
  }
  if(!state.addOnClick)
    return;
  const el = state.addOnClick({left: e.originalEvent.layerX, top: e.originalEvent.layerY});  
  $(e.originalEvent.originalTarget).append(el);
  state.addOnClick = undefined;
});