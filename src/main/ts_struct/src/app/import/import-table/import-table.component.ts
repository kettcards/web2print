import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {ContentTypeFilter} from "../../lib/utils";
import {Api} from "../../lib/api";
import {MatSnackBar} from "@angular/material/snack-bar";

/**
 * TODO - styling
 *  - context feedback
 */
@Component({
  selector: 'app-import-table',
  templateUrl: './import-table.component.html',
  styleUrls: ['./import-table.component.less'],
  providers: [Api]
})
export class ImportTableComponent {

  file: File | null = null;
  isProcessing = false;

  constructor(private dialog: MatDialog, private api: Api, private snackBar: MatSnackBar) {}

  fileAdded(files: File[]): void {
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      const isXslx = ContentTypeFilter.XSLX.filter(file);
      if (isXslx == null) {
        if (file == null) {
          invalidFiles.push(new FileError(file, '<h3>Es kann maximal eine Datei gleichzeitig importiert werden.</h3>'));
        } else {
          this.file = file;
        }
      } else {
        invalidFiles.push(new FileError(file, isXslx));
      }
    });

    if (invalidFiles.length > 0) {
      this.dialog.open(ErrorDialogComponent, {
        data: {
          title: '<h1>Folgende Dateien konnten nicht hinzugefügt werden:</h1>',
          entries: invalidFiles
        }
      })
    }
  }

  removeSelected() {
    this.file = null;
  }

  importFile() {
    //TODO callback feedback
    this.isProcessing = true;
    let importCardTable = this.api.importCardTable(this.file);
    importCardTable?.subscribe(
      response => {}, // TODO process response
      error => {
        this.isProcessing = false;
      },
      () => {
        this.isProcessing = false;
        this.snackBar.open('Tabelle erfolgreich importiert', undefined, {
          duration: 3000
        });
        this.file = null;
      }
    )
  }
}
