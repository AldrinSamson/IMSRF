import { Component, OnInit, Input} from '@angular/core';
import { InventoryService,AuthService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryPartnerComponent implements OnInit {

  activeSearchText;
  archivedSearchText;
  p;
  isPartner = true;
  activeInventory$: Observable<any>;
  archivedInventory$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly inventoryService: InventoryService,
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activeInventory$ = this.inventoryService.getInventoryOfPartner(this.authService.partnerID());
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
