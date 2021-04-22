import { Component, OnInit, Input,  OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DispatchService, PartnerService, AlertService, BloodTypes, InventoryService,
  Partner, StorageService, UtilService, AuthService, Sexes } from '@shared';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription, Subject, merge, EMPTY } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter, catchError, takeUntil} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbTypeahead, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { MEDIA_STORAGE_PATH_IMG , DEFAULT_PROFILE_PIC } from '../../storage.config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'validate-order-dialog',
  templateUrl: './dialog/validate-order.html',
  styleUrls: ['./dispatch.component.scss'],
})
export class ValidateOrderComponent {
  claimForm: any;
  @Input() claimCode;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly alertService: AlertService) {
    this.claimForm = this.formBuilder.group({
      claimCode: ['', Validators.required]
    });
  }

  validate() {
    if (this.claimForm.dirty && this.claimForm.valid) {
      if (this.claimForm.value.claimCode === this.claimCode) {
        const passBack = {
          claimCodeEntered: this.claimForm.value.claimCode,
          isValidated : true
        }
        this.activeModal.close(passBack);
      }else{
        this.alertService.showToaster('Invalid Code, Try Again' , { classname: 'bg-danger text-light', delay: 10000 })
      }
    }
  }

}

// @Component({
//   // tslint:disable-next-line: component-selector
//   selector: 'add-request-dialog',
//   templateUrl: './dialog/add-request.html',
//   styleUrls: ['./dispatch.component.scss'],
// })
// export class AddRequestComponent implements OnInit, OnDestroy{
//   addForm: any;
//   sexes = Sexes.sexes;

//   dateObject: NgbDateStruct;
//   date: {year: number, month: number};

//   destroy$: Subject<null> = new Subject();
//   fileToUpload1: File;
//   fileToUpload2: File;
//   requesterPhoto: string | ArrayBuffer;
//   patientDiagnosisPhoto: string | ArrayBuffer;
//   submitted = false;
//   uploadProgress1$: Observable<number>;
//   uploadProgress2$: Observable<number>;

//   constructor(
//     private readonly formBuilder: FormBuilder,
//     public readonly activeModal: NgbActiveModal,
//     private readonly dispatchService: DispatchService,
//     private readonly storageService: StorageService,
//     private readonly utilService: UtilService,
//     private readonly alertService: AlertService) {
//   }

//   ngOnInit() {
//     this.addForm = this.formBuilder.group({
//       firstName: ['', Validators.required],
//       lastName: ['', Validators.required],
//       fullName: [],
//       mailingAddress: ['', Validators.required],
//       email: ['', Validators.required],
//       birthday: [this.dateObject],
//       sex: ['', Validators.required],
//       requesterPhoto: ['', [ this.image.bind(this)]],
//       requesterPhotoUrl: [],
//       patientName: ['', Validators.required],
//       hospitalName: ['', Validators.required],
//       patientDiagnosis: ['', Validators.required],
//       patientBloodType: ['', Validators.required],
//       patientBloodComponent: ['', Validators.required],
//       patientBloodUnits: ['', Validators.required],
//       patientDiagnosisPhoto: ['', [ this.image.bind(this)]],
//       patientDiagnosisPhotoUrl: [''],
//     });

//     this.addForm
//       .get('requesterPhoto')
//       .valueChanges.pipe(takeUntil(this.destroy$))
//       .subscribe((newValue) => {
//         const {reader , img} = this.handleFileChange(newValue.files)
//         this.fileToUpload1 = img;
//         reader.onload = (loadEvent) => (this.requesterPhoto = loadEvent.target.result);
//       });

//     this.addForm
//       .get('patientDiagnosisPhoto')
//       .valueChanges.pipe(takeUntil(this.destroy$))
//       .subscribe((newValue) => {
//         const {reader , img} = this.handleFileChange(newValue.files)
//         this.fileToUpload2 = img;
//         reader.onload = (loadEvent) => (this.patientDiagnosisPhoto = loadEvent.target.result);
//       });
//   }

//   async asyncUpload (downloadUrl$) {
//     return new Promise(
//       (resolve, reject) => {
//         downloadUrl$
//         .pipe(
//           takeUntil(this.destroy$),
//           catchError((error) => {
//             this.alertService.showToaster(`${error.message}` , { classname: 'bg-warning text-light', delay: 10000 });
//             return EMPTY;
//           }),
//         )
//         .subscribe(async (downloadUrl) => {
//           this.submitted = false;
//           resolve(downloadUrl)
//         });
//       });
//   }

//   addRequest() {
//     this.addForm.controls.fullName.setValue(this.addForm.value.firstName + ' ' + this.addForm.value.lastName)
//     this.addForm.controls.birthday.setValue(new Date(this.addForm.value.birthday.year,
//       this.addForm.value.birthday.month - 1, this.addForm.value.birthday.day));

