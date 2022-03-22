import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

@Component({
    selector: 'app-purchaser',
    templateUrl: './purchaser.component.html',
    styleUrls: ['./purchaser.component.css']
})
export class PurchaserComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'projectProgressTab';
    title: string = '';
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService) { }
    ngOnInit(): void {
        if (localStorage.getItem('purchaserActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('purchaserActiveTab');
            this.setPageTitle(this.defaultActiveTab);

        }
        else {
            this.setPageTitle(this.defaultActiveTab);
        }
        this.checkLogin();
    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if(response.success){

                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
                else {
                }
            }
            else{
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    doTabFunctions(event) {
        if (event.nextId == 'projectProgressTab') {
            localStorage.setItem('purchaserActiveTab', 'projectProgressTab');
        }
        if (event.nextId == 'homeOwnersTab') {
            localStorage.setItem('purchaserActiveTab', 'homeOwnersTab');
        }
        if (event.nextId == 'unitsDealTab') {
            localStorage.setItem('purchaserActiveTab', 'unitsDealTab');
        }
        if (event.nextId == 'portalAppTab') {
            localStorage.setItem('purchaserActiveTab', 'portalAppTab');
        }
        if (event.nextId == 'layoutCustomizationTab') {
            localStorage.setItem('purchaserActiveTab', 'layoutCustomizationTab');
        }
        
        this.setPageTitle(localStorage.getItem('purchaserActiveTab'));
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'projectProgressTab':
                this.title = 'Project Progress';
                break;
            case 'homeOwnersTab':
                this.title = 'Home Owners';
                break;
            case 'unitsDealTab':
                this.title = 'Units/Deal';
                break;
            case 'portalAppTab':
                this.title = 'Portal App';
                break;
            case 'layoutCustomizationTab':
                this.title = 'Layout Customization';
                break;
                
            default:
                this.title = '';
                break;
        }
    }

}
