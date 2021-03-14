import { Component, OnInit } from '@angular/core';
import {Api, Web2Print} from "../lib/api";
declare const web2print: Web2Print;
@Component({
  selector: 'app-pdf-list',
  templateUrl: './pdf-list.component.html',
  styleUrls: ['./pdf-list.component.scss'],
  providers: [Api]
})
export class PdfListComponent implements OnInit {

  // @ts-ignore
  web2print: Web2Print;

  elements: string[] = [];

  constructor(private api: Api) { }

  ngOnInit(): void {
    this.loadList();
    this.web2print = web2print;
  }

  loadList(): void {
    this.api.listPdfs().subscribe(next => {
      this.elements = next;
    });
  }

  open(element: string): void {
    window.open(web2print.links.apiUrl + "pdfs/" + element, "_blank")
  }

}
