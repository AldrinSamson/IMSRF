import { Component, OnInit, Input,  OnDestroy, ViewChild} from '@angular/core';
import { InventoryService, AlertService, AuthService, BloodTypes, Partner, PartnerService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject, merge, Subscription } from 'rxjs';
import { NgbActiveModal, NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { pipe } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter, catchError, takeUntil} from 'rxjs/operators';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-batch-dialog',
  templateUrl: './dialog/view-batch.html',
  styleUrls: ['./inventory.component.scss'],
})
export class ViewBatchPartnerComponent implements OnInit{

  isPartner = true;
  isAdmin = false;
  isStaff = true;
  updateInventoryForm: any;
  @Input() value;
  @Input() isArchived;
  hideEditButton = true;
  hideArchiveButton = true;
  hideRestoreButton = true;
  isEventManager = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal) {
    }

  ngOnInit(): void {
    this.updateInventoryForm = this.formBuilder.group({
      batchID: [this.value.batchID],
      quantity: [this.value.quantity]
    });
  }

  updateInventory() {
  }

  // Destory before prod
  manualExpire() {
  }

  archiveBatch() {
  }

  restoreBatch() {}

  deleteBatch() {}
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryPartnerComponent implements OnInit {

  searchText1;
  searchText2;
  searchText3;
  filterBloodType;
  p1;
  p2;
  p3
  bloodTypes = BloodTypes.bloodTypes;
  isPartner = true;
  activeInventory$: Observable<any>;
  expiredInventory$: Observable<any>;
  archivedInventory$: Observable<any>;
  filter;
  orderValue = 'dateCreated';

  partner$: Subscription;
  partnerData;
  public partner: any;
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();


  constructor(
    private readonly modalService: NgbModal,
    private readonly inventoryService: InventoryService,
    public partnerService: PartnerService,
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.filter = []
    this.getData();
  }

  getData() {
    this.activeInventory$ = this.inventoryService.getInventoryOfPartner(this.authService.partnerID());
    this.expiredInventory$ = this.inventoryService.getInventoryOfPartnerExpired(this.authService.partnerID());
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

  orderData(order) {
    this.activeInventory$ = this.inventoryService.getAllActive(order);
    this.expiredInventory$ = this.inventoryService.getAllExpired(order);
    this.archivedInventory$ = this.inventoryService.getAllArchived(order);
    this.p1 = 1;
    this.p2 = 1;
    this.p3 = 1;
  }

  filterData() {
    this.filter = [];
    if ( this.partner !== undefined) {
      this.filter.push(this.partner.partnerID);
    }

    if (this.filterBloodType === 'None') {
      this.filterBloodType = undefined;
    }

    if (this.filterBloodType !== undefined) {
      this.filter.push(this.filterBloodType)
    }

    if (this.filterBloodType === undefined &&  this.partner === undefined) {

    } else {
      this.activeInventory$ = this.activeInventory$.pipe(
        map(items => items.filter( item => this.filter.every(val => item.searchTags.indexOf(val) > -1))),
        filter(items => items && items.length > 0)
      );
      this.expiredInventory$ = this.expiredInventory$.pipe(
        map(items => items.filter( item => this.filter.every(val => item.searchTags.indexOf(val) > -1))),
        filter(items => items && items.length > 0)
      );
      this.archivedInventory$ = this.archivedInventory$.pipe(
        map(items => items.filter( item => this.filter.every(val => item.searchTags.indexOf(val) > -1))),
        filter(items => items && items.length > 0)
      );
    }


    this.p1 = 1;
    this.p2 = 1;
    this.p3 = 1;

  }

  clearFilter() {
    this.filterBloodType = undefined;
    this.partner = undefined;
    this.getData();
    this.orderValue = 'dateCreated';
    this.p1 = 1;
    this.p2 = 1;
    this.p3 = 1;
  }

  trackByFn(index) {
    return index;
  }

  openViewBatch(value, isArchived , isExpired) {
    const modalRef = this.modalService.open(ViewBatchPartnerComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
    modalRef.componentInstance.isExpired = isExpired;
  }

}
