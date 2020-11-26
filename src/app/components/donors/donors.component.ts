import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DonorService, StorageService, AlertService, Sexes, BloodTypes } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MEDIA_STORAGE_PATH_IMG } from '../../storage.config';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-donor-dialog',
  templateUrl: './dialog/add-donor.html',
  styleUrls: ['./donors.component.scss'],
})
export class AddDonorComponent implements OnInit, OnDestroy{
  addForm: any;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};
  sexes = Sexes.sexes;
  bloodTypes = BloodTypes.bloodTypes;

  destroy$: Subject<null> = new Subject();
  fileToUpload1: File;
  donorPhoto: string | ArrayBuffer;
  submitted = false;
  uploadProgress1$: Observable<number>;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly donorService: DonorService,
    private readonly storageService: StorageService,
    private readonly alertService: AlertService) {}

  ngOnInit() {
    this.addForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName:['', Validators.required],
      mailingAddress: ['', Validators.required],
      email: ['', Validators.required],
      birthday: [ this.dateObject ],
      sex: [''],
      bloodType: [''],
      donorPhoto: [],
      donorPhotoUrl: [],
    });

    this.addForm
      .get('donorPhoto')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newValue) => {
        const {reader , img} = this.handleFileChange(newValue.files)
        this.fileToUpload1 = img;
        reader.onload = (loadEvent) => (this.donorPhoto = loadEvent.target.result);
      });
  }

  addDonor() {
    if (this.addForm.dirty && this.addForm.valid) {
      this.addForm.controls.birthday.setValue(new Date(this.addForm.value.birthday.year,
        this.addForm.value.birthday.month - 1, this.addForm.value.birthday.day));

        this.submitted = true;
        const mediaFolderPath = `${MEDIA_STORAGE_PATH_IMG}`;
        const { downloadUrl$: downloadUrl1$, uploadProgress$: uploadProgress1$ } = this.storageService.uploadFileAndGetMetadata(
          mediaFolderPath, this.fileToUpload1);
        this.uploadProgress1$ = uploadProgress1$;
        this.asyncUpload(downloadUrl1$).then( res => {

          this.addForm.controls.donorPhotoUrl.setValue(res);
          this.donorService.addOne(this.addForm.value);
          this.activeModal.close();
    });
    }
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

  handleFileChange([img]) {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    return {reader , img}
  }

  ngOnDestroy() {
    this.destroy$.next(null);
  }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-donor-dialog',
  templateUrl: './dialog/view-donor.html',
  styleUrls: ['./donors.component.scss'],
})
export class ViewDonorComponent implements OnInit {
  @Input() public value;
  editForm: any;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};
  sexes = Sexes.sexes;
  bloodTypes = BloodTypes.bloodTypes;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly donorService: DonorService) {
  }

  ngOnInit() {
    const recordDate = new Date(this.value.birthday.seconds * 1000)
    this.dateObject = { day: recordDate.getDate(),month:  recordDate.getMonth()+1, year:  recordDate.getFullYear()};
    this.editForm = this.formBuilder.group({
      firstName: [this.value.firstName, Validators.required],
      lastName:[this.value.lastName, Validators.required],
      mailingAddress: [this.value.mailingAddress, Validators.required],
      email: [this.value.email, Validators.required],
      birthday: [ this.dateObject ],
      sex: [this.value.sex],
      bloodType: [this.value.bloodType],
    });
  }

  updateDonor() {
    if (this.editForm.dirty && this.editForm.valid) {
      this.editForm.controls.birthday.setValue(new Date(this.editForm.value.birthday.year,
        this.editForm.value.birthday.month - 1, this.editForm.value.birthday.day));
      this.donorService.updateOne(this.value.id,this.editForm.value);
      this.activeModal.close();
    }
  }

  deleteDonor() {
    this.donorService.delete(this.value.id);
    this.activeModal.close();
  }

}

@Component({
  selector: 'app-donors',
  templateUrl: './donors.component.html',
  styleUrls: ['./donors.component.scss']
})
export class DonorsComponent implements OnInit {

  donor$: Observable<any>;
  constructor(
    private readonly donorService: DonorService,
    private readonly modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.donor$ = this.donorService.getActive();
  }

  trackByFn(index) {
    return index;
  }

  openAddDonor() {
    this.modalService.open(AddDonorComponent,{centered: true, scrollable: true, backdrop: 'static'});

  }

  openViewDonor(value) {
    const modalRef = this.modalService.open(ViewDonorComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;

  }

}



