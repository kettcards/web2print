import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {StatefulWrappedFileType} from "../../../lib/utils";
import {CardMaterial} from "../../../lib/card";

@Component({
  selector: 'app-mapping-dialog',
  templateUrl: './mapping-dialog.component.html',
  styleUrls: ['./mapping-dialog.component.less']
})
export class MappingDialogComponent {

  selected: CardMaterial | undefined;


  constructor(public dialogRef: MatDialogRef<MappingDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: TextureDialogDataWrapper) {
    this.selected = data.selected.type;
  }

  onCancel(): void { //TODO don't trigger exit event
    this.dialogRef.close();
  }

}

export interface TextureDialogDataWrapper {
  selected: StatefulWrappedFileType<CardMaterial>;
  options:  CardMaterial[];
}
