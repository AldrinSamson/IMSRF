import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  p;
  audit$: Observable<any>
  constructor(
    private readonly userService: UserService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  trackByFn(index) {
    return index;
  }

  getData() {
    this.audit$ = this.userService.getAllAudit();
  }

}
