import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'grt-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.scss']
})
export class LoginStatusComponent implements OnInit {
  showLogin = false;
  loggingIn = false;
  error = false;

  loginForm = this.formBuilder.group({
    email: '',
    password: ''
  });

  constructor(private formBuilder: FormBuilder, private userService: UserService) { }

  ngOnInit(): void {
  }

  login() {
    if (this.loggingIn) {
      return;
    }

    if (this.loginForm.valid) {
      this.loggingIn = true;
      this.error = false;
      this.userService.login(this.loginForm.value.email, this.loginForm.value.password);
      this.loginForm.reset();
    } else {
      this.error = true;
    }
  }

}
