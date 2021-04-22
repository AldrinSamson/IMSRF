import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { InventoryService, DispatchService, EventService} from '@shared'

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  p1;
  p2;
  p3;
  searchText1;
  searchText2;
  searchText3;
  route$: Subscription;
  inventory$: Observable<any>;
  dispatch$: Observable<any>;
  event$: Observable<any>;
  partnerID: string;
  institutionName: string;
  constructor(private route: ActivatedRoute,
    private readonly inventoryService: InventoryService,
    private readonly dispatchService: DispatchService,
    private readonly eventService: EventService) { }

  ngOnInit() {
    this.route$ = this.route.queryParams
    .subscribe(params => {
      this.partnerID = params.id;
      this.institutionName = params.partner;
    });

    this.getData();
  }

  trackByFn(index) {
    return index;
  }

  getData() {
    this.inventory$ = this.inventoryService.getInventoryOfPartner(this.partnerID);
    this.dispatch$ = this.dispatchService.getOrdersOfPartner(this.partnerID);
    this.event$ = this.eventService.getEventsOfPartner(this.partnerID);
  }

  ngOnDestroy() {
    if (this.route$ != null) {
      this.route$.unsubscribe();
    }
  }

}
