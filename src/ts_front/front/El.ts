class El {
  static hMDown(e : JQuery.MouseDownEvent) : void {
    switch(Editor.state) {
      case EditorStates.NONE:
        Editor.state = EditorStates.EL_BEGIN_FOCUS;
        Editor.setTarget(e.delegateTarget);
        ResizeBars.show();
        break;
      case EditorStates.EL_FOCUSED:
      case EditorStates.TXT_EDITING:
        if(Editor.storage.target !== e.delegateTarget) {
          Editor.state = EditorStates.EL_BEGIN_FOCUS;
          Editor.setTarget(e.delegateTarget);
          ResizeBars.show();
          break;
        }
    }
  }
  static hMUp(e : JQuery.MouseUpEvent) : void {
    switch(Editor.state) {
      case EditorStates.EL_BEGIN_FOCUS:
        if(Editor.storage.target === e.delegateTarget) {
          Editor.state = EditorStates.EL_FOCUSED;
          e.stopPropagation();
        }
        break;
    }
  }
}