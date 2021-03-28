import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { AlertService } from './alert.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthService {
  public token: any;
  userDetails: Array<any>;
  userUid: any;
  userPosition: any;


  constructor(public afAuth: AngularFireAuth,
    private router: Router,
    private db: AngularFirestore,
    private alert: AlertService,
    public fbs: FirebaseService
    ) { }

  async login(email: string, password: string) {
    try {
      this.alert.showToaster('Authenticating ...');
      const result = await this.afAuth.signInWithEmailAndPassword(email, password).then( res => {
        this.userUid = res.user.uid;
        // tslint:disable-next-line: no-shadowed-variable
        const auth = this.db.collection('user', ref => ref.where('uid', '==', res.user.uid)).valueChanges({idField: 'id'})
        .forEach( result2 => {
          this.userDetails = result2;
          if (result2.length !== 0) {
            sessionStorage.setItem('session-alive', 'true');
            sessionStorage.setItem('session-user-uid', this.userUid);
            sessionStorage.setItem('session-user-details', JSON.stringify(this.userDetails[0]));
            this.fbs.audit('Authentication' , 'Logged In', email);
            this.alert.showToaster('Logged In!');
            if (this.userDetails[0].position === 'Partner') {
              this.router.navigate(['/partner']);
            } else {
              this.router.navigate(['/main']);
            }
          } else {
            this.alert.showToaster('Invalid Account type');
          }
      });
      });
    } catch (err) {
      console.log(err);
      this.alert.showToaster('Email or Password is wrong');
    }
  }

  public logout(): void {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    this.fbs.audit('Authentication' , 'Logged Out' , this.userPosition.email);
    sessionStorage.removeItem('session-alive');
    sessionStorage.removeItem('session-user-uid');
    sessionStorage.removeItem('session-user-details');
    this.token = null;
    this.router.navigate(['/']);
  }

  public getIdToken(): string {
   firebase.auth().currentUser.getIdToken()
      .then(
        (token: string) => this.token = token
      );
    return this.token;
  }

  public isAuthenticated(): string {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (this.userPosition.position === 'System Admin' || this.userPosition.position === 'Event Manager'
    || this.userPosition.position === 'Blood Donor Manager' || this.userPosition.position === 'Dispatch & Request Manager') {
      return sessionStorage.getItem('session-alive');
    }
    return 'false'
  }

  public isPartnerAuthenticated(): string {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (this.userPosition.position === 'Partner') {
      return sessionStorage.getItem('session-alive');
    }

    return 'false'
  }

  public isAdmin() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'System Admin') {
      return true;
    } else {
      return false;
    }
  }

  public isEventManager() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Event Manager') {
      return true;
    } else {
      return false;
    }
  }

  public isBloodDonorManager() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Blood Donor Manager') {
      return true;
    } else {
      return false;
    }
  }

  public isDispatchRequestManager() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Dispatch & Request Manager') {
      return true;
    } else {
      return false;
    }
  }

  public isPartner() {
    this.userPosition = JSON.parse(sessionStorage.getItem('session-user-details'));
    if (!this.isAuthenticated() || !this.isPartnerAuthenticated()) {
      return false;
    } else if (this.userPosition.position === 'Partner') {
      return true;
    } else {
      return false;
    }
  }

  public userName() {
    const userName = JSON.parse(sessionStorage.getItem('session-user-details'));
    return userName.fullName
  }

  public partnerID() {
    const userName = JSON.parse(sessionStorage.getItem('session-user-details'));
    return userName.partnerID
  }
}
