import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-package-center',
    templateUrl: './package-center.component.html',
    styleUrls: ['./package-center.component.css']
})
export class PackageCenterComponent implements OnInit {
    title: string = '';
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'colorCollectionsTab';
    project_id: any = '';
    projectList: any = [] = [];
    eventsSubject: Subject<void> = new Subject<void>();
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private spinnerService: Ng4LoadingSpinnerService
    ) { }

    ngOnInit(): void {
        if (localStorage.getItem('packageCenterActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('packageCenterActiveTab');
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
            }
            else {
                this.getSavedFilterdata();
            }
        }else{
            this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
        }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    doTabFunctions(event) {
        if (event.nextId == 'colorCollectionsTab') {
            localStorage.setItem('packageCenterActiveTab', 'colorCollectionsTab');
        }
        if (event.nextId == 'packagesTab') {
            localStorage.setItem('packageCenterActiveTab', 'packagesTab');
        }
        if (event.nextId == 'optionsTab') {
            localStorage.setItem('packageCenterActiveTab', 'optionsTab');
        }
        if (event.nextId == 'settingsTab') {
            localStorage.setItem('packageCenterActiveTab', 'settingsTab');
        }
        if (event.nextId == 'packageLocationsTab') {
            localStorage.setItem('packageCenterActiveTab', 'packageLocationsTab');
        }

        this.setPageTitle(localStorage.getItem('packageCenterActiveTab'));

    }


    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('packageCenterProjectData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData && filterData._id) {
                this.project_id = filterData._id;
            }
        }
        // else {
        this.getProjectList();
        // }
    }

    onProjectChange(value) {
        let topLevelSelectedProject = this.projectList.find(ele => ele._id == value);
        if (topLevelSelectedProject) {
            this.eventsSubject.next(topLevelSelectedProject);
            let projectData = {
                _id:topLevelSelectedProject._id,
                no_of_floors:topLevelSelectedProject.no_of_floors,
                spaces:topLevelSelectedProject.spaces
            };
            localStorage.setItem('packageCenterProjectData', JSON.stringify(projectData));
        }
        else {
            this.eventsSubject.next(undefined);
            localStorage.setItem('packageCenterProjectData', JSON.stringify({}));
        }
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `package-center/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results ? response.results : [];
                // if(this.projectList.length > 0){
                //     if (!this.project_id) {
                //         this.onProjectChange(this.projectList[0]._id);
                //         this.project_id = this.projectList[0]._id;
                //     }
                // }
            }

        }, (error) => {
            console.log('error', error);
        });
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'colorCollectionsTab':
                this.title = 'Color Collections';
                break;
            case 'packagesTab':
                this.title = 'Packages';
                break;
            case 'optionsTab':
                this.title = 'Personalization Options';
                break;
            case 'settingsTab':
                this.title = 'Settings';
                break;
            case 'packageLocationsTab':
                this.title = 'Package Locations';
                break;
            default:
                this.title = '';
                break;
        }
    }

}
