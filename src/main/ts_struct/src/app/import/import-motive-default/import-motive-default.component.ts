import {Component, OnInit} from '@angular/core';
import {FileState, StatefulWrappedFileType, Utils} from "../../lib/utils";
import {CardFormat, Side} from "../../lib/card";
import {Api} from "../../lib/api";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-import-motive-default',
  templateUrl: './import-motive-default.component.html',
  styleUrls: ['./import-motive-default.component.less'],
  providers: [Api]
})
export class ImportMotiveDefaultComponent implements OnInit {

  defaultMotives: StatefulWrappedFileType<ImportDefaultMotiveRequest>[] = [];

  availableFormats: CardFormat[] = [];

  onLoad = false;

  constructor(private api: Api, private dialog: MatDialog, private snackbar: MatSnackBar) {}

  ngOnInit(): void {
    this.onLoad = true;
    this.api.getCardFormats().subscribe(
      response => {
        this.availableFormats = response;
      },
      error => {
        this.onLoad = false;
        this.snackbar.open('Kartenformate konnten nicht geladen werden', undefined, {
          duration: 3 * 1000
        })
      },
      () => {
        this.onLoad = false;
      }
    );
  }

  fileAdded($event: File[]) {
    Utils.filterFilesAndDialogInvalid($event, file => {
      return null;
    }, this.dialog).forEach(validFile => {
      this.defaultMotives.push({
        file: validFile,
        state: FileState.AWAIT,
        type: {
          format: undefined,
          sides: [],
          file: validFile
        }
      });
    });
  }

  submitAll(): void {
    this.defaultMotives.forEach((e, i) => {
      this.submit(e);
      this.defaultMotives.splice(i, 1);
    });
  }

  submit(defaultMotive: StatefulWrappedFileType<ImportDefaultMotiveRequest>): void {
    this.api.importMotive(defaultMotive.file);
  }

  delete(defaultMotive: StatefulWrappedFileType<ImportDefaultMotiveRequest>): void {
    const index = this.defaultMotives.indexOf(defaultMotive);
    if (index >= 0) {
      this.defaultMotives.splice(index, 1);
    }
  }

}

export interface ImportDefaultMotiveRequest {
  format?: CardFormat
  sides: Side[];
  file: File;
}
