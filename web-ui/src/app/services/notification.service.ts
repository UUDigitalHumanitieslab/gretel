import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export type Notification = {
    id: number,
    message: string,
    type: 'error' | 'warning'
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

    addWarning(message: string) {
        const id = NotificationService.counter++;
        NotificationService.notifications$.next({
            id,
            message,
            type: 'warning'
        });
        return id;
    }

    cancel(id: number) {
        NotificationService.notifications$.next({ id, type: 'cancel' });
    }
}
