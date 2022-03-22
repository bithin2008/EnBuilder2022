import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-package-locations',
    templateUrl: './package-locations.component.html',
    styleUrls: ['./package-locations.component.css']
})
export class PackageLocationsComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    projectList: any = [];
    filterForm: any = {
        // searchText: '',
        project_id: ''
    };
    itemsList: any[] = [];
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    reverse: boolean = true;
    isClear: boolean = false;
    isEdit: boolean = false;
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }
    ngOnInit(): void {
        this.getProjectList();
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
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
    onProjectChange() {
        this.getItemslist();
    }


    getProjectList() {
        this.spinnerService.show();
        let url = `package-center/projects`;
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
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData._id) {
                this.filterForm.project_id = projectData._id;
            }
            else {
                //do if project id not found
            }
        }
        else {
            //do if project id not found
        }

        let filterData: any = localStorage.getItem('packageLoctaionsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

            if (filterData.page) {
                this.page = filterData.page;
            }
            // if (filterData.searchText) {
            //     this.filterForm.searchText = filterData.searchText;
            //     this.isClear = true;
            // }
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

        this.getItemslist();
    }

    getItemslist() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `package-center/project-settings?type=PROJECT-PACKAGE-LOCATION&page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.itemsList = [];
                this.itemsList = response.results ? response.results : [];
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1? this.paginationObj.totalPages-1 :1;
                    this.getItemslist()  
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
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    saveFilter() {
        let data = {
            // project_id: this.filterForm.project_id,
            // searchText: this.filterForm.searchText,
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder
        }
        localStorage.setItem('packageLoctaionsFilterData', JSON.stringify(data));
    }

    setOrder(value: string) {
        if (this.order === value) {
            this.reverse = !this.reverse;
        }
        this.order = value;
        this.sortedtby = value;
        if (this.reverse) {
            this.sortOrder = 'DESC';
        } else {
            this.sortOrder = 'ASC';
        }
        this.getItemslist();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getItemslist();
    }

    setPageSize() {
        this.page = 1;
        this.getItemslist();
    }

    openAddModal(template: TemplateRef<any>) {
        if (!this.filterForm.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        this.isEdit = false;
        this.formDetails = {
            order: this.itemsList.length + 1,
        };
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    openEditModal(template: TemplateRef<any>, item) {

        this.isEdit = true;
        this.formDetails = { ...item };
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);
        this.formDetails.project_name = selectedProject ? selectedProject.name : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    addItem() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        let selectedProject = this.projectList.find((data) => data._id == this.filterForm.project_id);

        let data: any = {
            type: "PROJECT-PACKAGE-LOCATION",
            order: this.formDetails.order,
            name: this.formDetails.name.trim(),
            project_id: this.filterForm.project_id,
            project_name: selectedProject ? selectedProject.name : ''

        };
        this.spinnerService.show();
        let url = `package-center/project-settings`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getItemslist();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    editItem() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        let data: any = {
            // order: this.formDetails.order,
            name: this.formDetails.name,
            _id: this.formDetails._id
        };

        this.spinnerService.show();
        let url = `package-center/project-settings`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getItemslist();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteItem(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this ${item.name} location?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/project-settings?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getItemslist();
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

    reArrangeLocationOrder(direction, index) {
        if (direction == 'up') {
            let previous = { ...this.itemsList[index - 1] };
            let current = { ...this.itemsList[index] };
            let payload = {
                data: [
                    {
                        _id: previous._id,
                        order: previous.order + 1
                    },
                    {
                        _id: current._id,
                        order: current.order - 1
                    }
                ]
            }
            this.onStepChange(payload);

        }
        else if (direction == 'down') {
            let next = { ... this.itemsList[index + 1] };
            let current = { ...this.itemsList[index] };
            let payload = {
                data: [
                    {
                        _id: next._id,
                        order: next.order - 1
                    },
                    {
                        _id: current._id,
                        order: current.order + 1
                    }
                ]
            }
            this.onStepChange(payload);
        }
    }

    onStepChange(data) {
        this.spinnerService.show();
        let url = `package-center/rearrange-project-settings`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getItemslist();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

}
