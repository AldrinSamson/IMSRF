import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService , PartnerAuthGuardService } from '@shared';
import { MainComponent } from './pages/main/main.component';
import { PartnerComponent } from './pages/partner/partner.component';
import { LoginComponent } from './pages/login/login.component';
import { Error404Component } from './pages/error-pages/error404/error404.component'
import { Error500Component } from './pages/error-pages/error500/error500.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login' , component: LoginComponent},
  { path: 'main' , component: MainComponent ,  loadChildren: './pages/main/main.module#MainModule',
  canActivate: [AuthGuardService]},
  { path: 'partner' , component: MainComponent ,  loadChildren: './pages/partner/partner.module#PartnerModule',
  canActivate: [PartnerAuthGuardService]},
  { path: '**', component: Error404Component },
  { path: '500', component: Error500Component }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
