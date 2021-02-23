import {Component, OnInit} from '@angular/core';
import {FileState, StatefulWrappedFileType, Utils} from "../../lib/utils";
import {CardFormat, Side} from "../../lib/card";
import {Api} from "../../lib/api";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-import-motive-default',
  templateUrl: './import-motive-default.component.html',
  styleUrls: ['./import-motive-default.component.less'],
  providers: [Api]
})
export class ImportMotiveDefaultComponent implements OnInit {

  defaultMotives: StatefulWrappedFileType<ImportDefaultMotiveRequest>[] = [];

  constructor(private api: Api, private dialog: MatDialog) {}

  ngOnInit(): void {
  }

  fileAdded($event: File[]) {
    Utils.filterFilesAndDialogInvalid($event, file => {
      return null;
    }, this.dialog).forEach(validFile => {
      this.defaultMotives.push({
        file: validFile,
        state: FileState.AWAIT,
        type: {

        }
      });
    });
  }
}

export interface ImportDefaultMotiveRequest {
  format: CardFormat
  sides: Side[];
  file: File;
}
