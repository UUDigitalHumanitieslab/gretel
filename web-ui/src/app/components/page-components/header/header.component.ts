import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'grt-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ 'height': '0' }),
                animate('400ms ease-in-out', style({ 'height': '*' }))
            ]),
            transition(':leave', [
                animate('400ms ease-in-out', style({ 'height': '0' }))
            ])
        ])
    ]
})
export class HeaderComponent implements OnDestroy, OnInit {
    private subscriptions: Subscription[] = [];
    private messageId: number;
    message: string;
    messageType: 'is-warning' | 'is-error';
    show = false;

    constructor(private notificationService: NotificationService, private ngZone: NgZone) {
    }

    ngOnInit() {
        this.subscriptions = [
            this.notificationService.notifications$.subscribe(notification => {
                switch (notification.type) {
                    case 'cancel':
                        if (this.messageId === notification.id) {
                            this.show = false;
                        }
                        return;

                    case 'error':
                        this.messageType = 'is-error';
                        break;

                    case 'warning':
                        this.messageType = 'is-warning';
                        // hide the warning after some time
                        setTimeout(() => {
                            this.ngZone.run(() => {
                                if (this.messageId === notification.id) { this.show = false; }
                            });
                        }, 5000);
                        break;
                }
                this.message = notification.message;
                this.messageId = notification.id;
                this.show = true;
            })
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
