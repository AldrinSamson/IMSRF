import { Component, OnInit, Input,  OnDestroy, ViewChild} from '@angular/core';
import { DispatchService, PartnerService, AlertService, BloodTypes, InventoryService,
  Partner, StorageService, UtilService, Sexes, AuthService } from '@shared';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription, Subject, merge, EMPTY } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter, catchError, takeUntil} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { MEDIA_STORAGE_PATH_IMG , DEFAULT_PROFILE_PIC } from '../../storage.config';
import { FixedScaleAxis } from 'chartist';

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

// @Component({
//   // tslint:disable-next-line: component-selector
//   selector: 'view-request-dialog',
//   templateUrl: './dialog/view-request.html',
//   styleUrls: ['./dispatch.component.scss'],
// })
// export class ViewRequestComponent implements OnInit{
//   editForm: any;
//   @Input() value;
//   dateObject: NgbDateStruct;
//   date: {year: number, month: number};

//   constructor(
//     private readonly formBuilder: FormBuilder,
//     public readonly activeModal: NgbActiveModal,
//     private readonly dispatchService: DispatchService) {
//   }

//   ngOnInit() {
//     const recordDate = new Date(this.value.birthday.seconds * 1000)
//     this.dateObject = { day: recordDate.getDate(),month:  recordDate.getMonth()+1, year:  recordDate.getFullYear()};
//     this.editForm = this.formBuilder.group({
//       requestID:[this.value.requestID],
//       firstName: [this.value.firstName, Validators.required],
//       lastName: [this.value.lastName, Validators.required],
//       fullName: [],
//       mailingAddress: [this.value.mailingAddress, Validators.required],
//       email: [this.value.email, Validators.required],
//       birthday: [this.dateObject],
//       sex: [this.value.sex, Validators.required],
//       patientName: [this.value.patientName, Validators.required],
//       hospitalName: [this.value.hospitalName, Validators.required],
//       patientDiagnosis: [this.value.patientDiagnosis, Validators.required],
//       patientBloodType: [this.value.patientBloodType, Validators.required],
//       patientBloodComponent: [this.value.patientBloodComponent, Validators.required],
//       patientBloodUnits:[this.value.patientBloodUnits, Validators.required],
//     });

//   }

//   editRequest() {
//     this.editForm.controls.fullName.setValue(this.editForm.value.firstName + ' ' + this.editForm.value.lastName)
//     this.editForm.controls.birthday.setValue(new Date(this.editForm.value.birthday.year,
//       this.editForm.value.birthday.month - 1, this.editForm.value.birthday.day));

//     this.dispatchService.updateRequest(this.value.id,this.editForm.value)
//     this.activeModal.close();
//   }

//   deleteRequest() {
//    this.dispatchService.deleteRequest(this.value.id);
//    this.activeModal.close();
//   }
// }

// @Component({
//   // tslint:disable-next-line: component-selector
//   selector: 'add-order-dialog',
//   templateUrl: './dialog/add-order.html',
//   styleUrls: ['./dispatch.component.scss'],
// })
// export class AddOrderComponent implements OnInit{
//   p;
//   addForm: any;
//   @Input() value;
//   @Input() partnerData;
//   public partner: Partner;
//   @ViewChild('instance', {static: true}) instance: NgbTypeahead;
//   focus$ = new Subject<string>();
//   click$ = new Subject<string>();
//   bloodTypes = BloodTypes.bloodTypes;
//   inventory$: Observable<any>;
//   loadInventory = false;
//   orderQuantity;
//   orderItems = [];

//   constructor(
//     private readonly formBuilder: FormBuilder,
//     public readonly activeModal: NgbActiveModal,
//     private readonly dispatchService: DispatchService,
//     private readonly inventoryService: InventoryService ) {
//   }

//   ngOnInit() {
//     this.addForm = this.formBuilder.group({
//       id: [this.value.id],
//       requestID:[this.value.requestID],
//       patientName: [this.value.patientName],
//       bloodType: [this.value.patientBloodType],
//       requesterName: [this.value.fullName],
//       partnerID: [],
//       institutionName: [],
//       orderItems: [],
//     });
//   }

//   formatter = (partner: Partner) => partner.institutionName;

//   search = (text$: Observable<string>) => {
//     const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
//     const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
//     const inputFocus$ = this.focus$;

//     return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
//       map(term => (term === '' ? this.partnerData
//         : this.partnerData.filter(partner => new RegExp(term, 'mi').test(partner.institutionName)).slice(0, 10))
//     ));
//   }

//   getInventory(bloodType) {
//     this.inventory$ = this.inventoryService.getByPTRandBT(this.partner.partnerID, bloodType);
//     this.loadInventory = true;
//   }

//   addToOrder(batchValues) {
//     const orderItem = {
//       id: batchValues.id,
//       batchID: batchValues.batchID,
//       quantity: this.orderQuantity
//     }

