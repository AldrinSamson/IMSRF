import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService , PartnerAuthGuardService, MainAuthGuardService } from '@shared';
import { MainComponent } from './pages/main/main.component';
import { PartnerComponent } from './pages/partner/partner.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './pages/login/login.component';
import { Error404Component } from './pages/error-pages/error404/error404.component'
import { Error500Component } from './pages/error-pages/error500/error500.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login' , component: LoginComponent},
  { path: 'main' , component: MainComponent ,  loadChildren: './pages/main/main.module#MainModule',
  canActivate: [MainAuthGuardService]},
  { path: 'partner' , component: PartnerComponent ,  loadChildren: './pages/partner/partner.module#PartnerModule',
  canActivate: [PartnerAuthGuardService]},
  { path: 'profile', component: ProfileComponent ,
  canActivate: [AuthGuardService] },
  { path: 'partner/profile', component: ProfileComponent ,
  canActivate: [PartnerAuthGuardService] },
  { path: '500', component: Error500Component },
  { path: '**', component: Error404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
