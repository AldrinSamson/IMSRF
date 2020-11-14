import { Component, OnInit, Input,  OnDestroy} from '@angular/core';
import { InventoryService, AlertService, ValidationService } from '@shared';
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

  inventory$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.inventory$ = this.inventoryService.getAll();
  }

  trackByFn(index) {
    return index;
  }

  openViewBatch(value) {
    const modalRef = this.modalService.open(ViewBatchComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
  }


}
