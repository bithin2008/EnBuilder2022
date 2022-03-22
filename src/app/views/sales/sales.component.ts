import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
@Component({
    selector: 'app-sales',
    templateUrl: './sales.component.html',
    styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'registrantsTab';
    title: string = '';
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }
    ngOnInit(): void {
        if (localStorage.getItem('salesActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('salesActiveTab');
            this.setPageTitle(this.defaultActiveTab);
        }
        else {
            this.setPageTitle(this.defaultActiveTab);
        }
        this.checkLogin();
    }
    // checkLogin() {
    //     let url = 'whoami';
    //     this.webService.get(url).subscribe((response: any) => {
    //         if (response.success && response.result.isGuest) {
    //             this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
    //         }
    //         else {
    //         }
    //     }, (error) => {
    //         this.toastr.error(error, 'Error!');
    //     })
    // }

    checkLogin() {
      let url = 'whoami';
      this.webService.get(url).subscribe((response: any) => {

          if (response.success) {

              if (response.result.isGuest) {
                  this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
              }
              else {
              }
          }
          else {
              this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
          }

      }, (error) => {
          this.toastr.error(error, 'Error!');
      })
  }

    doTabFunctions(event) {
        if (event.nextId == 'registrantsTab') {
            localStorage.setItem('salesActiveTab', 'registrantsTab');
        }
        if (event.nextId == 'worksheetsTab') {
            localStorage.setItem('salesActiveTab', 'worksheetsTab');
        }
        if (event.nextId == 'contactsTab') {
            localStorage.setItem('salesActiveTab', 'contactsTab');
        }
        if (event.nextId == 'listsTab') {
            localStorage.setItem('salesActiveTab', 'listsTab');
        }
        if (event.nextId == 'dealsTab') {
            localStorage.setItem('salesActiveTab', 'dealsTab');
        }
        if (event.nextId == 'salesSettingsTab') {
            localStorage.setItem('salesActiveTab', 'salesSettingsTab');
        }
        this.setPageTitle(localStorage.getItem('salesActiveTab'));
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'registrantsTab':
                this.title = 'Registrants';
                break;
            case 'worksheetsTab':
                this.title = 'Worksheets';
                break;
            case 'contactsTab':
                this.title = 'Contacts';
                break;
            case 'listsTab':
                this.title = 'Lists';
                break;
            case 'dealsTab':
                this.title = 'Deals';
                break;
            case 'salesSettingsTab':
                this.title = 'Settings';
                break;
            default:
                this.title = '';
                break;
        }
    }

}
