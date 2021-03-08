import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMotive, CardOverview} from "../../lib/card";
import {Api} from "../../lib/api";
import {ImportMenu} from "../import";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-import-motive',
  templateUrl: './import-motive.component.html',
  styleUrls: ['./import-motive.component.less'],
  providers: [Api]
})
export class ImportMotiveComponent extends ImportMenu<CardMotive> implements OnInit {

  filters = [ContentTypeFilter.BITMAP, new UniqueEntryFilter(this.elements)];

  orderIds: CardOverview[] = [];

  constructor(dialog: MatDialog, private api: Api) {
    super(dialog);
  }

  ngOnInit(): void {
    this.api.getCardOverview(undefined).subscribe(
      next => {
        this.orderIds = next.content;
      },
      error => {
        // TODO error handling
      }
    );
  }


  public addMappedFiles(file: File,  elements: (CardMotive | undefined)[]): void {
  }

  public findName(file: File): (CardMotive | undefined)[] {
    const name = Utils.fileNameFor(file.name);
    const results:(CardMotive | undefined)[] = [];
    this.orderIds.forEach(e => {
      if (name.startsWith(e.orderId)) {
        //results.push(e);
      }
    });
    return results;
  }

  changeMapping(element: StatefulWrappedFileType<CardMotive>): void {
    // TODO
  }

  submit(element: StatefulWrappedFileType<CardMotive>): void {
    // TODO
  }

}
