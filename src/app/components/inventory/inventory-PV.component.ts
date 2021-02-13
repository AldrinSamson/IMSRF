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
  isStaff = true;
  updateInventoryForm: any;
  @Input() value;
  @Input() isArchived;
  hideEditButton = true;
  hideArchiveButton = true;
  hideRestoreButton = true;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal) {
    }

  ngOnInit(): void {
    this.updateInventoryForm = this.formBuilder.group({
      batchID: [this.value.batchID],
      quantity: [this.value.quantity, Validators.required]
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
    if (this.partner.partnerID !== undefined || null ) {
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
    const modalRef = this.modalService.open(ViewBatchPartnerComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
  }

}
