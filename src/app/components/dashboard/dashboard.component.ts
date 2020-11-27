import { Component, OnInit } from '@angular/core';
import { DispatchService } from '@shared'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  order$: Observable<any>;

  constructor(
    private readonly dispatchService: DispatchService
    ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.order$ = this.dispatchService.getActiveOrder();
  }

  trackByFn(index) {
    return index;
  }


}
