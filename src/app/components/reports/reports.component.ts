import { Component, OnInit, Input } from '@angular/core';
import { UserService, InventoryService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  inventorySearchText: any;
  p: any;
  audit$: Observable<any>
  inventory$: Observable<any>
  constructor(
    private readonly userService: UserService,
    private readonly inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  trackByFn(index) {
    return index;
  }

  getData() {
    this.audit$ = this.userService.getAllAudit();
    this.inventory$ = this.inventoryService.getAll();
  }

}
