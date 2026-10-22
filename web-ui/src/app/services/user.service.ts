import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

type UserResponseSuccess = {
    id: string;
    logged_in: true;
    username: string;
}

type UserResponseFailure = {
    logged_in: false
}

type UserResponse = UserResponseSuccess | UserResponseFailure;

class InternalUser {
    id: number;
    displayName: string;
    username: string;

    constructor(response: UserResponseSuccess) {
        this.id = parseInt(response.id);
        this.displayName = response.username;
        this.username = response.username;
    }
};


export type User = {
    [key in keyof InternalUser]: InternalUser[key]
}


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user$: BehaviorSubject<User>;
    private _canLogIn$ = new BehaviorSubject<boolean>(environment.showSamlLogin);

    constructor(
        private http: HttpClient,
        private configurationService: ConfigurationService,
        private notificationService: NotificationService) { }

    public get user$() {
        if (this._user$) {
            return this._user$.asObservable();
        }

        this._user$ = new BehaviorSubject<User>(undefined);
        this.retrieveCurrent();
        return this._user$;
    }

    public get canLogin$() {
        return this._canLogIn$.asObservable();
    }

    /**
     * Retrieve the current user or set it to undefined
     */
    private async retrieveCurrent(): Promise<boolean> {
        const currentUrl = await this.configurationService.getDjangoUrl('api/users/current/');

        let response: UserResponse = await firstValueFrom(this.http.get(currentUrl, { withCredentials: true }))
            .catch((error: HttpErrorResponse) => null);

        if (response) {
            this._canLogIn$.next(true);

            if (!response.logged_in && response['id']) {
                // not set on server
                response.logged_in = true;
            }
        }

        return this.setUser(response);
    }

    /**
     * Redirects the user to login with SAML
     */
    login(): void {
        window.location.href = '/saml/login/';
    }

    /**
     * Logs the user out, returns true if successful
     */
    logout(): void {
        window.location.href = '/saml/logout/';
    }

    private setUser(response: UserResponse): boolean {
        if (!this._user$) {
            this._user$ = new BehaviorSubject<User>(undefined);
        }

        const user = response?.logged_in ? new InternalUser(response) : undefined;
        this._user$.next(user);

        return response?.logged_in ?? false;
    }
}
