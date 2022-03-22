import { Component, OnInit, TemplateRef, Input, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import * as moment from 'moment';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-worksheets',
    templateUrl: './worksheets.component.html',
    styleUrls: ['./worksheets.component.css']
})
export class WorksheetsComponent implements OnInit {
    @Input() user_id: String;
    @Input() returnUrl: String;
    builders: any = [];
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        searchText: '',
        month: '',
        startDate: '',
        endDate: ''
    };
    // user_mobile: FormGroup;
    agent_mobile: FormGroup;
    solicitor_mobile: FormGroup;
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isClear: boolean = false;
    worksheetList: any = [];
    projectList: any = [];
    modelList: any = [];
    modelListTwo: any = [];
    modelListThree: any = [];
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    projectLogo: any;
    separateDialCode = false;
    workingWithBroker: boolean = false;
    workingWithSolicitor: boolean = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    minDate: any;
    dateDiff: any;
    isDisabled: boolean = false;
    purchasersGroup: FormGroup;
    desiredProjects: any[] = [];
    desiredUnitTypes: any[] = [];
    desiredPriceRange: any[] = [];
    howDidYouHere: any[] = [];

    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private formBuilder: FormBuilder,
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('worksheetFilterData');
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
                this.sortedtby = filterData.sortby;
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

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
            this.changeDateControle();
        }
        else {
            this.getWorksheetList();

        }
    }

    // ngDoCheck() {

    //     this.minDate = new Date(this.filterForm.startDate);
    //     let dateDiff = moment(this.filterForm.startDate).diff(moment(this.filterForm.endDate));
    //     if (dateDiff >= 0) {
    //         this.filterForm.endDate = '';
    //     }
    // }

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
            this.getWorksheetList();
        }

    }

    filterByDateControle() {
        this.page = 1;
        this.changeDateControle();
    }

    filterByCustomDate() {
        this.page = 1;
        this.getWorksheetList();
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `sales/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    onProjectChange(item, index) {
        if (item.project_id) {
            this.getModelList(item.project_id, index);
        }
        else {
            this.modelList = [];
        }
    }
    
    getModelList(projectId, index) {
        this.spinnerService.show();
        let url = `sales/models?type=list&project_id=${projectId}`;
        // let url = `sales/models?type=list`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    if (index == 0) {
                        this.modelList = response.results;
                    }
                    else if (index == 1) {
                        this.modelListTwo = response.results;
                    }
                    else if (index == 2) {
                        this.modelListThree = response.results;
                    }
                    else {
                        this.modelList = [];
                    }
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getWorksheetList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `sales/worksheets?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.month && this.filterForm.startDate) {
            url = this.filterForm.endDate ? url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}` : url + `&start_date=${this.filterForm.startDate}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.worksheetList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.worksheetList = response.results;
                    if(this.page >1 && response.results.length==0 && !response.pagination){
                        this.page = this.page > 1? this.page-1 :1;
                        this.getProjectList()  
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
    doPaginationWise(page) {
        this.page = page;
        this.getWorksheetList();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getWorksheetList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';

        this.getWorksheetList();
    }
    setPageSize() {
        this.page = 1;
        this.getWorksheetList();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            month: '',
            startDate: '',
            endDate: ''
        };
        this.isClear = false;
        this.isDisabled = true;
        this.getWorksheetList();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            month: this.filterForm.month,
            startDate: this.filterForm.startDate,
            endDate: this.filterForm.endDate
        }
        localStorage.setItem('worksheetFilterData', JSON.stringify(data));
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
        this.getWorksheetList();
    }
    //OPEN ADD SUBDIVISION MODAL
    openAddWorksheetModal(template: TemplateRef<any>) {
        this.isEdit = false;
        // this.user_mobile = new FormGroup({
        //     mobile: new FormControl('', [Validators.required])
        // });
        this.agent_mobile = new FormGroup({
            mobile: new FormControl('', [Validators.required])
        });
        this.purchasersGroup = this.formBuilder.group({
            purchasers: this.formBuilder.array([])
        })
        this.solicitor_mobile = this.formBuilder.group({
            mobile: new FormControl('', [Validators.required])
        })

        this.formDetails = {
            purchasers: [
                {
                    _id: '',
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    legal_full_name: '',
                    dob: '',
                    address1: '',
                    address2: '',
                    city: '',
                    province: '',
                    zip: '',
                    country: '',
                    occupation: '',
                    mobile: '',
                    home_phone: '',
                    office: '',
                    email: '',
                    residency: ''
                }
            ],
            choices: [
                {
                    project_id: '',
                    model_id: '',
                    level: ''
                }
            ],
            agent: {},
            solicitor: {}
        };
        this.getProjectList();
        // this.getModelList();
        this.appendPurchaserGroup();
        this.addDefaultChoices();
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    get getPurchasers(): FormArray {
        return this.purchasersGroup.get('purchasers') as FormArray;
    }
    appendPurchaserGroup() {
        this.getPurchasers.push(this.createPurchaserGroup());
    }
    createPurchaserGroup() {
        return this.formBuilder.group({
            _id: uuidv4(),
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            legal_full_name: ['', Validators.required],
            middle_name: [''],
            dob: ['', Validators.required],
            address1: ['', Validators.required],
            address2: [''],
            city: ['', Validators.required],
            province: ['', Validators.required],
            zip: ['', Validators.required],
            occupation: ['', Validators.required],
            country: ['', Validators.required],
            mobile: ['', Validators.required],
            email: ['', [Validators.required, Validators.pattern(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)]],
            home_phone: [''],
            office: [''],
            residency: [''],
        })
    }

    //OPEN EDIT PROJECT MODAL
    openEditWorksheetModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.formDetails = { ...obj };
        // this.formDetails.user_type = this.formDetails.investment ? 'investment' : 'rental';
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    addPurchaser() {
        this.appendPurchaserGroup();
        // this.formDetails.purchasers.push(
        //     {
        //         first_name: '',
        //         middle_name: '',
        //         last_name: '',
        //         legal_full_name: '',
        //         dob: '',
        //         address1: '',
        //         address2: '',
        //         city: '',
        //         province: '',
        //         zip: '',
        //         country: '',
        //         occupation: '',
        //         mobile: '',
        //         home_phone: '',
        //         office: '',
        //         email: '',
        //         residency: ''
        //     }
        // )
    }
    addDefaultChoices() {
        this.formDetails.choice = [];
        for (var i = 1; i < 3; i++) {
            this.formDetails.choices.push(
                {
                    project_id: '',
                    model_id: '',
                    level: '',
                }
            )
        }
    }

    addChoices() {
        this.formDetails.choices.push(
            {
                project_id: '',
                model_id: '',
                level: '',
            }
        )
    }
    addWorksheet() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        // if (!this.formDetails.first_name) {
        //     this.toastr.warning('Please enter first name', 'Warning');
        //     return;
        // }
        // if (!this.formDetails.last_name) {
        //     this.toastr.warning('Please enter last name', 'Warning');
        //     return;
        // }
        // if (!this.formDetails.legal_name) {
        //     this.toastr.warning('Please enter legal name', 'Warning');
        //     return;
        // }
        // if (!this.formDetails.dob) {
        //     this.toastr.warning('Please enter date of birth', 'Warning');
        //     return;
        // }
        // if (!this.formDetails.email) {
        //     this.toastr.warning('Please enter user email', 'Warning');
        //     return;
        // }
        // else {
        //     if (reg.test(this.formDetails.email) == false) {
        //         this.toastr.warning(`Please enter valid user email`, 'Warning');
        //         return;
        //     } else {
        //         this.formDetails.email = this.formDetails.email.toLowerCase();
        //     }
        // }
        // if (!this.user_mobile.controls['mobile'].value) {
        //     this.toastr.warning('Please enter mobile number', 'Warning');
        //     return;
        // }
        // else {
        //     if (this.user_mobile.controls['mobile'].invalid) {
        //         this.toastr.warning('Please enter valid mobile number', 'Warning');
        //         return;
        //     }
        // }
        if (!this.formDetails.user_type) {
            this.toastr.warning('Please check user type investment or rental', 'Warning');
            return;
        }

        this.formDetails.purchasers = [];
        let purchasersGp = Object.assign({}, this.purchasersGroup.value);
        purchasersGp.purchasers.forEach(element => {
            this.formDetails.purchasers.push(Object.assign({}, element));
        });
        // console.log('purchasersGp', purchasersGp);
        var keepGoing = true;
        this.formDetails.purchasers.forEach((element, index) => {
            if (!element.first_name) {
                this.toastr.warning(`Please enter purchaser${index + 1} first name`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.last_name) {
                this.toastr.warning(`Please enter purchaser${index + 1} last name`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.legal_full_name) {
                this.toastr.warning(`Please enter purchaser${index + 1} legal full name`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.dob) {
                this.toastr.warning(`Please enter purchaser${index + 1} date of birth`, 'Warning');
                keepGoing = false;
                return;
            } else {
                element.dob = moment(element.dob).format('YYYY-MM-DD');
            }
            if (!element.address1) {
                this.toastr.warning(`Please enter purchaser${index + 1} address1`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.city) {
                this.toastr.warning(`Please enter purchaser${index + 1} city`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.province) {
                this.toastr.warning(`Please enter purchaser${index + 1} province`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.zip) {
                this.toastr.warning(`Please enter purchaser${index + 1} zip`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.country) {
                this.toastr.warning(`Please enter purchaser${index + 1} country`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.occupation) {
                this.toastr.warning(`Please enter purchaser${index + 1} occupation`, 'Warning');
                keepGoing = false;
                return;
            }
            if (!element.mobile) {
                this.toastr.warning(`Please enter purchaser${index + 1} mobile`, 'Warning');
                keepGoing = false;
                return;
            }
            else {
                let mobileControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('mobile');
                if (mobileControl && mobileControl.invalid) {
                    this.toastr.warning(`Please enter  purchaser${index + 1} valid mobile number`, 'Warning');
                    keepGoing = false;
                    return;
                }
            }

            if (element.home_phone) {
                let homePhoneControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('home_phone');
                if (homePhoneControl && homePhoneControl.invalid) {
                    this.toastr.warning(`Please enter  purchaser${index + 1} valid home phone number`, 'Warning');
                    keepGoing = false;
                    return;
                }
            }

            if (!element.email) {
                this.toastr.warning(`Please enter purchaser${index + 1} email`, 'Warning');
                keepGoing = false;
                return;
            } else {
                if (reg.test(element.email) == false) {
                    this.toastr.warning(`Please enter valid purchaser${index + 1} email`, 'Warning');
                    keepGoing = false;
                    return;
                } else {
                    element.email = element.email.toLowerCase();
                }
            }
        });
        if (keepGoing) {
            if (this.workingWithBroker) {
                if (!this.formDetails.agent.first_name) {
                    this.toastr.warning('Please enter agent first name', 'Warning');
                    return;
                }
                if (!this.formDetails.agent.last_name) {
                    this.toastr.warning('Please enter agent last name', 'Warning');
                    return;
                }
                if (!this.formDetails.agent.email) {
                    this.toastr.warning('Please enter agent email', 'Warning');
                    return;
                }
                if (reg.test(this.formDetails.agent.email) == false) {
                    this.toastr.warning(`Please enter valid agent email`, 'Warning');
                    return;
                } else {
                    this.formDetails.agent.email = this.formDetails.agent.email.toLowerCase();
                }
                if (!this.formDetails.agent.address1) {
                    this.toastr.warning('Please enter agent address1', 'Warning');
                    return;
                }

                if (!this.formDetails.agent.city) {
                    this.toastr.warning('Please enter agent city', 'Warning');
                    return;
                }
                if (!this.formDetails.agent.province) {
                    this.toastr.warning('Please enter agent province', 'Warning');
                    return;
                }

                if (!this.agent_mobile.controls['mobile'].value) {
                    this.toastr.warning('Please enter agent mobile number', 'Warning');
                    return;
                }
                else {
                    if (this.agent_mobile.controls['mobile'].invalid) {
                        this.toastr.warning('Please enter valid agent mobile number', 'Warning');
                        return;
                    }
                }
            }
            //solicitor
            if (this.workingWithSolicitor) {
                if (!this.formDetails.solicitor.first_name) {
                    this.toastr.warning('Please enter solicitor first name', 'Warning');
                    return;
                }
                if (!this.formDetails.solicitor.last_name) {
                    this.toastr.warning('Please enter solicitor last name', 'Warning');
                    return;
                }
                if (!this.formDetails.solicitor.email) {
                    this.toastr.warning('Please enter solicitor email', 'Warning');
                    return;
                }
                if (reg.test(this.formDetails.solicitor.email) == false) {
                    this.toastr.warning(`Please enter valid solicitor email`, 'Warning');
                    return;
                } else {
                    this.formDetails.solicitor.email = this.formDetails.solicitor.email.toLowerCase();
                }
                if (!this.formDetails.solicitor.address1) {
                    this.toastr.warning('Please enter solicitor address1', 'Warning');
                    return;
                }

                if (!this.formDetails.solicitor.city) {
                    this.toastr.warning('Please enter solicitor city', 'Warning');
                    return;
                }
                if (!this.formDetails.solicitor.province) {
                    this.toastr.warning('Please enter solicitor province', 'Warning');
                    return;
                }

                if (!this.solicitor_mobile.controls['mobile'].value) {
                    this.toastr.warning('Please enter solicitor mobile number', 'Warning');
                    return;
                }
                else {
                    if (this.solicitor_mobile.controls['mobile'].invalid) {
                        this.toastr.warning('Please enter valid solicitor mobile number', 'Warning');
                        return;
                    }
                }
            }
            var data = {
                // first_name: this.formDetails.first_name,
                // middle_name: this.formDetails.middle_name,
                // last_name: this.formDetails.last_name,
                // legal_name: this.formDetails.legal_name,
                // dob: moment(this.formDetails.dob).format('YYYY-MM-DD'),
                // sin: this.formDetails.sin || '',
                // occupation: this.formDetails.occupation,
                // email: this.formDetails.email,
                user_type: this.formDetails.user_type,
                purchasers: this.formDetails.purchasers,
                how_did_you_hear: this.formDetails.how_did_you_hear || '',
                online_registration_date: this.formDetails.online_registration_date || '',
                parking_required: this.formDetails.parking_required ? true : false,
                locker_required: this.formDetails.locker_required ? true : false,
                bicycle_required: this.formDetails.bicycle_required ? true : false,
                maritial_status: this.formDetails.maritial_status || '',
                no_of_dependants: this.formDetails.no_of_dependants || '',
                rent_or_own: this.formDetails.rent_or_own || '',
                reason_for_purchase: this.formDetails.reason_for_purchase || '',
                deciding_factor: this.formDetails.deciding_factor || '',
                comments: this.formDetails.comments || '',
            }
            // let userMobileObj = Object.assign({}, this.user_mobile.value.mobile);
            // if (userMobileObj) {
            //     if (userMobileObj.hasOwnProperty('nationalNumber') && userMobileObj.hasOwnProperty('e164Number')) {
            //         let mobileObj = {
            //             number: userMobileObj.e164Number,
            //             formatted: userMobileObj.nationalNumber,
            //         }
            //         // delete data.agent['mobile'];
            //         data['mobile'] = Object.assign({}, mobileObj);
            //     }
            //     else {
            //         data['mobile'] = {};
            //     }

            // }
            let purchasers = [];
            if (this.formDetails && this.formDetails.purchasers && this.formDetails.purchasers.length > 0) {
                this.formDetails.purchasers.forEach((element, index) => {
                    let obj = {
                        _id: element._id ? element._id : "",
                        address1: element.address1 ? element.address1 : "",
                        address2: element.address2 ? element.address2 : "",
                        city: element.city ? element.city : "",
                        country: element.country ? element.country : "",
                        dob: element.dob ? moment(element.dob).format('YYYY-MM-DD') : "",
                        email: element.email ? element.email : "",
                        first_name: element.first_name ? element.first_name : "",
                        last_name: element.last_name ? element.last_name : "",
                        legal_full_name: element.legal_full_name ? element.legal_full_name : "",
                        middle_name: element.middle_name ? element.middle_name : "",
                        province: element.province ? element.province : "",
                        zip: element.zip ? element.zip : "",
                        occupation: element.occupation ? element.occupation : "",
                        mobile: element.mobile ? element.mobile : "",
                        home_phone: element.home_phone ? element.home_phone : "",
                        office: element.office ? element.office : "",
                        residency: element.residency ? element.residency : "",
                    };
                    if (element.hasOwnProperty('home_phone') && element.home_phone) {
                        let home_phoneObj = {
                            number: this.formDetails.purchasers[index].home_phone.e164Number,
                            formatted: this.formDetails.purchasers[index].home_phone.nationalNumber,
                        }
                        // delete element['home_phone'];
                        obj['home_phone'] = Object.assign({}, home_phoneObj);

                    }
                    else {
                        obj['home_phone'] = {};
                    }


                    if (element.hasOwnProperty('mobile') && element.mobile) {
                        let mobileObj = {
                            number: this.formDetails.purchasers[index].mobile.e164Number,
                            formatted: this.formDetails.purchasers[index].mobile.nationalNumber,
                        }
                        // delete element['mobile'];
                        obj['mobile'] = Object.assign({}, mobileObj);
                    }
                    else {
                        obj['mobile'] = {};
                    }

                    purchasers.push(obj);
                });
            }
            data['purchasers'] = purchasers;
            //Formatting mobile fields in the agent
            if (this.workingWithBroker) {
                let agent = Object.assign({}, this.formDetails.agent);
                data['agent'] = agent;
                let agentMobile = Object.assign({}, this.agent_mobile.value.mobile);

                if (agentMobile) {
                    if (agentMobile.hasOwnProperty('e164Number') && agentMobile.nationalNumber) {
                        let mobileObj = {
                            number: agentMobile.e164Number,
                            formatted: agentMobile.nationalNumber,
                        }
                        // delete data.agent['mobile'];
                        data['agent'].mobile = mobileObj;
                    }
                    else {
                        data['agent'].mobile = {};
                    }
                }
                else {
                    data['agent'].mobile = {};
                }
            }
            else {
                data['agent'] = {};
            }
            //Formatting mobile fields in the solicitor
            if (this.workingWithSolicitor) {
                let solicitor = Object.assign({}, this.formDetails.solicitor);
                data['solicitor'] = solicitor;
                let solicitorMobile = Object.assign({}, this.solicitor_mobile.value.mobile);
                if (solicitorMobile) {
                    if (solicitorMobile.hasOwnProperty('e164Number') && solicitorMobile.nationalNumber) {
                        let mobileObj = {
                            number: solicitorMobile.e164Number,
                            formatted: solicitorMobile.nationalNumber,
                        }
                        data['solicitor'].mobile = mobileObj;
                    }
                    else {
                        data['solicitor'].mobile = {};
                    }
                }
                else {
                    data['solicitor'].mobile = {};
                }
            } else {
                data['solicitor'] = {};
            }

            data['choices'] = [];
            if (this.formDetails.choices && this.formDetails.choices.length > 0) {
                this.formDetails.choices.forEach((element, index) => {
                    let selectedProject = this.projectList.find((ele) => ele._id == element.project_id);
                    let selectedModel: any;
                    if (index == 0) {
                        selectedModel = this.modelList.find((ele) => ele._id == element.model_id);
                    }
                    else if (index == 1) {
                        selectedModel = this.modelListTwo.find((ele) => ele._id == element.model_id);
                    }
                    else if (index == 2) {
                        selectedModel = this.modelListThree.find((ele) => ele._id == element.model_id);
                    }
                    // console.log('selectedProject', selectedProject);
                    if (selectedProject && selectedModel) {
                        data['choices'].push(
                            {
                                project_id: selectedProject._id ? selectedProject._id : '',
                                project_name: selectedProject.name ? selectedProject.name : '',
                                model_id: selectedModel._id ? selectedModel._id : '',
                                model_name: selectedModel.name ? selectedModel.name : '',
                                level: element.level ? element.level : '',
                            }
                        )
                    }
                    else {
                        data['choices'].push(
                            {
                                project_id: '',
                                project_name: '',
                                model_id: '',
                                model_name: '',
                                level: element.level ? element.level : '',
                            }
                        )
                    }

                });
            }
            let url = `sales/worksheets`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.filterForm.searchText = '';
                        this.isClear = true;
                        this.getWorksheetList();
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }

    deletePurchaser(i) {
        // if (this.formDetails.purchasers.length > 1) {
        //     this.formDetails.purchasers.splice(i, 1);
        // }
        this.getPurchasers.removeAt(i);
    }
    deleteChoise(i) {
        if (this.formDetails.choices.length > 1) {
            this.formDetails.choices.splice(i, 1);
        }
    }

    goToWorksheetsDetails(obj) {
        this.router.navigate(['sales/worksheets/' + obj._id]);
    }

    ///WORKSHEET MODAL////
    openWorksheetSettingsModal(template: TemplateRef<any>){
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
                this.modalRef.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
}
