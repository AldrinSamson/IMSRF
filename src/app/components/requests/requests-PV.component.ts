import { Component, OnInit, Input,  OnDestroy, ViewChild} from '@angular/core';
import { DispatchService, PartnerService, AlertService, BloodTypes, RequesterService, InventoryService,
  Partner, StorageService, UtilService, Sexes, AuthService, Requester } from '@shared';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription, Subject, merge, EMPTY } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter, catchError, takeUntil} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import { MEDIA_STORAGE_PATH_IMG , DEFAULT_PROFILE_PIC } from '../../storage.config';
import { FixedScaleAxis } from 'chartist';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-request-dialog',
  templateUrl: './dialog/add-request.html',
  styleUrls: ['./requests.component.scss'],
})
export class PartnerAddRequestComponent implements OnInit, OnDestroy{
  addForm: any;

  destroy$: Subject<null> = new Subject();
  fileToUpload1: File;
  requesterPhoto: string | ArrayBuffer;
  patientDiagnosisPhoto: string | ArrayBuffer;
  submitted = false;
  uploadProgress1$: Observable<number>;

  @Input() requesterData;
  public requester: any = {};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService,
    private readonly storageService: StorageService,
    private readonly utilService: UtilService,
    private readonly alertService: AlertService) {
  }

  ngOnInit() {
    this.addForm = this.formBuilder.group({
      requesterID: [],
      fullName: [],
      patientName: ['', Validators.required],
      hospitalName: ['', Validators.required],
      patientDiagnosis: ['', Validators.required],
      patientBloodType: ['', Validators.required],
      patientBloodComponent: ['', Validators.required],
      patientBloodUnits: ['', Validators.required],
      patientDiagnosisPhoto: ['', [ this.image.bind(this)]],
      patientDiagnosisPhotoUrl: [''],
    });

    this.addForm
      .get('patientDiagnosisPhoto')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((newValue) => {
        const {reader , img} = this.handleFileChange(newValue.files)
        this.fileToUpload1 = img;
        reader.onload = (loadEvent) => (this.patientDiagnosisPhoto = loadEvent.target.result);
      });
  }

  formatter = (requester: Requester) => requester.fullName;

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.requesterData
        : this.requesterData.filter(requester => new RegExp(term, 'mi').test(requester.fullName)).slice(0, 10))
    ));
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

  addRequest() {
    this.submitted = true;
    const mediaFolderPath = `${MEDIA_STORAGE_PATH_IMG}`;
    const { downloadUrl$: downloadUrl1$, uploadProgress$: uploadProgress1$ } = this.storageService.uploadFileAndGetMetadata(
      mediaFolderPath, this.fileToUpload1);
    this.uploadProgress1$ = uploadProgress1$;
    this.asyncUpload(downloadUrl1$).then( res => {
      this.addForm.controls.requesterID.setValue(this.requester.requesterID);
      this.addForm.controls.fullName.setValue(this.requester.fullName);
      this.addForm.controls.patientDiagnosisPhotoUrl.setValue(res);
      this.submitted = true;
      this.dispatchService.createRequest(this.addForm.value);
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
  selector: 'view-request-dialog',
  templateUrl: './dialog/view-request.html',
  styleUrls: ['./requests.component.scss'],
})
export class PartnerViewRequestComponent implements OnInit{
  editForm: any;
  @Input() value;

  @Input() requesterData;
  public requester: any = {};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  isDispatchRequestManager = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      requestID:[this.value.requestID],
      requesterID: [],
      fullName: [],
      patientName: [this.value.patientName, Validators.required],
      hospitalName: [this.value.hospitalName, Validators.required],
      patientDiagnosis: [this.value.patientDiagnosis, Validators.required],
      patientBloodType: [this.value.patientBloodType, Validators.required],
      patientBloodComponent: [this.value.patientBloodComponent, Validators.required],
      patientBloodUnits:[this.value.patientBloodUnits, Validators.required],
    });
    this.requester.requesterID = this.value.requesterID
    this.requester.fullName = this.value.fullName
  }

  formatter = (requester: Requester) => requester.fullName;

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.requesterData
        : this.requesterData.filter(requester => new RegExp(term, 'mi').test(requester.fullName)).slice(0, 10))
    ));
  }

  editRequest() {
    this.editForm.controls.requesterID.setValue(this.requester.requesterID);
    this.editForm.controls.fullName.setValue(this.requester.fullName);
    this.dispatchService.updateRequest(this.value.id,this.editForm.value)
    this.activeModal.close();
  }

  approveRequest(){
    this.editForm.controls.fullName.setValue(this.requester.fullName);
    this.dispatchService.approveRequest(this.value.id,this.editForm.value);
    this.activeModal.close();
  }

  denyRequest(){
    this.editForm.controls.fullName.setValue(this.requester.fullName);
    this.dispatchService.denyRequest(this.value.id,this.editForm.value);
    this.activeModal.close();
  }

  archiveRequest(){
    this.editForm.controls.fullName.setValue(this.requester.fullName);
    this.dispatchService.archiveRequest(this.value.id,this.editForm.value);
    this.activeModal.close();
  }

  restoreRequest(){
    this.editForm.controls.fullName.setValue(this.requester.fullName);
    this.dispatchService.restoreRequest(this.value.id,this.editForm.value);
    this.activeModal.close();
  }

  deleteRequest() {
    this.editForm.controls.fullName.setValue(this.requester.fullName);
   this.dispatchService.deleteRequest(this.value.id,this.editForm.value);
   this.activeModal.close();
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-partnerRequest-dialog',
  templateUrl: './dialog/add-partnerRequest.html',
  styleUrls: ['./requests.component.scss'],
})
export class PartnerAddPartnerRequestComponent implements OnInit{
  p;
  addForm: any;
  @Input() partnerData;
  public partner: any = {};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  bloodTypes = BloodTypes.bloodTypes;
  inventory$: Observable<any>;
  loadInventory = false;
  orderQuantity;
  orderItems = [];
  hasPartner = true;


  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService,
    private readonly inventoryService: InventoryService,
    ) {
  }

  ngOnInit() {
    this.addForm = this.formBuilder.group({
      partnerID: [],
      institutionName: [],
      orderItems: [],
    });
    const userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
    this.partner.partnerID = userDetails.partnerID
    this.partner.institutionName = userDetails.institutionName
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

  addPartnerRequest() {
    this.addForm.controls.partnerID.setValue(this.partner.partnerID);
    this.addForm.controls.institutionName.setValue(this.partner.institutionName);
    this.addForm.controls.orderItems.setValue(this.orderItems);
    this.dispatchService.createPartnerRequest(this.addForm.value);
    this.activeModal.close();
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-partnerRequest-dialog',
  templateUrl: './dialog/view-partnerRequest.html',
  styleUrls: ['./requests.component.scss'],
})
export class PartnerViewPartnerRequestComponent implements OnInit{
  p;
  editForm: any;
  @Input() value;
  @Input() partnerData;
  isPartner = true;
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
  hasPartner = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly dispatchService: DispatchService,
    private readonly inventoryService: InventoryService ) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      partnerRequestID: [this.value.partnerRequestID],
      partnerID: [],
      institutionName: [],
      orderItems: [],
    });

    this.partner.partnerID = this.value.partnerID
    this.partner.institutionName = this.value.institutionName
    this.orderItems = this.value.orderItems

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

  editPartnerRequest() {
    this.editForm.controls.partnerID.setValue(this.partner.partnerID);
    this.editForm.controls.institutionName.setValue(this.partner.institutionName);
    this.editForm.controls.orderItems.setValue(this.orderItems);
    this.dispatchService.updatePartnerRequest(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  releasePartnerRequest() {
    this.editForm.controls.partnerID.setValue(this.partner.partnerID);
    this.editForm.controls.institutionName.setValue(this.partner.institutionName);
    this.editForm.controls.orderItems.setValue(this.orderItems);
    this.dispatchService.releasePartnerRequest(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

  deletePartnerRequest() {
    this.dispatchService.releasePartnerRequest(this.value.id, this.editForm.value);
    this.activeModal.close();
  }

}

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})

export class RequestsPartnerComponent implements OnInit, OnDestroy {

  isStaff = false;
  isPartner = true;
  forApproval$: Observable<any>;
  approved$: Observable<any>;
  partnerRequestsAll$: Observable<any>;
  denied$: Observable<any>;
  archived$: Observable<any>;
  partnerRequestsOne$: Observable<any>;
  requester$ : Subscription;
  partner$: Subscription;
  partnerData;
  requesterData;

  constructor( private readonly modalService: NgbModal,
    private readonly dispatchService: DispatchService,
    public partnerService: PartnerService,
    public requesterService: RequesterService,
    private readonly authService: AuthService ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.forApproval$ = this.dispatchService.getForApprovalRequests();
    this.approved$ = this.dispatchService.getApprovedRequests();
    this.partnerRequestsAll$ =this.dispatchService.getAllActivePartnerRequest();
    this.denied$ = this.dispatchService.getDeniedRequests();
    this.archived$ = this.dispatchService.getArchivedRequests();
    this.partner$ = this.partnerService.getAll().subscribe( res => {
      this.partnerData = res
    });
    this.requester$ = this.requesterService.getActive().subscribe( res => {
      this.requesterData = res
    });
  }

  trackByFn(index) {
    return index;
  }

  openAddOrder(value) {

  }

  openAddRequest() {
    const modalRef = this.modalService.open(PartnerAddRequestComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.requesterData = this.requesterData;
  }

  openAddPartnerRequest() {
    const modalRef = this.modalService.open(PartnerAddPartnerRequestComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.partnerData = this.partnerData;
  }

  openViewRequest(value) {
    const modalRef = this.modalService.open(PartnerAddRequestComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.requesterData = this.requesterData;
  }

  openViewPartnerRequest(value) {
    const modalRef = this.modalService.open(PartnerViewPartnerRequestComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.partnerData = this.partnerData;
  }

  ngOnDestroy() {
    if (this.partner$ !== null) {
      this.partner$.unsubscribe();
    }
    if (this.requester$ !== null) {
      this.requester$.unsubscribe();
    }
  }

}