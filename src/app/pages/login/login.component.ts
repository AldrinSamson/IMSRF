import { Component , Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, ValidationService } from '@shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  {

  loginForm: any;

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, ValidationService.emailValidator]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.dirty && this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).then(() => {
      });
    }
  }


}
