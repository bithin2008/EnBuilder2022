import { Component, OnInit, EventEmitter,TemplateRef, Input, Output } from '@angular/core';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-checklist',
    templateUrl: './checklist.component.html',
    styleUrls: ['./checklist.component.css']
})
export class ChecklistComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;

    filterForm: any = {
        location: '',
        project_id: ''
    };
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    locationList: any[] = [];
    @Input() projectList: any = [];
    checkList: any[] = [];
    potentialIssues: any = [
        {
            potential_issue: ''
        },
        {
            potential_issue: ''
        },
        {
            potential_issue: ''
        }
    ];
    isEdit = false;
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();

    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        // this.getProjectList();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response._id;
                this.onProjectChange();
            }
            else {
                this.filterForm.project_id = '';
                this.onProjectChange();
            }
        });
        this.getSavedFilterdata();

    }

    getProjectList() {
        this.spinnerService.show();
        let url = `service/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;

                this.getSavedFilterdata();
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('serviceProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData._id) {
                this.filterForm.project_id = projectData._id;
            }
            else {
                this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id : '';
                let data = {
                    project_id: this.filterForm.project_id,
                }
                this.projectChanged.emit(data);
            }
        }
        else {
            this.filterForm.project_id = this.projectList.length>0 ? this.projectList[0]._id : '';
            let data = {
                project_id: this.filterForm.project_id,
            }
            this.projectChanged.emit(data);
        }

        let filterData: any = localStorage.getItem('serviceSettingsChecklistFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

            if (filterData.location) {
                this.filterForm.location = filterData.location;
            }
            if (filterData.page) {
                this.page = filterData.page;
            }
            if (filterData.pageSize) {
                this.pageSize = filterData.pageSize;
            }
            if (filterData.sortby) {
                this.sortedtby = filterData.sortby;
            }
            if (filterData.sortOrder) {
                this.sortOrder = filterData.sortOrder;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }

        this.getLocationList();
    }

    onProjectChange() {
        this.filterForm.location = '';
        this.getLocationList();
    }

    onLocationChange() {
        this.page = 1;
        this.getChecklist();

    }
    getChecklist() {
        // if (!this.filterForm.project_id) {
        //     this.toastr.warning('Please select project!', 'Warning');
        //     return false;
        // }
        // if (!this.filterForm.location) {
        //     this.toastr.warning('Please select location!', 'Warning');
        //     return false;
        // }
        this.saveFilter();
        // let url = `service/deficiencies?project_id=${this.filterForm.project_id}`;
        let url = `service/checklist-templates?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`
        }
        if (this.filterForm.location) {
            url = url + `&location=${this.filterForm.location}`
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.checkList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.checkList = response.results ? response.results : [];
                    if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                        this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                        this.getChecklist()  
                    }     
                    if (response.pagination) {

                        this.paginationObj = response.pagination;
                    }
                    else
                        this.paginationObj = {
                            total: 0
                        };
                } else {
                    this.paginationObj = {
                        total: 0
                    };
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getLocationList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `service/project-settings?type=PROJECT-ISSUE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                    // if (!this.filterForm.location || !this.filterForm.location.trim()) {
                    //     this.filterForm.location = this.locationList.length > 0 ? this.locationList[0].name : '';
                    // }
                    this.getChecklist();
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    saveFilter() {
        let data = {
            location: this.filterForm.location,
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder
        }
        localStorage.setItem('serviceSettingsChecklistFilterData', JSON.stringify(data));
    }
    doPaginationWise(page) {
        this.page = page;
        this.getChecklist();
    }

    setPageSize() {
        this.page = 1;
        this.getChecklist();
    }

    openAddIssue(template: TemplateRef<any>) {
        this.formDetails = {};
        this.isEdit = false;
        this.potentialIssues=[];
        for(let i=0;i<3;i++){
            this.potentialIssues.push({ potential_issue: '' });
        }
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    editIssue(template: TemplateRef<any>, item) {
        this.formDetails = Object.assign({}, item);
        this.potentialIssues = [];
        item.potential_issues.forEach(element => {
            this.potentialIssues.push({ potential_issue: element });
        });
        this.isEdit = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    addIssues() {
        if (!this.formDetails.title) {
            this.toastr.warning('Please select title', 'Warning');
            return;
        }

        // let emptyPotential = this.potentialIssues.find(element => !element.potential_issue);
        // if (emptyPotential) {
        //     this.toastr.warning('Please enter all potential issue', 'Warning');
        //     return;
        // }
        let url = `service/checklist-templates`;
        let potentialIssues = [];
        this.potentialIssues.forEach(element => {
            potentialIssues.push(element.potential_issue);
        });
        // if (this.formDetails.potential_issue1 && this.formDetails.potential_issue1.trim()) {
        // }
        // if (this.formDetails.potential_issue2 && this.formDetails.potential_issue2.trim()) {
        //     potentialIssues.push(this.formDetails.potential_issue2);
        // }
        // if (this.formDetails.potential_issue3 && this.formDetails.potential_issue3.trim()) {
        //     potentialIssues.push(this.formDetails.potential_issue3);
        // }
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);

        let data: any = {
            title: this.formDetails.title,
            potential_issues: potentialIssues,
            location: this.filterForm.location,
            project_name: selectedProject.name,
            project_id: this.filterForm.project_id

        };
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getChecklist();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    editIssues() {
        if (!this.formDetails.title) {
            this.toastr.warning('Please select title', 'Warning');
            return;
        }

        // let emptyPotential = this.potentialIssues.find(element => !element.potential_issue);
        // if (emptyPotential) {
        //     this.toastr.warning('Please enter all potential issue', 'Warning');
        //     return;
        // }
        let url = `service/checklist-templates`;
        let potentialIssues = [];
        this.potentialIssues.forEach(element => {
            potentialIssues.push(element.potential_issue);
        });
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);

        let data: any = {
            title: this.formDetails.title,
            potential_issues: potentialIssues,
            _id: this.formDetails._id
        };
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getChecklist();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    addIssue() {
        this.potentialIssues.push({ potential_issue: '' });
    }

    deleteIssue(i) {
        this.potentialIssues.splice(i, 1);
    }

    deleteCheckItem(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this item?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `service/checklist-templates?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getChecklist();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
}
