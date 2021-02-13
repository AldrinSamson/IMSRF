import { Component, OnInit, Input,  OnDestroy, ViewChild} from '@angular/core';
import { EventService, PartnerService, AlertService, BloodTypes, Partner } from '@shared';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription, Subject, merge } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, filter} from 'rxjs/operators';
import { NgbActiveModal, NgbModal, NgbTypeahead, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'init-event-dialog',
  templateUrl: './dialog/init-event.html',
  styleUrls: ['./events.component.scss'],
})
export class InitEventComponent {
  @Input() partnerData;
  public partner: Partner;
  dateObject: NgbDateStruct;
  date: {year: number, month: number};
  initEventForm: any;
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService,
    private readonly alertService: AlertService) {
    this.initEventForm = this.formBuilder.group({
      partnerID: [],
      institutionName: [],
      dateOfEvent: [ this.dateObject ],
      location: ['', Validators.required]
    });
  }

  formatter = (partner: Partner) => partner.institutionName;

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.partnerData
        : this.partnerData.filter(partner => new RegExp(term, 'mi').test(partner.institutionName)).slice(0, 10))
    ));
  }

  initEvent() {
    if (this.initEventForm.dirty && this.initEventForm.valid && this.partner !== undefined) {
      this.initEventForm.controls.partnerID.setValue(this.partner.partnerID);
      this.initEventForm.controls.institutionName.setValue(this.partner.institutionName);
      this.initEventForm.controls.dateOfEvent.setValue(new Date(this.initEventForm.value.dateOfEvent.year,
        this.initEventForm.value.dateOfEvent.month - 1, this.initEventForm.value.dateOfEvent.day));
      this.eventService.initPreEvent(this.initEventForm.value);
      this.activeModal.close();
    } else if (this.partner === undefined) {
      this.alertService.showToaster('Invalid Institution Name' , { classname: 'bg-success text-warning', delay: 10000 })
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
  @Input() partnerData;
  public partner: any = {};
  dateObject: NgbDateStruct;
  date: {year: number, month: number};
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService,
    private readonly alertService: AlertService) {
    }

  ngOnInit(): void {
    const recordDate = new Date(this.value.dateOfEvent.seconds * 1000)
    this.dateObject = { day: recordDate.getDate(),month:  recordDate.getMonth()+1, year:  recordDate.getFullYear()};
    this.preEventForm = this.formBuilder.group({
      partnerID: [],
      institutionName: [],
      dateOfEvent : [this.dateObject, Validators.required],
      location: [this.value.location, Validators.required]
    });
    this.partner.partnerID = this.value.partnerID
    this.partner.institutionName = this.value.institutionName
  }

  formatter = (partner: Partner) => partner.institutionName;

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.partnerData
        : this.partnerData.filter(partner => new RegExp(term, 'mi').test(partner.institutionName)).slice(0, 10))
    ));
  }

  preEvent() {
    if (this.preEventForm.dirty && this.preEventForm.valid && this.partner !== undefined) {
      this.preEventForm.controls.partnerID.setValue(this.partner.partnerID);
      this.preEventForm.controls.institutionName.setValue(this.partner.institutionName);
        this.preEventForm.controls.dateOfEvent.setValue(new Date(this.preEventForm.value.dateOfEvent.year,
          this.preEventForm.value.dateOfEvent.month - 1, this.preEventForm.value.dateOfEvent.day));

      this.eventService.updatePreEvent(this.value.id ,this.preEventForm.value);
      this.activeModal.close();
    }else if (this.partner === undefined) {
      this.alertService.showToaster('Invalid Institution Name' , { classname: 'bg-success text-warning', delay: 10000 })
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
  donorsRegistered: number;
  donorsDefferTotal : number;
  donorsBledTotal: number;
  quantityTotal: number ;

  constructor(
    private readonly formBuilder: FormBuilder,
    public readonly activeModal: NgbActiveModal,
    private readonly eventService: EventService,
    private readonly alertService: AlertService) {
    }

  ngOnInit(): void {
    this.postEventForm = this.formBuilder.group({
      eventID: [this.value.eventID],
      partnerID: [this.value.partnerID],
      institutionName: [this.value.institutionName],
      location: [this.value.location, ],
      dateOfEvent : [this.value.dateOfEvent],
      donorsRegistered: [],
      donorsDefferTotal: [],
      donorsDefferScreen: ['', Validators.required],
      donorsDefferLow: ['', Validators.required],
      donorsBledTotal: [],
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
      quantityTotal: [],
      remarks: ['', Validators.required]
    });
  }

  divideBy3() {
    // temp out ratio 1:3
    this.postEventForm.controls.quantityAP.setValue(Math.round(this.postEventForm.value.quantityAP / 3));
    this.postEventForm.controls.quantityAN.setValue(Math.round(this.postEventForm.value.quantityAN / 3));
    this.postEventForm.controls.quantityBP.setValue(Math.round(this.postEventForm.value.quantityBP / 3));
    this.postEventForm.controls.quantityBN.setValue(Math.round(this.postEventForm.value.quantityBN / 3));
    this.postEventForm.controls.quantityOP.setValue(Math.round(this.postEventForm.value.quantityOP / 3));
    this.postEventForm.controls.quantityON.setValue(Math.round(this.postEventForm.value.quantityON / 3));
    this.postEventForm.controls.quantityABP.setValue(Math.round(this.postEventForm.value.quantityABP / 3));
    this.postEventForm.controls.quantityABN.setValue(Math.round(this.postEventForm.value.quantityABN / 3));
  }

  postEvent() {
    // quick maffs
    this.donorsDefferTotal = this.postEventForm.value.donorsDefferScreen + this.postEventForm.value.donorsDefferLow

    this.donorsBledTotal = this.postEventForm.value.donorsBledOk + this.postEventForm.value.donorsBledFail

    this.donorsRegistered = this.postEventForm.value.donorsBledOk + this.postEventForm.value.donorsBledFail
    + this.postEventForm.value.donorsDefferScreen

    this.quantityTotal = this.postEventForm.value.quantityAP + this.postEventForm.value.quantityAN + this.postEventForm.value.quantityBP +
    this.postEventForm.value.quantityBN + this.postEventForm.value.quantityOP + this.postEventForm.value.quantityON +
    this.postEventForm.value.quantityABP + this.postEventForm.value.quantityABN

    // if (this.quantityTotal !== this.postEventForm.value.donorsBledOk) {
    //   this.postEventForm.controls.donorsBledOk.setErrors({incorrect: true});
    //   this.alertService.showToaster('Invalid Bled Total' ,
    //   { classname: 'bg-success text-warning', delay: 10000 })
    // }

    if (this.postEventForm.dirty && this.postEventForm.valid) {

        const dateExpiry = new Date(this.postEventForm.value.dateExpiry.year, this.postEventForm.value.dateExpiry.month - 1,
          this.postEventForm.value.dateExpiry.day)
        this.postEventForm.controls.dateExpiry.setValue(new Date(dateExpiry.setHours(13)));

        this.postEventForm.controls.donorsDefferTotal.setValue(this.donorsDefferTotal);
        this.postEventForm.controls.donorsBledTotal.setValue(this.donorsBledTotal);
        this.postEventForm.controls.donorsRegistered.setValue(this.donorsRegistered);
        this.postEventForm.controls.quantityTotal.setValue(this.quantityTotal);

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
export class EventsComponent implements OnInit, OnDestroy {

  activeEvent$: Observable<any>;
  historicalEvent$: Observable<any>;
  archivedEvent$: Observable<any>;
  partner$: Subscription;
  partnerData;

  constructor(
    private readonly modalService: NgbModal,
    private readonly eventService: EventService,
    public partnerService: PartnerService) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.activeEvent$ = this.eventService.getActive();
    this.historicalEvent$ = this.eventService.getHistorical();
    this.archivedEvent$ = this.eventService.getArchived();
    this.partner$ = this.partnerService.getAll().subscribe( res => {
      this.partnerData = res
    });
  }

  trackByFn(index) {
    return index;
  }

  openInitEvent() {
    const modalRef = this.modalService.open(InitEventComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.partnerData = this.partnerData;
  }

  openUpdatePreEvent(value) {
    const modalRef = this.modalService.open(UpdatePreEventComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.partnerData = this.partnerData;
  }

  openUpdatePostEvent(value) {
    const modalRef = this.modalService.open(UpdatePostEventComponent,{centered: true, scrollable: true, backdrop: 'static'});
    modalRef.componentInstance.value = value;
  }

  openViewEvent(value, isArchived) {
    const modalRef = this.modalService.open(ViewEventComponent,{centered: true, scrollable: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.value = value;
    modalRef.componentInstance.isArchived = isArchived;
  }

  ngOnDestroy() {
    if (this.partner$ !== null) {
      this.partner$.unsubscribe();
    }
  }

}
