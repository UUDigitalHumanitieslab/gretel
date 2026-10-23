import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'grt-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

    constructor(notificationService: NotificationService) {
        notificationService.uploadDisabled();
    }

    ngOnInit() {
    }

}
