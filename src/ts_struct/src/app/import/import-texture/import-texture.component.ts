import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMaterial} from "../../lib/card";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Api} from "../../lib/api";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FormControl} from "@angular/forms";
import {MappingDialogComponent} from "./mapping-dialog/mapping-dialog.component";

@Component({
  selector: 'app-import-texture',
  templateUrl: './import-texture.component.html',
  styleUrls: ['./import-texture.component.less'],
  providers: [Api]
})
export class ImportTextureComponent implements OnInit {

  FileState: typeof FileState = FileState;

  availableTextures: CardMaterial[] | null = null;

  hasSuccessfulUploadedInQueue = false;

  queuedTextureResources: StatefulWrappedFileType<CardMaterial>[] = [];

  filters = [ContentTypeFilter.BITMAP, new UniqueEntryFilter(this.queuedTextureResources)];

  errorLoadMsg: string | null = null;

  formControl = new FormControl();

  constructor(private dialog: MatDialog, private api: Api, private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.loadAvailableTextures();
  }

  loadAvailableTextures(): void {
    this.availableTextures = null;
    console.log('requesting textures');
    this.api.getTextures().subscribe(
      response => {
        this.availableTextures = response;
        console.log('response textures:', this.availableTextures);
      },
      error => {
        this.errorLoadMsg = 'Texturen konnten nicht geladen werden.';
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
        this.queuedTextureResources.push({
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

  findTextureName(file: File): CardMaterial | undefined {
    const fileName = Utils.fileNameFor(file.name);
    return Utils.predChain([
      e => { //look based on number
        return e.id?.toString() === fileName;
      },
      e => {
        return e.name === fileName
      }
    ], this.availableTextures);
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
    this.queuedTextureResources.length = 0;
  }

  deleteTextureEntry(entry: StatefulWrappedFileType<CardMaterial>): void {
    Utils.remove(this.queuedTextureResources, entry);
  }

  importAllTextures(): void {
    console.log('starting bulk import');
    this.queuedTextureResources.forEach((entry, index) => {
      this.importTexture(entry);
      // TODO error checking

    });
  }

  importTexture(texture: StatefulWrappedFileType<CardMaterial>): void {
    console.log('importing ', texture);
    this.api.setTexture(texture).subscribe(
      response => {
        texture.state = FileState.SUCCESSFUL;
        this.hasSuccessfulUploadedInQueue = true;
      },
      error => {
        texture.state = FileState.FAILED;
      }
    );
  }

  changeMapping(texture: StatefulWrappedFileType<CardMaterial>): void {
    const ref = this.dialog.open(MappingDialogComponent, {
      data: {
        selected: texture,
        options: this.availableTextures
      }
    });
    ref.afterClosed().subscribe(result => { //TODO ignore cancel closes
      console.log('setting result:', result);
      texture.type = result;
    });
  }

  clearSubmittedTextures() {
    this.queuedTextureResources.forEach((texture, index) => {
      if (texture.state == FileState.SUCCESSFUL) {
        this.queuedTextureResources.splice(index, 1);
      }
    });
    this.hasSuccessfulUploadedInQueue = false;
  }
}


