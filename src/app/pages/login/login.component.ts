import { Component , Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, ValidationService } from '@shared';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line:component-selector
  selector : 'forgot-password',
  templateUrl : './dialog/forgot-password.html',
  styleUrls: ['./login.component.scss'],
})

export class PasswordResetDialogComponent implements OnInit{

  @Input() value;
  email = '';

  constructor(
    public readonly activeModal: NgbActiveModal,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.email = this.value
  }

  sendResetEmail() {
    this.authService.sendUserPasswordResetEmailForgot(this.email);
    this.activeModal.close();
  }
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  {

  loginForm: any;

  constructor(private authService: AuthService,
    private formBuilder: FormBuilder,
    private readonly modalService: NgbModal
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, ValidationService.emailValidator]],
      password: ['', [Validators.required,ValidationService.passwordValidator]]
    });
  }

  login() {
    if (this.loginForm.dirty && this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password).then(() => {
      });
    }
  }

  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.login();
    }
  }

  openForgotPassword() {
    const modalRef = this.modalService.open(PasswordResetDialogComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = this.loginForm.value.email;
  }


}
