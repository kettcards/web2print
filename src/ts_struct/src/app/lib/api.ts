import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {Pageable, PageRequest} from "./pageable";
import {CardFormat, CardMaterial, CardMotive, CardOverview} from "./card";
import {StatefulWrappedFileType, WrappedFileType} from "./utils";

export interface Web2Print {
  links: {
    basePath : string;
    thumbnailUrl : string;
    textureUrl : string;
    motiveUrl : string;
    fontUrl : string;
    apiUrl : string;
  };
}
export declare const web2print: Web2Print;

@Injectable()
export class Api {

  static apiUrl = web2print.links.apiUrl;

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

  public getTextures(): Observable<CardMaterial[]> {
    return this.http.get<CardMaterial[]>(Api.apiUrl + '/texture');
  }

  public setTexture(texture: WrappedFileType<CardMaterial>): Observable<Object> {
    if (texture.type == undefined)
      throw Error('texture id not set');
    const data = new FormData();
    data.append('file', texture.file);
    return this.http.post(Api.apiUrl + '/texture/' + texture.type.id + '/texture', data);
  }

  public importCardTable(file: File | null): Observable<Object> | null {
    if (file != null) {
      const data: FormData = new FormData();
      data.append('file', file);
      return this.http.post(Api.apiUrl + '/import/table', data);
    }
    return null;
  }

  public importMotive(format: StatefulWrappedFileType<CardMotive>): Observable<Object> | null {
    const data: FormData = new FormData();
    data.append('file', format.file);
    data.append('cards', JSON.stringify(format.additionalAttributes));
    return this.http.post<Object>(Api.apiUrl + '/import/motive', data);
  }

  public importFrontMotive(format: StatefulWrappedFileType<CardMotive>): Observable<Object> | null {
    const data: FormData = new FormData();
    data.append('file', format.file);
    data.append('cards', JSON.stringify(format.additionalAttributes));
    return this.http.post<Object>(Api.apiUrl + '/import/motive/front', data);
  }

  public importBackMotive(format: StatefulWrappedFileType<CardMotive>): Observable<Object> | null {
    const data: FormData = new FormData();
    data.append('file', format.file);
    data.append('cards', JSON.stringify(format.additionalAttributes));
    return this.http.post<Object>(Api.apiUrl + '/import/motive/back', data);
  }

  public importDefaultMotive(format: StatefulWrappedFileType<CardFormat>): Observable<Object> | null {
    const data: FormData = new FormData();
    data.append('file', format.file);
    return this.http.post(Api.apiUrl + '/import/defaultMotive/' + format.type?.id, data);
  }

  public listPdfs(): Observable<string[]> {
    return this.http.get<string[]>(Api.apiUrl + '/pdfs');
  }

  public getFonts(): Observable<string[]> {
    return this.http.get<string[]>(Api.apiUrl + '/fonts');
  }

  saveDefaultFonts(fonts : string[]): Observable<Object> {
    return this.http.post(Api.apiUrl + '/defaultFonts', fonts);
  }
}
