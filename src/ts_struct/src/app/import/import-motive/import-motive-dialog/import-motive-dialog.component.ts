import {Component, Inject} from '@angular/core';
import {CardMotive, CardOverview} from "../../../lib/card";
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

  spaceKeyCodes: number[] = [ENTER, SPACE];

  assignedCards: CardOverview[] = [];

  constructor(public dialogRef: MatDialogRef<ImportMotiveDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: MotiveDialogDataWrapper) {

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
      this.assignedCards.push({
        thumbSlug: '',
        orderId: value
      });
    }

    if (input) {
      input.value = '';
    }
  }

  remove(card: CardOverview) {
    Utils.remove(this.assignedCards, card);
  }
}

export interface MotiveDialogDataWrapper {
  wasCancelled: boolean;
  motive: StatefulWrappedFileType<CardMotive>;
  options: CardOverview[];
}
