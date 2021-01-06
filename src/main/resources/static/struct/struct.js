const $container = $('div.container');
let dragAndDropFiles;

const inputXlsxElement = document.getElementById("xlsx-input"),
    xlsxSubmit = document.getElementById("xlsx-submit");
const xlsxDropbox = document.getElementById("xlsx-import");
xlsxDropbox.addEventListener("dragenter", dragenter, false);
xlsxDropbox.addEventListener("dragover", dragover, false);
xlsxDropbox.addEventListener("drop", drop, false);

const inputPdfElement = document.getElementById("pdf-input"),
    pdfSubmit = document.getElementById("pdf-submit");
const pdfDropbox = document.getElementById("pdf-import");
pdfDropbox.addEventListener("dragenter", dragenter, false);
pdfDropbox.addEventListener("dragover", dragover, false);
pdfDropbox.addEventListener("drop", drop, false);

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    dragAndDropFiles = dt.files;

    handleFiles();
}

pdfSubmit.addEventListener("click", function () {
    if (inputPdfElement) {
        inputPdfElement.click();
    }
});
xlsxSubmit.addEventListener("click", function () {
    if (inputXlsxElement) {
        inputXlsxElement.click();
    }
});

inputXlsxElement.addEventListener("change", handleFiles, false);

function handleFiles() {
    let fileList = this.files;
    let fd = new FormData();
    if (fileList === undefined) {
        fileList = dragAndDropFiles;
    }
    for (let listEl of fileList) {
        fd.append("file", fileList[0]);
        let req = jQuery.ajax({
            url: web2print.links.apiUrl + "backend/resource",
            method: "POST",
            data: fd,
            processData: false,
            contentType: false
        });

        req.then(function (response) {
            console.log(response)
        }, function (xhr) {
            console.error('failed to fetch xhr', xhr)
            console.error('failed to fetch xhr', xhr)
        })
    }
}
var isNew = false;
var selectedRatioId;

function showRatioDialogOnSelect(tr, isNew) {
    return function() {
        $('#dialog_input_name').value = "";
        $('#dialog_input_width').value = "";
        $('#dialog_input_height').value = "";
        $('#dialog_title').val("Hinzufügen");

        if (!isNew) {
            $.get(web2print.links.apiUrl + "aspectRatio/" + tr).then(function (ratio) {
                var nameBox = document.createElement('input');
                var height = document.createElement('input');
                var wight = document.createElement('input');
                $('#dialog_input_name').val(ratio.name);
                $('#dialog_input_name').parent().addClass('is-dirty')
                $('#dialog_input_width').val(ratio.width);
                $('#dialog_input_width').parent().addClass('is-dirty')
                $('#dialog_input_height').val(ratio.height);
                $('#dialog_input_height').parent().addClass('is-dirty')


            });

        }

        dialog.showModal();

    };
}
function removeRatio() {
    console.log('removing id ' + selectedRatioId);
    let req = jQuery.ajax({
        url: web2print.links.apiUrl + "aspectRatio/" + selectedRatioId,
        method: "DELETE",
        processData: false,
        contentType: false
    });
    renewRatios();
    dialog.close();
}
function newRatio() {
    var isNew = true;
    showRatioDialogOnSelect(null, isNew);
}

function renewRatios() {
    $.get(web2print.links.apiUrl + "aspectRatio").then(function (ratios) {
        $('#ratio-tb-body').empty();
        for (let ratio of ratios) {
            let tr = document.createElement('tr');
            let thname = document.createElement('td');
            thname.class = "mdl-data-table__cell--non-numeric";
            thname.innerText = ratio.name;
            componentHandler.upgradeDom(thname);
            let thwidht = document.createElement('td');
            thwidht.innerText = ratio.width;
            let thheight = document.createElement('td');
            thheight.innerText = ratio.height;
            let id = document.createElement('td');
            id.style.display = "none";
            id.innerText = id;
            tr.append(thname);
            tr.append(thwidht);
            tr.append(thheight);
            isNew = false;
            selectedRatioId = ratio.id;
            tr.onclick = showRatioDialogOnSelect(ratio.id);
            componentHandler.upgradeDom(tr);
            $('#ratio-tb').append(tr);
        }

    });
}

$(window).bind("hashchange", function () { //TODO onload hashchange is not working
    let Import = document.getElementById("Import");
    let Seitenformat = document.getElementById("Seitenformat");
    let Motive = document.getElementById("Motive");
    console.log(location.hash);
    switch (location.hash) {
        case "#import":
            Import.style.display = "inline";
            Seitenformat.style.display = "none";
            Motive.style.display = "none";
            break;
        case "#ov-format":
            Import.style.display = "none";
            Seitenformat.style.display = "inline";
            Motive.style.display = "none";
            renewRatios();
            break;
        case "#ov-motive":
            Import.style.display = "none";
            Seitenformat.style.display = "none";
            Motive.style.display = "inline";
            break;
    }
});

var dialogButton = document.querySelector('.dialog-button');
var dialog = document.querySelector('#dialog');
if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
}
dialogButton.addEventListener('click', function() {
    dialog.showModal();
    isNew = true;
    console.log('showing dialog as new element');
});
dialog.querySelector('button:not([disabled])')
    .addEventListener('click', function() {
        dialog.close();
    });


$('#ov-format').on('click', function () {
    renewRatios();
});