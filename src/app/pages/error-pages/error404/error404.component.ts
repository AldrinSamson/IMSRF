import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared'

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss']
})
export class Error404Component implements OnInit {
  homeRoute: any

  constructor(private readonly authService: AuthService) {
    if(this.authService.isPartnerAuthenticated()) {
      this.homeRoute = '/partner'
    }else if (this.authService.isAuthenticated()) {
      this.homeRoute = '/main'
    }else {
      this.homeRoute = '/login'
    }
  }

  ngOnInit() {
  }

}
