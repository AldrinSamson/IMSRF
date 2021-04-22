import { Component, OnInit, Input } from '@angular/core';
import { InventoryService, AuditService, AuthService } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as firebase from "firebase/app";

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-feedback-dialog',
  templateUrl: './dialog/view-feedback.html',
  styleUrls: ['./reports.component.scss'],
})
export class ViewFeedbackComponent implements OnInit{
  @Input() value;

  constructor(
    public readonly activeModal: NgbActiveModal,
    ) {
  }

  public openPDF():void {

  }

  ngOnInit() {
  }

}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsPartnerComponent implements OnInit {

  isPartner = true;
  inventorySearchText: any;
  p1: any;
  p2: any;
  p3: any;
  p4: any;
  p5: any;
  p6: any;
  p7: any;
  p8: any;
  p9: any;
  p10: any;
  searchText1;
  searchText2;
  searchText3;
  searchText4;
  searchText5;
  searchText6;
  searchText7;
  searchText8;
  searchText9;
  inventoryLog$: Observable<any>
  eventLog$: Observable<any>
  requestLog$: Observable<any>
  dispatchLog$: Observable<any>
  authenticationLog$: Observable<any>
  inventoryManifest$: Observable<any>
  donorLog$: Observable<any>
  requesterLog$: Observable<any>
  accountLog$: Observable<any>
  feedbackReport$: Observable<any>
  authenticationlog;
  inventorylog;
  eventlog;
  requestlog;
  dispatchlog;
  manifest;
  donorlog;
  requesterlog;
  accountlog;
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly auditService: AuditService,
    private readonly modalService: NgbModal,
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  trackByFn(index) {
    return index;
  }

  getData() {
    this.inventoryLog$ = this.auditService.getInventoryLogsPartner(this.authService.partnerID());
    this.dispatchLog$ = this.auditService.getDispatchLogsPartner(this.authService.partnerID());
    this.inventoryManifest$ = this.inventoryService.getInventoryOfPartnerAll(this.authService.partnerID());
    this.feedbackReport$ = this.auditService.getFeedbackReportPartner(this.authService.partnerID());

    this.inventoryLog$.subscribe(res => {
      this.inventorylog = res
    });

    this.dispatchLog$.subscribe(res => {
      this.dispatchlog = res
    });

    this.inventoryManifest$.subscribe(res => {
      this.manifest = res
    });
  }

  openViewFeedback(value) {
    const modalRef = this.modalService.open(ViewFeedbackComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;

  }

  downloadCSVFile(data, name) {
    const replacer = (key, value) => (value === null ? '' : value); 
    const header = Object.keys(data[0]);
    const csv =  this.ConvertToCSV(data)
    .map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(',').toUpperCase());
    const csvArray = csv.join('\r\n');
    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const datetoday = new Date();
    const today = datetoday.toISOString().substring(0, 10);
    a.href = url;
    a.download = name+"-AsOf-"+ today +'.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','
            
            //Converts

            if(array[i][index] instanceof firebase.firestore.Timestamp) {
              array[i][index] = array[i][index].toDate();
            }

            line += array[i][index];
        }

        str += line + '\r\n';
       
    }

    return array;
  }

}
