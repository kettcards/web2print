const $container = $('div.container');

const inputElement = document.getElementById("input");
inputElement.addEventListener("change", handleFiles, false);

fileSelect.addEventListener("click", function (e) {
    if (fileElem) {
        fileElem.click();
    }
}, false);

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

    req.then(function(response) {
        console.log(response)
    }, function(xhr) {
        console.error('failed to fetch xhr', xhr)
    })
}