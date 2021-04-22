import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { InventoryService, AuditService } from '@shared';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as firebase from "firebase/app";

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-feedback-dialog',
  templateUrl: './dialog/view-feedback.html',
  styleUrls: ['./reports.component.scss'],
})

export class ViewFeedbackComponent implements OnInit{
  @Input() value;
  @ViewChild('feedbackData') htmlData:ElementRef;

  constructor(
    public readonly activeModal: NgbActiveModal,
    ) {
  }

  public openPDF():void {
    let DATA = document.getElementById('feedbackData');
      
    html2canvas(DATA).then(canvas => {
        
        let fileWidth = 208;
        let fileHeight = canvas.height * fileWidth / canvas.width;
        
        const FILEURI = canvas.toDataURL('image/png')
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight)
        
        PDF.save(this.value.dispatchID+'-feedback.pdf');
    });     
  }

  ngOnInit() {
  }

}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isPartner = false;
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
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  trackByFn(index) {
    return index;
  }

  getData() {
    this.inventoryLog$ = this.auditService.getInventoryLogs();
    this.eventLog$ = this.auditService.getEventLogs();
    this.requestLog$ = this.auditService.getRequestLogs();
    this.dispatchLog$ = this.auditService.getDispatchLogs();
    this.authenticationLog$ = this.auditService.getAuthenticationLogs();
    this.inventoryManifest$ = this.inventoryService.getAll();
    this.donorLog$ = this.auditService.getDonorLogs();
    this.requesterLog$ = this.auditService.getRequesterLogs();
    this.accountLog$ = this.auditService.getAccountLogs();
    this.feedbackReport$ = this.auditService.getFeedbackReport();

    this.authenticationLog$.subscribe(res => {
      this.authenticationlog = res
    });

    this.inventoryLog$.subscribe(res => {
      this.inventorylog = res
    });

    this.eventLog$.subscribe(res => {
      this.eventlog = res
    });

    this.requestLog$.subscribe(res => {
      this.requestlog = res
    });

    this.dispatchLog$.subscribe(res => {
      this.dispatchlog = res
    });

    this.inventoryManifest$.subscribe(res => {
      this.manifest = res
    });

    this.donorLog$.subscribe(res => {
      this.donorlog = res
    });

    this.requesterLog$.subscribe(res => {
      this.requesterlog = res
    });

    this.accountLog$.subscribe(res => {
      this.accountlog = res
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
