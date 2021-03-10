import {Component, OnInit} from '@angular/core';
import {
  ContentType,
  ContentTypeFilter,
  FileState,
  StatefulWrappedFileType,
  UniqueEntryFilter,
  Utils
} from "../../lib/utils";
import {CardMotive, CardOverview, Side} from "../../lib/card";
import {Api} from "../../lib/api";
import {ImportMenu} from "../import";
import {MatDialog} from "@angular/material/dialog";
import {ImportMotiveDialogComponent, MaterialDialogResult} from "./import-motive-dialog/import-motive-dialog.component";

@Component({
  selector: 'app-import-motive',
  templateUrl: './import-motive.component.html',
  styleUrls: ['./import-motive.component.less'],
  providers: [Api]
})
export class ImportMotiveComponent extends ImportMenu<CardMotive> implements OnInit {

  filters = [new ContentTypeFilter([ContentType.PNG, ContentType.JPG, ContentType.PDF]), new UniqueEntryFilter(this.elements)];

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
    let side: Side | undefined = undefined;
    const name = Utils.fileNameFor(file.name); //TODO change based on name
    if (file.type === ContentType.JPG || file.type === ContentType.PNG) {
      side = Side.FRONT
    }
    this.elements.push({
      file: file,
      state: FileState.AWAIT,
      type: {
        side : side
      },
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
        element.additionalAttributes = result.assignedCards;
        // @ts-ignore
        element.type?.side = result.side;
      } else {
        console.log('dialog canceled');
      }
    });
  }

  submit(element: StatefulWrappedFileType<CardMotive>): void {
    if (element.type?.side == undefined) {
    this.api.importMotive(element)?.subscribe(
      next => {
        console.log('ret', next);
        element.state = FileState.SUCCESSFUL;
        this.hasSuccessfulFiles = true;
      },
        error => {
        element.state = FileState.FAILED;
      }
    );
    } else {
      if (element.type?.side == Side.FRONT) { //TODO really bad fix it
        this.api.importFrontMotive(element)?.subscribe(
          next => {
            console.log('ret', next);
            element.state = FileState.SUCCESSFUL;
            this.hasSuccessfulFiles = true;
          },
          error => {
            element.state = FileState.FAILED;
          }
        );
      }
      if (element.type?.side == Side.BACK) {
        this.api.importBackMotive(element)?.subscribe(
          next => {
            console.log('ret', next);
            element.state = FileState.SUCCESSFUL;
            this.hasSuccessfulFiles = true;
          },
          error => {
            element.state = FileState.FAILED;
          }
        );
      }
    }
  }

}
