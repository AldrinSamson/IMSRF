import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardDemoComponent } from './dashboard/dashboard.component';
import { MainComponent } from './pages/main/main.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventoryComponent } from './pages/inventory/inventory.component'
import { LoginComponent } from './pages/login/login.component';
import { EventsComponent } from './pages/events/events.component'
import { PartnersComponent } from './pages/partners/partners.component';
import { DonorsComponent } from './pages/donors/donors.component';
import { DispatchComponent } from './pages/dispatch/dispatch.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { ReportsComponent } from './pages/reports/reports.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login' , component: LoginComponent},
  { path: 'main' , component: MainComponent ,  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
       path: 'dashboard',
       component: DashboardComponent
    },
    {
       path: 'inventory',
       component: InventoryComponent
    },
    {
      path: 'events',
      component: EventsComponent
    },
    {
      path: 'partners',
      component: PartnersComponent
    },
    {
      path: 'donors',
      component: DonorsComponent
    },
    {
      path: 'dispatch',
      component: DispatchComponent
    },
    {
      path: 'accounts',
      component: AccountsComponent
    },
    {
      path: 'reports',
      component: ReportsComponent
    },
  ]},
  { path: 'template' , component: DashboardDemoComponent},
  { path: 'basic-ui', loadChildren: () => import('./basic-ui/basic-ui.module').then(m => m.BasicUiModule) },
  { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsDemoModule) },
  { path: 'forms', loadChildren: () => import('./forms/form.module').then(m => m.FormModule) },
  { path: 'tables', loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule) },
  { path: 'icons', loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule) },
  { path: 'general-pages', loadChildren: () => import('./general-pages/general-pages.module').then(m => m.GeneralPagesModule) },
  { path: 'apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule) },
  { path: 'user-pages', loadChildren: () => import('./user-pages/user-pages.module').then(m => m.UserPagesModule) },
  { path: 'error-pages', loadChildren: () => import('./error-pages/error-pages.module').then(m => m.ErrorPagesModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
