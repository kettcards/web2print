import {ErrorDialogComponent, FileError} from "./error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";

export class Utils {

  public static fileNameFor(name: string): string {
    const index = name.lastIndexOf('.');
    if (index < 0) {
      return '';
    } else {
      return name.substr(0, index);
    }
  }

  public static filterFile(file: File, filters: Filter<any>[]): string | null {
    let ret: string | null = null;
    for (let i = 0; i < filters.length; i++) {
      let e = filters[i];
      const filter = e.filter(file);
      console.log('filter result:', file, filter);
      if (filter != null) {
        ret = filter;
      }
    }
    return ret;
  }

  public static filterFilesAndDialogInvalid(files: File[], filter: (file: File) => string | null, dialog: MatDialog): File[] {
    const validated: File[] = [];
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      const failedReason = filter(file);
      if (failedReason === null) {
        validated.push(file);
      } else {
        invalidFiles.push(new FileError(file, failedReason))
      }
    });
    if (invalidFiles.length > 0) { // show error dialog
      dialog.open(ErrorDialogComponent, {
        data: {
          title: '<h1>Folgende Dateien konnten nicht hinzugefügt werden:</h1>',
          entries: invalidFiles
        }
      });
    }
    return validated;
  }

}

export class ContentType {
  public static PNG = 'image/png'
  public static JPG = 'image/jpeg'
  public static PDF = 'application/pdf'
  public static XSLX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export abstract class Filter<T> {
  // returns null when file is valid
  public abstract filter(type: T): string | null;
}

export class ContentTypeFilter extends Filter<File> {

  public static BITMAP = new ContentTypeFilter([ContentType.PNG, ContentType.JPG]);
  public static PDF = new ContentTypeFilter([ContentType.PDF]);
  public static XSLX = new ContentTypeFilter([ContentType.XSLX]);

  constructor(private allowedTypes: string[]) {
    super();
  }

  public filter(file: File): string | null {
    if (!file.type) {
      return 'unbekanntes Dateiformat';
    }
    const index = this.allowedTypes.indexOf(file.type);
    return index >= 0 ? null : 'das gewünschte Format wird nicht unterstützt (' + file.type + ')';
  }

}

export class UniqueEntryFilter extends Filter<any> {

  constructor(private entries: WrappedFileType<any>[]) {
    super();
  }

  filter(type: File): string | null {
    return this.entries.map(e => e.file).indexOf(type) < 0 ? null : 'die Datei wurde bereits hinzugefügt';
  }

}

export enum FileState {
  AWAIT, SUCCESSFUL, FAILED
}

export interface WrappedFileType<T> {
  type: T;
  file: File;
}

export interface StatefulWrappedFileType<T> extends WrappedFileType<T> {
  state: FileState;
}

export enum ImportStateChange {
  CREATED,MODIFIED,DELETED
}

export interface CardTableReport {

}
