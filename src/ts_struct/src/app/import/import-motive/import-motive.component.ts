import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, Filter, StatefulWrappedFileType, Utils} from "../../lib/utils";
import {CardMotive} from "../../lib/card";
import {Api} from "../../lib/api";
import {MatDialog} from "@angular/material/dialog";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-import-motive',
  templateUrl: './import-motive.component.html',
  styleUrls: ['./import-motive.component.less'],
  providers: [Api]
})
export class ImportMotiveComponent implements OnInit {

  motives: StatefulWrappedFileType<CardMotive>[] = [];

  availableCards: string[] = [];

  allowedTypes: Filter<any>[] = [ContentTypeFilter.PDF, ContentTypeFilter.BITMAP];
  hasSuccessfulUploadedInQueue = true;

  constructor(private api: Api, private dialog: MatDialog, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.api.getCardOverview().subscribe(
      response => {
        this.availableCards = response.content.map(e => e.orderId);
        this.snackBar.open('Bestellnummern aktualisiert', undefined, {
          duration: 1 * 1000
        });
        console.log('order ids', this.availableCards);
      },
      error => {
        this.snackBar.open('Bestellnummbern von Karten konnten nicht geholt werden', undefined, {
          duration: 10 * 1000
        });
      }
    );
  }

  addMotives(files: File[]): void {
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      console.log('checking file', file);
      //const failedReason = Utils.filterFile(file, this.allowedTypes); //TODO kinda not working -_-
      let failedReason = null;
      if (failedReason === null) {
        this.motives.push({
          file: file,
          state: FileState.AWAIT,
          type: {
            textureSlug: file.name
          }
        });
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


  submitAll(): void {

  }

  deleteAll(): void {

  }

  clearSubmitted() {

  }
}
