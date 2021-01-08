import { Component, OnInit, Input,  OnDestroy} from '@angular/core';
import { InventoryService, AlertService, AuthService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-batch-dialog',
  templateUrl: './dialog/view-batch.html',
  styleUrls: ['./inventory.component.scss'],
})
export class ViewBatchComponent implements OnInit{

  isPartner = false;
  isStaff = false;
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

  activeSearchText;
  archivedSearchText;
  p;
  isPartner = false;
  activeInventory$: Observable<any>;
  archivedInventory$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activeInventory$ = this.inventoryService.getAllActive();
    this.archivedInventory$ = this.inventoryService.getAllArchived();
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
