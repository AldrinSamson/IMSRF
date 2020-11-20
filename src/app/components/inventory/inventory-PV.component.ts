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
  updateInventoryForm: any;
  @Input() value;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly inventoryService: InventoryService) {
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
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryPartnerComponent implements OnInit {

  p;
  isPartner = true;
  inventory$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly inventoryService: InventoryService,
    private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.inventory$ = this.inventoryService.getInventoryOfPartner(this.authService.partnerID());
  }

  trackByFn(index) {
    return index;
  }

  openViewBatch(value) {
    const modalRef = this.modalService.open(ViewBatchPartnerComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
  }

}
