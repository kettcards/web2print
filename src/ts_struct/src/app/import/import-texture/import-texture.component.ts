import {Component, OnInit} from '@angular/core';
import {ContentTypeFilter, FileState, StatefulWrappedFileType, UniqueEntryFilter, Utils} from "../../lib/utils";
import {CardMaterial} from "../../lib/card";
import {MatDialog} from "@angular/material/dialog";
import {Api} from "../../lib/api";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MappingDialogComponent} from "./mapping-dialog/mapping-dialog.component";
import {ImportMenu} from "../import";

@Component({
  selector: 'app-import-texture',
  templateUrl: './import-texture.component.html',
  styleUrls: ['./import-texture.component.less'],
  providers: [Api]
})
export class ImportTextureComponent extends ImportMenu<CardMaterial> implements OnInit {

  availableTextures: CardMaterial[] | null = null;

  filters = [ContentTypeFilter.BITMAP, new UniqueEntryFilter(this.elements)];

  errorLoadMsg: string | null = null;

  constructor(dialog: MatDialog, private api: Api, private snackbar: MatSnackBar) {
    super(dialog);
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

  changeMapping(texture: StatefulWrappedFileType<CardMaterial>): void {
    const ref = this.dialog.open(MappingDialogComponent, {
      data: {
        selected: texture,
        options: this.availableTextures
      }
    });
    ref.afterClosed().subscribe(result => { //TODO ignore cancel closes
      if (result != undefined || result != null) {
        console.log('setting result:', result);
        texture.type = result;
      } else {
        console.log('dialog canceled');
      }
    });
  }

  addMappedFiles(file: File, elements: (CardMaterial | undefined)[]): void {
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

  findName(file: File): (CardMaterial | undefined)[] {
    return [this.findTextureName(file)];
  }

  submit(element: StatefulWrappedFileType<CardMaterial>): void {
    console.log('importing ', element);
    this.api.setTexture(element).subscribe(
      response => {
        element.state = FileState.SUCCESSFUL;
        this.hasSuccessfulFiles = true;
      },
      error => {
        element.state = FileState.FAILED;
      }
    );
  }

}


