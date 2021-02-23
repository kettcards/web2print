import {Component} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMaterial} from "../../lib/card";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Api} from "../../lib/api";

@Component({
  selector: 'app-import-texture',
  templateUrl: './import-texture.component.html',
  styleUrls: ['./import-texture.component.less'],
  providers: [Api]
})
export class ImportTextureComponent {

  FileState: typeof FileState = FileState;

  textures: StatefulWrappedFileType<CardMaterial>[] = [];

  filters  = [ContentTypeFilter.BITMAP, new UniqueEntryFilter(this.textures)]; // TODO COPY BY VALUE?

  constructor(private dialog: MatDialog) {}

  onFileAdded(files: File[]): void {
    const invalidFiles: FileError[] = [];
    files.forEach(file => {
      const failedReason = this.filter(file);
      if (failedReason === null) {
        this.textures.push({
          file: file,
          state: FileState.AWAIT,
          type: {
            name: Utils.fileNameFor(file.name),
            textureSlug: file.name,
            tiling: 'REPEAT' // TODO make changeable
          }
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

  deleteAllTextures(): void {
    this.textures = [];
  }

  deleteTextureEntry(entry: StatefulWrappedFileType<CardMaterial>): void {
    const index = this.textures.indexOf(entry);
    if (index >= 0) {
      this.textures.splice(index, 1);
    }
  }

  importAllTextures(): void {
    this.textures.forEach((entry, index) => {
      this.importTexture(entry);
      // TODO error checking
      this.textures.splice(index, 1);
    });
  }

  importTexture(texture: StatefulWrappedFileType<CardMaterial>): void {

  }

}
