import {Component, Inject} from '@angular/core';
import {CardMotive, Side} from "../../../lib/card";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {StatefulWrappedFileType, Utils} from "../../../lib/utils";
import {MatChipInputEvent} from "@angular/material/chips";
import {ENTER, SPACE} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-import-motive-dialog',
  templateUrl: './import-motive-dialog.component.html',
  styleUrls: ['./import-motive-dialog.component.less']
})
export class ImportMotiveDialogComponent {

  Side: typeof Side = Side;

  spaceKeyCodes: number[] = [ENTER, SPACE];

  assignedCards: string[] = [];

  selectedSide: Side | undefined = undefined;

  constructor(public dialogRef: MatDialogRef<ImportMotiveDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MotiveDialogDataWrapper) {
    if (data.motive.additionalAttributes != undefined) {
      this.assignedCards = data.motive.additionalAttributes.concat([]);
    }
    if (data.motive.type?.side != undefined) {
      this.selectedSide = data.motive.type.side;
    }
  }

  onCancel(): void {
    this.data.wasCancelled = true;
    this.dialogRef.close();
  }

  assign($event: MatChipInputEvent): void {
    let value = $event.value;
    let input = $event.input;

    // TODO we might want to compare orderIds before for validation
    if ((value || '').trim()) {
      this.assignedCards.push(value);
    }

    if (input) {
      input.value = '';
    }
  }

  remove(orderId: string) {
    Utils.remove(this.assignedCards, orderId);
  }
}

export interface MotiveDialogDataWrapper {
  wasCancelled: boolean;
  motive: StatefulWrappedFileType<CardMotive>;
  options: string[];
}
