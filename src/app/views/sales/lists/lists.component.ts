import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
    // baseUrl = environment.BASE_URL;
    modalRef: BsModalRef;
    lists: any = [];
    paginationObj: any = {};
    formDetails: any = {};
    filterFormData: any = {
        searchText: ''
    };
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    order: string = '_created';
    reverse: boolean = true;
    page: number = 1;
    pageSize: number = 20;
    isClear: boolean = false;
    isEdit: boolean = false;
    constructor(
        private router: Router,
        private modalService: BsModalService,
        private webService: WebService,
        private toastr: ToastrService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) {
    }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.checkLogin();
    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
                }
                else {
                    this.getLists();
                }
            } else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
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
        this.getLists();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getLists();
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('salesListFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);

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
                this.filterFormData.searchText = filterData.searchText;
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
    doSearch() {
        if (this.filterFormData.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getLists();
    }
    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterFormData.searchText = '';
        this.getLists();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterFormData = {
            searchText: ''
        };
        this.isClear = false;
        this.getLists();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterFormData.searchText
        }
        localStorage.setItem('salesListFilterData', JSON.stringify(data));
    }
    setPageSize() {
        this.page = 1;
        this.getLists();
    }
    getLists() {
        this.spinnerService.show();
        this.saveFilter();
        this.paginationObj = {};
        let url = `sales/lists?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterFormData.searchText)
            url = url + `&searchText=${this.filterFormData.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.lists = [];
            if (response.status == 1) {
                this.lists = response.results && response.results.rows ? response.results.rows : [];
                if(this.page >1 && response.results.length==0 && !response.pagination){
                    this.page = this.page > 1? this.page-1 :1;
                    this.getLists()  
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
            console.log('error', error);
        });
    }
    openAddModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            name: '',
            // is_inactive: false,
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    }
    goToDetails(id) {
        this.router.navigate([`/sales/lists/${id}`]);
    }
    addLists() {
        if (this.formDetails.name == '') {
            this.toastr.warning('Please enter name', 'Warning');
        } else {
            let url = `sales/lists`;
            this.webService.post(url, this.formDetails).subscribe((response: any) => {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getLists();
                        this.modalRef.hide();
                    }

                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    openEditList(template: TemplateRef<any>, item) {
        this.isEdit = true;
        this.formDetails = { ...item };
        this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    }
    updateLists() {
        if (this.formDetails.name == '') {
            this.toastr.warning('Please enter name', 'Warning');
        } else {
            let url = `sales/lists`;
            this.webService.post(url, this.formDetails).subscribe((response: any) => {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getLists();
                        this.modalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    deleteList(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to remove the list '${item.name}' ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/lists?id=${item._id}`;
                    this.webService.delete(url).subscribe((response: any) => {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getLists();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
}
