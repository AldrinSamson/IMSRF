import { Component, OnInit, Input,  OnDestroy, ViewChild} from '@angular/core';
import { DispatchService, PartnerService, AlertService, BloodTypes, InventoryService,
  Partner, StorageService, UtilService, AuthService } from '@shared';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription, Subject, merge, EMPTY } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter, catchError, takeUntil} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

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
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  bloodTypes = BloodTypes.bloodTypes;
  inventory$: Observable<any>;
  loadInventory = false;
  orderQuantity;
  orderItems = [];

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
}

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss']
})
export class DispatchPartnerComponent implements OnInit, OnDestroy {

  isPartner = true;
  request$;
  order$: Observable<any>;
  claimed$;
  claimedArchived$;
  partner$;
  partnerData;

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
