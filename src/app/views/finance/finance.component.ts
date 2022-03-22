import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Subject } from 'rxjs';
@Component({
    selector: 'app-finance',
    templateUrl: './finance.component.html',
    styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {

    title: string = '';
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'unitPricingTab';
    projectId: any = '';
    // builderId: any = '';
    projectList: any = [] = [];
    // builderList: any = [] = [];
    eventsSubject: Subject<any> = new Subject<any>();
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }

    ngOnInit(): void {
        if (localStorage.getItem('financeActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('financeActiveTab');
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
            if (response.success) {

                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
                }
                else {
                    this.getSavedFilterdata();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    doTabFunctions(event) {
        if (event.nextId == 'unitPricingTab') {
            localStorage.setItem('financeActiveTab', 'unitPricingTab');
        }
        if (event.nextId == 'dealPricingTab') {
            localStorage.setItem('financeActiveTab', 'dealPricingTab');
        }
        if (event.nextId == 'depositTab') {
            localStorage.setItem('financeActiveTab', 'depositTab');
        }
        if (event.nextId == 'commissionsTab') {
            localStorage.setItem('financeActiveTab', 'commissionsTab');
        }
        if (event.nextId == 'depositStructureTab') {
            localStorage.setItem('financeActiveTab', 'depositStructureTab');
        }
        if (event.nextId == 'insentivesTab') {
            localStorage.setItem('financeActiveTab', 'insentivesTab');
        }
        if (event.nextId == 'settingsTab') {
            localStorage.setItem('financeActiveTab', 'settingsTab');
        }
        if (event.nextId == 'paymentTab') {
            localStorage.setItem('financeActiveTab', 'paymentTab');
        }
        this.setPageTitle(localStorage.getItem('financeActiveTab'));

    }


    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('financeTabData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData) {
                this.projectId = filterData.project_id ? filterData.project_id : '';
                // this.builderId = filterData.builder_id ? filterData.builder_id : '';
            }
        }
        // this.getBuilderList();
        this.getProjectList();
    }

    onProjectChange() {
        let data = this.getProjectAndBuilder();
        localStorage.setItem('financeTabData', JSON.stringify(data));
        this.eventsSubject.next(data);
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `finance/projects`;
        // if (this.builderId) {
        //     url = url + `?builder_id=${this.builderId}`;
        // }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (!this.projectId) {
                    this.projectId = this.projectList[0] ? this.projectList[0]._id : '';
                    let data = this.getProjectAndBuilder();
                    localStorage.setItem('financeTabData', JSON.stringify(data));
                }
            }

        }, (error) => {
            console.log('error', error);
        });
    }

    // getBuilderList() {
    //     this.spinnerService.show();
    //     let url = `finance/builders`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.status == 1) {
    //             this.builderList = response.results;
    //             this.getProjectList();
    //         }

    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }

    // onBuilderChange(value) {
    //     this.projectId = '';
    //     this.getProjectList();
    //     let data = this.getProjectAndBuilder();
    //     localStorage.setItem('financeTabData', JSON.stringify(data));
    //     this.eventsSubject.next(data);
    // }

    getProjectAndBuilder() {
        let data = {
            project_id: this.projectId,
            // builder_id: this.builderId,
        };
        return data;
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'unitPricingTab':
                this.title = 'Unit Pricing';
                break;
            case 'dealPricingTab':
                this.title = 'Deal Pricing';
                break;
            case 'depositTab':
                this.title = 'Deposits';
                break;
            case 'commissionsTab':
                this.title = 'Commissions';
                break;
            case 'depositStructureTab':
                this.title = 'Deposit Structure';
                break;
            case 'insentivesTab':
                this.title = 'Incentives';
                break;
            case 'settingsTab':
                this.title = 'Settings';
                break;
            case 'paymentTab':
                this.title = 'Payments';
                break;
            default:
                this.title = '';
                break;
        }
    }

    onProjectChanged(data) {
        if (data && data.project_id) {
            this.projectId = data.project_id;
        }
    }
}
