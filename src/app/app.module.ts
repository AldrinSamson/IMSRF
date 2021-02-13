import { NgModule } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { HttpClientModule } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule, ThemeService } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MaterialFileInputModule } from 'ngx-material-file-input';

import { AlertService, AuthGuardService, AuthService, ValidationService, PartnerAuthGuardService , MainAuthGuardService } from '@shared';
import { firebaseKeys } from './firebase.config';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { ContentAnimateDirective } from './shared/directives/content-animate.directive';

import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { ToasterComponent } from './shared/toaster/toaster.component';
import { ControlMessagesComponent } from './shared/control-messages/control-messages.component';
import { PartnerComponent } from './pages/partner/partner.component';
import { ProfileComponent, ChangePasswordComponent } from './pages/profile/profile.component';
import { RequesterComponent } from './components/requester/requester.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    SpinnerComponent,
    ContentAnimateDirective,
    LoginComponent,
    MainComponent,
    ToasterComponent,
    ControlMessagesComponent,
    PartnerComponent,
    ProfileComponent,
    ChangePasswordComponent,
    RequesterComponent
  ],
  imports: [
    AngularFireModule.initializeApp(firebaseKeys),
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    AngularFireAuthModule,
    MaterialFileInputModule,
    MatFormFieldModule,
    HttpClientModule

  ],
  providers: [
    ThemeService,
    AlertService,
    AuthGuardService,
    AuthService,
    ValidationService,
    AngularFireStorage,
    BrowserAnimationsModule,
    BrowserModule,
    PartnerAuthGuardService,
    MainAuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
