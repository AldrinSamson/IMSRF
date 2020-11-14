import { Component, OnInit, Input } from '@angular/core';
import { PartnerService, FirebaseService, AlertService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'add-partner-dialog',
  templateUrl: './dialog/add-partner.html',
  styleUrls: ['./partners.component.scss'],
})
export class AddPartnerComponent {
  addForm: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly partnerService: PartnerService) {
    this.addForm = this.formBuilder.group({
      institutionName: ['', Validators.required]
    });
  }

  addPartner() {
    if (this.addForm.dirty && this.addForm.valid) {
      this.partnerService.addOne(this.addForm.value);
      this.activeModal.close();
    }
  }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-partner-dialog',
  templateUrl: './dialog/view-partner.html',
  styleUrls: ['./partners.component.scss'],
})
export class ViewPartnerComponent implements OnInit {
  @Input() public value;
  editForm: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly partnerService: PartnerService) {
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      partnerID: [this.value.partnerID,Validators.required],
      num: [this.value.num],
      institutionName: [this.value.institutionName]
    });
  }

  updatePartner() {
    if (this.editForm.dirty && this.editForm.valid) {
      this.partnerService.updateOne(this.value.id,this.editForm.value);
      this.activeModal.close();
    }
  }

  deletePartner() {
    this.partnerService.delete(this.value.id);
    this.activeModal.close();
  }

}

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  partner$: Observable<any>;
  constructor(
    private readonly partnerService: PartnerService,
    private readonly modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.partner$ = this.partnerService.getAll();
  }

  trackByFn(index) {
    return index;
  }

  openAddPartner() {
    this.modalService.open(AddPartnerComponent,{centered: true, scrollable: true, backdrop: 'static'});

  }

  openViewPartner(value) {
    const modalRef = this.modalService.open(ViewPartnerComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;

  }

}


