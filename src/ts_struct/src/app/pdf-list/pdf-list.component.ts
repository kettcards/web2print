import { Component, OnInit } from '@angular/core';
import {Api, Web2Print} from "../lib/api";

@Component({
  selector: 'app-pdf-list',
  templateUrl: './pdf-list.component.html',
  styleUrls: ['./pdf-list.component.scss'],
  providers: [Api]
})
export class PdfListComponent implements OnInit {

  declare web2print: Web2Print;

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
