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

$(window).bind("hashchange", function () {
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
            break;
        case "#ov-motive":
            Import.style.display = "none";
            Seitenformat.style.display = "none";
            Motive.style.display = "inline";
            break;
    }
});