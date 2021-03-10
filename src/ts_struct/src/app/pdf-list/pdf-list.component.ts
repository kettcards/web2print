import { Component, OnInit } from '@angular/core';
import {Api} from "../lib/api";

@Component({
  selector: 'app-pdf-list',
  templateUrl: './pdf-list.component.html',
  styleUrls: ['./pdf-list.component.less'],
  providers: [Api]
})
export class PdfListComponent implements OnInit {

  elements: string[] = [];

  constructor(private api: Api) { }

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.api.listPdfs().subscribe(next => {
      this.elements = next;
    });
  }

}
