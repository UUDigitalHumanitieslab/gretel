import { Injectable } from "@angular/core";
import { HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class HttpClientMock {
    private readonly mockData = {
        'get': {} as MockResponseData<any>,
        'post': {} as MockResponseData<(body: any) => any>
    }

    public setData(method: keyof HttpClientMock['mockData'], url: string, data: any) {
        this.mockData[method][url] = data;
        return this;
    }

    public get<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T> {
        return new Observable<T>(observer => {
            if (url in this.mockData['get']) {
                observer.next(this.mockData['get'][url]);
                observer.complete();
            } else {
                observer.error(`No data available for [GET] ${url}`);
            }
        });
    }

    public post<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T> {
        return new Observable<T>(observer => {
            if (url in this.mockData['post']) {
                observer.next(this.mockData['post'][url](body));
                observer.complete();
            } else {
                observer.error(`No data available for [POST] ${url}`);
            }
        });
    }
}

export type MockResponseData<T> = {
    [url: string]: T
}
