import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export type Notification = {
    id: number,
    message: string,
    progress?: number,
    type: 'error' | 'warning' | 'success'
} | {
    id: number,
    type: 'cancel'
};

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private static notifications$ = new Subject<Notification>();
    private static counter = 0;

    notifications$ = NotificationService.notifications$.asObservable();

    static addError(reason: HttpErrorResponse) {
        const id = NotificationService.counter++;
        NotificationService.notifications$.next({
            id,
            message: reason.message,
            type: 'error'
        });
        return id;
    }

    constructor() {
        setTimeout(() => {
            this.uploadDisabled();
        }, 2000);
    }

    uploadDisabled() {
        this.add('Corpus Upload is currently disabled because of the PHP2Shell vulnerability; we are working on a fix', 'warning');
    }

    add(message: string, type: Notification['type'] = 'warning', progress?: number) {
        const id = NotificationService.counter++;
        NotificationService.notifications$.next({
            id,
            message,
            type,
            progress
        });
        return id;
    }

    cancel(id: number) {
        NotificationService.notifications$.next({ id, type: 'cancel' });
    }

    cancelAll() {
        NotificationService.notifications$.next({ id: undefined, type: 'cancel' });
    }
}
