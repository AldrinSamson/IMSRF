import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';

import { InventoryPartnerComponent, ViewBatchPartnerComponent } from '../../components/inventory/inventory-PV.component';
import { SummaryPartnerComponent } from '../../components/summary/summary-PV.component';
import { RequestsPartnerComponent, PartnerAddPartnerRequestComponent, PartnerAddRequestComponent,
  PartnerViewPartnerRequestComponent, PartnerViewRequestComponent } from '../../components/requests/requests-PV.component';
import { ReportsPartnerComponent , ViewFeedbackComponent } from '../../components/reports/reports-PV.component';
import { DispatchPartnerComponent, ViewOrderComponent, ValidateOrderComponent } from '../../components/dispatch/dispatch-PV.component';

const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  {
     path: 'inventory',
     component: InventoryPartnerComponent,
  },
  {
     path: 'summary',
     component: SummaryPartnerComponent,
  },
  {
     path: 'dispatch',
     component: DispatchPartnerComponent,
  },
  {
    path: 'requests',
    component: RequestsPartnerComponent,
  },
  {
    path: 'reports',
    component: ReportsPartnerComponent,
  }
]

@NgModule({
  declarations: [
    InventoryPartnerComponent,
    SummaryPartnerComponent,
    DispatchPartnerComponent,
    RequestsPartnerComponent,
    ReportsPartnerComponent,
    ViewOrderComponent,
    ValidateOrderComponent,
    ViewBatchPartnerComponent,
    ViewFeedbackComponent,
    PartnerAddPartnerRequestComponent,
    PartnerAddRequestComponent,
    PartnerViewPartnerRequestComponent,
    PartnerViewRequestComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,

    MaterialFileInputModule,
    MatFormFieldModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class PartnerModule { }
