import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMotive, CardOverview} from "../../lib/card";
import {Api} from "../../lib/api";
import {ImportMenu} from "../import";
import {MatDialog} from "@angular/material/dialog";
import {ImportMotiveDialogComponent} from "./import-motive-dialog/import-motive-dialog.component";

@Component({
  selector: 'app-import-motive',
  templateUrl: './import-motive.component.html',
  styleUrls: ['./import-motive.component.less'],
  providers: [Api]
})
export class ImportMotiveComponent extends ImportMenu<CardMotive> implements OnInit {

  filters = [ContentTypeFilter.PDF, new UniqueEntryFilter(this.elements)];

  orderIds: CardOverview[] | null = null;

  errorLoadMsg: string | null = null;


  constructor(dialog: MatDialog, private api: Api) {
    super(dialog);
  }

  ngOnInit(): void {
    this.loadOrderIds();
  }

  public loadOrderIds(): void {
    this.api.getCardOverview(undefined).subscribe(
      next => {
        this.orderIds = next.content;
      },
      error => {
        this.errorLoadMsg = 'Bestellnummern für Karten konnten nicht geladen werden.';
      }
    );
  }


  public addMappedFiles(file: File,  elements: (any | undefined)[]): void {
    this.elements.push({
      file: file,
      state: FileState.AWAIT,
      additionalAttributes: elements
    });
  }

  public findName(file: File): (any | undefined)[] {
    const name = Utils.fileNameFor(file.name);
    const results:(any | undefined)[] = [];
    this.orderIds?.forEach(e => {
      if (e.orderId.startsWith(name)) {
        results.push(e.orderId);
      }
    });
    return results;
  }

  changeMapping(element: StatefulWrappedFileType<CardMotive>): void {
    const ref = this.dialog.open(ImportMotiveDialogComponent, {
      data: {
        options: this.orderIds,
        wasCancelled: false,
        motive: element
      }
    });
    ref.afterClosed().subscribe(result => { //TODO ignore cancel closes
      if (result != undefined || result != null) {
        console.log('setting result:', result);
        element.additionalAttributes = result;
      } else {
        console.log('dialog canceled');
      }
    });
  }

  submit(element: StatefulWrappedFileType<CardMotive>): void {
    // TODO
  }

}
