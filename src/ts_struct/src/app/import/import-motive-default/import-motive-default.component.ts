import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardFormat} from "../../lib/card";
import {Api} from "../../lib/api";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MappingDialogComponent} from "../import-texture/mapping-dialog/mapping-dialog.component";

@Component({
  selector: 'app-import-motive-default',
  templateUrl: './import-motive-default.component.html',
  styleUrls: ['./import-motive-default.component.scss'],
  providers: [Api]
})
export class ImportMotiveDefaultComponent implements OnInit {

  FileState: typeof FileState = FileState;

  availableFormats: CardFormat[] | null = null;

  hasSuccessfulUploadedInQueue = false;

  queuedDefaultFormatResources: StatefulWrappedFileType<CardFormat>[] = [];

  filters = [ContentTypeFilter.PDF, new UniqueEntryFilter(this.queuedDefaultFormatResources)];

  errorLoadMsg: string | null = null;

  constructor(private dialog: MatDialog, private api: Api, private snackbar: MatSnackBar) {
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

  onFileAdded(files: File[]): void {
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      const failedReason = this.filter(file);
      if (failedReason === null) {
        let texture = this.findTextureName(file);
        console.log('selecting texture', texture);
        this.queuedDefaultFormatResources.push({
          file: file,
          state: FileState.AWAIT,
          type: texture
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

  findTextureName(file: File): CardFormat | undefined {
    const fileName = Utils.fileNameFor(file.name);
    return Utils.predChain([
      e => { //look based on number
        return e.id?.toString() === fileName;
      },
      e => {
      console.log(fileName.replace( /(^.+)(\w\d+\w)(.+$)/i,'$2'));
        return e.id?.toString() === fileName.replace( /^\d+|\d+\b|\d+(?=\w)/g,'$2')[0];
      },
      e => { //direct naming match
        return e.name === fileName
      }
    ], this.availableFormats);
  }

  filter(file: File): string | null {
    for (let i = 0; i < this.filters.length; i++) {
      let e = this.filters[i];
      const filter = e.filter(file);
      console.log('filter result:', file, filter);
      if (filter != null) {
        return filter;
      }
    }
    return null;
  }

  deleteAllTextureEntry(): void {
    this.queuedDefaultFormatResources.length = 0;
  }

  deleteTextureEntry(entry: StatefulWrappedFileType<CardFormat>): void {
    Utils.remove(this.queuedDefaultFormatResources, entry);
  }

  importAllTextures(): void {
    console.log('starting bulk import');
    this.queuedDefaultFormatResources.forEach((entry) => {
      this.importTexture(entry);
    });
  }

  importTexture(texture: StatefulWrappedFileType<CardFormat>): void {
    console.log('importing ', texture);
    // @ts-ignore TODO non null pls
    this.api.importDefaultMotive(texture).subscribe(
      response => {
        texture.state = FileState.SUCCESSFUL;
        this.hasSuccessfulUploadedInQueue = true;
      },
      error => {
        texture.state = FileState.FAILED;
      }
    );
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

  clearSubmittedTextures() {
    this.queuedDefaultFormatResources.forEach((texture, index) => {
      if (texture.state == FileState.SUCCESSFUL) {
        this.queuedDefaultFormatResources.splice(index, 1);
      }
    });
    this.hasSuccessfulUploadedInQueue = false;
  }

}
