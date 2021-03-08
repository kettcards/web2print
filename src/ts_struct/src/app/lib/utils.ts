import {ErrorDialogComponent, FileError} from "./error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Predicate} from "@angular/core";

// a collection of small helper function
export class Utils {

  public static remove(list: any[], el: any) {
    const index = list.indexOf(el);
    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  public static fileNameFor(name: string): string {
    const index = name.lastIndexOf('.');
    if (index < 0) {
      return '';
    } else {
      return name.substr(0, index);
    }
  }

  public static predChain(chain: Predicate<any>[], data: any[] | null): any {
    if (data == null) {
      return undefined;
    }
    for (let pred of chain) {
      let find = data.find(pred);
      if (find !== undefined)
        return find;
    }
    return undefined
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

// types of content
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

// compares file content type against the given filter
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

// compares existing files, returns null if file is not present in list
export class UniqueEntryFilter extends Filter<any> {

  constructor(private entries: WrappedFileType<any>[]) {
    super();
  }

  filter(type: File): string | null {
    console.log('entries for compare:', this.entries);
    return this.entries.map(e => e.file.name).indexOf(type.name) < 0 ? null : 'die Datei wurde bereits hinzugefügt';
  }

}

export enum FileState {
  AWAIT, SUCCESSFUL, FAILED
}

export interface WrappedFileType<T> {
  type?: T;
  file: File;
  additionalAttributes?: string[];
}

export interface StatefulWrappedFileType<T> extends WrappedFileType<T> {
  state: FileState;
}
