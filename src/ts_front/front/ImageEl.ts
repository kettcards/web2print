class ImageEl {
  static contentId : string = undefined;
  static imgAR     : number = 1;

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

  static hFileUploadChanged(e) : void {
    const file = e.target.files[0];

    const fd = new FormData();
    fd.append("file", file);

    $.post({
      url        : web2print.links.apiUrl+"content",
      data       : fd,
      processData: false,
      contentType: false,
      beforeSend : ImageEl.showLoadingDelayed,
      xhr        : ImageEl.mkXhr,
    }).then(ImageEl.processImgId)
      .catch(ImageEl.hUploadErr);
  }

  private static uploadFinished = false;
  private static readonly DIALOG_DELAY = 250;

  private static showLoadingDelayed() : void {
    ImageEl.uploadFinished = false;
    setTimeout(ImageEl.maybeShowDialog, ImageEl.DIALOG_DELAY);
  }
  private static maybeShowDialog() : void {
    if(!ImageEl.uploadFinished)
      Dialogs.progress.show();
  }
  private static mkXhr() : XMLHttpRequest {
    let xhr = jQuery.ajaxSettings.xhr();
    xhr.upload.onprogress = ImageEl.reportProgress;
    return xhr;
  }
  private static reportProgress(e : ProgressEvent) : void {
    if(e.lengthComputable) {
      Dialogs.progress.setVal(e.loaded / e.total);
    }
  }

  private static processImgId(response : { contentId : string }) : void {
    ImageEl.uploadFinished = true;
    ImageEl.contentId = response.contentId;
    const img = new Image();
    img.onload = function() {
      ImageEl.imgAR = img.width / img.height;
      Dialogs.progress.hide();
    };
    img.src = `${web2print.links.apiUrl}content/${ImageEl.contentId}`;
  }
  private static hUploadErr(e) : void {
    ImageEl.uploadFinished = true;
    Editor.storage.addOnClick = undefined;
    UI.$fileUpBtn.val(null); //emptys the Filelist, is needed if the same file is choosen again

    console.error('failed to fetch xhr', e);
    Dialogs.progress.hide();
    alert("Die ausgewählte Datei konnte nicht hochgeladen werden.\nBitte stellen Sie sicher, dass das Dateiformat: .jpg,.jpeg,.png,.svg ist \nund die Dateigröße nicht "+web2print.editorConfiguration.maxFileSize+"MB überschreitet.");
  }
}