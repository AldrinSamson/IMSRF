import { Component, OnInit} from '@angular/core';
import { UserService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'change-password-dialog',
  templateUrl: './dialog/change-password.html',
  styleUrls: ['./profile.component.scss'],
})
export class ChangePasswordComponent {
  passwordForm: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly userService: UserService) {
    this.passwordForm = this.formBuilder.group({
      oldPassword: ['' , Validators.required],
      newPassword: ['', Validators.required],
      newPasswordConfirm: ['', Validators.required]
    });
  }

  changePassword() {
    if (this.passwordForm.dirty && this.passwordForm.valid) {
      this.userService.updateCurrentUserPassword(this.passwordForm.value);
      this.activeModal.close();
    }
  }

}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  editForm: any;
  userDetails;
  isPartnerUser = false;
  route = '/main'

  constructor(
    private readonly userService: UserService,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {

    this.userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    if( this.userDetails.position === 'Partner') {
      this.isPartnerUser = true;
      this.route = '/partner'
    }

    this.editForm = this.formBuilder.group({
      firstName: [this.userDetails.firstName, [Validators.required]],
      lastName: [this.userDetails.lastName, [Validators.required]],
      fullName: [this.userDetails.fullName],
      contactNumber: [this.userDetails.contactNumber, [Validators.required, Validators.max(12)]],
      institutionName: [this.userDetails.institutionName],
      partnerID: [this.userDetails.partnerID],
    });
  }

  editUser() {
    if (this.editForm.dirty && this.editForm.valid) {
      this.userService.updateOne(this.userDetails.id , this.editForm.value);
    }
  }

  openChangePassword() {
    this.modalService.open(ChangePasswordComponent,{centered: true, scrollable: true, backdrop: 'static'});
  }

}
