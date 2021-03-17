import {FileState, Filter, StatefulWrappedFileType, Utils} from "../lib/utils";
import {ErrorDialogComponent, FileError} from "../lib/error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";

export abstract class ImportMenu<T> {

  FileState: typeof FileState = FileState;

  hasSuccessfulFiles = false;

  public elements: StatefulWrappedFileType<T>[] = [];

  public abstract filters: Filter<File>[];

  protected constructor(protected dialog: MatDialog) {
  }

  public onFileAdded(files: File[]): void {
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      const failedReason = this.filter(file);
      if (failedReason === null) {
        let el = this.findName(file);
        console.log('selecting elements', el);
        this.addMappedFiles(file, el);
      } else {
        invalidFiles.push(new FileError(file, failedReason))
      }
    });
    if (invalidFiles.length > 0) { // show error dialog
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: '<h1>Folgende Dateien konnten nicht hinzugefügt werden:</h1>',
          entries: invalidFiles
        }
      });
    }
  }

  //add mapped files
  public abstract addMappedFiles(file: File, elements: (T | undefined)[]): void;

  public filter(file: File): string | null {
    for (let i = 0; i < this.filters.length; i++) {
      let e = this.filters[i];
      const filter = e.filter(file);
      console.log('filter result:', file, filter);
      if (filter != null) {
        return filter;
      }
    }
    return null;
  }

  /**
   * tries to guess the the associated element
   * @param file file to check
   */
  public abstract findName(file: File): (any | undefined)[];

  public abstract changeMapping(element: StatefulWrappedFileType<T>): void;

  public submitAll(): void {
    this.elements.forEach(e => this.submit(e));
  }

  public abstract submit(element: StatefulWrappedFileType<T>): void;

  /**
   * removes all files
   */
  public deleteAll(): void {
    this.elements.length = 0;
  }

  /**
   * @param element delete the given element
   */
  public delete(element: StatefulWrappedFileType<T>): void {
    Utils.remove(this.elements, element);
  }

  /**
   * clear all successfully uploaded files
   */
  public clearSubmitted(): void {
    for (var index = this.elements.length; index--;) {
      const e = this.elements[index];
      console.log('checking file ', e);
      if (e.state === FileState.SUCCESSFUL) {
        console.log('removeing');
        this.elements.splice(index, 1);
      }
    }
    this.hasSuccessfulFiles = false;
  }

}
