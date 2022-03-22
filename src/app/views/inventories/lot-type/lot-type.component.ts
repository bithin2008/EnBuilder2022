import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-lot-type',
    templateUrl: './lot-type.component.html',
    styleUrls: ['./lot-type.component.css']
})
export class LotTypeComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {
        views: []
    };
    filterForm: any = {
        searchText: '',
        project_id: '',
    };
    lotTypeList: any = [];
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    projectList: any = [];

    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    isClear: boolean = false;
    reverse: boolean = true;
    measureUnits: any[] = [];
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {
        this.getSavedFilterdata();
        this.getProjectList();
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response._id;
                this.doSearch();
            }
            else {
                this.filterForm.project_id = '';
                this.doSearch();
            }
        });

    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.filterForm.project_id = projectFilterData._id;
            }
        }

        let filterData: any = localStorage.getItem('inventoriesLotTypeFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            // if (filterData.project_id) {
            //     this.filterForm.project_id = filterData.project_id;
            //     this.getLotTypeList(this.filterForm.project_id);

            // }
            // else {
            //     this.getLotTypeList();
            // }
            // if (filterData.name) {
            //     this.filterForm.name = filterData.name;
            // }
            // if (filterData.width) {
            //     this.filterForm.width = filterData.width;
            // }
            // if (filterData.depth) {
            //     this.filterForm.depth = filterData.depth;
            // }

            if (filterData.area) {
                this.filterForm.area = filterData.area;
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
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }

        }

        this.getLotTypeList();
    }

    //// PAGINATION AND FILTERS ///
    doPaginationWise(page) {
        this.page = page;
        this.getLotTypeList();
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getLotTypeList();
    }

    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getLotTypeList();
    }

    setPageSize() {
        this.page = 1;
        this.getLotTypeList();
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
        this.getLotTypeList();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        // this.filterForm.project_id = '';
        this.getLotTypeList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            // project_id: this.filterForm.project_id,
            // name: this.filterForm.name,
            // width: this.filterForm.width,
            // depth: this.filterForm.depth,
            // area: this.filterForm.area,
        }
        localStorage.setItem('inventoriesLotTypeFilterData', JSON.stringify(data));
    }


    //OPEN ADD LOT TYPE MODEL
    openAddLotTypeModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            project_id: '',
            lot_name: '',
            width: null,
            depth: null,
            lot_area: null,
            is_irregular: false
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    
    addLotType() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.lot_name) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        
        let data: any = { ...this.formDetails };
        var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        data.project_name = selectedProject[0].name;
        data.is_irregular = data.is_irregular ? true : false;
        // console.log('data==>', data);
        let url = `inventories/lot-types`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.filterForm.searchText = '';
                    this.isClear = false;
                    this.getLotTypeList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //OPEN EDIT LOT TYPE MODEL
    openEditLotTypeModal(template: TemplateRef<any>, item) {
        this.isEdit = true;
        this.formDetails = {
            project_id: item.project_id,
            lot_name: item.lot_name,
            width: item.width,
            depth: item.depth,
            lot_area: item.lot_area,
            is_irregular: item.is_irregular,
            _id: item._id
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    editLotType() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.lot_name) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        
        let data: any = { ...this.formDetails };
        var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        data.project_name = selectedProject[0].name;
        data.is_irregular = data.is_irregular ? true : false;
        let url = `inventories/lot-types`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.filterForm.searchText = '';
                    this.isClear = false;
                    this.getLotTypeList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    
    getProjectList() {
        this.projectList = [];
        this.spinnerService.show();
        let url = `inventories/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectList = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getLotTypeList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/lot-types?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.lotTypeList = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    deleteLotType(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete lot type ${item.lot_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    // console.log(item);
                    let url = `inventories/lot-types?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getLotTypeList();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });

    }



}
