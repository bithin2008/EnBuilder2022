import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-inventories',
    templateUrl: './inventories.component.html',
    styleUrls: ['./inventories.component.css']
})
export class InventoriesComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'dashboardTab';
    project_id: any = '';
    projectList: any = [] = [];
    title: string = '';
    eventsSubject: Subject<void> = new Subject<void>();
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }

    ngOnInit(): void {
        if (localStorage.getItem('dashboarActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('dashboarActiveTab');
            this.setPageTitle(this.defaultActiveTab);

        }
        else {
            this.setPageTitle(this.defaultActiveTab);
        }
        this.checkLogin();
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('inventoriesProjectData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData && filterData._id) {
                this.project_id = filterData._id;
            }
            this.getProjectList();

        }
        else {
            this.getProjectList();
        }
    }

    onProjectChange(value) {
        let topLevelSelectedProject = this.projectList.find(ele => ele._id == value);
        if (topLevelSelectedProject) {
            this.eventsSubject.next(topLevelSelectedProject);
            localStorage.setItem('inventoriesProjectData', JSON.stringify(topLevelSelectedProject));
        }
        else {
            this.eventsSubject.next(undefined);
            localStorage.setItem('inventoriesProjectData', JSON.stringify(''));
        }
    }

    // checkLogin() {
    //     let url = 'whoami';
    //     this.webService.get(url).subscribe((response: any) => {
    //         if (response.success && response.result.isGuest) {
    //             this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
    //         }
    //         else {
    //             this.getSavedFilterdata();
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
                  this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
              }
              else {
                this.getSavedFilterdata();
              }
          }
          else {
              this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
          }

      }, (error) => {
          this.toastr.error(error, 'Error!');
      })
    }

    getProjectList(project_id?) {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100&type=list`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
            }

        }, (error) => {
            console.log('error', error);
        });
    }

    doTabFunctions(event) {
        if (event.nextId == 'dashboardTab') {
            localStorage.setItem('dashboarActiveTab', 'dashboardTab');
        }
        if (event.nextId == 'modelsTab') {
            localStorage.setItem('dashboarActiveTab', 'modelsTab');
        }
        if (event.nextId == 'unitsTab') {
            localStorage.setItem('dashboarActiveTab', 'unitsTab');
        }
        if (event.nextId == 'parkingTab') {
            localStorage.setItem('dashboarActiveTab', 'parkingTab');
        }
        if (event.nextId == 'bicycleTab') {
            localStorage.setItem('dashboarActiveTab', 'bicycleTab');
        }
        if (event.nextId == 'lockerTab') {
            localStorage.setItem('dashboarActiveTab', 'lockerTab');
        }
        if (event.nextId == 'lotType') {
            localStorage.setItem('dashboarActiveTab', 'lotType');
        }
        this.setPageTitle(localStorage.getItem('dashboarActiveTab'));
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'dashboardTab':
                this.title = 'Inventory Dashboard';
                break;
            case 'modelsTab':
                this.title = 'Models';
                break;
            case 'unitsTab':
                this.title = 'Units';
                break;
            case 'parkingTab':
                this.title = 'Parking';
                break;
            case 'bicycleTab':
                this.title = 'Bicycle';
                break;
            case 'lockerTab':
                this.title = 'Locker';
                break;
            case 'lotType':
                this.title = 'Lot Type';
                break;
            default:
                this.title = '';
                break;
        }
    }

}
