class ImageEl {
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

let logoContentId;
let imgAR = 1;

function hFileUploadChanged(e) {
  //file Upload code
  const file = e.target.files[0];

  const fd = new FormData();
  fd.append("file", file);
  $.post({
    url: web2print.links.apiUrl+"content",
    data: fd,
    processData: false,
    contentType: false,
  }).then(function(response : { contentId : string }) {
    logoContentId = response.contentId;
    const img = new Image();
    img.onload = function() {
      imgAR = img.width / img.height;
    };
    img.src = `${web2print.links.apiUrl}content/${logoContentId}`;
  }).catch(function(e) {
    Editor.storage.addOnClick = undefined;
    $fileUpBtn.val(null); //emptys the Filelist, is needed if the same file is choosen again
    console.error('failed to fetch xhr', e);
    alert("Could not send Image to server:\n"+JSON.stringify(e));
  });
}

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