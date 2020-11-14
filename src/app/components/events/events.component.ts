import { Component, OnInit, Input,  OnDestroy} from '@angular/core';
import { EventService, AlertService, ValidationService, BloodTypes } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'init-event-dialog',
  templateUrl: './dialog/init-event.html',
  styleUrls: ['./events.component.scss'],
})
export class InitEventComponent {

  dateObject: NgbDateStruct;
  date: {year: number, month: number};

  initEventForm: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService) {
    this.initEventForm = this.formBuilder.group({
      partnerID: ['', Validators.required],
      institutionName: ['', Validators.required],
      dateOfEvent: [ this.dateObject ],
      location: ['', Validators.required]
    });
  }

  initEvent() {
    if (this.initEventForm.dirty && this.initEventForm.valid) {
      this.initEventForm.controls.dateOfEvent.setValue(new Date(this.initEventForm.value.dateOfEvent.year,
        this.initEventForm.value.dateOfEvent.month - 1, this.initEventForm.value.dateOfEvent.day));
      this.eventService.initPreEvent(this.initEventForm.value);
      this.activeModal.close();
    }
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'update-pre-event-dialog',
  templateUrl: './dialog/update-pre-event.html',
  styleUrls: ['./events.component.scss'],
})
export class UpdatePreEventComponent implements OnInit{
  preEventForm: any;
  @Input() value;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService) {
    }

  ngOnInit(): void {
    this.preEventForm = this.formBuilder.group({
      partnerID: [this.value.partnerID, Validators.required],
      institutionName: [this.value.institutionName, Validators.required],
      dateOfEvent: [ this.value.dateOfEvent.toDate() ],
      newDateOfEvent : [this.dateObject],
      location: [this.value.location, Validators.required]
    });
  }

  preEvent() {
    if (this.preEventForm.dirty && this.preEventForm.valid) {
      if (this.preEventForm.value.newDateOfEvent !== null) {
        this.preEventForm.controls.dateOfEvent.setValue(new Date(this.preEventForm.value.newDateOfEvent.year,
          this.preEventForm.value.newDateOfEvent.month - 1, this.preEventForm.value.newDateOfEvent.day));
      }
      this.eventService.updatePreEvent(this.value.id ,this.preEventForm.value);
      this.activeModal.close();
    }
  }

}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'update-post-event-dialog',
  templateUrl: './dialog/update-post-event.html',
  styleUrls: ['./events.component.scss'],
})
export class UpdatePostEventComponent implements OnInit {
  postEventForm: any;
  @Input() value;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService) {
    }

  ngOnInit(): void {
    this.postEventForm = this.formBuilder.group({
      eventID: [this.value.eventID],
      partnerID: [this.value.partnerID],
      institutionName: [this.value.institutionName],
      donorsRegistered: ['', Validators.required],
      donorsDefferTotal: ['', Validators.required],
      donorsDefferScreen: ['', Validators.required],
      donorsDefferLow: ['', Validators.required],
      donorsBledTotal: ['', Validators.required],
      donorsBledOk: ['', Validators.required],
      donorsBledFail: ['', Validators.required],

      dateExpiry: [this.dateObject],
      quantityAP: ['', Validators.required],
      quantityAN: ['', Validators.required],
      quantityBP: ['', Validators.required],
      quantityBN: ['', Validators.required],
      quantityOP: ['', Validators.required],
      quantityON: ['', Validators.required],
      quantityABP: ['', Validators.required],
      quantityABN: ['', Validators.required],
      quantityTotal: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  postEvent() {
    if (this.postEventForm.dirty && this.postEventForm.valid) {
        this.postEventForm.controls.dateExpiry.setValue(new Date(this.postEventForm.value.dateExpiry.year,
          this.postEventForm.value.dateExpiry.month - 1, this.postEventForm.value.dateExpiry.day));
      this.eventService.updateToPostEventAndAddToInvetory(this.value.id ,this.postEventForm.value);
      this.activeModal.close();
    }
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'view-event-dialog',
  templateUrl: './dialog/view-event.html',
  styleUrls: ['./events.component.scss'],
})
export class ViewEventComponent {
   bloodTypes = BloodTypes.bloodTypes
   @Input() value;
   @Input() isArchived;

   constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService) {
  }

  archiveEvent() {
    this.eventService.archive(this.value.id);
    this.activeModal.close();
  }

  restoreEvent() {
    this.eventService.restore(this.value.id);
    this.activeModal.close();
  }
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  activeEvent$: Observable<any>;
  historicalEvent$: Observable<any>;
  archivedEvent$: Observable<any>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly eventService: EventService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activeEvent$ = this.eventService.getActive();
    this.historicalEvent$ = this.eventService.getHistorical();
    this.archivedEvent$ = this.eventService.getArchived();
  }

  trackByFn(index) {
    return index;
  }

  openInitEvent() {
    this.modalService.open(InitEventComponent,{centered: true, scrollable: true, backdrop: 'static'});
  }

  openUpdatePreEvent(value) {
    const modalRef = this.modalService.open(UpdatePreEventComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
  }

  openUpdatePostEvent(value) {
    const modalRef = this.modalService.open(UpdatePostEventComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.value = value;
  }

  openViewEvent(value, isArchived) {
    const modalRef = this.modalService.open(ViewEventComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
  }

}
