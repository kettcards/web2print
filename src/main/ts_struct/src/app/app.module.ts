import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ImportTextureComponent} from './import/import-texture/import-texture.component';
import {ImportMotiveComponent} from './import/import-motive/import-motive.component';
import {ImportTableComponent} from './import/import-table/import-table.component';
import {ImportMotiveDefaultComponent} from './import/import-motive-default/import-motive-default.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RouterModule, Routes} from "@angular/router";
import {MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {DropZoneComponent} from './lib/upload/drop-zone/drop-zone.component';
import {ErrorDialogComponent} from './lib/error-dialog/error-dialog.component';
import {DropControlsComponent} from './lib/upload/drop-controls/drop-controls.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

const routes: Routes = [
  {path: '', redirectTo: 'cards', pathMatch: 'full'},
  {path: 'import-table', component: ImportTableComponent},
  {path: 'import-motive', component: ImportMotiveComponent},
  {path: 'import-motive-default', component: ImportMotiveDefaultComponent},
  {path: 'import-texture', component: ImportTextureComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    ImportTextureComponent,
    ImportMotiveComponent,
    ImportTableComponent,
    ImportMotiveDefaultComponent,
    DropZoneComponent,
    ErrorDialogComponent,
    DropControlsComponent
  ],
  imports: [
    RouterModule.forRoot(routes, {useHash: true}),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  exports: [
    RouterModule,
    MatSnackBarModule
  ],
  providers: [
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
