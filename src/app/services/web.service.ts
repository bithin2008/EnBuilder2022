import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class WebService {
    token: any;
    headersObj: any;
    options: any;
    constructor(
        private _http: HttpClient
    ) {
    }
    getHeader() {
        this.token = localStorage.getItem("token");
        this.headersObj = new HttpHeaders()
            .set("Content-Type", "application/json; charset=utf-8")
            .set("Authorization", 'Bearer ' + this.token);
        let header = {
            headers: this.headersObj
        }
        return header;
    }
    getFileHeader() {
        this.token = localStorage.getItem("token");
        this.headersObj = new HttpHeaders()
            .set("Authorization", 'Bearer ' + this.token);
        let header = {
            headers: this.headersObj
        }
        return header;
    }
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        return throwError(
            'Something bad happened; please try again later.');
    };
    get(url: any): Observable<any> {
        return this._http.get(
            environment.API_ENDPOINT + url, this.getHeader()
        ).pipe(
            catchError(this.handleError)
        );
    }
    post(url: any, data: any): Observable<any> {
        return this._http.post(
            environment.API_ENDPOINT + url, data, this.getHeader()
        )
            .pipe(
                catchError(this.handleError)
            );
    }
    checklogin(data: any, url: any) {
        return this._http.post(
            environment.API_ENDPOINT + url, data
        ).pipe(
            catchError(this.handleError));
    }
    login(data: any, url: any) {
        return this._http.post(
            environment.API_ENDPOINT + url, data
        ).pipe(
            catchError(this.handleError)
        );
    }
    fileUpload(URL: any, data: any): Observable<any> {
        return this._http.post(
            environment.API_ENDPOINT + URL, data, this.getFileHeader()
        )
            .pipe(
                catchError(this.handleError)
            );
    }
    fileUploadPut(URL: any, data: any): Observable<any> {
        return this._http.put(
            environment.API_ENDPOINT + URL, data, this.getFileHeader()
        )
            .pipe(
                catchError(this.handleError)
            );
    }
    delete(url: any): Observable<any> {
        return this._http.delete(
            environment.API_ENDPOINT + url, this.getHeader()
        )
            .pipe(
                catchError(this.handleError)
            );
    }
    put(url: any, data: any): Observable<any> {
        return this._http.put(
            environment.API_ENDPOINT + url, data, this.getHeader()
        )
            .pipe(
                catchError(this.handleError)
            );
    }

    getLookupData(url: any, keys: any): Observable<any> {

        //requests
        const desiredProjects = this._http.get(`${environment.API_ENDPOINT}${url}?type=${keys[0]}`).pipe(
            map((response: any) => { return response.results }),
            catchError((error: any) => { return of(null) }));

        const desiredUnitTypes = this._http.get(`${environment.API_ENDPOINT}${url}?type=${keys[1]}`).pipe(
            map((response: any) => { return response.results }),
            catchError((error: any) => { return of(null) }));

        const desiredPriceRange = this._http.get(`${environment.API_ENDPOINT}${url}?type=${keys[2]}`).pipe(
            map((response: any) => { return response.results }),
            catchError((error: any) => { return of(null) }));

        const howDidYouHere = this._http.get(`${environment.API_ENDPOINT}${url}?type=${keys[3]}`).pipe(
            map((response: any) => { return response.results }),
            catchError((error: any) => { return of(null) }));

        return forkJoin([desiredProjects, desiredUnitTypes, desiredPriceRange, howDidYouHere]);
    }
}
