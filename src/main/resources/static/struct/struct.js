const $container = $('div.container');

const submit = document.getElementById("submit"),
    input = document.getElementById("input");

submit.addEventListener("click", function (e) {
    if (input) {
        input.click();
    }
}, false);

input.addEventListener("change", handleFiles, false);

function handleFiles() {
    const fileList = this.files;

    let fd = new FormData();
    fd.append("file", fileList[0]);

    var req = jQuery.ajax({
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
    })
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
            Seitenformat.style.display = "nonoe";
            Motive.style.display = "inline";
            break;
    }
});