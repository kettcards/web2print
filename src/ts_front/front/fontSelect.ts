const $options = $<HTMLSelectElement>('#font-options');
const $label   = $<HTMLSelectElement>('#font-label');
let currentSelection;

$fontSelect.children('p').click(function(e) {
    e.stopPropagation();
    $options.css('visibility', 'visible');
});

$options.click(function(e) {
    if(e.target.nodeName !== 'P')
        return;

    const fName = e.target.textContent;
    currentSelection = fName;
    $label.text(fName).css('font-family', fName);
    $fontSelect.trigger("change");
});