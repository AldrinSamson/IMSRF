import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public uiBasicCollapsed = false;
  public samplePagesCollapsed = false;
  userDetails = JSON.parse(sessionStorage.getItem('session-user-details'));
  isPartner;
  isAdmin;
  isEventManager;
  isBloodDonorManager;
  isDispatchRequestManager;

  constructor( private readonly authService: AuthService ) {
     this.isPartner = this.authService.isPartner();
     this.isAdmin = this.authService.isAdmin();
     this.isEventManager = this.authService.isEventManager();
     this.isBloodDonorManager = this.authService.isBloodDonorManager();
     this.isDispatchRequestManager = this.authService.isDispatchRequestManager();
  }

  ngOnInit() {
    const body = document.querySelector('body');

    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    document.querySelectorAll('.sidebar .nav-item').forEach(function (el) {
      el.addEventListener('mouseover', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.add('hover-open');
        }
      });
      el.addEventListener('mouseout', function() {
        if(body.classList.contains('sidebar-icon-only')) {
          el.classList.remove('hover-open');
        }
      });
    });
  }
}
