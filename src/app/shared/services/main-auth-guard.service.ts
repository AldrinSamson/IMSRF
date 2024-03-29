import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class MainAuthGuardService implements CanActivate {
  constructor(private authService: AuthService,
    private router: Router) { }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated() === 'false') {
      this.router.navigate(['/**']);
      return false;
    } else {
      return true;
    }
  }
}
