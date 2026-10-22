import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../services/notification.service';
import { User, UserService } from '../../../../services/user.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'grt-login-status',
    templateUrl: './login-status.component.html',
    styleUrls: ['./login-status.component.scss']
})
export class LoginStatusComponent implements OnInit, OnDestroy {
    faUser = faUser;
    faUsers = faUsers;

    subscriptions: Subscription[] = [];

    /**
     * show the drop down menu
     */
    active = false;
    allowLogin = environment.showSamlLogin;
    error = false;
    loading = false;
    showSamlLogin = environment.showSamlLogin;
    user: User;

    loginForm = this.formBuilder.group({
        username: '',
        password: ''
    });

    constructor(private elementRef: ElementRef,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.subscriptions.push(
            this.userService.user$.subscribe(user => this.user = user),
            this.userService.canLogin$.subscribe(canLogin => this.allowLogin));
    }

    ngOnDestroy(): void {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    @HostListener('document:click', ['$event'])
    clickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.active = false;
        }
    }

    toggleActive() {
        this.active = !this.active;
        if (this.active) {
            // notifications overlap the menu
            this.notificationService.cancelAll()
        }
    }

    async login() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.active = false;
        this.notificationService.add('Logging in...', 'info');
        this.userService.login();
    }

    async logout() {
        this.loading = true;
        this.active = false;
        this.notificationService.add('Logging off...', 'info');
        this.userService.logout();
    }

}
