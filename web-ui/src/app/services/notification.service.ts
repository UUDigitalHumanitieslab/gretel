import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export type Notification = {
    id: number,
    message: string,
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

    add(message: string, type: Notification['type'] = 'warning') {
        const id = NotificationService.counter++;
        NotificationService.notifications$.next({
            id,
            message,
            type
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
