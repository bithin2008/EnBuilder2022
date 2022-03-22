import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import * as moment from 'moment';

@Component({
    selector: 'app-incentives',
    templateUrl: './incentives.component.html',
    styleUrls: ['./incentives.component.css']
})
export class IncentivesComponent implements OnInit {
    @Output() projectChanged: EventEmitter<any> = new EventEmitter();
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    formDetails: any = {};
    incentiveList: any[] = [];
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
    isClear: boolean = false;
    order: string = '_created';
    reverse: boolean = true;
    modalRef: BsModalRef;
    isEdit: boolean = false;
    minDate: any;
    dateDiff: any;
    projectList: any[] = [];
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.getSavedFilterdata();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            if (response) {
                this.filterForm.project_id = response.project_id;
                // this.filterForm.builder_id = response.builder_id;
                this.getIncentive();
            }
        });
    }

    //NON INLINE EDITOR OPTIONS
    public nonInlineEdit: Object = {
        attribution: false,
        heightMax: 200,
        charCounterCount: false,
        pasteDeniedTags: ['img'],
        videoInsertButtons:['videoBack', '|', 'videoByURL', 'videoEmbed'],
        toolbarButtons: {
            'moreText': {

                'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
                'buttonsVisible': 4
            
              },
            
              'moreParagraph': {
            
                'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
                'buttonsVisible': 2
            
              },
            
              'moreRich': {
            
                'buttons': ['insertLink', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertHR'],
                'buttonsVisible': 2
            
              },
            
              'moreMisc': {
            
                'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
            
                'align': 'right',
            
                'buttonsVisible': 2
            
              }
            
            },
        key: "te1C2sB5C7D5G4H5B3jC1QUd1Xd1OZJ1ABVJRDRNGGUE1ITrE1D4A3A11B1B6B5B1F4F3==",
    }

  getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('financeTabData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData.project_id) {
                this.filterForm.project_id = projectFilterData.project_id;
                this.getIncentiveStoredData();
                this.getProjectList();
            }
            else{
                this.setDefaultProjectList();
            }        
        }
         else{
                this.setDefaultProjectList();
        }

  }

    
  getIncentiveStoredData(){
    let filterData: any = localStorage.getItem('fiannaceIncentiveFilterData');
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
        this.getIncentive();
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
                this.getIncentiveStoredData();
            }
        }, (error) => {
            console.log('error', error);
        });
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

    getIncentive() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `finance/incentives?page=${this.page}&pageSize=${this.pageSize}`;
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
            this.incentiveList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.incentiveList = response.results;
                    if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                        this.page = this.paginationObj.totalPages!=1? this.paginationObj.totalPages-1 :1;
                        this.getIncentive()  
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
    
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText

        }
        localStorage.setItem('fiannaceIncentiveFilterData', JSON.stringify(data));
    }

    doSearch() {
        if (this.filterForm.searchText && this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getIncentive();
    }
    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterForm.searchText = '';
        this.getIncentive();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getIncentive();
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
        this.getIncentive();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getIncentive();
    }

    setPageSize() {
        this.page = 1;
        this.getIncentive();
    }


    //// MANAGE INCENTIVE ////
    openAddIncentivesModal(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.filterForm.project_id ? this.filterForm.project_id : '',
        };
        this.isEdit = false;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addIncentive() {
        if (!this.formDetails.project_id) {
            this.toastr.warning(`Please select project`, 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning(`Please enter name`, 'Warning');
            return;
        }
        if (!this.formDetails.start) {
            this.toastr.warning(`Please enter start date`, 'Warning');
            return;
        }
        if (!this.formDetails.end) {
            this.toastr.warning(`Please enter end date`, 'Warning');
            return;
        }
        if (!this.formDetails.type_of_incentive) {
            this.toastr.warning(`Please enter type of incentive`, 'Warning');
            return;
        }
        if (this.formDetails.type_of_incentive == 'UPGRADE-PACKAGE-FREE' && (!this.formDetails.package_name || !this.formDetails.package_name.trim())) {
            this.toastr.warning(`Please enter package name`, 'Warning');
            return;
        }
        if (this.formDetails.type_of_incentive == 'MONETARY' || this.formDetails.type_of_incentive == 'DECORE-DOLLAR') {
            if (!this.formDetails.amount_type) {
                this.toastr.warning(`Please choose amount type`, 'Warning');
                return;
            }
        }

        if (this.formDetails.amount_type == "AMOUNT") {
            if (!this.formDetails.amount && this.formDetails.amount != 0) {
                this.toastr.warning(`Please enter amount`, 'Warning');
                return;
            }
            if (this.formDetails.amount < 0) {
                this.toastr.warning(`Please enter amount greater than and equal to 0`, 'Warning');
                return;
            }
        }

        if (this.formDetails.amount_type == "PERCENT") {
            if (!this.formDetails.percent && this.formDetails.percent != 0) {
                this.toastr.warning(`Please enter percent`, 'Warning');
                return;
            }
            if (this.formDetails.percent < 0) {
                this.toastr.warning(`Please enter percent amount greater than and equal to 0`, 'Warning');
                return;
            }
        }
        let selectedProject = this.projectList.find((project) => project._id == this.formDetails.project_id)
        let data: any = {};
        data = { ...this.formDetails };
        data.type = "INCENTIVE";
        data.project_name = selectedProject ? selectedProject.name : '';
        data.start = moment(this.formDetails.start).format('YYYY-MM-DD');
        data.end = moment(this.formDetails.end).format('YYYY-MM-DD');
        // consdition for amount type
        if (this.formDetails.amount_type == "AMOUNT") {
            // delete data.amount_type;
            delete data.percent;
        }
        else {
            // delete data.amount_type;
            delete data.amount;
        }
        // condition for package name
        if (this.formDetails.type_of_incentive != 'UPGRADE-PACKAGE-FREE') {
            delete data.package_name;
        }
        if (this.formDetails.type_of_incentive == 'UPGRADE-PACKAGE-FREE') {
            delete data.percent;
            delete data.amount;
            delete data.amount_type;
        }
        let url = `finance/incentives`;
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getIncentive();
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

    openEditIncentiveModal(template: TemplateRef<any>, item) {
        this.isEdit = true;
        // this.formDetails = { ...item };
        this.formDetails.active = item.active ? item.active : false;
        this.formDetails.description = item.description ? item.description : '';
        this.formDetails.end = item.end ? moment(item.end).format('YYYY-MM-DD') : '';
        this.formDetails.name = item.name ? item.name : '';
        this.formDetails.project_id = item.project_id ? item.project_id : '';
        this.formDetails.start = item.start ? moment(item.start).format('YYYY-MM-DD') : '';
        this.formDetails.type = item.type ? item.type : '';
        this.formDetails.type_of_incentive = item.type_of_incentive ? item.type_of_incentive : '';
        this.formDetails.amount_type = item.amount_type ? item.amount_type : '';

        if (item.type_of_incentive && item.package_name) {
            this.formDetails.package_name = item.package_name;
        }
        if (item.amount_type == "AMOUNT") {
            this.formDetails.percent = '';
            this.formDetails.amount = item.amount ? item.amount : '';
        }
        else {
            this.formDetails.amount = '';
            this.formDetails.percent = item.percent ? item.percent : '';

        }


        this.formDetails._id = item._id;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editIncentive() {
        if (!this.formDetails.project_id) {
            this.toastr.warning(`Please select project`, 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning(`Please enter name`, 'Warning');
            return;
        }
        if (!this.formDetails.start) {
            this.toastr.warning(`Please enter start date`, 'Warning');
            return;
        }
        if (!this.formDetails.end) {
            this.toastr.warning(`Please enter end date`, 'Warning');
            return;
        }

        if (!this.formDetails.type_of_incentive) {
            this.toastr.warning(`Please enter type of incentive`, 'Warning');
            return;
        }
        if (this.formDetails.type_of_incentive == 'UPGRADE-PACKAGE-FREE' && (!this.formDetails.package_name || !this.formDetails.package_name.trim())) {
            this.toastr.warning(`Please enter package name`, 'Warning');
            return;
        }
        if (this.formDetails.type_of_incentive == 'MONETARY' || this.formDetails.type_of_incentive == 'DECORE-DOLLAR') {
            if (!this.formDetails.amount_type) {
                this.toastr.warning(`Please choose amount type`, 'Warning');
                return;
            }
        }
        if (this.formDetails.amount_type == "AMOUNT") {
            if (!this.formDetails.amount && this.formDetails.amount != 0) {
                this.toastr.warning(`Please enter amount`, 'Warning');
                return;
            }
            if (this.formDetails.amount < 0) {
                this.toastr.warning(`Please enter amount greater than and equal to 0`, 'Warning');
                return;
            }
        }

        if (this.formDetails.amount_type == "PERCENT") {
            if (!this.formDetails.percent && this.formDetails.percent != 0) {
                this.toastr.warning(`Please enter percent`, 'Warning');
                return;
            }
            if (this.formDetails.percent < 0) {
                this.toastr.warning(`Please enter percent amount greater than and equal to 0`, 'Warning');
                return;
            }
        }
        let selectedProject = this.projectList.find((project) => project._id == this.formDetails.project_id)

        let data: any = {};
        data = { ...this.formDetails };
        data.type = "INCENTIVE";
        data.project_name = selectedProject ? selectedProject.name : '';
        data.start = moment(this.formDetails.start).format('YYYY-MM-DD');
        data.end = moment(this.formDetails.end).format('YYYY-MM-DD');
        // consdition for amount type
        if (this.formDetails.amount_type == "AMOUNT") {
            // delete data.amount_type;
            delete data.percent;
        }
        else {
            // delete data.amount_type;
            delete data.amount;
        }
        // condition for package name
        if (this.formDetails.type_of_incentive != 'UPGRADE-PACKAGE-FREE') {
            delete data.package_name;
        }
        if (this.formDetails.type_of_incentive == 'UPGRADE-PACKAGE-FREE') {
            delete data.percent;
            delete data.amount;
            delete data.amount_type;
        }
        let url = `finance/incentives`;
        console.log('data=>', data);

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getIncentive();
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

    deleteIncentive(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} incentive ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `finance/incentives?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getIncentive();
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

    ngDoCheck() {
        this.minDate = new Date(this.formDetails.start);
        let dateDiff = moment(this.formDetails.start).diff(moment(this.formDetails.end));
        if (dateDiff == NaN || dateDiff > 0) {
            this.formDetails.end = '';
        }
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
}
