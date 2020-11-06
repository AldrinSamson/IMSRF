import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';

// Main Components
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { InventoryComponent } from '../../components/inventory/inventory.component'
import { EventsComponent } from '../../components/events/events.component'
import { PartnersComponent, AddPartnerComponent, ViewPartnerComponent } from '../../components/partners/partners.component';
import { DonorsComponent } from '../../components/donors/donors.component';
import { DispatchComponent } from '../../components/dispatch/dispatch.component';
import { AccountsComponent, AddUserComponent, ViewUserComponent, ChangePasswordComponent } from '../../components/accounts/accounts.component';
import { ReportsComponent } from '../../components/reports/reports.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
     path: 'dashboard',
     component: DashboardComponent,
  },
  {
     path: 'inventory',
     component: InventoryComponent,
  },
  {
    path: 'events',
    component: EventsComponent,
  },
  {
    path: 'partners',
    component: PartnersComponent,
  },
  {
    path: 'donors',
    component: DonorsComponent,
  },
  {
    path: 'dispatch',
    component: DispatchComponent,
  },
  {
    path: 'accounts',
    component: AccountsComponent,
  },
  {
    path: 'reports',
    component: ReportsComponent,
  }
]

@NgModule({
  declarations: [
    // Components
    DashboardComponent,
    InventoryComponent,
    EventsComponent,
    PartnersComponent,
    DonorsComponent,
    DispatchComponent,
    AccountsComponent,
    ReportsComponent,

    // Dialogs
    AddPartnerComponent,
    ViewPartnerComponent,
    AddUserComponent,
    ViewUserComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgbModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,

    MaterialFileInputModule,
    MatFormFieldModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class MainModule { }
