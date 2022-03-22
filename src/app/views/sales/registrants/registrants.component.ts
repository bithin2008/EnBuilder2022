import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import * as moment from 'moment';

@Component({
    selector: 'app-registrants',
    templateUrl: './registrants.component.html',
    styleUrls: ['./registrants.component.css']
})
export class RegistrantsComponent implements OnInit {
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        searchText: '',
        month: '',
        startDate: '',
        endDate: '',
        desired_project: [],
        desired_unit_type: [],
        desired_price_range: [],
        how_did_you_hear: [],
    };
    sortedtBy: any = '_created';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isClear: boolean = false;
    registrantsList: any = [];
    desiredProjects: any[] = [];
    desiredUnitTypes: any[] = [];
    desiredPriceRange: any[] = [];
    howDidYouHere: any[] = [];
    minDate: any;
    dateDiff: any;
    isDisabled: boolean = false;
    isEdit: boolean = false;
    dropdownSettings: any = {};
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService, ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        // this.getRegistrantsList();
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'value',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            itemsShowLimit: 2,
            allowSearchFilter: true
        }
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('registrantsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            if (filterData.page) {
                this.page = filterData.page;
            }
            if (filterData.pageSize) {
                this.pageSize = filterData.pageSize;
            }
            if (filterData.sortby) {
                this.sortedtBy = filterData.sortby;
            }
            if (filterData.sortOrder) {
                this.sortOrder = filterData.sortOrder;
            }
            if (filterData.month) {
                this.filterForm.month = filterData.month;
            }
            if (filterData.startDate) {
                this.filterForm.startDate = filterData.startDate;
            }
            if (filterData.endDate) {
                this.filterForm.endDate = filterData.endDate;
            }
            this.order = this.sortedtBy;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
            this.changeDateControle();
        }
        else {
            this.getRegistrantsList();
        }
        this.getLookupData();

    }

    getLookupData() {
        let url = `sales/crm-settings`;
        let keys = ['REGISTRATION_DESIRED_PROJECTS', 'REGISTRATION_DESIRED_UNIT_TYPES', 'REGISTRATION_DESIRED_PRICE_RANGE', 'REGISTRATION_DESIRED_HOW_DID_YOU_HEAR']
        this.webService.getLookupData(url, keys).subscribe((response: any) => {
            // this.spinnerService.hide();
            if (response && response.length > 0) {
                // this.toastr.success(response.message, 'Success');
                this.desiredProjects = response[0].length > 0 ? response[0] : [];
                this.desiredUnitTypes = response[1].length > 0 ? response[1] : [];
                this.desiredPriceRange = response[2].length > 0 ? response[2] : [];
                this.howDidYouHere = response[3].length > 0 ? response[3] : [];
            } else {
                // this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    ngDoCheck() {

        this.minDate = new Date(this.filterForm.startDate);
        let dateDiff = moment(this.filterForm.startDate).diff(moment(this.filterForm.endDate));
        if (dateDiff == NaN || dateDiff > 0) {
            this.filterForm.endDate = '';
        }
        if (!this.filterForm.endDate) {
            this.filterForm.endDate = '';
        }

        if (this.filterForm.startDate) {
            this.filterForm.startDate = moment(this.filterForm.startDate).format('YYYY-MM-DD');
        }
        if (this.filterForm.endDate) {
            this.filterForm.endDate = moment(this.filterForm.endDate).format('YYYY-MM-DD');
        }


    }

    filterByDateControle() {
        this.page = 1;
        this.changeDateControle();
    }

    changeDateControle() {
        // console.log('month', this.filterForm.month);
        if (this.filterForm.month == 'custom') {
            this.isDisabled = false;
            return;
        }
        if (this.filterForm.month != 'custom') {

            if (this.filterForm.month == 'currentMonth') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('month').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('month').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'today') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('day').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('day').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'yesterday') {
                this.isDisabled = true;
                let lastDay = moment().subtract(1, 'day');
                this.filterForm.startDate = moment(lastDay).startOf('day').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastDay).endOf('day').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'currentWeek') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('week').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('week').format('YYYY-MM-DD');

            }
            else if (this.filterForm.month == 'lastWeek') {
                this.isDisabled = true;
                let lastWeek = moment().subtract(1, 'week');
                this.filterForm.startDate = moment(lastWeek).startOf('week').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastWeek).endOf('week').format('YYYY-MM-DD');

            }
            else if (this.filterForm.month == 'lastMonth') {
                this.isDisabled = true;
                let lastMonth = moment().subtract(1, 'months');
                this.filterForm.startDate = moment(lastMonth).startOf('month').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastMonth).endOf('month').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'currentYear') {
                this.isDisabled = true;
                this.filterForm.startDate = moment().startOf('year').format('YYYY-MM-DD');
                this.filterForm.endDate = moment().endOf('year').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == 'lastYear') {
                this.isDisabled = true;
                let lastYear = moment().subtract(1, 'years');;
                this.filterForm.startDate = moment(lastYear).startOf('year').format('YYYY-MM-DD');
                this.filterForm.endDate = moment(lastYear).endOf('year').format('YYYY-MM-DD');
            }
            else if (this.filterForm.month == '') {
                this.isDisabled = true;
                this.filterForm.startDate = '';
                this.filterForm.endDate = '';
            } else {
                this.isDisabled = false;
                if (this.filterForm.startDate != '') {
                    this.filterForm.startDate = moment(this.filterForm.startDate).format('YYYY-MM-DD');
                    this.minDate = new Date(this.filterForm.startDate);
                }
                if (this.filterForm.endDate != '')
                    this.filterForm.endDate = moment(this.filterForm.endDate).format('YYYY-MM-DD');
            }
            this.getRegistrantsList();
        }

    }

    filterByCustomDate() {
        this.page = 1;
        this.getRegistrantsList();
    }

    getRegistrantsList() {
        this.saveFilter();
        let url = `sales/registrants?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtBy)
            url = url + `&sortBy=${this.sortedtBy}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.month && this.filterForm.startDate) {
            url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
        }
        if (this.filterForm.desired_project.length > 0) {
            const values = this.filterForm.desired_project.map((ele) => ele.value);
            const valueString = values.join();
            url = url + `&desired_project=${valueString}`;
        }
        if (this.filterForm.desired_unit_type.length > 0) {
            const values = this.filterForm.desired_unit_type.map((ele) => ele.value);
            const valueString = values.join();
            url = url + `&desired_unit_type=${valueString}`;
        }
        if (this.filterForm.desired_price_range.length > 0) {
            const values = this.filterForm.desired_price_range.map((ele) => ele.value);
            const valueString = values.join();
            url = url + `&desired_price_range=${valueString}`;
        }
        if (this.filterForm.how_did_you_hear.length > 0) {
            const values = this.filterForm.how_did_you_hear.map((ele) => ele.value);
            const valueString = values.join();
            url = url + `&how_did_you_hear=${valueString}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.registrantsList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.registrantsList = response.results;
                    if(this.page >1 && response.results.length==0 && !response.pagination){
                        this.page = this.page > 1? this.page-1 :1;
                        this.getRegistrantsList()  
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
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //SEARCH
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getRegistrantsList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getRegistrantsList();
    }

    clearFilters() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            month: '',
            startDate: '',
            endDate: '',
            desired_project: [],
            desired_unit_type: [],
            desired_price_range: [],
            how_did_you_hear: []
        };
        this.isDisabled = true;
        this.isClear = false;
        this.getRegistrantsList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtBy,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            month: this.filterForm.month,
            startDate: this.filterForm.startDate,
            endDate: this.filterForm.endDate,
            desired_project: this.filterForm.desired_project,
            desired_unit_type: this.filterForm.desired_unit_type,
            desired_price_range: this.filterForm.desired_price_range,
            how_did_you_hear: this.filterForm.how_did_you_hear
        }
        localStorage.setItem('registrantsFilterData', JSON.stringify(data));
    }

    setOrder(value: string) {
        if (this.order === value) {
            this.reverse = !this.reverse;
        }
        this.order = value;
        this.sortedtBy = value;
        if (this.reverse) {
            this.sortOrder = 'DESC';
        } else {
            this.sortOrder = 'ASC';
        }
        // if (this.filterForm.startDate != '') {
        //     this.filterForm.startDate = moment(this.filterForm.startDate).format('YYYY-MM-DD');
        // }
        // if (this.filterForm.endDate != '')
        //     this.filterForm.endDate = moment(this.filterForm.endDate).format('YYYY-MM-DD');
        this.getRegistrantsList();
    }

    //REGISTRANS
    openAddRegistrantModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });

    }

    addRegistrant() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.formDetails.first_name || !this.formDetails.first_name.trim()) {
            this.toastr.warning('Please enter first name', 'Warning');
            return;
        }
        if (!this.formDetails.last_name || !this.formDetails.last_name.trim()) {
            this.toastr.warning('Please enter last name', 'Warning');
            return;
        }
        if (!this.formDetails.email) {
            this.toastr.warning(`Please enter registrant email`, 'Warning');
            return;
        } else {
            if (reg.test(this.formDetails.email) == false) {
                this.toastr.warning(`Please enter valid registrant email`, 'Warning');
                return;
            } else {
                this.formDetails.email = this.formDetails.email.toLowerCase();
            }
        }
        if (!this.formDetails.mobile) {
            this.toastr.warning('Please enter mobile', 'Warning');
            return;
        }
        if (!this.formDetails.desired_price_range) {
            this.toastr.warning('Please choose desired price range', 'Warning');
            return;
        } if (!this.formDetails.desired_project) {
            this.toastr.warning('Please choose desired project', 'Warning');
            return;
        } if (!this.formDetails.desired_unit_type) {
            this.toastr.warning('Please choose desired unit type', 'Warning');
            return;
        }
        // if (this.formDetails.hasOwnProperty('mobile') && this.formDetails.mobile) {
        //     let mobileObj = {
        //         number: this.formDetails.mobile.e164Number,
        //         formatted: this.formDetails.mobile.nationalNumber,
        //     }
        //     delete this.formDetails['mobile'];
        //     this.formDetails.mobile = mobileObj;
        // }
        // else {
        //     this.formDetails.mobile = null;
        // }
        let data = Object.assign({}, this.formDetails);
        data.emails = [];
        if (this.formDetails.hasOwnProperty('email') && this.formDetails.email) {
            if (this.formDetails.email.trim()) {
                let obj = {
                    type: "Personal",
                    email: this.formDetails.email.trim().toLowerCase(),
                    html_supported: true,
                    marketing: true,
                    is_inactive: false
                }
                data.emails.push(obj);
                delete data.email;
            }
        }

        data.phones = [];
        if (this.formDetails.hasOwnProperty('mobile') && this.formDetails.mobile) {
            if (this.formDetails.mobile && this.formDetails.mobile.e164Number) {
                let objMobile = {
                    type: "Mobile",
                    number: this.formDetails.mobile.e164Number,
                    formatted: this.formDetails.mobile.nationalNumber,
                    marketing: true,
                    is_inactive: false
                }
                data.phones.push(objMobile);
                delete data.mobile;
            }
        }
        // console.log('test', data);
        let url = `sales/registrants`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getRegistrantsList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openRegistrantsDetails(template: TemplateRef<any>, item) {
        // this.isEdit = false;
        this.formDetails = item;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    openEditRegistrantsModal(template: TemplateRef<any>, item) {
        this.isEdit = true;
        this.formDetails = {};
        this.formDetails = {
            desired_price_range: item.desired_price_range,
            desired_project: item.desired_project,
            desired_unit_type: item.desired_unit_type,
            email: item.email,
            first_name: item.first_name,
            how_did_you_hear: item.how_did_you_hear,
            last_name: item.last_name,
            // mobile: {
            //     formatted: '',
            //     number: ''
            // },
            _id: item._id
        }
        // this.formDetails.mobile.formatted = item.mobile.formatted;
        this.formDetails.mobile = item.mobile.number;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });
    }

    editRegistrant() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.formDetails.first_name || !this.formDetails.first_name.trim()) {
            this.toastr.warning('Please enter first name', 'Warning');
            return;
        }
        if (!this.formDetails.last_name || !this.formDetails.last_name.trim()) {
            this.toastr.warning('Please enter last name', 'Warning');
            return;
        }
        if (!this.formDetails.email) {
            this.toastr.warning(`Please enter registrant email`, 'Warning');
            return;
        } else {
            if (reg.test(this.formDetails.email) == false) {
                this.toastr.warning(`Please enter valid registrant email`, 'Warning');
                return;
            } else {
                this.formDetails.email = this.formDetails.email.toLowerCase();
            }
        }
        if (!this.formDetails.mobile) {
            this.toastr.warning('Please enter mobile', 'Warning');
            return;
        }
        if (!this.formDetails.desired_price_range) {
            this.toastr.warning('Please choose desired price range', 'Warning');
            return;
        } if (!this.formDetails.desired_project) {
            this.toastr.warning('Please choose desired project', 'Warning');
            return;
        } if (!this.formDetails.desired_unit_type) {
            this.toastr.warning('Please choose desired unit type', 'Warning');
            return;
        }
        if (this.formDetails.hasOwnProperty('mobile') && this.formDetails.mobile) {
            let mobileObj = {
                number: this.formDetails.mobile.e164Number,
                formatted: this.formDetails.mobile.nationalNumber,
            }
            delete this.formDetails['mobile'];
            this.formDetails.mobile = mobileObj;
        }
        else {
            this.formDetails.mobile = null;
        }
        let data = { ...this.formDetails };
        // delete data._id;
        let url = `sales/registrants`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getRegistrantsList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    ////SETTINGS////
    openRegistrantSettingsModal(template: TemplateRef<any>){
        this.formDetails = {
            defaultActiveTab:'generalTab'
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });
    }

    doTabFunctions(event){
        this.formDetails.defaultActiveTab=event.nextId;
        if(this.formDetails.defaultActiveTab=='optionsTab'){
            this.formDetails.desired_projects=this.desiredProjects ? this.desiredProjects.map((element)=>element.value).join('\n') :[];
            this.formDetails.desired_unit_type=this.desiredUnitTypes ? this.desiredUnitTypes.map((element)=>element.value).join('\n') :[];
            this.formDetails.desired_price_range=this.desiredPriceRange ? this.desiredPriceRange.map((element)=>element.value).join('\n') :[];
            this.formDetails.how_did_you_hear=this.howDidYouHere ? this.howDidYouHere.map((element)=>element.value).join('\n') :[];
        }
    }

    updateRegistrantSettings(){
        let data:any={};
        let keys = ['REGISTRATION_DESIRED_PROJECTS', 'REGISTRATION_DESIRED_UNIT_TYPES', 'REGISTRATION_DESIRED_PRICE_RANGE', 'REGISTRATION_DESIRED_HOW_DID_YOU_HEAR']
        if(this.formDetails.defaultActiveTab=='generalTab'){
            data.heading=this.formDetails.heading || '';
            data.sub_title=this.formDetails.sub_title || '';
            data.footer=this.formDetails.footer || '';
            // this.updateGeneralSetting(data);
        }
        else if(this .formDetails.defaultActiveTab=='optionsTab'){
            data.desired_projects=this.formDetails.desired_projects ? this.formDetails.desired_projects.split('\n') :[];
            data.desired_unit_type=this.formDetails.desired_unit_type ? this.formDetails.desired_unit_type.split('\n') :[];
            data.desired_price_range=this.formDetails.desired_price_range ? this.formDetails.desired_price_range.split('\n') :[];
            data.how_did_you_hear=this.formDetails.how_did_you_hear ? this.formDetails.how_did_you_hear.split('\n') :[];
            data.show_desired_price_range=this.formDetails.show_desired_price_range ? true:false;
            data.show_how_did_you_hear=this.formDetails.show_how_did_you_hear ? true:false;    
            data.show_desired_unit_type= this.formDetails.show_desired_unit_type ? true:false;
            data.show_desired_projects= this.formDetails.show_desired_projects ? true:false;

            // this.updateRegistrantSettingsData(keys,data);
        }

        console.log('data',data);
       
    }

    updateGeneralSetting(data){
        let url = `sales/crm-setting`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    updateRegistrantSettingsData(key,data) {
        let url = `sales/crm-settings?type=${'key'}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getLookupData();
                this.modalRef.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    
    //FILTERS
    onItemSelect() {
        this.page = 1;
        this.getRegistrantsList();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getRegistrantsList();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getRegistrantsList();
    }

    //PAGINATION
    doPaginationWise(page) {
        this.page = page;
        this.getRegistrantsList();
    }

    setPageSize() {
        this.page = 1;
        this.getRegistrantsList();
    }

    goToRegistrantsDetails(obj) {
        this.router.navigate(['sales/registrants/' + obj._id]);
    }
}
