class ImageEl {
  static contentId  : string = undefined;
  static imgAR      : number = 1;
  static hMDown(e : JQuery.MouseDownEvent) : void {
    switch(Editor.state) {
      case EditorStates.EL_FOCUSED:
        if(Editor.storage.target === e.delegateTarget) {
          Editor.beginDragEl();
          break;
        }
      default:
        El.hMDown(e);
    }
  }
}

function hFileUploadChanged(e) {
  let  $progressBar;
  //file Upload code
  const file = e.target.files[0];

  const fd = new FormData();
  fd.append("file", file);

  $.post({
    url: web2print.links.apiUrl+"content",
    data: fd,
    processData: false,
    contentType: false,
    beforeSend: function(){
      $progressBar = $('<div style="position:absolute; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.66)">' +
          '<div class="center" style="white-space: normal; overflow: auto; max-width:70%; max-height:70%; background-color:lightgray; padding:5px 5px 15px 5px;">' +
          '<label for="prog">Hochladen:</label><progress id="prog" value="0" max="100">0%</progress></div></div>');
      $body.append($progressBar);
    },
    xhr: xhrProvider,
  }).then(function(response : { contentId : string }) {
    $progressBar.remove();
    ImageEl.contentId = response.contentId;
    const img = new Image();
    img.onload = function() {
      ImageEl.imgAR = img.width / img.height;
    };
    img.src = `${web2print.links.apiUrl}content/${ImageEl.contentId}`;
  }).catch(function(e) {
    $progressBar.remove();
    Editor.storage.addOnClick = undefined;
    $fileUpBtn.val(null); //emptys the Filelist, is needed if the same file is choosen again
    console.error('failed to fetch xhr', e);
    alert("Die ausgewählte Datei konnte nicht hochgeladen werden.\nBitte stellen Sie sicher, dass das Dateiformat: .jpg,.jpeg,.png,.svg ist \nund die Dateigröße nicht 10MB überschreitet.");
  });

}

const xhrProvider = function(){
  let xhr = jQuery.ajaxSettings.xhr();
  let bar = $('#prog');
  xhr.upload.addEventListener("progress", function(e){
    if(e.lengthComputable){
      let percent = e.loaded/e.total;
      percent = percent * 100;
      console.log(percent);
      bar.val(percent);
    }
  }, false);
  return xhr;
};

const $fileUpBtn = $<HTMLInputElement>('#fileUpload').change(hFileUploadChanged);

//function to return transform rotation angle of the state.target
const getRotation = function(){
  let transformMatrix = Editor.storage.$target.css('transform');
  let angle = 0;
  if(transformMatrix !== "none") {
    let mat = transformMatrix.split('(')[1].split(')')[0].split(',');
    let a = +mat[0];
    let b = +mat[1];
    let radians = Math.atan2(b, a);
    if (radians < 0) {
      radians += (2 * Math.PI);
    }
    angle = Math.round(radians * (180 / Math.PI));
  }
  return angle;
};