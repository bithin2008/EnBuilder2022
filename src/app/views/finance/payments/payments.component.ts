import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subscription, Observable } from 'rxjs';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../services/web.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    paginationObj: any = {};
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    filterForm = {
        project_id: '',
        // builder_id: '',
        searchText: ''
    }
    baseUrl = environment.BASE_URL;
    isClear: boolean = false;
    order: string = '_created';
    reverse: boolean = true;
    paymentList: any[] = [];
    formDetails: any = {};
    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private modalService: BsModalService,
        private toastr: ToastrService) { }

    ngOnInit(): void {
        this.getSavedFilterdata();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                // console.log('filterForm', this.filterForm, response);
                this.filterForm.project_id = response.project_id;
                // this.filterForm.builder_id = response.builder_id;
                this.getDealPayments();
            }
        });
    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('financeTabData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData.project_id) {
                this.filterForm.project_id = projectFilterData.project_id;
                this.getPaymentStoredData();
            }
            else{
                this.getProjectList();
            }
        }
        else{
            this.getProjectList();
        }

    }

    getPaymentStoredData(){
        let filterData: any = localStorage.getItem('fiannacePaymentFilterData');
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
        this.getDealPayments();
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `finance/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                let projectList = response.results;
                this.filterForm.project_id= projectList[0] ? projectList[0]._id :'';
                let data = {
                    project_id: this.filterForm.project_id,
                }
                localStorage.setItem('financeTabData', JSON.stringify(data));
                this.projectChanged.emit(data);
                this.getPaymentStoredData();
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getDealPayments() {
        this.saveFilter();
        let url = `finance/deals-payments?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;

        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.paymentList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.paymentList = response.results;
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
            searchText: this.filterForm.searchText
        }
        localStorage.setItem('fiannacePaymentFilterData', JSON.stringify(data));
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
        this.getDealPayments();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getDealPayments();
    }

    setPageSize() {
        this.page = 1;
        this.getDealPayments();
    }

    // openEditDepositModal(template: TemplateRef<any>, item) {
    //     this.formDetails = { ...item };
    //     this.formDetails.due_date = item.due_date ? moment(item.due_date).format('YYYY-MM-DD') : '';
    //     this.formDetails.payment_date = item.payment_date ? moment(item.due_date).format('YYYY-MM-DD') : '';
    //     this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    // }

    doSearch() {
        if (this.filterForm.searchText && this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getDealPayments();
    }

    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterForm.searchText = '';
        this.getDealPayments();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getDealPayments();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
}