//     this.submitted = true;
//     const mediaFolderPath = `${MEDIA_STORAGE_PATH_IMG}`;
//     const { downloadUrl$: downloadUrl1$, uploadProgress$: uploadProgress1$ } = this.storageService.uploadFileAndGetMetadata(
//       mediaFolderPath, this.fileToUpload1);
//     this.uploadProgress1$ = uploadProgress1$;
//     this.asyncUpload(downloadUrl1$).then( res => {

//       this.addForm.controls.requesterPhotoUrl.setValue(res);

//       this.submitted = true;
//       const { downloadUrl$: downloadUrl2$, uploadProgress$: uploadProgress2$ } = this.storageService.uploadFileAndGetMetadata(
//         mediaFolderPath, this.fileToUpload2);
//       this.uploadProgress2$ = uploadProgress2$;
//       this.asyncUpload(downloadUrl2$).then( res2 => {

//         this.addForm.controls.patientDiagnosisPhotoUrl.setValue(res2);
//         this.dispatchService.createRequest(this.addForm.value);
//         this.activeModal.close();
//      });
//     })
//   }

//   handleFileChange([img]) {
//     const reader = new FileReader();
//     reader.readAsDataURL(img);
//     return {reader , img}
//   }

//   ngOnDestroy() {
//     this.destroy$.next(null);
//   }

//   // Move to Validators
//   private image(photoControl: AbstractControl): { [key: string]: boolean } | null {
//     if (photoControl.value) {
//       const [img] = photoControl.value.files;
//       return this.utilService.validateFile(img)
//         ? null
//         : {
//             image: true,
//           };
//     }
//     return;
//   }

// }

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-order-dialog',
  templateUrl: './dialog/view-order.html',
  styleUrls: ['./dispatch.component.scss'],
})
export class ViewOrderComponent implements OnInit{
  p;
  editForm: any;
  @Input() value;
  partnerData;
  isClaimed = false;
  isArchived = false;
  isDelivered = false;
  isPartner = true;
  isValidated = false;
  public partner: any = {};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  @ViewChild('orderData') htmlData:ElementRef;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  bloodTypes = BloodTypes.bloodTypes;
  inventory$: Observable<any>;
  loadInventory = false;
  orderQuantity;
  orderItems = [];
  isHidden = true;
  hasPartner = true;
  isDispatchRequestManager = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService,
    private readonly modalService: NgbModal ) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      dispatchID: [this.value.dispatchID],
      orderItems: [this.value.orderItems],
      claimCodeEntered: [],
    });
    this.orderItems = this.value.orderItems
    if (this.value.status === 'Delivered'){
      this.isDelivered = true;
    }
  }

  formatter = (partner: Partner) => partner.institutionName;

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.partnerData
        : this.partnerData.filter(partner => new RegExp(term, 'mi').test(partner.institutionName)).slice(0, 10))
    ));
  }

  getInventory(value) {
  }

  addToOrder(batch) {
  }

  removefromOrder(item) {
  }

  editOrder() {
  }

  deliverOrder() {
  }

  archiveOrder() {
  }

  restoreOrder() {
  }

  claimOrder() {
    this.dispatchService.claimOrder(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  openValidateCode() {
    const modalRef = this.modalService.open(ValidateOrderComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.claimCode = this.value.claimCode;
    modalRef.result.then((result) => {
      if (result.isValidated === true) {
        this.isValidated = true;
        this.editForm.controls.claimCodeEntered.setValue(result.claimCodeEntered);
      }
    });
  }

  public openPDF():void {
    let DATA = document.getElementById('orderData');
      
    html2canvas(DATA).then(canvas => {
        
        let fileWidth = 208;
        let fileHeight = canvas.height * fileWidth / canvas.width;
        
        const FILEURI = canvas.toDataURL('image/png')
        let PDF = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: 'a4',
        });
        let position = 0;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight)
        
        PDF.save(this.value.dispatchID+'.pdf');
    });     
  }
}

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchPartnerComponent implements OnInit, OnDestroy {

  isStaff = false;
  isPartner = true;
  request$;
  order$: Observable<any>;
  claimed$;
  claimedArchived$;
  partner$;
  partnerData;

  p1;
  p2;
  p3;
  searchText1;
  searchText2;
  searchText3;

  constructor(
    private readonly modalService: NgbModal,
    private readonly dispatchService: DispatchService,
    public partnerService: PartnerService,
    private readonly authservice: AuthService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.order$ = this.dispatchService.getOrdersOfPartner(this.authservice.partnerID());
  }

  trackByFn(index) {
    return index;
  }

  openAddRequest() {
    // this.modalService.open(AddRequestComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
  }

  openViewRequest(value) {
  }

  openAddOrder(value) {
  }

  openViewOrder(value, isClaimed, isArchived) {
    const modalRef = this.modalService.open(ViewOrderComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.value = value;
  }

  ngOnDestroy() {
  }

}
