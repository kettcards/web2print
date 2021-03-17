import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardFormat} from "../../lib/card";
import {Api} from "../../lib/api";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MappingDialogComponent} from "../import-texture/mapping-dialog/mapping-dialog.component";
import {ImportMenu} from "../import";

@Component({
  selector: 'app-import-motive-default',
  templateUrl: './import-motive-default.component.html',
  styleUrls: ['./import-motive-default.component.scss'],
  providers: [Api]
})
export class ImportMotiveDefaultComponent extends ImportMenu<CardFormat> implements OnInit {

  availableFormats: CardFormat[] | null = null;

  filters = [ContentTypeFilter.PDF, new UniqueEntryFilter(this.elements)];

  errorLoadMsg: string | null = null;

  constructor(dialog: MatDialog, private api: Api, private snackbar: MatSnackBar) {
    super(dialog);
  }

  ngOnInit(): void {
    this.loadAvailableTextures();
  }

  loadAvailableTextures(): void {
    this.availableFormats = null;
    console.log('requesting formats');
    this.api.getCardFormats().subscribe(
      response => {
        this.availableFormats = response;
        console.log('response card formats:', this.availableFormats);
      },
      error => {
        this.errorLoadMsg = 'Kartenformate konnten nicht geladen werden.';
      }
    );
  }

  public addMappedFiles(file: File, elements: (CardFormat | undefined)[]): void {
    let type = undefined;
    if (elements.length > 0) {
      type = elements[0];
    }
    this.elements.push({
      file: file,
      state: FileState.AWAIT,
      type: type
    });
  }

  public findName(file: File): any[] {
    return [this.findDefaultMotiveName(file)];
  }

  public submit(element: StatefulWrappedFileType<CardFormat>): void {
    console.log('importing ', element);
    // @ts-ignore TODO non null pls
    this.api.importDefaultMotive(element).subscribe(
      response => {
        element.state = FileState.SUCCESSFUL;
        this.hasSuccessfulFiles = true;
      },
      error => {
        element.state = FileState.FAILED;
      }
    );
  }

  findDefaultMotiveName(file: File): CardFormat | undefined {
    const fileName = Utils.fileNameFor(file.name);
    return Utils.predChain([
      e => { //look based on first occurring number
        let match = fileName.match(/\d+/);
        console.log(fileName, 'filename', match);
        if (match != undefined) {
          console.log('numeric match', fileName, match);
          return match?.[0] == e.id;
        }
        return false;
      },
      e => { //lookup filename
        return e.name === fileName
      }
    ], this.availableFormats);
  }

  changeMapping(texture: StatefulWrappedFileType<CardFormat>): void {
    const ref = this.dialog.open(MappingDialogComponent, {
      data: {
        selected: texture,
        options: this.availableFormats
      }
    });
    ref.afterClosed().subscribe(result => { //TODO ignore cancel closes
      console.log('setting result:', result);
      texture.type = result;
    });
  }

}
