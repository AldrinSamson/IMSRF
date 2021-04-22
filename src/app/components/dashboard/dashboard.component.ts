import { Component, OnDestroy, OnInit } from '@angular/core';
import { DispatchService, EventService, InventoryService, PartnerService, BloodTypes } from '@shared'
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

export class InventoryFiltered {
  total: number; 
  AP: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  p4;
  p2;
  order$: Observable<any>;
  event$: Observable<any>;
  activeRequest$: Observable<any>;
  inventory$: Subscription;
  partner$: Subscription;
  partnerData;
  inventoryData;
  inventoryFilteredTotal
  inventoryFiltered = [];
  selectedPartner;
  activeRequestCount 
  pendingRequestCount

  constructor(
    private readonly dispatchService: DispatchService,
    private readonly eventService: EventService,
    private readonly inventoryService: InventoryService,
    public partnerService: PartnerService,
    public db: AngularFirestore 
    ) { }

  ngOnInit(): void {
    this.getData();
    this.countRequest();
  }

  async countRequest() {

      await this.db.collection('request',  ref => ref.where("status",
      "in" , ['Approved'])).get().subscribe( data => {
        this.activeRequestCount = data.size ;
      });
   
      await this.db.collection('request',  ref => ref.where("status",
      "==" , 'For Approval')).get().subscribe( data => {
        this.pendingRequestCount = data.size ;       
      });   
  }

  getInventory(partnerID) {
    this.inventory$ = this.inventoryService.getInventoryOfPartner(partnerID).subscribe( res => {
      this.inventoryData = res
      let sum = 0;
      this.inventoryData.forEach(obj => {
        sum += obj.quantity;
      });
      this.inventoryFilteredTotal= sum;

      for (const bloodType of BloodTypes.bloodTypes){
        this.inventoryFiltered.push(this.filterAndSumAR(bloodType));
      }
    });
  }

  getData() {
    this.order$ = this.dispatchService.getActiveOrder();
    this.event$ = this.eventService.getActive();
    this.activeRequest$ = this.dispatchService.getApprovedRequests();
    this.partner$ = this.partnerService.getAll().subscribe( res => {
      this.partnerData = res
      this.getInventory(this.partnerData[0].partnerID);
      this.selectedPartner = this.partnerData[0].partnerID;
    });
  }

  selectPartner() {
    this.inventory$.unsubscribe();
    this.inventoryFilteredTotal = 0;
    this.inventoryFiltered = [];
    this.getInventory(this.selectedPartner);
  }

  filterAndSumAR(bloodType) {
    let sum = 0;
    let filtered = this.inventoryData.filter(function (el) {
      return el.bloodType === bloodType;
    });

    filtered.forEach(obj => {
          sum += obj.quantity;
    })
    return sum;
  }

  trackByFn(index) {
    return index;
  }

  ngOnDestroy() {
    if (this.partner$ != null) {
      this.partner$.unsubscribe();
    }
    if (this.inventory$ != null) {
      this.inventory$.unsubscribe();
    }
  }


}
