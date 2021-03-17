import { Component, OnInit } from '@angular/core';
import { DispatchService, EventService } from '@shared'
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  p1;
  p2;
  order$: Observable<any>;
  event$: Observable<any>;
  activeRequest$: Observable<any>;

  constructor(
    private readonly dispatchService: DispatchService,
    private readonly eventService: EventService
    ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.order$ = this.dispatchService.getActiveOrder();
    this.event$ = this.eventService.getActive();
    this.activeRequest$ = this.dispatchService.getApprovedRequests();
  }

  filterAndSumAR(item) {
    // let sum = 0;
    // const filtered = this.activeRequest$.pipe(
    //   map(items => items.filter( item => item.searchTags.indexOf(item) > -1)),
    //   filter(items => items && items.length > 0)
    // );

    // filtered.forEach(obj => {
    //       sum += obj.quantity;
    // })
    // return sum;
  }

  trackByFn(index) {
    return index;
  }


}
