import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../services/notification.service';
import { User, UserService } from '../../../../services/user.service';

@Component({
    selector: 'grt-login-status',
    templateUrl: './login-status.component.html',
    styleUrls: ['./login-status.component.scss']
})
export class LoginStatusComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];

    /**
     * show the drop down menu
     */
    active = false;
    allowLogin = false;
    error = false;
    loading = false;

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
            this.userService.canLogin$.subscribe(canLogin => this.allowLogin = canLogin));
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

        if (this.loginForm.valid) {
            this.loading = true;
            this.error = false;

            if (await this.userService.login(this.loginForm.value.username, this.loginForm.value.password)) {
                this.loginForm.reset();
                this.notificationService.add('Logged in', 'success');
                this.active = false;
            } else {
                this.error = true;
            }
            this.loading = false;
        } else {
            this.error = true;
        }
    }

    async logout() {
        this.loading = true;
        if (await this.userService.logout()) {
            this.notificationService.add('Logged out', 'success');
        } else {
            this.notificationService.add('Something went wrong logging off, try again.', 'error');
        }

        this.active = false;
        this.loading = false;
    }

}
