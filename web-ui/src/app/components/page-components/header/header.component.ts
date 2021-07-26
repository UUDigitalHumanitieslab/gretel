import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { animations } from '../../../animations';

@Component({
    selector: 'grt-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    animations
})
export class HeaderComponent implements OnDestroy, OnInit {
    private subscriptions: Subscription[] = [];
    private messageId: number;
    message: string;
    messageType: 'is-warning' | 'is-danger';
    menuExpanded = false;
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
                        this.messageType = 'is-danger';
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
