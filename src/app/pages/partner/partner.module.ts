import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { InventoryComponent } from '../../components/inventory/inventory.component'

const routes: Routes = [
  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  {
     path: 'inventory',
     component: InventoryComponent,
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