//     this.orderItems.push(orderItem);
//   }

//   removefromOrder(item) {
//     const index = this.orderItems.indexOf(item);
//     this.orderItems.splice(index, 1);
//   }

//   addOrder() {
//     this.addForm.controls.partnerID.setValue(this.partner.partnerID);
//     this.addForm.controls.institutionName.setValue(this.partner.institutionName);
//     this.addForm.controls.orderItems.setValue(this.orderItems);
//     this.dispatchService.createOrder(this.addForm.value);
//     this.activeModal.close();
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
  @Input() partnerData;
  @Input() isClaimed;
  @Input() isArchived;
  isPartner = false;
  isValidated = false;
  isDelivered = false;
  public partner: any = {};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  bloodTypes = BloodTypes.bloodTypes;
  inventory$: Observable<any>;
  loadInventory = false;
  orderQuantity;
  orderItems = [];
  isHidden = false;
  hasPartner = false;
  isDispatchRequestManager = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService,
    private readonly inventoryService: InventoryService,
    private readonly authService: AuthService ) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      dispatchID: [this.value.dispatchID],
      requestID:[this.value.requestID],
      partnerID: [],
      institutionName: [],
      orderItems: [],
    });

    this.partner.partnerID = this.value.partnerID
    this.partner.institutionName = this.value.institutionName
    this.orderItems = this.value.orderItems
    this.isDispatchRequestManager = this.authService.isDispatchRequestManager();

    if (this.value.status === 'Delivered'){
      this.isDelivered = true;
    }

    if (this.isDelivered || this.isClaimed === true) {
      this.isHidden = true;
    }

    if (this.orderItems.length === 0) {
      this.hasPartner = true
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

  getInventory(bloodType) {
    this.inventory$ = this.inventoryService.getByPTRandBT(this.partner.partnerID, bloodType);
    this.loadInventory = true;
  }

  addToOrder(batchValues) {
    const orderItem = {
      id: batchValues.id,
      batchID: batchValues.batchID,
      quantity: this.orderQuantity
    }

    this.orderItems.push(orderItem);
    this.orderQuantity = 0;
    if (this.orderItems.length === 0) {
      this.hasPartner = true
    }
  }

  removefromOrder(item) {
    const index = this.orderItems.indexOf(item);
    this.orderItems.splice(index, 1);
    if (this.orderItems.length === 0) {
      this.hasPartner = true
    }
  }

  editOrder() {
    this.editForm.controls.partnerID.setValue(this.partner.partnerID);
    this.editForm.controls.institutionName.setValue(this.partner.institutionName);
    this.editForm.controls.orderItems.setValue(this.orderItems);
    this.dispatchService.updateOrder(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  deliverOrder() {
    this.dispatchService.deliverOrder(this.value.id, this.value.dispatchID);
    this.activeModal.close();
  }

  archiveOrder() {
    this.dispatchService.archiveOrder(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  restoreOrder() {
    this.dispatchService.restoreOrder(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  claimOrder() {
  }

  openValidateCode() {
  }
}
@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchComponent implements OnInit, OnDestroy {

  isStaff = false;
  isPartner = false;
  request$: Observable<any>;
  order$: Observable<any>;
  claimed$: Observable<any>;
  claimedArchived$: Observable<any>;
  partner$: Subscription;
  partnerData;

  constructor(
    private readonly modalService: NgbModal,
    private readonly dispatchService: DispatchService,
    public partnerService: PartnerService,
    private readonly authService: AuthService ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    // this.request$ = this.dispatchService.getAllRequest();
    this.order$ = this.dispatchService.getActiveOrder();
    this.claimed$ = this.dispatchService.getClaimed();
    this.claimedArchived$ = this.dispatchService.getArchivedClaimed();
    this.partner$ = this.partnerService.getAll().subscribe( res => {
      this.partnerData = res
    });
  }

  trackByFn(index) {
    return index;
  }

  // openAddRequest() {
  //   this.modalService.open(AddRequestComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
  // }

  // openViewRequest(value) {
  //   const modalRef = this.modalService.open(ViewRequestComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
  //   modalRef.componentInstance.value = value;
  // }

  // openAddOrder(value) {
  //   const modalRef = this.modalService.open(AddOrderComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
  //   modalRef.componentInstance.value = value;
  //   modalRef.componentInstance.partnerData = this.partnerData;
  // }

  openViewOrder(value, isClaimed, isArchived) {
    const modalRef = this.modalService.open(ViewOrderComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.partnerData = this.partnerData;
    modalRef.componentInstance.isClaimed = isClaimed;
    modalRef.componentInstance.isArchived = isArchived;
  }

  ngOnDestroy() {
    if (this.partner$ !== null) {
      this.partner$.unsubscribe();
    }
  }
}
