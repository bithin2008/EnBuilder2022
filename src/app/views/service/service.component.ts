import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
    selector: 'app-service',
    templateUrl: './service.component.html',
    styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
    baseUrl = environment.BASE_URL;
    defaultActiveTab: any = 'dashboardTab';
    title: string = '';
    project_id: any = '';
    dashboard_project_id: any = '';
    projectList: any = [] = [];
    eventsSubject: Subject<void> = new Subject<void>();
    projectEventsSubject: Subject<void> = new Subject<void>();
    dashboardProjectEvents: Subject<void> = new Subject<void>();
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService

    ) { }

    ngOnInit(): void {
        if (localStorage.getItem('serviceActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('serviceActiveTab');
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
                    this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
                }
                else {
                    this.getProjectList();
                }
            }else{
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }


    doTabFunctions(event) {
        this.defaultActiveTab=event.nextId;
        if (event.nextId == 'dashboardTab') {
            localStorage.setItem('serviceActiveTab', 'dashboardTab');
        }
        if (event.nextId == 'occupancydatesTab') {
            localStorage.setItem('serviceActiveTab', 'occupancydatesTab');
            let obj: any = { projects: this.projectList };
            this.projectEventsSubject.next(obj);
        }
        if (event.nextId == 'deficienciesTab') {
            localStorage.setItem('serviceActiveTab', 'deficienciesTab');
            let obj: any = { projects: this.projectList };
            this.projectEventsSubject.next(obj);
        }
        if (event.nextId == 'checklistInspactionTab') {
            localStorage.setItem('serviceActiveTab', 'checklistInspactionTab');
        }
        if (event.nextId == 'settingsTab') {
            localStorage.setItem('serviceActiveTab', 'settingsTab');
        }
        if (event.nextId == 'checklistsTab') {
            localStorage.setItem('serviceActiveTab', 'checklistsTab');
            let obj: any = { projects: this.projectList };
            this.projectEventsSubject.next(obj);

        }
        

        this.setPageTitle(localStorage.getItem('serviceActiveTab'));
    }

    setPageTitle(selectedTab) {
        switch (selectedTab) {
            case 'dashboardTab':
                this.title = 'Dashboard';
                break;
            case 'occupancydatesTab':
                this.title = 'Occupancy Dates';
                break;
            case 'deficienciesTab':
                this.title = 'Deficiencies';
                break;
            case 'checklistTab':
                this.title = 'Checklist';
                break;
            case 'checklistsTab':
                this.title = 'Checklists';
                break;
            case 'settingsTab':
                this.title = 'Settings';
                break;
            default:
                this.title = '';
                break;
        }
    }


    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('serviceProjectData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData && filterData._id) {
                this.project_id = filterData._id;
            }
            else {
                this.project_id = this.projectList.length > 0 ? this.projectList[0]._id : '';
                this.onProjectChange(this.project_id);
            }
        } else {
            this.project_id = this.projectList.length > 0 ? this.projectList[0]._id : '';
            this.onProjectChange(this.project_id);
        }

        let projectFilterData: any = localStorage.getItem('serviceDashboardProjectData');
        this.dashboard_project_id ='';
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
                if (projectFilterData._id) {
                    this.dashboard_project_id = projectFilterData._id;
                }
        }
    // this.onDashboardProjectChange(this.dashboard_project_id);
    }

    onProjectChange(value) {
        let topLevelSelectedProject = this.projectList.find(ele => ele._id == value);
        if (topLevelSelectedProject) {
            this.project_id=value;
            localStorage.setItem('serviceProjectData', JSON.stringify(topLevelSelectedProject));
            this.eventsSubject.next(topLevelSelectedProject);
        }
        else {
            let firstProject = this.projectList.length > 0 ? this.projectList[0] : "";
            this.project_id=firstProject ? firstProject._id:'';
            localStorage.setItem('serviceProjectData', JSON.stringify(''));
            this.eventsSubject.next(firstProject);
        }
    }

    getProjectList(project_id?) {
        this.spinnerService.show();
        let url = `service/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                let obj: any = { projects: this.projectList };
                this.projectEventsSubject.next(obj);
                this.getSavedFilterdata();
            }

        }, (error) => {
            console.log('error', error);
        });
    }

    onDashboardProjectChange(value){
        let topLevelSelectedProject = this.projectList.find(ele => ele._id == value);
        if (topLevelSelectedProject) {
            this.dashboard_project_id=value;
            localStorage.setItem('serviceDashboardProjectData', JSON.stringify(topLevelSelectedProject));
            this.dashboardProjectEvents.next(topLevelSelectedProject);
        }
        else {
            this.dashboard_project_id='';
            let firstProject  =null;
            localStorage.setItem('serviceDashboardProjectData', JSON.stringify(''));
            this.dashboardProjectEvents.next(firstProject);
        }
        this.onProjectChange(value);
    }

    onProjectChanged(data){
        if(data && data.project_id){
            this.project_id=data.project_id;
            let topLevelSelectedProject = this.projectList.find(ele => ele._id == this.project_id);
            if (topLevelSelectedProject) {
                localStorage.setItem('serviceProjectData', JSON.stringify(topLevelSelectedProject));
            }
            else {
                localStorage.setItem('serviceProjectData', JSON.stringify(''));
            }
    
        }
    }

    onServiceDashboardProjectChanged(data){
        if(data && !data.project_id){
            setTimeout(()=>{
                this.dashboard_project_id='';
            },1000)
            // localStorage.setItem('serviceDashboardProjectData', JSON.stringify(''));    
        }
    }
}
