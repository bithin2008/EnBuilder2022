import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { navItems } from '../../_nav';
import { WebService } from '../../services/web.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgIdleService } from '../../services/ng-idle.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
  //styleUrls: ['./default-layout.component.css']
})
export class DefaultLayoutComponent implements OnInit {
  @ViewChild('profileModal') public profileModal: ModalDirective;
  @ViewChild('logoutTimerModal') public logoutTimerModal: ModalDirective;
  public sidebarMinimized = false;
  public navItems = navItems;
  searchText: string;
  token: any = '';
  userName: any = '';
  profile: any = {};
  // for timer
  idleTimerLeft: string;
  secondTimerLeft: string;
  timeRemain: number;
  FULL_DASH_ARRAY = 283;
  idleTime = 360;
  waitTime = 1;
  timeLeft: number = 60;
  interval;
  logoutCount = 0;
  constructor(
    private ngIdle: NgIdleService,
    private router: Router,
    private webService: WebService,
    private toastr: ToastrService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
  }
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  ngOnInit() {
    this.userName = localStorage.getItem("username");
    window.addEventListener('storage', (event) => {
      if (event.key == 'userLastAction') {
        this.closeTimerModal();
        NgIdleService.runSecondTimer = false;
        if (event.newValue == null) {
          this.startTimer();
          this.logoutTimerModal.show();
        }
        if (event.oldValue == null) {
          this.ngIdle.initilizeSessionTimeout();
        }
      }
    });
    this.initTimer(this.idleTime, this.waitTime);
  }
  openChangePassword() {
    this.profileModal.show();
  }
  updatePassword() {
    if (!this.profile.newpassword) {
      this.toastr.warning('Please enter new password', 'Warning');
    } else if (this.profile.newpassword != this.profile.confirmpassword) {
      this.toastr.warning('Password does not matched', 'Warning');
    } else {
      let url = `change-password`;
      this.spinnerService.show();
      this.webService.post(url, this.profile).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.success) {
          this.toastr.success(response.message, 'Success!');
          this.profileModal.hide();
        }
        else {
          this.toastr.error(response.message, 'Error!');
        }
      }, (error) => {
        this.toastr.error(error, 'Error!');
      })
    }
  }
  logout() {
    this.closeTimerModal();
    NgIdleService.runTimer = false;
    NgIdleService.runSecondTimer = false;
    let url = `logout`;
    this.spinnerService.show();
    this.webService.post(url, {}).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.success) {
        if (response.status === 0) {
          this.toastr.error(response.message, 'Error!');
        } else {
          // this.logoutCount = 0;
          // console.log('logout()',window.location.href);
          let redirectUrl = this.router.url.split('?');
          localStorage.removeItem('token');
          this.router.navigate(['/login'], { queryParams: { return_url: redirectUrl[0] } });
        }
      }
      else {
        this.toastr.error(response.message, 'Error!');
      }
    }, (error) => {
      this.toastr.error(error, 'Error!');
    })
  }
  startTimer() {
    this.timeLeft = 60;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 60;
      }
    }, 1000)
  }
  // for timer
  initTimer(firstTimerValue: number, secondTimerValue: number): void {
    // Timer value initialization
    this.ngIdle.USER_IDLE_TIMER_VALUE_IN_MIN = firstTimerValue;
    this.ngIdle.FINAL_LEVEL_TIMER_VALUE_IN_MIN = secondTimerValue;
    // end
    // Watcher on timer
    this.ngIdle.initilizeSessionTimeout();
    this.ngIdle.userIdlenessChecker.subscribe((status: string) => {
      this.initiateFirstTimer(status);
    });
    this.ngIdle.secondLevelUserIdleChecker.subscribe((status: string) => {
      this.initiateSecondTimer(status);
    });
  }
  initiateFirstTimer = (status: string) => {
    switch (status) {
      case 'INITIATE_TIMER':
        break;
      case 'RESET_TIMER':
        break;
      case 'STOPPED_TIMER':
        this.showSendTimerDialog();
        break;
      default:
        this.idleTimerLeft = this.formatTimeLeft(Number(status));
        break;
    }
  }
  initiateSecondTimer = (status: string) => {
    // let self = this;
    switch (status) {
      case 'INITIATE_SECOND_TIMER':
        break;
      case 'SECOND_TIMER_STARTED':
        break;
      case 'SECOND_TIMER_STOPPED':
        // if (this.logoutCount === 0) {
        //   this.logoutCount += 1;
          this.logout();
        // }
        break;
      default:
        this.secondTimerLeft = status;
        break;
    }
  }
  showSendTimerDialog(): void {
    this.startTimer();
    this.logoutTimerModal.show();
    setTimeout(() => {
      localStorage.removeItem('userLastAction');
    }, 500);
  }
  continue(): void {
    this.closeTimerModal();
    // stop second timer and initiate first timer again
    NgIdleService.runSecondTimer = false;
    this.ngIdle.initilizeSessionTimeout();
    window.location.reload();
  }
  closeTimerModal() {
    this.logoutTimerModal.hide();
    clearInterval(this.interval);
    // let bodyTag = this.el.nativeElement.querySelector(".app");
    // bodyTag.classList.remove('modal-open'); 
    // console.log('bodyTag',bodyTag)
  }
  /*** Draw timer circle*/
  formatTimeLeft = (time: number) => {
    if (time > 0) {
      let seconds = Math.trunc(time / 1000);
      // this.setCircleDasharray(seconds);
      let min = 0;
      if (seconds >= 60) {
        min = Math.trunc(seconds / 60);
        seconds -= (min * 60);
      }
      // seconds = this.pad(seconds, 2);
      return `${min}:${seconds}`;
    }
  }
  pad(str, max) {
    str = str.toString();
    return str.length < max ? this.pad("0" + str, max) : str;
  }
  setCircleDasharray = (elapsedTime: number) => {
    const timeLimit = this.idleTime * 60;
    this.timeRemain = elapsedTime / timeLimit;
    const circleDasharray = `${(
      this.timeRemain * this.FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    document.getElementById('base-timer-path-remaining').setAttribute('stroke-dasharray', circleDasharray);
  }
}
