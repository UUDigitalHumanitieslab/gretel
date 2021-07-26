import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ConfigurationService } from './configuration.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private http: HttpClient,
        private configurationService: ConfigurationService) { }

    async login(email: string, password: string) {
        const loginUrl = await this.configurationService.getUploadApiUrl('../login/submit');
        console.log(loginUrl);

        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        this.http.post(
            loginUrl,
            formData
        ).subscribe(
            (value => console.log(value)),
            (error => console.log(error)));

        return true;
    }
}
