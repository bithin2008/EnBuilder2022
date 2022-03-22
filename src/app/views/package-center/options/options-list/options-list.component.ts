import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-options-list',
    templateUrl: './options-list.component.html',
    styleUrls: ['./options-list.component.css']
})
export class OptionsListComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    collectionsList: any = [];
    projectList: any = [];
    selectedProject: string = '';
    optionsList: any = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    modalRef: BsModalRef;
    reverse: boolean = true;
    categoryList: any[] = [];
    dropdownSettings = {};
    ccdropdownSettings = {};
    locationList: any[] = [];
    filterForm: any = {
        category_name: []
    }
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
        this.ccdropdownSettings = {
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

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.selectedProject = projectData._id;
            }
        }
        let filterData: any = localStorage.getItem('packageOptionsFilterData');
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
            if (filterData.category_name) {
                this.filterForm.category_name = filterData.category_name;
            }

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getCategoryList();
        this.getLocationList();
        this.getCollections();
    }
    getProjectList() {
        this.spinnerService.show();
        let url = `package-center/projects?page=1&pageSize=100`;
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

    getCategoryList() {
        let url = `package-center/options-categories`;
        if (this.selectedProject) {
            url = url + `?project_id=${this.selectedProject}`;
        }
        this.spinnerService.show();
        this.categoryList = [];
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.categoryList = response.results;
                let ids = this.filterForm.category_name.map((ele) => ele._id);
                this.filterForm.category_name = this.categoryList.filter((category) => ids.includes(category._id))
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
            this.getOptionList();
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onProjectChange() {
        this.getCategoryList();
        // this.getOptionList();
        this.getLocationList();
        this.getCollections();
    }

    getOptionList() {
        let url = `package-center/options?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        if (this.filterForm.category_name.length > 0) {
            const values = this.filterForm.category_name.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&category=${valueString}`;
        }
        this.spinnerService.show();
        this.saveFilter();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.optionsList = [];
            if (response.status == 1) {
                this.optionsList = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1? this.paginationObj.totalPages-1 :1;
                    this.getOptionList()  
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

    goToOptionDetails(item) {
        this.router.navigate(['package-center/options/' + item._id]);
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
        this.getOptionList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            category_name: this.filterForm.category_name
        }
        localStorage.setItem('packageOptionsFilterData', JSON.stringify(data));
    }

    onOrderChange(data) {
        this.spinnerService.show();
        let url = `package-center/rearrange-options`
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getOptionList();
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
        this.getOptionList();
    }

    setPageSize() {
        this.page = 1;
        this.getOptionList();
    }

    onDeSelectAll(type, event) {
        this.formDetails[type] = event;
    }

    onSelectAll(type, event) {
        this.formDetails[type] = event;
    }

    onDeFilterSelectAll(type, event) {
        this.filterForm[type] = event;
        this.getOptionList();
    }

    onFilterSelectAll(type, event) {
        this.filterForm[type] = event;
        this.getOptionList();
    }
    onFilterItemSelect() {
        this.getOptionList();
    }
    onStatusChange(item) {
        let data: any = {};
        data.is_active = item.is_active ? true : false;
        data._id = item._id;
        let url = `package-center/options`;
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

    reArrangeOptionsOrder(event, direction, index) {
        event.stopPropagation();
        if (direction == 'up') {
            let previous = { ...this.optionsList[index - 1] };
            let current = { ...this.optionsList[index] };
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
            let next = { ... this.optionsList[index + 1] };
            let current = { ...this.optionsList[index] };
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

    openAddOptionModal(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.selectedProject,
            name: '',
            category_name: '',
            location: '',
            is_active: false,
            collections: [],
            order: this.optionsList.length + 1
        }
        // this.subCategoryList = [];
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }


    addOption() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.formDetails.category_id) {
            this.toastr.warning('Please select category', 'Warning');
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
        let data = { ...this.formDetails };
        let selectedProject = this.projectList.find((element) => element._id == this.formDetails.project_id);
        if (selectedProject) {
            let selectedCategory = this.categoryList.find((element) => element._id == this.formDetails.category_id);
            data.project_name = (selectedProject && selectedProject.name) ? selectedProject.name : '';
            data.category_name = (selectedCategory && selectedCategory.name) ? selectedCategory.name : '';

            data.only_sold_with_collections = [];
            this.formDetails.collections.forEach(element => {
                data.only_sold_with_collections.push(Object.assign({}, element));
            });
            delete data.collections;
            // console.log('data', data);
            let url = `package-center/options`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getOptionList();
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'package-center' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //DELETE OPTION
    deleteOption(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/options?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getOptionList();
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

    onCategoryChange() {
        if (this.formDetails.category_id) {
            let selectedCategory = this.categoryList.find((element) => element._id == this.formDetails.category_id);
            if (selectedCategory) {
                // this.formDetails.sub_categories = selectedCategory.sub_categories.join();
                // this.subCategoryList = selectedCategory.sub_categories;
            }
        }
        else {
            // this.subCategoryList = [];
            // this.formDetails.sub_categories = [];
        }
    }


   


}
