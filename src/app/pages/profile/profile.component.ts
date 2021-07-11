import { Component, OnInit} from '@angular/core';
import { UserService , ValidationService} from '@shared';
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
      oldPassword: ['' , [Validators.required,ValidationService.passwordValidator]],
      newPassword: ['', [Validators.required,ValidationService.passwordValidator]],
      newPasswordConfirm: ['', [Validators.required,ValidationService.passwordValidator]]
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
  userDetailsid;
  isPartnerUser = false;
  route = '/main'

  constructor(
    private readonly userService: UserService,
    private readonly formBuilder: FormBuilder,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {

    this.userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    this.userDetailsid = JSON.parse(sessionStorage.getItem('session-user-details-doc-id'));
    if( this.userDetails.position === 'Partner') {
      this.isPartnerUser = true;
      this.route = '/partner'
    }

    this.editForm = this.formBuilder.group({
      firstName: [this.userDetails.firstName, [Validators.required]],
      lastName: [this.userDetails.lastName, [Validators.required]],
      fullName: [this.userDetails.fullName],
      contactNumber: [this.userDetails.contactNumber, [Validators.required]],
      institutionName: [this.userDetails.institutionName],
      partnerID: [this.userDetails.partnerID],
    });
  }

  editUser() {
    if (this.editForm.dirty && this.editForm.valid) {
      this.editForm.controls.fullName.setValue(this.editForm.value.firstName + this.editForm.value.lastName);
      this.userService.updateOne(this.userDetailsid , this.editForm.value, this.userDetails.uid);
    }

    
  }

  openChangePassword() {
    this.modalService.open(ChangePasswordComponent,{centered: true, scrollable: true, backdrop: 'static'});
  }

}
