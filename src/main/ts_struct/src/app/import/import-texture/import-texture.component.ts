import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMaterial} from "../../lib/card";
import {ErrorDialogComponent, FileError} from "../../lib/error-dialog/error-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Api} from "../../lib/api";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-import-texture',
  templateUrl: './import-texture.component.html',
  styleUrls: ['./import-texture.component.less'],
  providers: [Api]
})
export class ImportTextureComponent implements OnInit {

  FileState: typeof FileState = FileState;

  availableTextures: CardMaterial[] | null = null;

  queuedTextureResources: StatefulWrappedFileType<CardMaterial>[] = [];

  filters = [ContentTypeFilter.BITMAP, new UniqueEntryFilter(this.queuedTextureResources)];

  errorLoadMsg: string | null = null;

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
    console.log('available textures', this.availableTextures);
    // @ts-ignore
    this.availableTextures?.forEach(texture => {
      if (texture.textureSlug === file.name) {
        return texture;
      }
    });
    // @ts-ignore
    this.availableTextures?.forEach(texture => {
      if (Utils.fileNameFor(file.name) === texture.name) {
        texture.textureSlug = file.name;
        return texture;
      }
    });
    return {
      id: -1,
      name: Utils.fileNameFor(file.name),
      textureSlug: file.name,
      tiling: "REPEAT"
    };
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
      },
      error => {
        texture.state = FileState.FAILED;
      }
    );
  }

}
