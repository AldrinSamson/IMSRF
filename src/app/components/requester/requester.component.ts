import { Component, OnInit, Input,OnDestroy} from '@angular/core';
import { RequesterService, AlertService, StorageService, UtilService, Sexes, AuthService } from '@shared';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable,Subject, EMPTY } from 'rxjs';
import {catchError, takeUntil} from 'rxjs/operators';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { MEDIA_STORAGE_PATH_IMG , DEFAULT_PROFILE_PIC } from '../../storage.config';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-requester-dialog',
  templateUrl: './dialog/add-requester.html',
  styleUrls: ['./requester.component.scss']
})
export class AddRequesterComponent implements OnInit, OnDestroy{
  addForm: any;
  sexes = Sexes.sexes;

  dateObject: NgbDateStruct;
  date: {year: number, month: number};

  destroy$: Subject<null> = new Subject();
  fileToUpload1: File;
  requesterPhoto: string | ArrayBuffer;
  submitted = false;
  uploadProgress1$: Observable<number>;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly requesterService: RequesterService,
    private readonly storageService: StorageService,
    private readonly utilService: UtilService,
    private readonly alertService: AlertService) {
  }

  ngOnInit() {
    this.addForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      fullName: [],
      mailingAddress: ['', Validators.required],
      email: ['', Validators.required],
      contactNumber: ['', Validators.required],
      password: ['', Validators.required],
      birthday: [this.dateObject, Validators.required],
      sex: ['', Validators.required],
      requesterPhoto: ['', [ this.image.bind(this)]],
      requesterPhotoUrl: [],
    });

    this.addForm
      .get('requesterPhoto')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newValue) => {
        const {reader , img} = this.handleFileChange(newValue.files)
        this.fileToUpload1 = img;
        reader.onload = (loadEvent) => (this.requesterPhoto = loadEvent.target.result);
      });
  }

  async asyncUpload (downloadUrl$) {
    return new Promise(
      (resolve, reject) => {
        downloadUrl$
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            this.alertService.showToaster(`${error.message}` , { classname: 'bg-warning text-light', delay: 10000 });
            return EMPTY;
          }),
        )
        .subscribe(async (downloadUrl) => {
          this.submitted = false;
          resolve(downloadUrl)
        });
      });
  }

  addRequester() {
    this.addForm.controls.fullName.setValue(this.addForm.value.firstName + ' ' + this.addForm.value.lastName)
    this.addForm.controls.birthday.setValue(new Date(this.addForm.value.birthday.year,
      this.addForm.value.birthday.month - 1, this.addForm.value.birthday.day));

    this.submitted = true;
    const mediaFolderPath = `${MEDIA_STORAGE_PATH_IMG}`;
    const { downloadUrl$: downloadUrl1$, uploadProgress$: uploadProgress1$ } = this.storageService.uploadFileAndGetMetadata(
      mediaFolderPath, this.fileToUpload1);
    this.uploadProgress1$ = uploadProgress1$;
    this.asyncUpload(downloadUrl1$).then( res => {
      this.addForm.controls.requesterPhotoUrl.setValue(res);
      this.submitted = true;
      this.requesterService.addOne(this.addForm.value);
      this.activeModal.close();
    })
  }

  handleFileChange([img]) {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    return {reader , img}
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
  selector: 'view-requester-dialog',
  templateUrl: './dialog/view-requester.html',
  styleUrls: ['./requester.component.scss']
})
export class ViewRequesterComponent implements OnInit{
  editForm: any;
  @Input() value;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly requesterService: RequesterService,) {
  }

  ngOnInit() {
    const recordDate = new Date(this.value.birthday.seconds * 1000)
    this.dateObject = { day: recordDate.getDate(),month:  recordDate.getMonth()+1, year:  recordDate.getFullYear()};
    this.editForm = this.formBuilder.group({
      requesterID:[this.value.requesterID],
      firstName: [this.value.firstName, Validators.required],
      lastName: [this.value.lastName, Validators.required],
      fullName: [],
      mailingAddress: [this.value.mailingAddress, Validators.required],
      birthday: [this.dateObject, Validators.required],
      sex: [this.value.sex, Validators.required]
    });

  }

  editRequester() {
    this.editForm.controls.fullName.setValue(this.editForm.value.firstName + ' ' + this.editForm.value.lastName)
    this.editForm.controls.birthday.setValue(new Date(this.editForm.value.birthday.year,
      this.editForm.value.birthday.month - 1, this.editForm.value.birthday.day));

    this.requesterService.updateOne(this.value.id,this.editForm.value)
    this.activeModal.close();
  }

  activateRequester() {
    this.editForm.controls.fullName.setValue(this.editForm.value.firstName + ' ' + this.editForm.value.lastName)
    this.requesterService.activate(this.value.id, this.editForm.value)
    this.activeModal.close();
  }

  deactivateRequester() {
    this.editForm.controls.fullName.setValue(this.editForm.value.firstName + ' ' + this.editForm.value.lastName)
    this.requesterService.deactivate(this.value.id, this.editForm.value)
    this.activeModal.close();
  }

  deleteRequester() {
   this.editForm.controls.fullName.setValue(this.editForm.value.firstName + ' ' + this.editForm.value.lastName)
   this.requesterService.delete(this.value.id, this.editForm.value);
   this.activeModal.close();
  }
}


@Component({
  selector: 'app-requester',
  templateUrl: './requester.component.html',
  styleUrls: ['./requester.component.scss']
})
export class RequesterComponent implements OnInit {

  requester$: Observable<any>;
  deactivated$: Observable<any>;
  p1;
  p2
  searchText1;
  searchText2;

  constructor(
    private readonly modalService: NgbModal,
    private readonly requesterService: RequesterService,
    private readonly authService: AuthService ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.requester$ = this.requesterService.getActive();
    this.deactivated$ = this.requesterService.getDeactivated();
  }

  trackByFn(index) {
    return index;
  }

  openAddRequester() {
    this.modalService.open(AddRequesterComponent,{centered: true, scrollable: true, backdrop: 'static'});
  }

  openViewRequester(value) {
    const modalRef = this.modalService.open(ViewRequesterComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
  }

}
