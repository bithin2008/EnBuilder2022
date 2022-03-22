import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'app-deposit-structure',
    templateUrl: './deposit-structure.component.html',
    styleUrls: ['./deposit-structure.component.css']
})
export class DepositStructureComponent implements OnInit {
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    depositeList: any[] = [];
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
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    formDetails: any = {};
    modalRef: BsModalRef;
    isEdit: boolean = false;
    minDate: any;
    dateDiff: any;
    depositForm: FormGroup;
    projectList: any[] = [];
    typeList = [{
        name: 'Percentage',
        value: 'PERCENT-CP'
    },
    {
        name: 'Fixed Amount',
        value: 'FIXED'
    }];
    dateTypeList = [{
        name: 'From Initiated Date',
        value: 'FROM-INITIATED'
    },
    {
        name: 'From Executed Date',
        value: 'FROM-EXECUTED'
    },
    {
        name: 'Fixed Date',
        value: 'FIXED'
    }]
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private formBuilder: FormBuilder) { }


    ngOnInit(): void {
        this.getSavedFilterdata();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response.project_id;
                // this.filterForm.builder_id = response.builder_id;
                this.getDeposit();
            }
        });
        this.initiateDepositeForm();
    }

    initiateDepositeForm() {
        this.depositForm = this.formBuilder.group({
            project_id: [''],
            name: [''],
            start: [''],
            end: [''],
            active: [false],
            deduct_signup: [false],
            // sign_up: this.formBuilder.group({
            //     type: [''],
            //     amount: [''],
            //     date_type: [''],
            //     days: [''],
            //     date: ['']
            // }),
            deposits: this.formBuilder.array([]),

        })


    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('financeTabData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData.project_id) {
                this.filterForm.project_id = projectFilterData.project_id;
                this.getDepositStoredData();
                this.getProjectList();
            }
            else{
                this.setDefaultProjectList();
            }
            // if (projectFilterData.builder_id) {
            //     this.filterForm.builder_id = projectFilterData.builder_id;
            // }
        }
        else{
            this.setDefaultProjectList();
        }
    }   

    getDepositStoredData(){
    let filterData: any = localStorage.getItem('fiannaceDepositeFilterData');
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
    this.getDeposit();

    }

    setDefaultProjectList() {
        this.spinnerService.show();
        let url = `finance/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                this.filterForm.project_id= this.projectList[0] ? this.projectList[0]._id :'';
                let data = {
                    project_id: this.filterForm.project_id,
                }
                localStorage.setItem('financeTabData', JSON.stringify(data));
                this.projectChanged.emit(data);
                this.getDepositStoredData();
            }
        }, (error) => {
            console.log('error', error);
        });
    }

   
    getDeposit() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `finance/deposit-structures?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        // if (this.filterForm.builder_id) {
        //     url = url + `&builder_id=${this.filterForm.builder_id}`;
        // }
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.depositeList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.depositeList = response.results;
                    if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                        this.page = this.paginationObj.totalPages>1? this.paginationObj.totalPages-1 :1;
                        this.getDeposit()  
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
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openEditDepositeModal(template: TemplateRef<any>, item) {
        this.isEdit = true;
        this.depositForm.reset();
        this.getDeposits ? this.getDeposits.clear() : true;
        this.formDetails._id = item._id;
        this.patchFormValue(item);
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    /// EDIT DEPOSIT ///
    editDeposit() {
        if (!this.depositForm.value.project_id) {
            this.toastr.warning(`Please select project`, 'Warning');
            return;
        }
        if (!this.depositForm.value.name) {
            this.toastr.warning(`Please enter name`, 'Warning');
            return;
        }
        if (!this.depositForm.value.start) {
            this.toastr.warning(`Please enter start date`, 'Warning');
            return;
        }
        if (!this.depositForm.value.end) {
            this.toastr.warning(`Please enter end date`, 'Warning');
            return;
        }
        let percentType = this.depositForm.value.deposits.filter((ele) => ele.type == 'PERCENT-CP');
        let invalidValue = percentType.find((ele) => ele.value > 100);
        if (invalidValue) {
            this.toastr.warning(`Please enter percentage less than and equal to 100`, 'Warning');
            return;
        }

        let totalpercent = 0;
        percentType.forEach(element => {
            totalpercent += element.value;
        });
        if (totalpercent > 100) {
            this.toastr.warning(`Please enter percentage value less than and equal to 100`, 'Warning');
            return;

        }
        let validDeposits= this.depositForm.value.deposits.filter((deposit)=>(deposit.value && deposit.value!=0 ));
        let invalidRecords = validDeposits.find((ele) => ((ele.date_type == 'FIXED' && !ele.date) || (ele.date_type == 'FROM-INITIATED' && !ele.days)));
        // console.log('invalidRecords', invalidRecords);
        if (invalidRecords) {
            this.toastr.warning(`Please enter days/date for populated records`, 'Warning');
            return;
        }
        if(validDeposits.length==0){
            this.toastr.warning(`Please add deposits`, 'Warning');
            return;
        }
        // console.log(this.depositForm.value);
        let selectedProject = this.projectList.find((project) => project._id == this.depositForm.value.project_id)
        let data: any = {};
        data = { ...this.depositForm.value };
        data.type = "DEPOSIT-STRUCTURE";
        data.project_name = selectedProject ? selectedProject.name : '';
        data.deposits=validDeposits;
        data.deposits.forEach((element, index) => {
            if (element.date_type == "FIXED") {
                element.date = moment(data.deposits[index].date).format('YYYY-MM-DD');
                delete element.days;
            }
            else {
                delete element.date;
            }
        });
        data.start = moment(this.depositForm.value.start).format('YYYY-MM-DD');
        data.end = moment(this.depositForm.value.end).format('YYYY-MM-DD');
        data._id = this.formDetails._id;
        data.active=this.depositForm.value.active ? true:false;
        data.deduct_signup=this.depositForm.value.deduct_signup ? true:false;
        let url = `finance/deposit-structures`;
        // console.log('edit data=>', data);

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getDeposit();
                    this.depositForm.reset();
                    this.getDeposits.clear();
                    this.formDetails = {};
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    patchFormValue(item) {
        // let selectedProject= this.projectList.find((project)=>project._id==item._project_id);
        this.depositForm.patchValue({
            project_id: item.project_id,
            name: item.name,
            start: item.start ? moment(item.start).format('YYYY-MM-DD') : '',
            end: item.end ? moment(item.end).format('YYYY-MM-DD') : '',
            active: item.active ? true:false,
            deduct_signup: item.deduct_signup? true:false,
            deposits: []
        })
        this.addDepositeArray(item.deposits)
    }

    addDepositeArray(deposits) {
        if (deposits) {
            deposits.forEach(element => {
                this.mapValuesToDeposit(element);
            });
        }
    }

    mapValuesToDeposit(element) {
        this.getDeposits.push(this.createDepositGroupWithValue(element));

    }

    createDepositGroupWithValue(element) {
        return this.formBuilder.group({
            type: [element.type],
            value: [element.value ? element.value : 0],
            date_type: [element.date_type],
            days: [element.days ? element.days : ''],
            date: [element.date ? moment(element.date).format('YYYY-MM-DD') : '']
        })
    }

    get getDeposits(): FormArray {
        return this.depositForm.get('deposits') as FormArray;
    }

    appendDepositGroup() {
        this.getDeposits.push(this.createDepositGroup());
    }

    createDepositGroup() {
        return this.formBuilder.group({
            type: ['PERCENT-CP'],
            value: [0],
            date_type: ['FROM-INITIATED'],
            days: [''],
            date: ['']
        })
    }

    addMoreDeposits() {
        for (let i = 1; i <= 5; i++) {
            this.appendDepositGroup();
        }
    }

    deleteDeposits(index) {
        this.getDeposits.removeAt(index);
    }


    /// ADD DEPOSIT ///
    openAddDepositModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.depositForm.reset();
        this.getDeposits ? this.getDeposits.clear() : true;
        this.appendDepositGroup();
        this.appendDepositGroup();
        this.appendDepositGroup();
        this.appendDepositGroup();
        this.appendDepositGroup();
        this.appendDepositGroup();
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });

    }

    addDeposit() {
        if (!this.depositForm.value.project_id) {
            this.toastr.warning(`Please select project`, 'Warning');
            return;
        }
        if (!this.depositForm.value.name) {
            this.toastr.warning(`Please enter name`, 'Warning');
            return;
        }
        if (!this.depositForm.value.start) {
            this.toastr.warning(`Please enter start date`, 'Warning');
            return;
        }
        if (!this.depositForm.value.end) {
            this.toastr.warning(`Please enter end date`, 'Warning');
            return;
        }
        let percentType = this.depositForm.value.deposits.filter((ele) => ele.type == 'PERCENT-CP');
        let invalidValue = percentType.find((ele) => ele.value > 100);
        if (invalidValue) {
            this.toastr.warning(`Please enter percentage less than and equal to 100`, 'Warning');
            return;
        }
        let totalpercent = 0;
        percentType.forEach(element => {
            totalpercent += element.value;
        });
        if (totalpercent > 100) {
            this.toastr.warning(`Please enter percentage value less than and equal to 100`, 'Warning');
            return;

        }
        let validDeposits= this.depositForm.value.deposits.filter((deposit)=>(deposit.value && deposit.value!=0 ));
        let invalidRecords = validDeposits.find((ele) => ((ele.date_type == 'FIXED' && !ele.date) || (ele.date_type == 'FROM-INITIATED' && !ele.days) || (ele.date_type == 'FROM-EXECUTED' && !ele.days) ));
        // console.log('invalidRecords', invalidRecords);
        if (invalidRecords) {
            this.toastr.warning(`Please enter days/date for populated records`, 'Warning');
            return;
        }
        if(validDeposits.length==0){
            this.toastr.warning(`Please add deposits`, 'Warning');
            return;
        }
        let selectedProject = this.projectList.find((project) => project._id == this.depositForm.value.project_id)

        let data: any = {};
        data = { ...this.depositForm.value };
        data.type = "DEPOSIT-STRUCTURE";
        data.project_name = selectedProject ? selectedProject.name : '';
        data.deposits=validDeposits;
        data.deposits.forEach((element, index) => {
            if (element.date_type == "FIXED") {
                element.date = moment(data.deposits[index].date).format('YYYY-MM-DD');
                delete element.days;
            }
            else {
                delete element.date;
            }
        });
        data.start = moment(this.depositForm.value.start).format('YYYY-MM-DD');
        data.end = moment(this.depositForm.value.end).format('YYYY-MM-DD');
        data.active=this.depositForm.value.active ? true:false;
        data.deduct_signup=this.depositForm.value.deduct_signup ? true:false;
        let url = `finance/deposit-structures`;
        console.log('data', data);

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getDeposit();
                    this.depositForm.reset();
                    this.getDeposits.clear();
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            this.spinnerService.hide();
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
        localStorage.setItem('fiannaceDepositeFilterData', JSON.stringify(data));
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `finance/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
            }

        }, (error) => {
            console.log('error', error);
        });
    }

    ngDoCheck() {
        this.minDate = new Date(this.depositForm.value.start);
        let dateDiff = moment(this.depositForm.value.start).diff(moment(this.depositForm.value.end));
        if (dateDiff == NaN || dateDiff > 0) {
            this.depositForm.patchValue({
                end: ''
            })
        }
    }

    deleteDeposit(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} deposit structure ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `finance/deposit-structures?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getDeposit();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {

                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
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
        this.getDeposit();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getDeposit();
    }

    setPageSize() {
        this.page = 1;
        this.getDeposit();
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getDeposit();
    }

    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterForm.searchText = '';
        this.getDeposit();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getDeposit();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
}
