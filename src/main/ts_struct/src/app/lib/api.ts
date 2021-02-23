import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {Pageable, PageRequest} from "./pageable";
import {CardFormat, CardMaterial, CardOverview} from "./card";
import {WrappedFileType} from "./utils";

@Injectable()
export class Api {

  static apiUrl = 'http://localhost:8080/web2print/api';

  constructor(private http: HttpClient) {
  }

  public getCardOverview(pageRequest?: PageRequest): Observable<Pageable<CardOverview>> {
    console.log('requesting: ', pageRequest);
    if (pageRequest != undefined) {
      return this.http.get<Pageable<CardOverview>>(Api.apiUrl + '/cards?page='
        + pageRequest.currentPage + '&size=' + pageRequest.pageSize);
    } else {
      return this.http.get<Pageable<CardOverview>>(Api.apiUrl + '/cards');
    }
  }

  public getCardFormats(): Observable<CardFormat[]> {
    return this.http.get<CardFormat[]>(Api.apiUrl + '/format');
  }

  public setTexture(texture: WrappedFileType<CardMaterial>): void {
    //TODO impl
  }

  public importCardTable(file: File | null): Observable<Object> | null {
    if (file != null) {
      const data: FormData = new FormData();
      data.append('file', file);
      let ret = this.http.post<ApiResponse>(Api.apiUrl + '/import/table', data);
      ret.subscribe(next => {
        console.log(next)
      }, error => {
        console.log(error.message)
      }, () => console.log('request finished'));
      return ret;
    }
    return null;
  }

  public importMotive(file: File): void {

  }

}

export interface ApiResponse {
  uff: string;
}
