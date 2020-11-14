import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { InventoryComponent } from '../../components/partner-view/inventory/inventory.component';
import { SummaryComponent } from '../../components/partner-view/summary/summary.component';
import { DispatchComponent } from '../../components/partner-view/dispatch/dispatch.component';

const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  {
     path: 'inventory',
     component: InventoryComponent,
  },
  {
     path: 'summary',
     component: SummaryComponent,
  },
  {
     path: 'dispatch',
     component: DispatchComponent,
  }
]

@NgModule({
  declarations: [
    InventoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class PartnerModule { }
