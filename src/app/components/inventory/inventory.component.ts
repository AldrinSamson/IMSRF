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
  updateInventoryForm: any;
  @Input() value;
  @Input() isArchived;
  hideEditButton = false;
  hideArchiveButton = false;
  hideRestoreButton = false;


  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly inventoryService: InventoryService,
    private readonly authService : AuthService) {
    }

  ngOnInit(): void {
    this.updateInventoryForm = this.formBuilder.group({
      batchID: [this.value.batchID],
      quantity: [this.value.quantity, Validators.required]
    });

    this.isStaff = this.authService.isStaff();

    if (this.isStaff === true || this.isArchived === true) {
      this.hideEditButton = true
    }
    if (this.isStaff === true || this.isArchived === true) {
      this.hideArchiveButton = true
    }
    if (this.isStaff === true || this.isArchived === false) {
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
    this.inventoryService.manualExpire(this.value.id , this.updateInventoryForm);
    this.activeModal.close();
  }

  deleteBatch() {
    this.inventoryService.delete(this.value.id);
    this.activeModal.close();
  }

  archiveBatch() {
    this.inventoryService.archive(this.value.id);
    this.activeModal.close();
  }

  restoreBatch() {
    this.inventoryService.restore(this.value.id);
    this.activeModal.close();
  }
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {

  searchText;
  filterBloodType;
  p;
  bloodTypes = BloodTypes.bloodTypes;
  isPartner = false;
  activeInventory$: Observable<any>;
  archivedInventory$: Observable<any>;
  filter;

  partner$: Subscription;
  partnerData;
  public partner: any = {};
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
    this.activeInventory$ = this.inventoryService.getAllActive('dateCreated');
    this.archivedInventory$ = this.inventoryService.getAllArchived();
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
    this.p = 1;
  }

  filterData() {
    this.filter = [];
    if (this.partner !== undefined || null ) {
      this.filter.push(this.partner.partnerID);
    }

    if (this.filterBloodType === 'None') {
      this.filterBloodType = undefined;
    }

    if (this.filterBloodType !== undefined) {
      this.filter.push(this.filterBloodType)
    }
    this.activeInventory$ = this.activeInventory$.pipe(
      map(items => items.filter( item => this.filter.every(val => item.searchTags.indexOf(val) > -1))),
      filter(items => items && items.length > 0)
    );

    this.p = 1;
  }

  trackByFn(index) {
    return index;
  }

  openViewBatch(value, isArchived) {
    const modalRef = this.modalService.open(ViewBatchComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
  }


}
