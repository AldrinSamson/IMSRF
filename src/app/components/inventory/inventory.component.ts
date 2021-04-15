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
export class ViewBatchComponent implements OnInit{

  isPartner = false;
  isStaff = true;
  isAdmin = false;
  updateInventoryForm: any;
  @Input() value;
  @Input() isArchived;
  @Input() isExpired;
  hideEditButton = false;
  hideArchiveButton = false;
  hideRestoreButton = false;
  hideExpireButton = false;
  isEventManager = false;


  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly inventoryService: InventoryService,
    private readonly authService : AuthService) {
    }

  ngOnInit(): void {
    this.updateInventoryForm = this.formBuilder.group({
      batchID: [this.value.batchID],
      quantity: [this.value.quantity]
    });

    this.isAdmin = this.authService.isAdmin();
    this.isEventManager = this.authService.isEventManager();

    if (this.isEventManager === true || this.isArchived === true || this.isExpired === true) {
      this.hideEditButton = true
      this.updateInventoryForm.controls.quantity.disable()
      this.hideExpireButton = true;
    } else if ( this.isAdmin === true && this.isArchived === true || this.isExpired === true) {
      this.hideEditButton = true
      this.hideExpireButton = true;
    }
    if (this.isArchived === true) {
      this.hideArchiveButton = true
    } else if ( this.isAdmin === true && this.isArchived === true ) {
      this.hideArchiveButton = true
    }
    if (this.isArchived === false) {
      this.hideRestoreButton = true
    } else if ( this.isAdmin === true && this.isArchived === false ) {
      this.hideRestoreButton = true
    }
  }

  updateInventory() {
    if (this.updateInventoryForm.dirty && this.updateInventoryForm.valid) {
      this.inventoryService.updateOne(this.value.id ,this.updateInventoryForm.value);
      this.activeModal.close();
    }
  }

  // Destory before prod
  manualExpire() {
    this.inventoryService.manualExpire(this.value.id , this.updateInventoryForm.value);
    this.activeModal.close();
  }

  deleteBatch() {
    this.inventoryService.delete(this.value.id, this.updateInventoryForm.value);
    this.activeModal.close();
  }

  archiveBatch() {
    this.inventoryService.archive(this.value.id, this.updateInventoryForm.value);
    this.activeModal.close();
  }

  restoreBatch() {
    this.inventoryService.restore(this.value.id, this.updateInventoryForm.value);
    this.activeModal.close();
  }
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  searchText1;
  searchText2;
  searchText3;
  filterBloodType;
  p1;
  p2;
  p3;
  bloodTypes = BloodTypes.bloodTypes;
  isPartner = false;
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
    public partnerService: PartnerService) { }

  ngOnInit(): void {
    this.filter = []
    this.getData();
  }

  getData() {
    this.activeInventory$ = this.inventoryService.getAllActive('dateExpiry');
    this.expiredInventory$ = this.inventoryService.getAllExpired('dateExpiry');
    this.archivedInventory$ = this.inventoryService.getAllArchived('dateExpiry');
    this.partner$ = this.partnerService.getAll().subscribe( res => {
      this.partnerData = res
    });
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
    const modalRef = this.modalService.open(ViewBatchComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
    modalRef.componentInstance.isExpired = isExpired;
  }

  ngOnDestroy() {
    if (this.partner$ != null) {
      this.partner$.unsubscribe();
    }
  }


}
