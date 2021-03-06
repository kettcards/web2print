import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.less']
})
export class ErrorDialogComponent<T extends Error> {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorDialog<T>, private dialog: MatDialogRef<ErrorDialog<T>>) {}

}

export interface ErrorDialog<T extends Error> {
  title?: string;
  prefix?: string;
  entries: T[];
  suffix?: string;
}

export abstract class Error {
  abstract html(): string;
}

export class FileError extends Error {
  constructor(private file: File, private reason: string) {
    super();
  }

  html(): string {
    return '<span>' + this.file.name + ' : ' + '</span>' + '<span>' + this.reason + '</span>';
  }
}
