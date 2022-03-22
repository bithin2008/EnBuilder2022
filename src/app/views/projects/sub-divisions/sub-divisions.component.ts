import { Component, OnInit, TemplateRef, Input, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
@Component({
    selector: 'app-sub-divisions',
    templateUrl: './sub-divisions.component.html',
    styleUrls: ['./sub-divisions.component.css']
})
export class SubDivisionsComponent implements OnInit {
    @Input() user_id: String;
    @Input() returnUrl: String;
    builders: any = [];
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        searchText: '',
        builderId: ''
    };
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    subdivisionList: any = [];
    builderList: any = [];
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    public uploadedPhoto: boolean = false;
    builderLogo: any;
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.getSubdivisionList();
        this.getBuilderList()
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('subdivisionsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.builderId) {
                this.filterForm.builderId = filterData.builderId;

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
    }

    getSubdivisionList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `projects/subdivisions?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.builderId)
            url = url + `&builder_id=${this.filterForm.builderId}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.subdivisionList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.subdivisionList = response.results;
                    if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                        this.page = this.paginationObj.totalPages >1? this.paginationObj.totalPages-1 :1;
                        this.getSubdivisionList()  
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
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            builderId: this.filterForm.builderId
        }
        localStorage.setItem('subdivisionsFilterData', JSON.stringify(data));
    }

    getBuilderList() {
        this.spinnerService.show();
        let url = `projects/builders?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderList = response.results;
                } else {
                    this.paginationObj = {
                        total: 0
                    };
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    doPaginationWise(page) {
        this.page = page;
        this.getSubdivisionList();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getSubdivisionList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getSubdivisionList();
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
        this.getSubdivisionList();
    }
    setPageSize() {
        this.page = 1;
        this.getSubdivisionList();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            builderId: ''
        };
        this.isClear = false;
        this.getSubdivisionList();
    }
    //OPEN ADD SUBDIVISION MODAL
    openAddSubdivisionModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            builder_id: '',
            name: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    addSubdvision() {
        if (this.formDetails.builder_id == '') {
            this.toastr.warning('Please select builder', 'Warning');
        }
        else if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter subdivision name', 'Warning');
        }
        // else if (!this.formDetails.location) {
        //   this.toastr.warning('Please enter subdivision location', 'Warning');
        // } 
        else {
            let data = {
                builder_id: this.formDetails.builder_id,
                name: this.formDetails.name.trim(),
                location: this.formDetails.location ? this.formDetails.location.trim() : ''
            }
            let url = `projects/subdivisions`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.filterForm.searchText = '';
                        this.isClear = false;
                        this.getSubdivisionList();
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    //OPEN EDIT SUBDIVISION MODAL
    openEditSubdivisionModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.formDetails = { ...obj };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    editSubdvision() {
        if (!this.formDetails.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
        }
        else if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter subdivision name', 'Warning');
        }
        // else if (!this.formDetails.location) {
        //   this.toastr.warning('Please enter subdivision location', 'Warning');
        // }
        else {
            let data = {
                _id: this.formDetails._id,
                // builder_id: this.formDetails.builder_id,
                name: this.formDetails.name.trim(),
                location: this.formDetails.location ? this.formDetails.location.trim() : ''
            }
            let url = `projects/subdivisions`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.filterForm.searchText = '';
                        this.isClear = false;
                        this.getSubdivisionList();
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    deleteSubdivision(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete subdivision ${item.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    console.log(item);
                    let url = `projects/subdivisions?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getSubdivisionList();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }
}
