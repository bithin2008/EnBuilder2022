import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-package-list',
    templateUrl: './package-list.component.html',
    styleUrls: ['./package-list.component.css']
})
export class PackageListComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    projectList: any = [];
    collectionsList: any = [];
    selectedProject: string = '';
    packageList: any = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    modalRef: BsModalRef;
    reverse: boolean = true;
    dropdownSettings = {};
    locationList: any[] = [];
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.getProjectList();
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.selectedProject = response._id;
                this.onProjectChange();
            }
            else {
                this.selectedProject = '';
                this.onProjectChange();
            }
        });
    }


    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.selectedProject = projectData._id;
            }
        }

        let filterData: any = localStorage.getItem('packageFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            // if (filterData.project_id) {
            //     this.selectedProject = filterData.project_id;
            // } else {
            //     this.selectedProject = this.projectList[0]._id;
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
        this.getPackageList();
        this.getLocationList();
        this.getCollections();

    }

    getCollections() {
        let url = `package-center/color-collections`;
        if (this.selectedProject) {
            url = url + `?project_id=${this.selectedProject}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.collectionsList = response.results;
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }

    getLocationList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `package-center/project-settings?type=PROJECT-PACKAGE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `package-center` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getProjectList() {
        let url = `package-center/projects?page=1&pageSize=100`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (this.projectList.length > 0) {
                    // this.selectedProject = this.projectList[0]._id;
                    this.getSavedFilterdata();
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onProjectChange() {
        this.getPackageList();
        this.getCollections();
        this.getLocationList();
    }

    getPackageList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `package-center/packages?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.packageList=[];
            if (response.status == 1) {
                this.packageList = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                    this.getPackageList()  
                } 
                if (response.pagination)
                    this.paginationObj = response.pagination;
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

    goToPackageDetails(item) {
        // this.router.navigate(['package-center/packages/' + item.project_id + '/' + item._id]);
        this.router.navigate(['package-center/packages/' + item._id]);
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
        this.getPackageList();
    }

    reArrangePackageOrder(event, direction, index) {
        event.stopPropagation();
        if (direction == 'up') {
            let previous = { ...this.packageList[index - 1] };
            let current = { ...this.packageList[index] };
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
            this.onOrderChange(payload);

        }
        else if (direction == 'down') {
            let next = { ... this.packageList[index + 1] };
            let current = { ...this.packageList[index] };
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
            this.onOrderChange(payload);
        }
    }

    onOrderChange(data) {
        this.spinnerService.show();
        let url = `package-center/rearrange-packages`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageList();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    doPaginationWise(page) {
        this.page = page;
        this.getPackageList();
    }

    setPageSize() {
        this.page = 1;
        this.getPackageList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            // project_id: this.selectedProject
        }
        localStorage.setItem('packageFilterData', JSON.stringify(data));
    }

    onStatusChange(item) {
        let data: any = {};
        data.is_active = item.is_active ? true : false;
        data._id = item._id;
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                // this.getColorCollectionList();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onDeSelectAll(type, event) {
        this.formDetails[type] = event;
    }

    onSelectAll(type, event) {
        this.formDetails[type] = event;
    }


    openAddPackageModal(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.selectedProject,
            name: '',
            caption: '',
            collections: [],
            is_active: false,
            order: this.packageList.length + 1
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addPackage() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.formDetails.location) {
            this.toastr.warning('Please select location', 'Warning');
            return;
        }
        if (this.formDetails.collections.length == 0) {
            this.toastr.warning('Please select collections', 'Warning');
            return;
        }

        let selectedProject = this.projectList.filter((element) => element._id == this.formDetails.project_id);
        if (selectedProject && selectedProject.length > 0) {
            let data = { ...this.formDetails };
            // let collectionArray = this.formDetails.collections.map(ele => ele._id);
            data.project_name = selectedProject[0].name;
            this.formDetails.collections.forEach(element => {
                let collection = this.collectionsList.find(ele => ele._id == element._id);
                element.cost = collection.cost;
                element.price = collection.price;
                element.collection_id = element._id;
            });

            this.formDetails.collections ? Object.assign(data.collections, this.formDetails.collections) : [];
            data.collections.forEach(element => {
                delete element['_id'];
            });
            // collectionArray;
            let url = `package-center/packages`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getPackageList();
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.toastr.warning('Please select valid project', 'Warning');
        }
    }

    //DELETE PACKAGE
    deletePackage(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} package?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/packages?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageList();
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
