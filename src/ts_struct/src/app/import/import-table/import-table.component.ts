import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {ContentTypeFilter} from "../../lib/utils";
import {Api} from "../../lib/api";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Overlay} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {MatSpinner} from "@angular/material/progress-spinner";

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
  loadingSpinner;

  constructor(private dialog: MatDialog, private api: Api, private snackBar: MatSnackBar, private overlay: Overlay) {
    this.loadingSpinner = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()// TODO pos should be relative to current component
        .centerHorizontally()
        .centerVertically()
    });
  }

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
    console.log('importing table data');
    //TODO callback feedback
    this.loadingSpinner.attach(new ComponentPortal(MatSpinner))
    let importCardTable = this.api.importCardTable(this.file);
    importCardTable?.subscribe(
      response => {}, // TODO process response
      error => {
        this.loadingSpinner.detach();
      },
      () => {
        this.loadingSpinner.detach();
        this.snackBar.open('Tabelle erfolgreich importiert', undefined, {
          duration: 3000
        });
        this.file = null;
      }
    )
  }
}
