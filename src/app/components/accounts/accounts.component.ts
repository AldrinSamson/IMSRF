import { Component, OnInit, Input,  OnDestroy} from '@angular/core';
import { UserService, AlertService, ValidationService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AbstractControl } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { AuthService, StorageService, UtilService } from '@shared';
import { MEDIA_STORAGE_PATH_IMG , DEFAULT_PROFILE_PIC } from '../../storage.config';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-user-dialog',
  templateUrl: './dialog/add-user.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AddUserComponent implements OnInit, OnDestroy{
  addForm: any;
  destroy$: Subject<null> = new Subject();
  fileToUpload: File;
  profileImagePreview: string | ArrayBuffer;
  submitted = false;
  uploadProgress$: Observable<number>;
  @Input() isPartnerUser: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly formBuilder: FormBuilder,
    private readonly storageService: StorageService,
    private readonly utilService: UtilService,
    private readonly alertService: AlertService,
    private readonly activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {

    this.addForm = this.formBuilder.group({
      uid: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      fullName: [''],
      email: ['', [Validators.required]],
      password: ['', [Validators.required, ValidationService.passwordValidator]],
      contactNumber: ['', [Validators.required]],
      photo: ['', [ this.image.bind(this)]],
      photoUrl: [''],
      position: [''],
      institutionName: [''],
      partnerID: [''],
      dateCreated: [new Date()],
      dateLastModified:[new Date()],
      createdBy: ['admin'],
      lastModifiedBy: ['admin']
    });

    this.addForm
      .get('photo')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newValue) => {
        this.handleFileChange(newValue.files);
      });
  }

  handleFileChange([img]) {
    this.fileToUpload = img;
    const reader = new FileReader();
    reader.onload = (loadEvent) => (this.profileImagePreview = loadEvent.target.result);
    reader.readAsDataURL(img);
  }

  addUser() {
    this.submitted = true;
    const mediaFolderPath = `${MEDIA_STORAGE_PATH_IMG}`;
    this.addForm.controls.fullName.setValue(this.addForm.value.firstName + ' ' + this.addForm.value.lastName)

    if(this.isPartnerUser === false) {
      this.addForm.controls.partnerID.setValue('N/A');
      this.addForm.controls.institutionName.setValue('The Red Bank Foundation');
    } else {
      this.addForm.controls.position.setValue('Partner');
    }

    if(this.fileToUpload === null) {

      this.addForm.controls.photoUrl.setValue(DEFAULT_PROFILE_PIC);
      this.userService.addOne(this.addForm.value)
      this.submitted = false;
      this.activeModal.close();

    } else {

      const { downloadUrl$, uploadProgress$ } = this.storageService.uploadFileAndGetMetadata(
        mediaFolderPath,
        this.fileToUpload,
      );

      this.uploadProgress$ = uploadProgress$;

      downloadUrl$
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            this.alertService.showToaster(`${error.message}` , { classname: 'bg-warning text-light', delay: 10000 });
            return EMPTY;
          }),
        )
        .subscribe((downloadUrl) => {
          this.addForm.controls.photoUrl.setValue(downloadUrl);
          this.userService.addOne(this.addForm.value)
          this.submitted = false;
          this.activeModal.close();
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }

  // Move to Validators
  private image(photoControl: AbstractControl): { [key: string]: boolean } | null {
    if (photoControl.value) {
      const [img] = photoControl.value.files;
      return this.utilService.validateFile(img)
        ? null
        : {
            image: true,
          };
    }
    return;
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-user-dialog',
  templateUrl: './dialog/view-user.html',
  styleUrls: ['./accounts.component.scss'],
})
export class ViewUserComponent implements OnInit{
  editForm: any;
  @Input() isPartnerUser: boolean;
  @Input() value;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly formBuilder: FormBuilder,
    private readonly storageService: StorageService,
    private readonly utilService: UtilService,
    private readonly alertService: AlertService,
    private readonly activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {

    this.editForm = this.formBuilder.group({
      firstName: [this.value.firstName, [Validators.required]],
      lastName: [this.value.lastName, [Validators.required]],
      fullName: [this.value.fullName],
      contactNumber: [this.value.contactNumber, [Validators.required]],
      institutionName: [this.value.institutionName],
      partnerID: [this.value.partnerID],
    });
  }

  // handleFileChange([img]) {
  //   this.fileToUpload = img;
  //   const reader = new FileReader();
  //   reader.onload = (loadEvent) => (this.profileImagePreview = loadEvent.target.result);
  //   reader.readAsDataURL(img);
  // }

  editUser() {
    this.userService.updateOne(this.value.id , this.editForm.value);
  }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'change-password-dialog',
  templateUrl: './dialog/change-password.html',
  styleUrls: ['./accounts.component.scss'],
})
export class ChangePasswordComponent {
  addForm: any;

  constructor(private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private userService: UserService) {
    this.addForm = this.formBuilder.group({
      institutionName: ['', Validators.required]
    });
  }

  addUser() {
    if (this.addForm.dirty && this.addForm.valid) {
      this.activeModal.close();
    }
  }

}

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  partner$: Observable<any>;
  staff$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly userService: UserService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.staff$ = this.userService.getStaff();
    this.partner$ = this.userService.getPartner();
  }

  trackByFn(index) {
    return index;
  }

  openAddUser(isPartnerUser) {
    const modalRef = this.modalService.open(AddUserComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.isPartnerUser = isPartnerUser;
  }

  openViewUser(value , isPartnerUser) {
    const modalRef = this.modalService.open(ViewUserComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.isPartnerUser = isPartnerUser;
    modalRef.componentInstance.value = value;
  }

}
