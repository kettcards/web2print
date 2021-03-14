import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {Api} from "../../lib/api";

@Component({
  selector: 'app-font-config',
  templateUrl: './font-config.component.html',
  styleUrls: ['./font-config.component.scss'],
  providers: [Api],
})

export class FontConfigComponent implements OnInit {

  //@ts-ignore
  fonts: string[];

  constructor(private api : Api) { }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fonts, event.previousIndex, event.currentIndex);
  }

  ngOnInit(): void {
    this.api.getFonts().subscribe(next => {
      this.fonts = next;
    });
  }

  buttonClicked(): void {
    this.api.saveDefaultFonts(this.fonts).subscribe();
  }

}
