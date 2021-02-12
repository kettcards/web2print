let logoContentId;

const hFileUploadChanged = function(e) {
  //file Upload code
  let file = e.target.files[0];
  console.log(file.type);
  //send to server
  let fd = new FormData();
  fd.append("file", file);
  let req = jQuery.ajax({
    url: web2print.links.apiUrl + "content",
    method: "POST",
    data: fd,
    processData: false,
    contentType: false
  });
  req.then(function (response) {
    logoContentId = JSON.parse(response).contentId;
  }, function (xhr) {
    console.error('failed to fetch xhr', xhr)
  });
}

const $fileUpBtn = $<HTMLInputElement>('#fileUpload').change(hFileUploadChanged);

const imgClick = function(e){
  e.stopPropagation();

  const target = $(e.delegateTarget);
  imgTool.css(Object.assign({
    visibility: 'visible',
  }, target.offset()) as  JQuery.PlainObject);
}

//function to return transform rotation angle of the state.target
const getRotation = function(){
  let transformMatrix = state.target.css('transform');
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