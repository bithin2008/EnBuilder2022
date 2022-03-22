import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { WebService } from '../../../services/web.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { Subject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { InventoryModalComponent } from '../inventory-modal/inventory-modal.component';
import { AutoComplete } from 'primeng/autocomplete';
import * as moment from 'moment';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { environment } from '../../../../environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/compiler/src/compiler_facade_interface';
import { element } from 'protractor';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
    selector: 'app-deal-details',
    templateUrl: './deal-details.component.html',
    styleUrls: ['./deal-details.component.css']
})
export class DealDetailsComponent implements OnInit {
    dealsId: any;
    @ViewChild('autoCompleteObject', { static: false }) public autoCompleteObject: AutoComplete;
    dealDetailsObj: any = {
        purchasers: [{
            phones: [],
            emails: [],
            layouts: []
        }]
    };
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    paymemtTypes = [{
        value: 'CHEQUE',
        name: 'Cheque'
    },
    {
        value: 'WIRE TRANSFER',
        name: 'Wire Transfer'
    },
    {
        value: 'CREDIT CARD',
        name: 'Credit Card'
    },
    {
        value: 'OTHER',
        name: 'OTHER'
    }]
    dealStages: any[] = [
        {
            value: 'NEW',
            description: ''
        },
        {
            value: 'RESERVED',
            description: ''
        },
        // {
        //     value: 'VERIFIED',
        //     description: ''
        // },
        {
            value: 'OUT FOR SIGN',
            description: ''
        },
        {
            value: 'SIGNED',
            description: ''
        },
        {
            value: 'CONDITIONAL',
            description: ''
        },
        {
            value: 'FIRM',
            description: ''
        },
        {
            value: 'DEFAULT',
            description: ''
        },
        {
            value: 'RECESSION',
            description: ''
        },
        {
            value: 'UNIT RELEASED',
            description: ''
        },
        // {
        //     value: 'REVIEW',
        //     description: ''
        // },
        // {
        //     value: 'EXECUTED',
        //     description: ''
        // },
    ]
    defaultActiveTab: any = 'dealInfo';
    openContactModalRef;
    formDetails: any = {};
    modalRef: BsModalRef;
    editDepositModalRef: BsModalRef;
    autosearchText: any = '';
    contactList: any = [];
    projectList: any[] = [];
    disableUnit: boolean = true;
    private modelChanged: Subject<string> = new Subject<string>();
    private subscription: Subscription;
    checkInventoryModalRef;
    isUnitAvailable: boolean = false;
    unitsSoldOut: boolean = false;
    isSearching: boolean = false;
    selectedProject: any;
    unitList: any = [];
    depositInfo: any = [];
    paymentList: any = {
        total_amount: 0,
        records: []
    };
    occupancyList: any = [];
    contactTypes: any = [
        {
            value: 'Sales Agent',
        },
        {
            value: 'Broker',
        },
        {
            value: 'Trade',
        },
        {
            value: 'Staff',
        },
        {
            value: 'Solicitor',
        },
        {
            value: 'End-User',
        }
    ];
    measureUnits: any[] = [];
    depositList: any[] = [];
    depositedList: any[] = [];
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    mobilePhone: FormGroup;
    workPhone: FormGroup;
    homePhone: FormGroup;
    supportPhone: FormGroup;
    brokerPhone: FormGroup;
    baseUrl = environment.BASE_URL;
    chequeDocuments: any[] = [];
    isSalesPriceAvailable: boolean = false;
    discountList: any[] = [];
    // depositFormDetails: any = {};
    parkingTypes: any[] = [];
    bicycleTypes: any[] = [];
    lockerTypes: any[] = [];
    percentageDetails: any;
    noteList: any[] = [];
    documentsList: any[] = [];
    selectedDocument: any = {};
    worksheetDetailsObj: any = {};
    isNotesEdit: boolean = false;
    constructor(
        public _activatedRoute: ActivatedRoute,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private ngModalService: NgbModal,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private modalService: BsModalService,
        private httpClient: HttpClient,
        private FileSaverService: FileSaverService,
        public cdk: ChangeDetectorRef
    ) { }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        // if (localStorage.getItem('salesDealActiveTab')) {
        //     this.defaultActiveTab = localStorage.getItem('salesDealActiveTab');
        // }
        this.checkLogin();
        this.subscription = this.modelChanged
            .pipe(
                map((text: any) => {
                    return text;
                })
                , debounceTime(200)
                , distinctUntilChanged()
            ).subscribe((searchValue: string) => {
                if (searchValue) {
                    this.onUnitChange(searchValue);
                }
            });
    }

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
                }
                else {
                    this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
                    this.dealsId = this._activatedRoute.snapshot.paramMap.get("dealId");
                    if (this.dealsId) {
                        this.getDealDetails();
                        this.getProjectList();
                        this.getSettings();
                        this.getNotesList();
                        this.getDocumentList();
                        this.getDealPayments();

                    }
                }
            } else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    doTabFunctions(event) {
        // if (event.nextId == 'dealInfo') {
        //     localStorage.setItem('salesDealActiveTab', 'dealInfo');
        // }
        if (event.nextId == 'deposits') {
            localStorage.setItem('salesDealActiveTab', 'deposits');
            if (this.dealDetailsObj.stage != 'NEW' && this.dealDetailsObj.stage != 'UNIT RELEASED') {
                this.getDepositDeal();
                this.getChequeImages();
            }
        }
    }
    ngDoCheck() {
        if (this.formDetails.signed_date) {
            this.formDetails.signed_date = moment(this.formDetails.signed_date).format('YYYY-MM-DD');
        }
    }

    goToSales() {
        this.router.navigate(['sales']);
    }


    getDealDetails() {
        let url = `sales/deals?_id=${this.dealsId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.dealDetailsObj = response.result ? response.result : [];
                    // this.dealDetailsObj.parking_price = 0;
                    if (this.dealDetailsObj.allocate_parking && this.dealDetailsObj.allocate_parking.length > 0) {
                        this.dealDetailsObj.allocate_parking.forEach(element => {
                            let records = (this.dealDetailsObj.assigned_parking && this.dealDetailsObj.assigned_parking.length > 0) ? this.dealDetailsObj.assigned_parking.filter((assigned) => assigned.type == element.type) : [];
                            element.assignedCount = records;
                            // this.dealDetailsObj.parking_price = this.dealDetailsObj.parking_price + (element.price ? element.price : 0);
                        });
                    }
                    // this.dealDetailsObj.locker_price = 0;
                    if (this.dealDetailsObj.allocate_locker && this.dealDetailsObj.allocate_locker.length > 0) {
                        this.dealDetailsObj.allocate_locker.forEach(element => {
                            let records = (this.dealDetailsObj.assigned_locker && this.dealDetailsObj.assigned_locker.length > 0) ? this.dealDetailsObj.assigned_locker.filter((assigned) => assigned.type == element.type) : [];
                            element.assignedCount = records;
                            // this.dealDetailsObj.locker_price = this.dealDetailsObj.locker_price + (element.price ? element.price : 0);
                        });
                    }
                    // this.dealDetailsObj.bicycle_price = 0;
                    if (this.dealDetailsObj.allocate_bicycle && this.dealDetailsObj.allocate_bicycle.length > 0) {
                        this.dealDetailsObj.allocate_bicycle.forEach(element => {
                            let records = (this.dealDetailsObj.assigned_bicycle && this.dealDetailsObj.assigned_bicycle.length > 0) ? this.dealDetailsObj.assigned_bicycle.filter((assigned) => assigned.type == element.type) : [];
                            element.assignedCount = records;
                            // this.dealDetailsObj.bicycle_price = this.dealDetailsObj.bicycle_price + (element.price ? element.price : 0);
                        });
                    }
                    this.dealDetailsObj.purchasers.forEach(element => {
                        element.layouts = [];
                        this.getImgesByPurchaser(element);
                    });
                    if (this.dealDetailsObj.unit && this.dealDetailsObj.unit.area) {
                        // this.dealDetailsObj.unit.priceSqFt = this.dealDetailsObj.unit.sales_price / this.dealDetailsObj.unit.area
                        // this.dealDetailsObj.contract_price = this.dealDetailsObj.unit.sales_price - this.dealDetailsObj.total_discount;
                    }
                    this.occupancyList = [];
                    if (this.dealDetailsObj.unit) {
                        let selectedProject = this.projectList.find((response) => response._id == this.dealDetailsObj.unit.project_id);
                        if (selectedProject) {
                            this.occupancyList = selectedProject.occupancy_dates;
                        }
                    }
                    if (this.dealDetailsObj.discounts && this.dealDetailsObj.discounts.length > 0 && this.dealDetailsObj.unit) {
                        this.dealDetailsObj.discounts.forEach(element => {
                            if (element.amount_type == 'PERCENT') {
                                // element['amount'] = Math.round((element.percent / 100) * this.dealDetailsObj.unit.sales_price);
                                element['amount'] = Math.round(((element.value / 100) * this.dealDetailsObj.unit.sales_price) * 100) / 100;

                            }
                        });
                    }

                    if (this.dealDetailsObj.unit) {
                        if (!this.dealDetailsObj.hasOwnProperty('finance') || !this.dealDetailsObj.finance.hasOwnProperty('base_price')) {
                            this.addFinanceKey();
                        }
                    }
                    // this.getNotesList();
                    // this.getDocumentList();
                    // this.getDealPayments();
                    //CALL FOR WORKSHEET DETAILS
                    if (this.dealDetailsObj.worksheet_id) {
                        this.getWorksheetDetails();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    updateDealAPI(data) {
        let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    if (this.modalRef) {
                        this.modalRef.hide();
                    }
                    this.getDealDetails();
                    if (data.hasOwnProperty('notes')) {
                        this.getNotesList();
                    }
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getSettings() {
        let url = `finance/crm-settings?type=TAX_PERCENTAGE`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.percentageDetails = (response.results && response.results.length > 0) ? response.results[0] : {};
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //To add finance keys at first time in the deal details
    addFinanceKey() {
        let data: any = {};
        let finance = {
            base_price: Math.round(this.dealDetailsObj.unit.price * 100) / 100 || '',
            price_sqft: this.dealDetailsObj.unit.area ? Math.round((this.dealDetailsObj.unit.sales_price / this.dealDetailsObj.unit.area) * 100) / 100 : 0,
            floor_premium: Math.round(this.dealDetailsObj.unit.floor_premium * 100) / 100 || '',
            unit_premium: Math.round(this.dealDetailsObj.unit.unit_premium * 100) / 100 || '',
            sales_price: Math.round(this.dealDetailsObj.unit.sales_price * 100) / 100 || '',
        }
        data.finance = finance;
        this.updateDealAPI(data);

    }

    //to get worksheet details
    getWorksheetDetails() {
        let url = `sales/worksheets?_id=${this.dealDetailsObj.worksheet_id}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.worksheetDetailsObj = response.result ? response.result : {};
                    if (this.worksheetDetailsObj.dob) {
                        this.worksheetDetailsObj.dob = moment(this.worksheetDetailsObj.dob).format("YYYY-MM-DD");
                    }
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

    navigateToWorksheet(id) {
        if (id) {
            let url = `#/sales/worksheets/${id}`;
            window.open(url, '_blank');
        }
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `sales/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    changeProject() {
        this.formDetails.unit_no = '';
        this.formDetails.unit_id = '';
        this.formDetails.model_id = '';
        this.formDetails.model_name = '';
        this.formDetails.bath = '';
        this.formDetails.bed = '';
        this.formDetails.floor_legal = '';
        this.formDetails.unit_no_legal = '';
        this.formDetails.is_locker = false;
        this.formDetails.max_lockers = 0;
        this.formDetails.max_parking = 0;
        this.formDetails.locker = '';
        this.formDetails.is_parking = false;
        this.formDetails.parking = '';
        this.formDetails.deposit_structure = '';
        this.depositInfo = [];
        if (this.formDetails.project_id) {
            this.selectedProject = this.projectList.find((project) => project._id == this.formDetails.project_id);
            this.disableUnit = false;
            this.getUnitList();
            this.getDeposit(this.formDetails.project_id);
        }
        else {
            this.selectedProject = {};
            this.unitList = [];
        }
    }


    //CONFIRM AGREEMENT SIGNED MODAL
    openAgreementSignedModal(template: TemplateRef<any>) {
        // console.log(this.dealDetailsObj);
        this.formDetails = {
            signed_date: moment().startOf('day').format('YYYY-MM-DD'),
            cooling_period: '',
            cooling_period_extended: this.dealDetailsObj.cooling_period_extended
        };
        this.getProjectDetails();
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    onSignedDateChanged(event) {
        if (event) {
            if (event && this.formDetails.cooling_period) {
                let fday = moment(event).add(this.formDetails.cooling_period, 'day');
                this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
            }
            else {
                this.formDetails.firm_date = '';
            }
        }
    }

    addAgreementSigned() {
        if (!this.formDetails.signed_date) {
            this.toastr.warning('Please select signed date', 'Warning');
            return;
        }
        if (!this.dealDetailsObj.unit || !this.dealDetailsObj.unit.sales_price) {
            this.toastr.warning('Sales price is not available for this unit', 'Warning')
            return;
        }
        let data: any = {};
        data.signed_date = this.formDetails.signed_date;
        // data.firm_date = this.formDetails.firm_date ? moment(this.formDetails.firm_date).startOf('day').format('YYYY-MM-DD') : '';
        data.stage = 'SIGNED';
        data.notes = this.formDetails.signed_note;
        this.updateDealAPI(data);
    }

    getProjectDetails() {
        var url = `sales/projects?_id=${this.dealDetailsObj.unit.project_id}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response) => {
            this.spinnerService.hide();
            if (response.success == true) {
                this.formDetails.cooling_period = response.result.default_cooling_period ? response.result.default_cooling_period : 0;
                // let fday = moment(this.formDetails.signed_date).add(this.formDetails.cooling_period, 'day');
                // this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
                this.formDetails.firm_date = this.dealDetailsObj.firm_date || '';
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        })
    }
    // onFirmDateChanged(event) {
    //     if (event) {
    //         this.formDetails.firm_date = moment(event).startOf('day').format('YYYY-MM-DD');
    //     }
    // }


    //ASSIGN UNIT MODAL
    openAssignUnitModal(template: TemplateRef<any>) {
        this.unitsSoldOut = false;
        this.isUnitAvailable = false;
        this.selectedProject = {};
        this.formDetails = {
        };
        this.depositInfo = [];
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    assignUnit() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.unit_no && !this.isUnitAvailable) {
            this.toastr.warning('Please enter unit', 'Warning');
            return;
        }

        if (!this.formDetails.deposit_structure) {
            this.toastr.warning('Please select deposit structure', 'Warning');
            return;
        }
        let selectedProject = this.projectList.find((element) => element._id == this.formDetails.project_id);
        let selectedDeposit = this.depositList.find((element) => element._id == this.formDetails.deposit_structure);
        let data: any = {
            deal_type: this.formDetails.deal_type,
            deal_id: this.dealDetailsObj._id,
            unit_id: this.formDetails.unit_id,
            deposit_structure_id: this.formDetails.deposit_structure,
            deposit_structure_def: selectedDeposit ? selectedDeposit.deposits : []
        }

        // console.log('payload', data);
        let url = `sales/deals-assign-unit`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe(async (response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                    if (this.dealDetailsObj.initiated_on) {
                        this.spinnerService.show();
                        let url = `sales/deals?_id=${this.dealsId}`;
                        let dealDetailsRes: any = await this.webService.get(url).toPromise();
                        if (dealDetailsRes && dealDetailsRes.result) {
                            this.dealDetailsObj = dealDetailsRes.result;
                            this.addDepositDeal();
                        }
                        else {
                            this.spinnerService.hide();
                            this.toastr.error('Failed to get deal details', 'Error');
                        }
                    }
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getUnitList() {
        this.isSearching = true;
        this.spinnerService.show();
        let url = `sales/units?project_id=${this.formDetails.project_id}&page=1&pageSize=1000`;
        this.webService.get(url).subscribe((response) => {
            if (response.success == true) {
                this.unitList = response.results;
                // console.log('filteredUnits', filteredUnits);
                if (this.unitList.length > 0) {
                    // let filteredUnits = this.unitList.filter((unit) => (unit.status == 'AVAILABLE' || !unit.status || unit.status == ''));
                    let filteredUnits = this.unitList.filter((unit) => (unit.status == 'AVAILABLE'));
                    this.unitsSoldOut = filteredUnits.length == 0 ? true : false;
                    this.isUnitAvailable = filteredUnits.length == 0 ? false : true;
                }
                else {
                    this.unitsSoldOut = false;
                    this.isUnitAvailable = false;
                }
                this.spinnerService.hide();
                this.isSearching = false;
            } else {
                this.toastr.error('Error!', response.errors[0]);
            }
        }, (error) => {
            this.isSearching = false;
            this.spinnerService.hide();
            console.log("error ts: ", error);
        })
    }

    unitInputChanged(value) {
        this.modelChanged.next(value);
        this.formDetails.deposit_structure = '';
        this.depositInfo = [];
    }

    onUnitChange(value) {
        if (value) {
            this.formDetails.max_bicycle = null;
            this.formDetails.max_lockers = null;
            this.formDetails.max_parking = null;
            this.formDetails.is_locker = false;
            this.formDetails.locker = '';
            this.formDetails.is_parking = false;
            this.formDetails.parking = '';
            this.formDetails.unit_id = '';
            this.isSalesPriceAvailable = true;
            let url = `sales/units?project_id=${this.formDetails.project_id}&searchText=${value}`;
            this.spinnerService.show();
            this.webService.get(url).subscribe((response) => {
                this.spinnerService.hide();
                if (response.success == true) {
                    let record = response.results.find((element) => element.unit_no == value);
                    let element: HTMLElement = document.getElementById('unit_no');
                    if (record != null && (record.status == 'AVAILABLE')) {
                        this.isUnitAvailable = true;
                        element.style.borderColor = 'green';
                        if (record.sales_price) {
                            this.formDetails.unit_id = record._id;
                            if (record.max_bicycle) {
                                this.formDetails.max_bicycle = record.max_bicycle;
                            }
                            if (record.max_lockers) {
                                this.formDetails.max_lockers = record.max_lockers;
                            }
                            if (record.max_parking) {
                                this.formDetails.max_parking = record.max_parking;
                            }
                        }
                        else {
                            this.isSalesPriceAvailable = false;
                        }
                    }
                    else {
                        element.style.borderColor = 'red';
                        this.isUnitAvailable = false;
                        // this.toastr.error('Error!', 'This unit is not available');
                    }
                } else {
                    this.toastr.error('Error!', response.messages[0]);
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log("error ts: ", error);
            });
        }
    }

    onChangeDepositeStructure() {
        let selectedDeposit = this.depositList.filter((item) => item._id == this.formDetails.deposit_structure);
        this.depositInfo = [];
        if (!this.formDetails.unit_no) {
            this.toastr.warning('Select the unit/Suite', 'Warning')
            return;
        }
        let selectedUnit = this.unitList.find((element) => element.unit_no == this.formDetails.unit_no);
        if (this.formDetails.unit_no && !selectedUnit.sales_price) {
            this.toastr.warning('sales price is not available for the selected unit', 'Warning')
            return;
        }
        this.depositInfo = this.formatAssignDepositValues(selectedUnit, selectedDeposit[0]);
        this.formDetails.start = selectedDeposit[0].start;
        this.formDetails.end = selectedDeposit[0].end;
        this.formDetails.total_amount = 0;
        this.formDetails.total_payment_amount = 0;
        if (this.depositInfo.length != 0) {
            this.depositInfo.forEach(deposit => {
                if (deposit.amount) {
                    this.formDetails.total_amount = this.formDetails.total_amount + deposit.amount;
                }
                if (deposit.payment_amount) {
                    this.formDetails.total_payment_amount = this.formDetails.total_payment_amount + deposit.payment_amount;
                }
            })
            // console.log('this.dealDetailsObj', this.dealDetailsObj);
            this.cdk.detectChanges();
        }
    }

    formatAssignDepositValues(selectedUnit, deposit_structure_def) {
        let deposits: any[] = [];
        if (deposit_structure_def.deposits) {
            deposit_structure_def.deposits.forEach((deposit, index) => {
                let object = {}
                object['deposit_no'] = index + 1;
                if (deposit.type == 'PERCENT-CP') {
                    object['percent'] = parseFloat(deposit.value);
                    if (selectedUnit.sales_price) {
                        object['amount'] = Math.round(((deposit.value / 100) * selectedUnit.sales_price) * 100) / 100;
                    }
                    else {
                        object['amount'] = "";
                        this.toastr.warning('Sales price is not available for unit', 'Warning')
                    }
                }
                else if (deposit.type == 'FIXED') {
                    object['amount'] = parseFloat(deposit.value);
                    object['percent'] = '';
                }
                if (deposit.date_type == 'FROM-INITIATED' || deposit.date_type == 'FROM-EXECUTED') {
                    // deposit. = deposit.days;
                    if (deposit.days) { //adding signed date in deposit days
                        let initiatedDate = moment(this.dealDetailsObj.initiated_on).format('YYYY-MM-DD');
                        let due_date = moment(initiatedDate).add(deposit.days, 'day');
                        object['due_date'] = moment(due_date).startOf('day').format('YYYY-MM-DD');
                    }
                    else {
                        object['due_date'] = '';
                    }
                }
                else if (deposit.date_type == 'FIXED') {
                    object['due_date'] = moment(deposit.date).format('YYYY-MM-DD');;
                }

                //Deducting signup value from second deposit if condition is checked
                if (index == 1 && deposit_structure_def.deduct_signup) {
                    object['amount'] = (object['amount'] && deposits[index - 1]['amount']) ? object['amount'] - deposits[index - 1]['amount'] : '';
                }
                deposits.push(object);
            });
        }
        else {
            this.toastr.warning('Selected deposit not found', 'Warning')
        }
        return deposits;
    }

    openCheckInventoryModal() {
        this.checkInventoryModalRef = this.ngModalService.open(InventoryModalComponent,
            {
                size: 'modal-xl', backdrop: 'static'
            })
        this.checkInventoryModalRef.componentInstance.data = {
            isEdit: false,
            units: this.unitList,
            project_id: this.formDetails.project_id
        }
        this.checkInventoryModalRef.result.then(async (result) => {
            this.formDetails.unit_no = '';
            this.formDetails.deposit_structure = '';
            this.depositInfo = [];
            if (result) {
                let element: HTMLElement = document.getElementById('unit_no');
                element.style.borderColor = 'green';
                this.isUnitAvailable = true;
                this.isSalesPriceAvailable = true;
                this.formDetails.unit_no = result.unit_no;
                this.formDetails.unit_id = result.unit_id;
                this.formDetails.max_bicycle = result.max_bicycle ? result.max_bicycle : null;
                this.formDetails.max_lockers = result.max_lockers ? result.max_lockers : null;
                this.formDetails.max_parking = result.max_parking ? result.max_parking : null;
                this.formDetails.is_locker = false;
                this.formDetails.locker = '';
                this.formDetails.is_parking = false;
                this.formDetails.parking = '';
            }
        }, (reason) => {
            console.log('inventory modal closed');
        })
    }

    addDepositDeal() {
        let data: any = {};
        data.deposits = this.formatDepositValues(this.dealDetailsObj.deposit_structure_def);
        data.operation = 'add';
        data.deal_id = this.dealsId;
        data.project_id = this.dealDetailsObj.unit.project_id;
        data.project_name = this.dealDetailsObj.unit.project_name;
        data.unit_id = this.dealDetailsObj.unit._id;
        data.unit_no = this.dealDetailsObj.unit.unit_no;
        // console.log('data=>', data);
        let url = 'sales/deals-deposits';
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    let tab = localStorage.getItem('salesDealActiveTab');
                    if (tab == 'deposits') {
                        if (this.dealDetailsObj.stage != 'NEW' && this.dealDetailsObj.stage != 'UNIT RELEASED') {
                            this.getDepositDeal();
                        }
                    }
                    // this.getDealDetails();
                    //commenting because after add user needs to click over deposits to see the depoit. tehn API will call for depoit
                    // this.getDepositDeal(); 
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //ADD PURCHASER
    openAddPurchaser(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.contactList = [];
        this.formDetails = {
            purchaser_name: '',
            project_id: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    addPurchaser() {
        if (!this.formDetails.purchaser_name || !this.formDetails.purchaser_name._id) {
            this.toastr.warning('Please select purchaser', 'Warning');
            return;
        }
        if (this.dealDetailsObj && this.dealDetailsObj.purchasers && this.dealDetailsObj.purchasers.length > 0) {
            let purchaser = this.dealDetailsObj.purchasers.find(element => element._id == this.formDetails.purchaser_name._id)
            if (purchaser) {
                this.toastr.warning(`The ${this.formDetails.purchaser_name.display_name} purchaser is already added`, 'Warning');
                return;
            }
        };
        let data: any = {};
        data['purchasers'] = [];
        let newPurchaser = {
            addresses: this.formDetails.purchaser_name.addresses,
            contact_type: this.formDetails.purchaser_name.contact_type,
            emails: this.formDetails.purchaser_name.emails,
            geography: this.formDetails.purchaser_name.geography,
            phones: this.formDetails.purchaser_name.phones,
            display_name: this.formDetails.purchaser_name.display_name,
            first_name: this.formDetails.purchaser_name.first_name,
            last_name: this.formDetails.purchaser_name.last_name,
            middle_name: this.formDetails.purchaser_name.middle_name,
            // territory: this.formDetails.purchaser_name.territory,
            _id: this.formDetails.purchaser_name._id
        };
        if (this.dealDetailsObj && this.dealDetailsObj.purchasers && this.dealDetailsObj.purchasers.length > 0) {
            data.purchasers = this.dealDetailsObj.purchasers;
        }
        data.purchasers.push(newPurchaser);
        // data['stage'] = 'NEW';
        this.updateDealAPI(data);
    }

    openNewContact() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            project_id: this.dealDetailsObj
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                this.contactList = [];
                this.contactList.push(result);
                this.filterContactList();
                this.formDetails.purchaser_name = this.contactList[0];
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    searchAuto(event, type) {
        this.autosearchText = event.query;
        this.getContactList(type);
    }

    getContactList(type) {
        let url = `sales/contacts?page=1&pageSize=100&sortBy=display_name&sortOrder=ASC&searchText=${this.autosearchText}`;
        if (type && (type != 'Solicitor' && type != 'Third Party')) {
            url = url + `&contact_type=${type}`
        }
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    this.contactList = response.results;
                    this.filterContactList();
                }
                else {
                    this.contactList = [];
                }
            } else {
                this.contactList = [];
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    filterContactList() {
        this.contactList.forEach(item => {
            if (item.phones && item.phones.length > 0) {
                let keepGoing = true;
                item.phones.forEach(phone => {
                    if (keepGoing) {
                        if (!phone.is_inactive) {
                            item.phone = {
                                number: phone.number,
                                type: phone.type
                            };
                            keepGoing = false;
                        }
                    }
                });
            } else {
                item.phone = {
                    number: '',
                    type: ''
                }
            }
            if (item.emails && item.emails.length > 0) {
                let keepGoing = true;
                item.emails.forEach(email => {
                    if (keepGoing) {
                        if (!email.is_inactive) {
                            item.email = {
                                email: email.email,
                                type: email.type
                            };
                            keepGoing = false;
                        }
                    }
                });
            } else {
                item.email = {
                    email: '',
                    type: ''
                }
            }
            if (item.addresses && item.addresses.length > 0) {
                let keepGoing = true;
                item.addresses.forEach(address => {
                    if (keepGoing) {
                        if (!address.is_inactive) {
                            item.addresses = address;
                            keepGoing = false;
                        }
                    }
                });
            } else {
                item.addresses = {};
            }
            item.show_name = `${item._id}, ${item.display_name ? item.display_name : ''},  ${item.email.email ? item.email.email : ''}, ${item.phone.number ? item.phone.number : ''}`;
        });
    }

    //PURCHASER IMAGES UPLOAD
    uploadImage1(files, item) {
        if (files.length > 0) {
            if (item._id) {
                let validation = this.validateImage(files.item(0).name);
                if (validation) {
                    let document = files.item(0);
                    var formData = new FormData();
                    formData.append('file', document);
                    formData.append('document_type', 'document1');
                    formData.append('contact_id', item._id);
                    formData.append('deal_id', this.dealsId);
                    this.spinnerService.show();
                    let url = `sales/documents`;
                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.dealDetailsObj.purchasers.forEach(element => {
                                element.layouts = [];
                                this.getImgesByPurchaser(element);
                            });
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                } else {
                    this.toastr.error("Please upload only JPG, JPEG, PNG format", "Error");
                }
            }
            else {
                this.toastr.error("Purchaser is not having id .Create new record", "Error");
            }
        }
    }
    validateImage(fileName) {
        var allowed_extensions = new Array("pdf", "jpg", "jpeg", "png");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }
    uploadImage2(files, item) {
        if (files.length > 0) {
            if (item._id) {
                let validation = this.validateImage(files.item(0).name);
                if (validation) {
                    let document = files.item(0);
                    var formData = new FormData();
                    formData.append('file', document);
                    formData.append('document_type', 'document2');
                    formData.append('contact_id', item._id);
                    formData.append('deal_id', this.dealsId);
                    this.spinnerService.show();
                    let url = `sales/documents`;
                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.dealDetailsObj.purchasers.forEach(element => {
                                element.layouts = [];
                                this.getImgesByPurchaser(element);
                            });
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                } else {
                    this.toastr.error("Please upload only JPG, JPEG, PNG format", "Error");
                }
            }
            else {
                this.toastr.error("Purchaser is not having id .Create new record", "Error");
            }
        }
    }
    getImgesByPurchaser(purchaser) {
        this.spinnerService.show();
        let url = `sales/documents?contact_id=${purchaser._id}`
        if (purchaser.person_id) {
            url = url + `&person_id=${purchaser.person_id}`
        };
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                response.results.forEach(async (element) => {
                    let obj: any = {};
                    if (element.document_type == 'document1') {
                        obj.url = `${this.baseUrl}${element.document.url}`;
                        obj.document_id = element._id;
                        obj.image_id = element.document._id;
                        obj.document_type = element.document_type;
                        purchaser.layouts[0] = obj;
                    }
                    if (element.document_type == 'document2') {
                        obj.url = `${this.baseUrl}${element.document.url}`;
                        obj.document_id = element._id;
                        obj.image_id = element.document._id;
                        obj.document_type = element.document_type;
                        purchaser.layouts[1] = obj;
                    }
                });
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    deleteImage(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this id ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/documents?_id=${item.document_id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.dealDetailsObj.purchasers.forEach(element => {
                                    element.layouts = [];
                                    this.getImgesByPurchaser(element);
                                });
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
            })
            .catch((error) => { });
    }


    //MANAGE SOLICITOR
    openAddSolicitor(template: TemplateRef<any>) {
        if (this.dealDetailsObj.solicitor && this.dealDetailsObj.solicitor.length > 0) {
        }
        this.autosearchText = '';
        this.contactList = [];
        this.formDetails = {
            purchaser_name: '',
            project_id: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    openNewSolicitor() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            conatctType: 'Solicitor',
            project_id: this.dealDetailsObj
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                this.contactList = [];
                this.contactList.push(result);
                this.filterContactList();
                this.formDetails.solicitor_name = this.contactList[0];
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    addSolicitor() {
        if (!this.formDetails.solicitor_name || !this.formDetails.solicitor_name._id) {
            this.toastr.warning('Please select solicitor', 'Warning');
            return;
        }
        let data: any = {};
        data['solicitor'] = {};
        let newSolicitor = {
            addresses: this.formDetails.solicitor_name.addresses,
            contact_type: this.formDetails.solicitor_name.contact_type,
            emails: this.formDetails.solicitor_name.emails,
            geography: this.formDetails.solicitor_name.geography,
            phones: this.formDetails.solicitor_name.phones,
            display_name: this.formDetails.solicitor_name.display_name,
            first_name: this.formDetails.solicitor_name.first_name,
            last_name: this.formDetails.solicitor_name.last_name,
            middle_name: this.formDetails.solicitor_name.middle_name,
            // territory: this.formDetails.solicitor_name.territory,
            _id: this.formDetails.solicitor_name._id
        };
        data.solicitor = newSolicitor;
        // console.log('data', data);
        this.updateDealAPI(data);
    }

    openEditSolicitorModal(template: TemplateRef<any>, solicitor) {
        this.formDetails = { ...solicitor };
        // this.formDetails.solicitorNo = index + 1;
        this.mobilePhone = new FormGroup({
            mobile_phone: new FormControl('', [Validators.required])
        });
        this.workPhone = new FormGroup({
            work_phone: new FormControl('', [Validators.required])
        });
        this.supportPhone = new FormGroup({
            support_phone: new FormControl('', [Validators.required])
        });
        this.homePhone = new FormGroup({
            home_phone: new FormControl('', [Validators.required])
        });
        solicitor.phones.forEach(phone => {
            if (phone.type == "Support") {
                this.supportPhone.patchValue({
                    support_phone: phone.number
                })
            }
            if (phone.type == "Home") {
                this.homePhone.patchValue({
                    home_phone: phone.number
                })
            }
            else if (phone.type == "Mobile") {
                this.mobilePhone.patchValue({
                    mobile_phone: phone.number
                })
            }
            else if (phone.type == "Work") {
                this.workPhone.patchValue({
                    work_phone: phone.number
                })
            }
        })
        solicitor.emails.forEach(email => {
            if (email.type == "Personal") {
                this.formDetails.personal_email = email.email
            }
            else if (email.type == "Work") {
                this.formDetails.work_email = email.email
            }
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateSolicitor() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.formDetails.first_name || !this.formDetails.first_name.trim()) {
            this.toastr.warning('Please enter first name', 'Warning');
            return;
        }
        if (!this.formDetails.last_name || !this.formDetails.last_name.trim()) {
            this.toastr.warning('Please enter last name', 'Warning');
            return;
        }
        if (this.supportPhone.value.support_phone) {
            if (this.supportPhone.controls['support_phone'].invalid) {
                this.toastr.warning('Please enter valid support phone number', 'Warning');
                return;
            }
        }
        if (this.mobilePhone.value.mobile_phone) {
            if (this.mobilePhone.controls['mobile_phone'].invalid) {
                this.toastr.warning('Please enter valid mobile phone number', 'Warning');
                return;
            }
        }
        if (this.workPhone.value.work_phone) {
            if (this.workPhone.controls['work_phone'].invalid) {
                this.toastr.warning('Please enter valid work phone number', 'Warning');
                return;
            }
        }
        if (this.formDetails.personal_email && reg.test(this.formDetails.personal_email) == false) {
            this.toastr.warning('Please enter valid personal email', 'Warning');
            return;
        }
        if (this.formDetails.work_email) {
            if (reg.test(this.formDetails.work_email) == false) {
                this.toastr.warning('Please enter valid work email', 'Warning');
                return;
            } else if (this.formDetails.personal_email.trim() == this.formDetails.work_email.trim()) {
                this.toastr.warning('Work email and personal email can\'t be same', 'Warning');
                return;
            }
        }
        let data: any = {};
        data.first_name = this.formDetails.first_name ? this.formDetails.first_name : '';
        data._id = this.formDetails._id ? this.formDetails._id : '';
        data.middle_name = this.formDetails.middle_name ? this.formDetails.middle_name : '';
        data.last_name = this.formDetails.last_name ? this.formDetails.last_name : '';
        data.display_name = this.formDetails.display_name ? this.formDetails.display_name : '';

        data.prefix = this.formDetails.prefix ? this.formDetails.prefix.trim() : '';
        data.suffix = this.formDetails.suffix ? this.formDetails.suffix.trim() : '';
        data.salutation = this.formDetails.salutation ? this.formDetails.salutation.trim() : '';
        data.family_salutation = this.formDetails.family_salutation ? this.formDetails.family_salutation.trim() : '';
        // data.dob = this.formDetails.dob ? moment(this.formDetails.dob).format('YYYY-MM-DD') : '';
        data.fax = this.formDetails.fax ? this.formDetails.fax : '';
        data.addresses = {
            street1: this.formDetails.addresses.street1 ? this.formDetails.addresses.street1.trim() : '',
            street2: this.formDetails.addresses.street2 ? this.formDetails.addresses.street2.trim() : '',
            street3: this.formDetails.addresses.street3 ? this.formDetails.addresses.street3.trim() : '',
            city: this.formDetails.addresses.city ? this.formDetails.addresses.city.trim() : '',
            state: this.formDetails.addresses.state,
            zip: this.formDetails.addresses.zip ? this.formDetails.addresses.zip.trim() : '',
            country: this.formDetails.addresses.country
        }
        data.emails = [];
        if (this.formDetails.personal_email && this.formDetails.personal_email.trim()) {
            let obj = {
                type: "Personal",
                email: this.formDetails.personal_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        if (this.formDetails.work_email && this.formDetails.work_email.trim()) {
            let obj = {
                type: "Work",
                email: this.formDetails.work_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        data.phones = [];
        if (this.homePhone.value && this.homePhone.value.home_phone && this.homePhone.value.home_phone.e164Number) {
            let objHome = {
                type: "Home",
                number: this.homePhone.value.home_phone.e164Number,
                formatted: this.homePhone.value.home_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objHome);
        }
        if (this.supportPhone.value && this.supportPhone.value.support_phone && this.supportPhone.value.support_phone.e164Number) {
            let objSupport = {
                type: "Support",
                number: this.supportPhone.value.support_phone.e164Number,
                formatted: this.supportPhone.value.support_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objSupport);
        }
        if (this.mobilePhone.value && this.mobilePhone.value.mobile_phone && this.mobilePhone.value.mobile_phone.e164Number) {
            let objMobile = {
                type: "Mobile",
                number: this.mobilePhone.value.mobile_phone.e164Number,
                formatted: this.mobilePhone.value.mobile_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objMobile);
        }
        if (this.workPhone.value && this.workPhone.value.work_phone && this.workPhone.value.work_phone.e164Number) {
            let objWork = {
                type: "Work",
                number: this.workPhone.value.work_phone.e164Number,
                formatted: this.workPhone.value.work_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objWork);
        }
        let finalData: any = {};
        finalData['solicitor'] = data;
        // console.log('finalData', finalData);
        this.updateDealAPI(finalData);
    }

    removeSolicitor() {
        this.confirmationDialogService.confirm('Delete', `Do you want to remove this solicitor ?`)
            .then((confirmed) => {
                let data: any = {};
                data['solicitor'] = {};
                this.updateDealAPI(data);
            })
            .catch(() => { })
    }

    //ADD THIRD PARTY 
    openAddThirdParty(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.contactList = [];
        this.formDetails = {
            purchaser_name: '',
            project_id: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    openNewThirdParty() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            conatctType: 'Third Party',
            project_id: this.dealDetailsObj
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                this.contactList = [];
                this.contactList.push(result);
                this.filterContactList();
                this.formDetails.third_party = this.contactList[0];
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    addThirdParty() {
        if (!this.formDetails.third_party || !this.formDetails.third_party._id) {
            this.toastr.warning('Please select third party', 'Warning');
            return;
        }
        let data: any = {};
        data['third_party'] = {};
        let newThirdParty = {
            addresses: this.formDetails.third_party.addresses,
            contact_type: this.formDetails.third_party.contact_type,
            emails: this.formDetails.third_party.emails,
            geography: this.formDetails.third_party.geography,
            phones: this.formDetails.third_party.phones,
            display_name: this.formDetails.third_party.display_name,
            first_name: this.formDetails.third_party.first_name,
            last_name: this.formDetails.third_party.last_name,
            middle_name: this.formDetails.third_party.middle_name,
            // territory: this.formDetails.third_party.territory,
            _id: this.formDetails.third_party._id
        };
        data.third_party = newThirdParty;
        console.log('data', data);
        this.updateDealAPI(data);
    }

    openEditThirdPartyModal(template: TemplateRef<any>) {
        this.formDetails = this.dealDetailsObj.third_party ? Object.assign({}, this.dealDetailsObj.third_party) : {};
        this.mobilePhone = new FormGroup({
            mobile_phone: new FormControl('', [Validators.required])
        });
        this.workPhone = new FormGroup({
            work_phone: new FormControl('', [Validators.required])
        });
        this.supportPhone = new FormGroup({
            support_phone: new FormControl('', [Validators.required])
        });
        this.homePhone = new FormGroup({
            home_phone: new FormControl('', [Validators.required])
        });
        if (this.dealDetailsObj.third_party && this.dealDetailsObj.third_party.phones) {
            this.dealDetailsObj.third_party.phones.forEach(phone => {
                if (phone.type == "Support") {
                    this.supportPhone.patchValue({
                        support_phone: phone.number
                    })
                }
                if (phone.type == "Home") {
                    this.homePhone.patchValue({
                        home_phone: phone.number
                    })
                }
                else if (phone.type == "Mobile") {
                    this.mobilePhone.patchValue({
                        mobile_phone: phone.number
                    })
                }
                else if (phone.type == "Work") {
                    this.workPhone.patchValue({
                        work_phone: phone.number
                    })
                }
            })
        }
        if (this.dealDetailsObj.third_party && this.dealDetailsObj.third_party.emails) {
            this.dealDetailsObj.third_party.emails.forEach(email => {
                if (email.type == "Personal") {
                    this.formDetails.personal_email = email.email
                }
                else if (email.type == "Work") {
                    this.formDetails.work_email = email.email
                }
            });
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateThirdParty() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.formDetails.first_name || !this.formDetails.first_name.trim()) {
            this.toastr.warning('Please enter first name', 'Warning');
            return;
        }
        if (!this.formDetails.last_name || !this.formDetails.last_name.trim()) {
            this.toastr.warning('Please enter last name', 'Warning');
            return;
        }
        if (this.supportPhone.value.support_phone) {
            if (this.supportPhone.controls['support_phone'].invalid) {
                this.toastr.warning('Please enter valid support phone number', 'Warning');
                return;
            }
        }
        if (this.mobilePhone.value.mobile_phone) {
            if (this.mobilePhone.controls['mobile_phone'].invalid) {
                this.toastr.warning('Please enter valid mobile phone number', 'Warning');
                return;
            }
        }
        if (this.workPhone.value.work_phone) {
            if (this.workPhone.controls['work_phone'].invalid) {
                this.toastr.warning('Please enter valid work phone number', 'Warning');
                return;
            }
        }
        if (this.formDetails.personal_email && reg.test(this.formDetails.personal_email) == false) {
            this.toastr.warning('Please enter valid personal email', 'Warning');
            return;
        }
        if (this.formDetails.work_email) {
            if (reg.test(this.formDetails.work_email) == false) {
                this.toastr.warning('Please enter valid work email', 'Warning');
                return;
            } else if (this.formDetails.personal_email.trim() == this.formDetails.work_email.trim()) {
                this.toastr.warning('Work email and personal email can\'t be same', 'Warning');
                return;
            }
        }
        let data: any = {};
        data.first_name = this.formDetails.first_name ? this.formDetails.first_name : '';
        data.middle_name = this.formDetails.middle_name ? this.formDetails.middle_name : '';
        data.last_name = this.formDetails.last_name ? this.formDetails.last_name : '';
        data.display_name = this.formDetails.display_name ? this.formDetails.display_name : '';
        // data.dob = this.formDetails.dob ? moment(this.formDetails.dob).format('YYYY-MM-DD') : '';
        data.fax = this.formDetails.fax ? this.formDetails.fax : '';
        data.poa = this.formDetails.poa ? this.formDetails.poa : '';
        data.addresses = {
            street1: this.formDetails.addresses.street1 ? this.formDetails.addresses.street1.trim() : '',
            street2: this.formDetails.addresses.street2 ? this.formDetails.addresses.street2.trim() : '',
            street3: this.formDetails.addresses.street3 ? this.formDetails.addresses.street3.trim() : '',
            city: this.formDetails.addresses.city ? this.formDetails.addresses.city.trim() : '',
            state: this.formDetails.addresses.state,
            zip: this.formDetails.addresses.zip ? this.formDetails.addresses.zip.trim() : '',
            country: this.formDetails.addresses.country
        }
        data.emails = [];
        if (this.formDetails.personal_email && this.formDetails.personal_email.trim()) {
            let obj = {
                type: "Personal",
                email: this.formDetails.personal_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        if (this.formDetails.work_email && this.formDetails.work_email.trim()) {
            let obj = {
                type: "Work",
                email: this.formDetails.work_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        data.phones = [];
        if (this.homePhone.value && this.homePhone.value.home_phone && this.homePhone.value.home_phone.e164Number) {
            let objHome = {
                type: "Home",
                number: this.homePhone.value.home_phone.e164Number,
                formatted: this.homePhone.value.home_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objHome);
        }
        if (this.supportPhone.value && this.supportPhone.value.support_phone && this.supportPhone.value.support_phone.e164Number) {
            let objSupport = {
                type: "Support",
                number: this.supportPhone.value.support_phone.e164Number,
                formatted: this.supportPhone.value.support_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objSupport);
        }
        if (this.mobilePhone.value && this.mobilePhone.value.mobile_phone && this.mobilePhone.value.mobile_phone.e164Number) {
            let objMobile = {
                type: "Mobile",
                number: this.mobilePhone.value.mobile_phone.e164Number,
                formatted: this.mobilePhone.value.mobile_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objMobile);
        }
        if (this.workPhone.value && this.workPhone.value.work_phone && this.workPhone.value.work_phone.e164Number) {
            let objWork = {
                type: "Work",
                number: this.workPhone.value.work_phone.e164Number,
                formatted: this.workPhone.value.work_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objWork);
        }
        let finalData: any = {};
        finalData['third_party'] = data;
        // console.log('finalData', finalData);
        this.updateDealAPI(finalData);
        // const object: any = {};
        // object.first_name = this.formDetails.first_name ? this.formDetails.first_name : '';
        // object.last_name = this.formDetails.last_name ? this.formDetails.last_name : '';
        // object.legal_name = this.formDetails.legal_name ? this.formDetails.legal_name : '';
        // object.dob = this.formDetails.dob ? moment(this.formDetails.dob).format('YYYY-MM-DD') : '';
        // object.address = this.formDetails.address ? this.formDetails.address : '';
        // object.zip = this.formDetails.zip ? this.formDetails.zip : '';
        // object.country = this.formDetails.country ? this.formDetails.country : '';
        // object.state = this.formDetails.state ? this.formDetails.state : '';
        // object.city = this.formDetails.city ? this.formDetails.city : '';
        // object.poa = this.formDetails.poa ? this.formDetails.poa : '';
        // const data: any = {};
        // data['third_party'] = object;
        // this.updateDealAPI(data);
    }

    //ASSIGN BROKER MODAL
    openAssignBrokerModal(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.contactList = [];
        this.formDetails = {
            broker_name: '',
        };
        if (this.dealDetailsObj.brokers && this.dealDetailsObj.brokers.length > 0) {
            this.confirmationDialogService.confirm('Confirm', `Already a broker assigned, do you want to assign an additional broker?`)
                .then((confirmed) => {
                    if (confirmed) {
                        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
                    }
                }).catch(() => console.log('User dismissed the dialog '));
        }
        else {
            this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
        }
    }

    openNewBroker() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            conatctType: 'Broker',
            project_id: this.dealDetailsObj
        }
        this.
            openContactModalRef.result.then(async (result) => {
                if (result) {
                    this.contactList.push(result);
                    this.filterContactList();
                    let oldBrokers = [...this.formDetails.broker_name];
                    this.contactList.forEach(new_broker => {
                        if (new_broker._id == result._id) {
                            if (this.formDetails.broker_name.length == 0) {
                                this.formDetails.broker_name = [];
                                this.formDetails.broker_name.push(new_broker);
                            }
                            else {
                                this.formDetails.broker_name = [...oldBrokers];
                                this.formDetails.broker_name.push(new_broker);
                            }
                        }
                    });
                    if (this.autoCompleteObject) {
                        this.autoCompleteObject.focusInput();
                    }
                }
            }, (reason) => {
                console.log('reason', reason);
            })
    }

    deleteBroker(broker, j) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete broker ${broker.broker_id} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    data['brokers'] = [];
                    if (this.dealDetailsObj && this.dealDetailsObj.brokers && this.dealDetailsObj.brokers.length > 0) {
                        data.brokers = [...this.dealDetailsObj.brokers];
                    }
                    data.brokers.splice(j, 1);
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getDealDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    addBroker() {
        if (!this.formDetails.broker_name || this.formDetails.broker_name.length == 0) {
            this.toastr.warning('Please select broker', 'Warning');
            return;
        }
        let selectedBrokers = this.formDetails.broker_name.map((ele) => ele._id);
        if (this.dealDetailsObj && this.dealDetailsObj.brokers && this.dealDetailsObj.brokers.length > 0) {
            let broker = this.dealDetailsObj.brokers.find(element => (selectedBrokers.indexOf(element.broker_id) != -1))
            if (broker) {
                this.toastr.warning(`The ${broker.broker_name} broker is already added`, 'Warning');
                return;
            }
        }
        let data: any = {};
        data['brokers'] = [];
        this.formDetails.broker_name.forEach(element => {
            let newBroker: any = {
                email: element.email.email ? element.email.email : '',
                phone: element.phone.number ? element.phone.number : '',
                broker_name: element.display_name,
                broker_id: element._id
            }
            data.brokers.push(newBroker);
        });
        if (this.dealDetailsObj && this.dealDetailsObj.brokers && this.dealDetailsObj.brokers.length > 0) {
            data.brokers = [...data.brokers, ...this.dealDetailsObj.brokers];
        }
        this.updateDealAPI(data);
    }

    //EDIT BROKER 
    openEditBrokerModal(template: TemplateRef<any>, broker) {
        this.brokerPhone = new FormGroup({
            phone: new FormControl('', [Validators.required])
        });
        if (this.dealDetailsObj.brokers) {
            this.dealDetailsObj.brokers.forEach(element => {
                if (element.broker_id == broker.broker_id) {
                    this.brokerPhone.patchValue({
                        phone: element.phone ? element.phone : ''
                    })
                }
            });
        }
        this.formDetails = { ...broker };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updateBrokerDetail() {
        if (!this.formDetails.broker_name) {
            this.toastr.warning('Please enter valid broker name', 'Warning');
            return;
        }
        // if (!this.formDetails.email) {
        //         this.toastr.warning('Please enter valid phone number', 'Warning');
        //         return;
        // }
        if (this.brokerPhone.value.phone) {
            if (this.brokerPhone.controls['phone'].invalid) {
                this.toastr.warning('Please enter valid phone number', 'Warning');
                return;
            }
        }
        let existingBrokers = this.dealDetailsObj.brokers ? this.dealDetailsObj.brokers : [];
        existingBrokers.forEach(broker => {
            if (broker.broker_id == this.formDetails.broker_id) {
                broker.broker_id = this.formDetails.broker_id;
                broker.broker_name = this.formDetails.broker_name;
                broker.email = this.formDetails.email;
                broker.phone = this.brokerPhone.value && this.brokerPhone.value.phone ? this.brokerPhone.value.phone.e164Number : ''
            }
        });
        let data: any = {
            brokers: existingBrokers
        }
        this.updateDealAPI(data);
    }


    getDepositDeal() {
        let url = `sales/deals-deposits?deal_id=${this.dealsId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.depositedList = [];
                    this.dealDetailsObj.total_amount = 0;
                    this.dealDetailsObj.total_payment_amount = 0;
                    this.dealDetailsObj.total_amount_received = 0;
                    this.depositedList = response.results;
                    if (this.depositedList.length != 0) {
                        this.depositedList.forEach(deposit => {
                            if (deposit.amount) {
                                this.dealDetailsObj.total_amount = this.dealDetailsObj.total_amount + deposit.amount;
                            }
                            if (deposit.payment_amount) {
                                this.dealDetailsObj.total_payment_amount = this.dealDetailsObj.total_payment_amount + deposit.payment_amount;
                            }
                            if (deposit.payment_received) {
                                this.dealDetailsObj.total_amount_received = this.dealDetailsObj.total_amount_received + deposit.payment_received;
                            }
                        })
                        this.cdk.detectChanges();
                        this.spinnerService.hide();
                    }
                    // console.log('this.dealDetailsObj', this.dealDetailsObj);
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //ASSIGN SALES AGENT MODAL
    openAssigSalesAgentModal(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.contactList = [];
        this.formDetails = {
            sales_agent_name: '',
        };
        if (this.dealDetailsObj.sales_agents && this.dealDetailsObj.sales_agents.length > 0) {
            this.confirmationDialogService.confirm('Confirm', `Already a sales agent assigned, do you want to assign an additional sales agents?`)
                .then((confirmed) => {
                    if (confirmed) {
                        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
                    }
                }).catch(() => console.log('User dismissed the dialog '));
        }
        else {
            this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
        }
    }

    addSalesAgent() {
        if (!this.formDetails.sales_agent_name || this.formDetails.sales_agent_name.length == 0) {
            this.toastr.warning('Please select sales agent ', 'Warning');
            return;
        }
        let selectedSalesAgent = this.formDetails.sales_agent_name.map((ele) => ele._id);
        if (this.dealDetailsObj && this.dealDetailsObj.sales_agents && this.dealDetailsObj.sales_agents.length > 0) {
            let sales_agent = this.dealDetailsObj.sales_agents.find(element => (selectedSalesAgent.indexOf(element.sales_agent_id) != -1))
            if (sales_agent) {
                this.toastr.warning(`The ${sales_agent.sales_agent_name} sales agent is already added`, 'Warning');
                return;
            }
        }
        let data: any = {};
        data['sales_agents'] = [];
        this.formDetails.sales_agent_name.forEach(element => {
            let newAgent: any = {
                email: element.email.email ? element.email.email : '',
                phone: element.phone.number ? element.phone.number : '',
                sales_agent_name: element.display_name,
                sales_agent_id: element._id
            }
            data.sales_agents.push(newAgent);
        });
        if (this.dealDetailsObj && this.dealDetailsObj.sales_agents && this.dealDetailsObj.sales_agents.length > 0) {
            data.sales_agents = [...data.sales_agents, ...this.dealDetailsObj.sales_agents];
        }
        this.updateDealAPI(data);
    }

    openNewSalesAgent() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            conatctType: 'Sales Agent',
            project_id: this.dealDetailsObj
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                this.contactList.push(result);
                this.filterContactList();
                let oldSalesAgent = [...this.formDetails.sales_agent_name];
                this.contactList.forEach(new_agent => {
                    if (new_agent._id == result._id) {
                        if (this.formDetails.sales_agent_name.length == 0) {
                            this.formDetails.sales_agent_name = [];
                            this.formDetails.sales_agent_name.push(new_agent);
                        }
                        else {
                            this.formDetails.sales_agent_name = [...oldSalesAgent];
                            this.formDetails.sales_agent_name.push(new_agent);
                        }
                    }
                });
                console.log('this.formDetails.broker_name', this.formDetails.sales_agent_name);
                if (this.autoCompleteObject) {
                    this.autoCompleteObject.focusInput();
                }
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    deleteSalesAgent(agent, j) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete sales agent ${agent.sales_agent_id} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    data['sales_agents'] = [];
                    if (this.dealDetailsObj && this.dealDetailsObj.sales_agents && this.dealDetailsObj.sales_agents.length > 0) {
                        data.sales_agents = [...this.dealDetailsObj.sales_agents];
                    }
                    data.sales_agents.splice(j, 1);
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getDealDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    openEditSalesAgentModal(template: TemplateRef<any>, agent) {
        this.brokerPhone = new FormGroup({
            phone: new FormControl('', [Validators.required])
        });
        if (this.dealDetailsObj.sales_agents) {
            this.dealDetailsObj.sales_agents.forEach(element => {
                if (element.sales_agent_id == agent.sales_agent_id) {
                    this.brokerPhone.patchValue({
                        phone: element.phone ? element.phone : ''
                    })
                }
            });
        }
        this.formDetails = { ...agent };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updateSalesAgentDetail() {
        if (!this.formDetails.sales_agent_name) {
            this.toastr.warning('Please enter valid broker name', 'Warning');
            return;
        }
        if (this.brokerPhone.value.phone) {
            if (this.brokerPhone.controls['phone'].invalid) {
                this.toastr.warning('Please enter valid phone number', 'Warning');
                return;
            }
        }
        let existingSalesAgent = this.dealDetailsObj.sales_agents ? this.dealDetailsObj.sales_agents : [];
        existingSalesAgent.forEach(broker => {
            if (broker.sales_agent_id == this.formDetails.sales_agent_id) {
                broker.sales_agent_id = this.formDetails.sales_agent_id;
                broker.sales_agent_name = this.formDetails.sales_agent_name;
                broker.email = this.formDetails.email;
                broker.phone = this.brokerPhone.value && this.brokerPhone.value.phone ? this.brokerPhone.value.phone.e164Number : ''
            }
        });
        let data: any = {
            sales_agents: existingSalesAgent
        }
        this.updateDealAPI(data);
    }

    //APPLY EXTENTION MODAL
    openApplyExtentionModal(template: TemplateRef<any>) {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to give cooling period extension ?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.formDetails = {
                        cooling_period_extended: this.dealDetailsObj.cooling_period_extended ? this.dealDetailsObj.cooling_period_extended : 1,
                        pre_firm_date: this.dealDetailsObj.firm_date ? this.dealDetailsObj.firm_date : '',
                        // firm_date: this.dealDetailsObj.firm_date ? this.dealDetailsObj.firm_date : '',
                        cooling_period: 0
                    };
                    if (this.formDetails.pre_firm_date) {
                        let fday = moment(this.formDetails.pre_firm_date).add(this.formDetails.cooling_period_extended, 'day');
                        this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
                    }
                    var url = `sales/projects?_id=${this.dealDetailsObj.unit.project_id}`;
                    this.spinnerService.show();
                    this.webService.get(url).toPromise().then((response) => {
                        this.spinnerService.hide();
                        this.formDetails.cooling_period = response.result.default_cooling_period ? response.result.default_cooling_period : 0;
                    })
                        .catch((error => {
                            this.formDetails.cooling_period = 0;
                            this.spinnerService.hide();
                        }))
                    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    extendeDaysChange(value) {
        // console.log('extendedDays',value)
        let extendedDays = value ? parseInt(value) : 0;
        if (value >= 0) {
            if (this.formDetails.pre_firm_date) {
                let fday = moment(this.formDetails.pre_firm_date).add(extendedDays, 'day');
                this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
            }
        }
    }

    addExtention() {
        if (!this.formDetails.cooling_period_extended) {
            this.toastr.warning('Please enter cooling period extended', 'Warning');
            return;
        }
        if (this.formDetails.cooling_period_extended < 1) {
            this.toastr.warning('Please enter extension days greater than or equal to 1', 'Warning');
            return;
        }
        let data: any = {};
        data.cooling_period_extended = this.formDetails.cooling_period_extended;
        data.firm_date = this.formDetails.firm_date ? moment(this.formDetails.firm_date).format('YYYY-MM-DD') : ''
        this.updateDealAPI(data);
    }


    //DATES MODAL
    openEditDatesModal(template: TemplateRef<any>) {
        this.formDetails = {
            initiated_on: this.dealDetailsObj.initiated_on ? moment(this.dealDetailsObj.initiated_on).format('YYYY-MM-DD') : '',
            out_for_sign_date: this.dealDetailsObj.out_for_sign_date ? moment(this.dealDetailsObj.out_for_sign_date).format('YYYY-MM-DD') : '',
            signed_date: this.dealDetailsObj.signed_date ? moment(this.dealDetailsObj.signed_date).format('YYYY-MM-DD') : '',
            executed_date: this.dealDetailsObj.executed_date ? moment(this.dealDetailsObj.executed_date).format('YYYY-MM-DD') : '',
            acknowledgement_date: this.dealDetailsObj.acknowledgement_date ? moment(this.dealDetailsObj.acknowledgement_date).format('YYYY-MM-DD') : '',
            firm_date: this.dealDetailsObj.firm_date ? moment(this.dealDetailsObj.firm_date).format('YYYY-MM-DD') : '',
            // cooling_period_extended: this.dealDetailsObj.cooling_period_extended || '',
            // distribution_date: this.dealDetailsObj.distribution_date ? moment(this.dealDetailsObj.distribution_date).format('YYYY-MM-DD') : '',
            // expected_completion_date: this.dealDetailsObj.expected_completion_date ? moment(this.dealDetailsObj.expected_completion_date).format('YYYY-MM-DD') : '',
            // actual_completion_date: this.dealDetailsObj.actual_completion_date ? moment(this.dealDetailsObj.actual_completion_date).format('YYYY-MM-DD') : '',
            // closing_date: this.dealDetailsObj.closing_date ? moment(this.dealDetailsObj.closing_date).format('YYYY-MM-DD') : ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateDates() {
        if (this.formDetails.cooling_period_extended < 1) {
            this.toastr.warning('Please enter extension days greater than or equal to 1', 'Warning');
            return;
        }
        let data: any = {};
        data.initiated_on = this.formDetails.initiated_on ? moment(this.formDetails.initiated_on).format('YYYY-MM-DD') : '';
        data.out_for_sign_date = this.formDetails.out_for_sign_date ? moment(this.formDetails.out_for_sign_date).format('YYYY-MM-DD') : '';
        data.signed_date = this.formDetails.signed_date ? moment(this.formDetails.signed_date).format('YYYY-MM-DD') : '';
        data.executed_date = this.formDetails.executed_date ? moment(this.formDetails.executed_date).format('YYYY-MM-DD') : '';
        data.acknowledgement_date = this.formDetails.acknowledgement_date ? moment(this.formDetails.acknowledgement_date).format('YYYY-MM-DD') : '';
        data.firm_date = this.formDetails.firm_date ? moment(this.formDetails.firm_date).format('YYYY-MM-DD') : '';
        // data.cooling_period_extended = this.formDetails.cooling_period_extended ? this.formDetails.cooling_period_extended : '';
        // data.distribution_date = this.formDetails.distribution_date ? moment(this.formDetails.distribution_date).format('YYYY-MM-DD') : '';
        // data.expected_completion_date = this.formDetails.expected_completion_date ? moment(this.formDetails.expected_completion_date).format('YYYY-MM-DD') : '';
        // data.actual_completion_date = this.formDetails.actual_completion_date ? moment(this.formDetails.actual_completion_date).format('YYYY-MM-DD') : '';
        // data.closing_date = this.formDetails.closing_date ? moment(this.formDetails.closing_date).format('YYYY-MM-DD') : ''
        this.updateDealAPI(data);
    }

    //PURCHASER DETAIL MODAL
    openEditPurchaserDetailsModal(template: TemplateRef<any>, purchaser, index) {
        this.formDetails = { ...purchaser };
        this.formDetails.purchaserNo = index + 1;
        this.mobilePhone = new FormGroup({
            mobile_phone: new FormControl('', [Validators.required])
        });
        this.workPhone = new FormGroup({
            work_phone: new FormControl('', [Validators.required])
        });
        this.homePhone = new FormGroup({
            home_phone: new FormControl('', [Validators.required])
        });
        purchaser.phones.forEach(phone => {
            if (phone.type == "Home") {
                this.homePhone.patchValue({
                    home_phone: phone.number
                })
            }
            else if (phone.type == "Mobile") {
                this.mobilePhone.patchValue({
                    mobile_phone: phone.number
                })
            }
            else if (phone.type == "Work") {
                this.workPhone.patchValue({
                    work_phone: phone.number
                })
            }
        })
        purchaser.emails.forEach(email => {
            if (email.type == "Personal") {
                this.formDetails.personal_email = email.email
            }
            else if (email.type == "Work") {
                this.formDetails.work_email = email.email
            }
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    deletePurchaser(purchaser, i) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete purchaser ${purchaser._id} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    data['purchasers'] = [];
                    if (this.dealDetailsObj && this.dealDetailsObj.purchasers && this.dealDetailsObj.purchasers.length > 0) {
                        data.purchasers = [...this.dealDetailsObj.purchasers];
                    }
                    data.purchasers.splice(i, 1);
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getDealDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    navigateToContact(id) {
        let url = `#/sales/contact/${id}`;
        window.open(url, '_blank');
    }

    updatePurchaser() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!this.formDetails.first_name.trim()) {
            this.toastr.warning('Please enter first name', 'Warning');
            return;
        }
        if (!this.formDetails.last_name.trim()) {
            this.toastr.warning('Please enter last name', 'Warning');
            return;
        }
        if (this.homePhone.value.home_phone) {
            if (this.homePhone.controls['home_phone'].invalid) {
                this.toastr.warning('Please enter valid home phone number', 'Warning');
                return;
            }
        }
        if (this.mobilePhone.value.mobile_phone) {
            if (this.mobilePhone.controls['mobile_phone'].invalid) {
                this.toastr.warning('Please enter valid mobile phone number', 'Warning');
                return;
            }
        }
        if (this.workPhone.value.work_phone) {
            if (this.workPhone.controls['work_phone'].invalid) {
                this.toastr.warning('Please enter valid work phone number', 'Warning');
                return;
            }
        }
        if (this.formDetails.personal_email && reg.test(this.formDetails.personal_email) == false) {
            this.toastr.warning('Please enter valid personal email', 'Warning');
            return;
        }
        if (this.formDetails.work_email) {
            if (reg.test(this.formDetails.work_email) == false) {
                this.toastr.warning('Please enter valid work email', 'Warning');
                return;
            } else if (this.formDetails.personal_email.trim() == this.formDetails.work_email.trim()) {
                this.toastr.warning('Work email and personal email can\'t be same', 'Warning');
                return;
            }
        }
        let data: any = {};
        data.first_name = this.formDetails.first_name ? this.formDetails.first_name : '';
        data.middle_name = this.formDetails.middle_name ? this.formDetails.middle_name : '';
        data.last_name = this.formDetails.last_name ? this.formDetails.last_name : '';
        data.legal_full_name = this.formDetails.legal_full_name ? this.formDetails.legal_full_name : '';
        data.dob = this.formDetails.dob ? moment(this.formDetails.dob).format('YYYY-MM-DD') : '';
        data.sin = this.formDetails.sin ? this.formDetails.sin : '';
        data.profession = this.formDetails.profession ? this.formDetails.profession : '';
        data.client_risk = this.formDetails.client_risk ? this.formDetails.client_risk : '';
        data.addresses = {
            street1: this.formDetails.addresses.street1 ? this.formDetails.addresses.street1.trim() : '',
            street2: this.formDetails.addresses.street2 ? this.formDetails.addresses.street2.trim() : '',
            street3: this.formDetails.addresses.street3 ? this.formDetails.addresses.street3.trim() : '',
            city: this.formDetails.addresses.city ? this.formDetails.addresses.city.trim() : '',
            state: this.formDetails.addresses.state,
            zip: this.formDetails.addresses.zip ? this.formDetails.addresses.zip.trim() : '',
            country: this.formDetails.addresses.country
        }
        data.emails = [];
        if (this.formDetails.personal_email && this.formDetails.personal_email.trim()) {
            let obj = {
                type: "Personal",
                email: this.formDetails.personal_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        if (this.formDetails.work_email && this.formDetails.work_email.trim()) {
            let obj = {
                type: "Work",
                email: this.formDetails.work_email.trim().toLowerCase(),
                html_supported: true,
                marketing: true,
                is_inactive: false
            }
            data.emails.push(obj);
        }
        data.phones = [];
        if (this.homePhone.value && this.homePhone.value.home_phone && this.homePhone.value.home_phone.e164Number) {
            let objHome = {
                type: "Home",
                number: this.homePhone.value.home_phone.e164Number,
                formatted: this.homePhone.value.home_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objHome);
        }
        if (this.mobilePhone.value && this.mobilePhone.value.mobile_phone && this.mobilePhone.value.mobile_phone.e164Number) {
            let objMobile = {
                type: "Mobile",
                number: this.mobilePhone.value.mobile_phone.e164Number,
                formatted: this.mobilePhone.value.mobile_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objMobile);
        }
        if (this.workPhone.value && this.workPhone.value.work_phone && this.workPhone.value.work_phone.e164Number) {
            let objWork = {
                type: "Work",
                number: this.workPhone.value.work_phone.e164Number,
                formatted: this.workPhone.value.work_phone.nationalNumber,
                marketing: true,
                is_inactive: false
            }
            data.phones.push(objWork);
        }
        let purchasers = [...this.dealDetailsObj.purchasers];
        if (purchasers && purchasers.length > 0) {
            purchasers.forEach(purchaser => {
                if (purchaser._id == this.formDetails._id) {
                    purchaser.addresses = { ...purchaser.addresses, ...data.addresses };
                    purchaser.client_risk = data.client_risk;
                    purchaser.dob = data.dob;
                    purchaser.emails = data.emails;
                    purchaser.first_name = data.first_name;
                    purchaser.last_name = data.last_name;
                    purchaser.legal_full_name = data.legal_full_name;
                    purchaser.middle_name = data.middle_name;
                    purchaser.phones = data.phones;
                    purchaser.profession = data.profession;
                    purchaser.sin = data.sin;
                    purchaser.client_risk = data.client_risk;
                }
            });
        }
        let finalData: any = {};
        finalData['purchasers'] = purchasers;
        this.updateDealAPI(finalData);
    }

    //DEPOSIT
    getDeposit(project_id) {
        this.spinnerService.show();
        let url = `sales/deposit-structures?project_id=${project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.depositList = response.results;
                    this.depositList.forEach((element) => {
                        if (element._id == this.dealDetailsObj.deposit_structure_id) {
                            this.formDetails.start = element.start;
                            this.formDetails.end = element.end;
                        }
                    })
                    //   this.depositList =deposit. //append if active
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openEditDepositModal(template: TemplateRef<any>, item, i) {
        this.formDetails = { ...item };
        this.formDetails.index = i;
        this.formDetails.due_date = item.due_date ? moment(item.due_date).format('YYYY-MM-DD') : '';
        this.editDepositModalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateDepositStructure() {
        if (!this.formDetails.due_date) {
            this.toastr.warning('Please select due date', 'Warning')
            return;
        }
        let data: any = {
            _id: this.formDetails._id,
            operation: 'edit',
            // nsf_fee: this.formDetails.nsf_fee ? this.formDetails.nsf_fee : '',
            // is_paid: this.formDetails.is_paid ? true : false,
            percent: this.formDetails.percent ? this.formDetails.percent : '',
            amount: this.formDetails.amount ? this.formDetails.amount : '',
            // penalty: this.formDetails.penalty ? this.formDetails.penalty : '',
            // interest: this.formDetails.interest ? this.formDetails.interest : '',
            due_date: this.formDetails.due_date ? moment(this.formDetails.due_date).format('YYYY-MM-DD') : ''
        }
        let url = `sales/deals-deposits`;
        // console.log('editDepositStructure', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.editDepositModalRef.hide();
                    this.getDepositDeal();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openSetupDepositStructure(template: TemplateRef<any>) {
        this.formDetails = {
            project_id: this.dealDetailsObj.unit.project_id,
            deposit_structure: this.dealDetailsObj.deposit_structure_id,
            deposits: []
        };
        this.getDeposit(this.dealDetailsObj.unit.project_id);
        // this.depositInfo = [];
        // this.depositedList.forEach((element) => {
        //     let obj: any = {
        //         deposit_no: element.deposit_no,
        //         amount: element.amount,
        //         percent: element.percent,
        //         due_date: moment(element.due_date).format('YYYY-MM-DD')
        //     }
        //     this.depositInfo.push(obj);
        // })
        let deposit_structure_def = (this.dealDetailsObj.deposit_structure_def && this.dealDetailsObj.deposit_structure_def.length > 0) ? this.dealDetailsObj.deposit_structure_def : [];
        this.depositInfo = this.formatDepositValues(deposit_structure_def);
        this.formDetails.total_amount = 0;
        this.formDetails.total_payment_amount = 0;
        if (this.depositInfo.length > 0) {
            this.depositInfo.forEach(deposit => {
                if (deposit.amount) {
                    this.formDetails.total_amount = this.formDetails.total_amount + deposit.amount;
                }
                if (deposit.payment_amount) {
                    this.formDetails.total_payment_amount = this.formDetails.total_payment_amount + deposit.payment_amount;
                }
            })
            // console.log('this.dealDetailsObj', this.dealDetailsObj);
            this.cdk.detectChanges();
        }
        setTimeout(() => {
            this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
        }, 1000)
    }

    onDepositStructureChange() {
        if (!this.dealDetailsObj.unit || !this.dealDetailsObj.unit.sales_price) {
            this.toastr.warning('Sales price is not available for this unit', 'Warning')
            return;
        }
        if (this.formDetails.deposit_structure) {
            let noDueDatedeposit = this.depositInfo.find(element => !element.due_date);
            if (noDueDatedeposit) {
                this.toastr.warning('Please select due date', 'Warning')
                return;
            }
            let selectedDeposit = this.depositList.find((element) => element._id == this.formDetails.deposit_structure);
            let data: any = {
                deposit_structure_id: this.formDetails.deposit_structure,
                deposit_structure_def: selectedDeposit ? selectedDeposit.deposits : [],
            }
            this.updateDealAPI(data);
            this.depositInfo.forEach(element => {
                element.due_date = moment(element.due_date).format('YYYY-MM-DD');
            });
            let deposit: any = {};
            deposit.deposits = this.depositInfo;
            deposit.operation = 'change';
            deposit.deal_id = this.dealsId;
            deposit.project_id = this.dealDetailsObj.unit.project_id;
            deposit.project_name = this.dealDetailsObj.unit.project_name;
            deposit.unit_id = this.dealDetailsObj.unit._id;
            deposit.unit_no = this.dealDetailsObj.unit.unit_no;
            // console.log('data=>', data, deposit);
            let url = 'sales/deals-deposits';
            this.spinnerService.show();
            this.webService.post(url, deposit).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                        this.getDepositDeal();
                        this.getDealPayments();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
        else {
            this.formDetails.deposits = [];
        }
    }

    onDepositChange() {
        this.depositList.forEach((element) => {
            if (element._id == this.formDetails.deposit_structure) {
                this.formDetails.start = element.start;
                this.formDetails.end = element.end;
                this.depositInfo = this.formatDepositValues(element.deposits);
                this.formDetails.total_amount = 0;
                this.formDetails.total_payment_amount = 0;
                if (this.depositInfo.length != 0) {
                    this.depositInfo.forEach(deposit => {
                        if (deposit.amount) {
                            this.formDetails.total_amount = this.formDetails.total_amount + deposit.amount;
                        }
                        if (deposit.payment_amount) {
                            this.formDetails.total_payment_amount = this.formDetails.total_payment_amount + deposit.payment_amount;
                        }
                    })
                }
            }
        })
    }

    formatDepositValues(deposit_structure_def) {
        let deposits: any[] = [];
        let selectedDepositeType = this.depositList.find((item) => item._id == this.dealDetailsObj.deposit_structure_id);
        if (selectedDepositeType) {
            deposit_structure_def.forEach((deposit, index) => {
                let object = {}
                object['deposit_no'] = index + 1;
                if (deposit.type == 'PERCENT-CP') {
                    object['percent'] = parseFloat(deposit.value);
                    if (this.dealDetailsObj.unit.sales_price) {
                        // object.percent = `${((deposit.value / 100) * this.dealDetailsObj.unit.sales_price).toFixed(2)}%`;
                        // object['amount'] = Math.round((deposit.value / 100) * this.dealDetailsObj.unit.sales_price);
                        object['amount'] = Math.round(((deposit.value / 100) * this.dealDetailsObj.unit.sales_price) * 100) / 100;

                    }
                    else {
                        object['amount'] = "";
                        this.toastr.warning('Sales price is not available for unit', 'Warning')
                    }
                }
                else if (deposit.type == 'FIXED') {
                    object['amount'] = parseFloat(deposit.value);
                    object['percent'] = '';
                }
                if (deposit.date_type == 'FROM-INITIATED' || deposit.date_type == 'FROM-EXECUTED') {
                    // deposit. = deposit.days;
                    if (deposit.days) { //adding signed date in deposit days
                        let initiatedDate = moment(this.dealDetailsObj.initiated_on).format('YYYY-MM-DD');
                        let due_date = moment(initiatedDate).add(deposit.days, 'day');
                        object['due_date'] = moment(due_date).startOf('day').format('YYYY-MM-DD');
                    }
                    else {
                        object['due_date'] = '';
                    }
                }
                else if (deposit.date_type == 'FIXED') {
                    object['due_date'] = moment(deposit.date).format('YYYY-MM-DD');;
                }

                //Deducting signup value from second deposit if condition is checked
                if (index == 1 && selectedDepositeType.deduct_signup) {
                    object['amount'] = (object['amount'] && deposits[index - 1]['amount']) ? object['amount'] - deposits[index - 1]['amount'] : '';
                }
                deposits.push(object);
            });
        }
        else {
            // this.toastr.warning('deposits not found', 'Warning')
        }
        return deposits;
    }

    //NSF MODAL
    openNSFModal(template: TemplateRef<any>, item) {
        this.formDetails = { ...item };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updateNSFPayment() {
        let data = { ...this.formDetails };
        delete data._created;
        delete data._createdBy;
        delete data._created_;
        delete data._t;
        delete data._updated;
        delete data._updatedBy;
        delete data._updated_;
        let url = `sales/deals-payments-nsf`;
        // this.updateFinance(data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                    this.updateFinance(data);
                    this.getDepositDeal();
                    this.getDealPayments();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    updateFinance(data) {
        let payload: any = {};
        let finance = this.dealDetailsObj.finance ? Object.assign({}, this.dealDetailsObj.finance) : {};
        if (finance.hasOwnProperty('nsf_fee_paid')) {
            finance.nsf_fee_paid = finance.nsf_fee_paid + (data.nsf_fee ? data.nsf_fee : 0);
        }
        else {
            finance.nsf_fee_paid = (data.nsf_fee ? data.nsf_fee : 0);
        }

        if (finance.hasOwnProperty('total_interest')) {
            finance.total_interest = finance.total_interest + (data.interest ? data.interest : 0);
        }
        else {
            finance.total_interest = (data.interest ? data.interest : 0);
        }

        if (finance.hasOwnProperty('total_penalty')) {
            finance.total_penalty = finance.total_penalty + (data.penalty ? data.penalty : 0);
        }
        else {
            finance.total_penalty = (data.penalty ? data.penalty : 0);
        }

        if (finance.hasOwnProperty('nsf_count')) {
            finance.nsf_count = finance.nsf_count + 1;
        }
        else {
            finance.nsf_count = 1;
        }
        payload.finance = finance;
        this.updateDealAPI(payload);
    }

    getDealPayments() {
        let url = `sales/deals-payments?deal_id=${this.dealsId}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.paymentList.records = response.results ? response.results : [];
                    this.paymentList.total_amount = 0;
                    this.paymentList.nsf_fee_paid = 0;
                    this.paymentList.total_interest = 0;
                    this.paymentList.total_penalty = 0;
                    this.paymentList.records.forEach(element => {
                        if (element) {
                            this.paymentList.total_amount = element.payment_amount + this.paymentList.total_amount;
                            this.paymentList.nsf_fee_paid = this.paymentList.nsf_fee_paid + (element.nsf_fee ? element.nsf_fee : 0);
                            this.paymentList.total_interest = this.paymentList.total_interest + (element.interest ? element.interest : 0);
                            this.paymentList.total_penalty = this.paymentList.total_penalty + (element.penalty ? element.penalty : 0);
                        }
                    });
                    let nsfRecords = this.paymentList.records.filter(element => element.nsf);
                    this.paymentList.nsf_count = nsfRecords.length;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //RECEIVE PAYMENT MODAL
    openReceivePaymentModal(template: TemplateRef<any>) {
        this.formDetails = {
            unit: this.dealDetailsObj.unit,
            payment_date: moment(new Date()).format('YYYY-MM-DD'),
            deposit_id: '',
            payment_type: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    receivedPayment() {
        if (!this.formDetails.deposit_id) {
            this.toastr.warning('Please select deposit', 'Warning')
            return;
        }
        if (!this.formDetails.payment_type) {
            this.toastr.warning('Please select payment type', 'Warning')
            return;
        }
        if (!this.formDetails.payment_amount) {
            this.toastr.warning('Please enter payment amount', 'Warning')
            return;
        }
        if (!this.formDetails.payment_date) {
            this.toastr.warning('Please enter payment date', 'Warning')
            return;
        }
        // if (this.formDetails.payment_type == 'CHEQUE' || this.formDetails.payment_type == 'WIRE TRANSFER') {
        //     if (!this.formDetails.financial_institution) {
        //         this.toastr.warning('Please enter financial institution', 'Warning')
        //         return;
        //     }
        //     if (!this.formDetails.account_holder_name) {
        //         this.toastr.warning('Please enter account holder name', 'Warning')
        //         return;
        //     }
        //     if (!this.formDetails.account) {
        //         this.toastr.warning('Please enter account', 'Warning')
        //         return;
        //     }
        // }
        if (this.formDetails.payment_type == 'CREDIT CARD') {

            if (this.formDetails.last_digits && this.formDetails.last_digits.length != 4) {
                this.toastr.warning('Please enter last 4 digits only', 'Warning')
                return;
            }
        }

        let selectedDeposit = this.depositedList.find((element) => element._id == this.formDetails.deposit_id);
        let data: any = {
            deposit_id: this.formDetails.deposit_id,
            deposit_no: selectedDeposit.deposit_no,
            project_id: selectedDeposit.project_id,
            project_name: selectedDeposit.project_name,
            unit_id: selectedDeposit.unit_id,
            unit_no: selectedDeposit.unit_no,
            payment_type: this.formDetails.payment_type ? this.formDetails.payment_type : '',
            payment_amount: this.formDetails.payment_amount ? this.formDetails.payment_amount : '',
            payment_date: this.formDetails.payment_date ? this.formDetails.payment_date : '',
            nsf: this.formDetails.nsf ? this.formDetails.nsf : false,
            notes: this.formDetails.notes ? this.formDetails.notes : '',
            deal_id: this.dealsId
        }
        if (this.formDetails.payment_type == 'CHEQUE' || this.formDetails.payment_type == 'WIRE TRANSFER') {
            data.financial_institution = this.formDetails.financial_institution ? this.formDetails.financial_institution : '';
            data.account_holder_name = this.formDetails.account_holder_name ? this.formDetails.account_holder_name : '';
            data.account = this.formDetails.account ? this.formDetails.account : ''
        }
        if (this.formDetails.payment_type == 'CREDIT CARD') {
            data.last_4digits = this.formDetails.last_digits ? this.formDetails.last_digits : ''
        }

        let url = `sales/deals-payments`;
        // console.log('editDepositStructure', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                    this.getDepositDeal();
                    this.getDealPayments();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onEditDepositChange() {
        let item = this.depositedList.find(element => this.formDetails.deposit_id == element._id);
        if (item) {
            this.formDetails['payment_amount'] = item.amount;
        }
        else {
            this.formDetails.payment_amount = '';
        }
    }

    // noOfDaysChange(value) {
    //     let extendedDays = value ? parseFloat(value) : 0;
    //     if (value >= 0) {
    //         if (value) {
    //             let fday = moment(this.formDetails.pre_firm_date).add(extendedDays, 'day');
    //             this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
    //         }
    //         else {
    //             let fday = moment(this.formDetails.pre_firm_date).add(extendedDays, 'day');
    //             this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
    //         }
    //     }
    // }

    //ARCHIVE DEAL
    archiveDeal() {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to Archive this Deal?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/deals`;
                    let data: any = {
                        is_archived: true,
                        _id: this.dealsId
                    }
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        // this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.router.navigate(['sales']);
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    //RELEASE UNIT
    openReleaseDealUnit(template: TemplateRef<any>) {
        this.formDetails = {
            release_comment: '',
        };
        if (this.dealDetailsObj.stage != 'RESERVED') {
            this.confirmationDialogService.confirm('Confirmation', `This deal is already SIGNED, are you sure you want to release the unit?\n Do you want to continue?`)
                .then((confirmed) => {
                    if (confirmed) {
                        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
                    }
                }).catch(() => console.log('User dismissed the dialog '));
        } else {
            this.modalRef = this.modalService.show(template, { backdrop: 'static' });
        }
    }

    onReleaseUnit() {
        if (!this.formDetails.release_comment || !this.formDetails.release_comment.trim()) {
            this.toastr.warning('Please enter comment', 'Warning');
            return;
        }
        let url = `sales/deals-release-unit`;
        let data: any = {};
        data.deal_id = this.dealDetailsObj._id;
        data.notes = this.formDetails.release_comment;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.getDealDetails();
                    this.defaultActiveTab = 'dealInfo';
                    this.depositedList = [];
                    this.modalRef.hide();
                    this.toastr.success(response.message, 'Success');
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //EDIT CONSTRUCTION 
    openEditConstructionModal(template: TemplateRef<any>) {
        this.formDetails = this.dealDetailsObj.construction ? { ...this.dealDetailsObj.construction } : {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateConstruction() {
        const object: any = {};
        object.notice_period_occupancy_delay = this.formDetails.notice_period_occupancy_delay ? this.formDetails.notice_period_occupancy_delay : '';
        object.purchaser_termination_period = this.formDetails.purchaser_termination_period ? this.formDetails.purchaser_termination_period : '';
        object.zoning_approval = this.formDetails.zoning_approval ? this.formDetails.zoning_approval : '';
        object.commencement_expected_occur_by = this.formDetails.commencement_expected_occur_by ? this.formDetails.commencement_expected_occur_by : '';
        object.early_termination_condition_1 = this.formDetails.early_termination_condition_1 ? this.formDetails.early_termination_condition_1 : '';
        object.early_termination_condition_2 = this.formDetails.early_termination_condition_2 ? this.formDetails.early_termination_condition_2 : '';
        object.early_termination_condition_3 = this.formDetails.early_termination_condition_3 ? this.formDetails.early_termination_condition_3 : '';
        object.commencement_construction_occurred = this.formDetails.commencement_construction_occurred ? moment(this.formDetails.commencement_construction_occurred).format('YYYY-MM-DD') : '';
        object.first_tentative_occupancy = this.formDetails.first_tentative_occupancy ? moment(this.formDetails.first_tentative_occupancy).format('YYYY-MM-DD') : '';
        object.outside_occupancy = this.formDetails.outside_occupancy ? moment(this.formDetails.outside_occupancy).format('YYYY-MM-DD') : '';
        const data: any = {};
        data['construction'] = object;
        this.updateDealAPI(data);
    }

    //UPDATE MORTGAGE
    openEditUpdateMortgageModal(template: TemplateRef<any>) {
        this.formDetails = this.dealDetailsObj.mortgage ? { ...this.dealDetailsObj.mortgage } : {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateMortgageDetails() {
        const object: any = {};
        object.required = this.formDetails.required;
        object.required_amount = this.formDetails.required_amount ? this.formDetails.required_amount : '';
        object.required_by_date = this.formDetails.required_by_date ? moment(this.formDetails.required_by_date).format('YYYY-MM-DD') : '';
        object.approval_amount = this.formDetails.approval_amount ? this.formDetails.approval_amount : '';
        object.lender = this.formDetails.lender ? this.formDetails.lender : '';
        object.coverage_percent = this.formDetails.coverage_percent ? this.formDetails.coverage_percent : '';
        const data: any = {};
        data['mortgage'] = object;
        this.updateDealAPI(data);
    }


    // FINANCE AND SALES VERIFY 
    openVerifyModal(template: TemplateRef<any>) {
        this.formDetails = {
            sales_verified: this.dealDetailsObj.sales_verified,
            notes: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    verifyBySales() {
        if (this.formDetails.sales_verified == false && !this.formDetails.notes) {
            this.toastr.warning('Please enter the issues found on the deal below in the Notes section', 'Warning');
            return;
        }
        let data: any = {};
        data.notes = this.formDetails.notes;
        data.sales_verified = this.formDetails.sales_verified ? true : false;
        // if (data.sales_verified && this.dealDetailsObj.finance_verified) {
        //     data.stage = 'VERIFIED';
        // }
        // if (!data.sales_verified || !this.dealDetailsObj.finance_verified) {
        //     data.stage = 'REVIEW';
        // }
        this.updateDealAPI(data);
    }

    verifyByFinance() {
        if (this.formDetails.finance_verified == false && !this.formDetails.notes) {
            this.toastr.warning('Please enter the issues found on the deal below in the Notes section', 'Warning');
            return;
        }
        let data: any = {};
        data.notes = this.formDetails.notes;
        data.finance_verified = this.formDetails.finance_verified ? true : false;
        // if (data.finance_verified && this.dealDetailsObj.sales_verified) {
        //     data.stage = 'VERIFIED';
        // }
        // if (!data.finance_verified || !this.dealDetailsObj.sales_verified) {
        //     data.stage = 'REVIEW';
        // }
        this.updateDealAPI(data);
    }

    openFinanceModal(template: TemplateRef<any>) {
        this.formDetails = {
            finance_verified: this.dealDetailsObj.finance_verified,
            notes: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    //CHEQUE IMAGES
    getChequeImages() {
        this.spinnerService.show();
        let url = `sales/documents?deal_id=${this.dealsId}&type=DEPOSIT-CHEQUE`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.chequeDocuments = [];
                response.results.forEach(async (element) => {
                    if (element.document) {
                        let file_extension = element.document.name.split('.').pop().toLowerCase();
                        element.file_type = file_extension;
                        element.name = element.document.name;
                        // element.filesize = await this.formatBytes(element.document.size, 3);
                        element.thumbnailUrl = `${environment.API_ENDPOINT}sales/view-file?dataset=crm_documents&_id=${element._id}&file_type=${element.file_type}`;
                    }
                    this.chequeDocuments.push(element)
                });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onSelectChequeImage(files) {
        if (files.length > 0) {
            let validation = this.validateFeaturesDocumentUpload(files.item(0).name);
            if (validation) {
                let document = files.item(0);
                var formData = new FormData();
                formData.append('file', document);
                formData.append('deal_id', this.dealsId);
                formData.append('type', 'DEPOSIT-CHEQUE');
                this.uploadChequeImages(formData);
            } else {
                this.toastr.error("Please upload only PDF, JPG, JPEG, PNG format", "Error");
            }
        }
    }

    uploadChequeImages(data) {
        this.spinnerService.show();
        let url = `sales/documents`;
        this.webService.fileUpload(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getChequeImages();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openPDFDocumentModal(template: TemplateRef<any>, document) {
        // console.log('document', document);
        this.formDetails = { ...document };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    validateFeaturesDocumentUpload(fileName) {
        var allowed_extensions = new Array("pdf", "jpg", "jpeg", "png");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    downloadDealDocument(obj) {
        const fileName = obj.document.name;
        this.httpClient.get(this.baseUrl + obj.document.url, {
            observe: 'response',
            responseType: 'blob'
        }).subscribe(res => {
            this.FileSaverService.save(res.body, fileName);
        });
        return;
    }

    openRenameDocumentModal(template: TemplateRef<any>, item) {
        let dotInd = item.name.indexOf(".");
        let name = item.name.substr(0, dotInd);
        this.formDetails = { ...item };
        this.formDetails.name = name;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    updateDocumentName() {
        let url = `sales/documents`;
        let data = {
            _id: this.formDetails._id,
            name: `${this.formDetails.name}.${this.formDetails.file_type}`
        }
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getDealDetails();
                this.toastr.success(response.message, 'Success');
                this.modalRef.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //APPLY INCENTIVE/DEPOSIT
    openApplyDiscount(template: TemplateRef<any>) {
        this.formDetails = {
            discount: '',
            comment: ''
        };
        // element['amount'] = Math.round((element.percent / 100) * this.dealDetailsObj.unit.sales_price);
        this.getDiscountList();
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    getDiscountList() {
        this.spinnerService.show();
        let url = `sales/incentives?project_id=${this.dealDetailsObj.unit.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.discountList = response.results ? response.results : [];
                if (this.discountList && this.discountList.length > 0 && this.dealDetailsObj.unit) {
                    this.discountList.forEach(element => {
                        if (element.amount_type == 'PERCENT') {
                            // element['amount'] = Math.round((element.percent / 100) * this.dealDetailsObj.unit.sales_price);
                            element['amount'] = Math.round(((element.percent / 100) * this.dealDetailsObj.unit.sales_price) * 100) / 100;

                        }
                    });
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    onApplyDeposit() {
        let existingItem = this.dealDetailsObj.discounts ? this.dealDetailsObj.discounts : [];
        let discount = existingItem.find((element) => element._id == this.formDetails.discount);
        if (discount) {
            this.toastr.warning('Selected discount is already added ', 'Warning');
            return;
        }
        if (!this.formDetails.discount) {
            this.toastr.warning('Select discount', 'Warning');
            return;
        }
        let newItem = this.discountList.filter((element) => element._id == this.formDetails.discount);
        newItem.forEach(element => {
            if (element.amount_type == 'PERCENT') {
                delete element.amount;
            }
        });
        newItem[0]['comment'] = this.formDetails.comment;
        existingItem.push(Object.assign({}, newItem[0]));
        existingItem.forEach(element => {
            if (element.amount_type == 'PERCENT') {
                delete element.amount;
            }
        });
        let data = {
            discounts: existingItem
        }
        if (newItem[0].type_of_incentive == 'MONETARY') {
            if (!this.dealDetailsObj.unit.sales_price) {
                this.toastr.warning('Please assign unit sales price', 'Warning');
                return;
            }
            let incentives = existingItem.filter((element) => element.type_of_incentive == 'MONETARY');
            let totalDiscount = 0;
            incentives.forEach(element => {
                if (element.amount_type == 'PERCENT') {
                    // totalDiscount = totalDiscount + ((element.percent / 100) * this.dealDetailsObj.unit.sales_price);
                    totalDiscount = totalDiscount + Math.round(((element.percent / 100) * this.dealDetailsObj.unit.sales_price) * 100) / 100;
                }
                if (element.amount_type == 'AMOUNT') {
                    totalDiscount = totalDiscount + element.amount;
                }
            });
            // data['total_discount'] = totalDiscount;
            let net_price = this.dealDetailsObj.unit.sales_price - totalDiscount;
            // data['net_price'] = net_price;
            // data['tax'] = (this.percentageDetails.percentage / 100) * net_price;
            let finance = this.dealDetailsObj.finance ? Object.assign({}, this.dealDetailsObj.finance) : {};
            finance['total_discount'] = Math.round(totalDiscount * 100) / 100;
            finance['net_price'] = Math.round(net_price * 100) / 100;
            finance['tax'] = Math.round(((this.percentageDetails.percentage / 100) * net_price) * 100) / 100;
            finance['contract_price'] = Math.round((this.dealDetailsObj.unit.sales_price - totalDiscount) * 100) / 100;;
            data['finance'] = finance;
        }
        console.log('existingItem data', data);
        this.spinnerService.show();
        let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.modalRef.hide();
                    this.getDealDetails();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //ALLOCATE PARKING
    openAllocateParking(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('parking-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    allocateParking() {
        let item = this.parkingTypes.find((element) => (element.number < 0));
        let item2 = this.parkingTypes.find((element) => (element.price < 0));
        let item4 = this.parkingTypes.find((element) => (element.number && element.price !== 0 && !element.price));
        let item3 = this.parkingTypes.find((element) => (element.price && (!element.number || element.number === 0)));
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        if (item2) {
            this.toastr.warning(`Please enter price greater than or equal to 0 for type ${item2.name}`, 'Warning');
            return;
        }
        if (item3) {
            this.toastr.warning(`Please enter number value for type ${item3.name}`, 'Warning');
            return;
        }
        if (item4) {
            this.toastr.warning(`Please enter price value for type ${item4.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.parkingTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
                price: (element.price || element.price === 0) ? element.price : '',
            };
            parking.push(obj);
        })
        let parking_price = 0;
        parking.forEach(element => {
            parking_price = parking_price + (element.price ? element.price : 0);
        })
        let finance = this.dealDetailsObj.finance ? Object.assign({}, this.dealDetailsObj.finance) : {};
        finance.parking_price = Math.round(parking_price * 100) / 100;
        let data = {
            allocate_parking: parking,
            finance: finance,
        }
        this.updateDealAPI(data);
    }

    //ALLOCATE BICYCLE PARKING
    openAllocateBicycle(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('bicycle-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    allocateBicycle() {
        let item = this.bicycleTypes.find((element) => (element.number < 0));
        let item2 = this.bicycleTypes.find((element) => (element.price < 0));
        let item4 = this.bicycleTypes.find((element) => (element.number && element.price !== 0 && !element.price));
        let item3 = this.bicycleTypes.find((element) => (element.price && (!element.number || element.number === 0)));
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        if (item2) {
            this.toastr.warning(`Please enter price greater than or equal to 0 for type ${item2.name}`, 'Warning');
            return;
        }
        if (item3) {
            this.toastr.warning(`Please enter number value for type ${item3.name}`, 'Warning');
            return;
        }
        if (item4) {
            this.toastr.warning(`Please enter price value for type ${item4.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.bicycleTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
                price: (element.price || element.price == 0) ? element.price : ''
            };
            parking.push(obj);
        })
        let bicycle_price = 0;
        parking.forEach(element => {
            bicycle_price = bicycle_price + (element.price ? element.price : 0);
        })
        let finance = this.dealDetailsObj.finance ? Object.assign({}, this.dealDetailsObj.finance) : {};
        finance.bicycle_price = Math.round(bicycle_price * 100) / 100;
        let data = {
            allocate_bicycle: parking,
            finance: finance,
        }
        this.updateDealAPI(data);
    }

    //ALLOCATE LOCKER PARKING
    openAllocateLocker(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('locker-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    allocateLocker() {
        let item = this.lockerTypes.find((element) => (element.number < 0));
        let item2 = this.lockerTypes.find((element) => (element.price < 0));
        let item4 = this.lockerTypes.find((element) => (element.number && element.price !== 0 && !element.price));
        let item3 = this.lockerTypes.find((element) => (element.price && (element.number ? false : true)));
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        if (item2) {
            this.toastr.warning(`Please enter price greater than or equal to 0 for type ${item2.name}`, 'Warning');
            return;
        }
        if (item3) {
            this.toastr.warning(`Please enter number value for type ${item3.name}`, 'Warning');
            return;
        }
        if (item4) {
            this.toastr.warning(`Please enter price value for type ${item4.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.lockerTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
                price: (element.price || element.price == 0) ? element.price : ''
            };
            parking.push(obj);
        })
        let locker_price = 0;
        parking.forEach(element => {
            locker_price = locker_price + (element.price ? element.price : 0);
        })
        let finance = this.dealDetailsObj.finance ? Object.assign({}, this.dealDetailsObj.finance) : {};
        finance.locker_price = Math.round(locker_price * 100) / 100;
        let data = {
            allocate_locker: parking,
            finance: finance,
        }

        this.updateDealAPI(data);
    }

    getAllocateDataByType(type) {
        this.spinnerService.show();
        let url = `sales/${type}`;
        if (this.dealDetailsObj.unit.project_id) {
            url = url + `?project_id=${this.dealDetailsObj.unit.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (type == 'parking-types') {
                    this.parkingTypes = response.results ? response.results : [];
                    if (this.dealDetailsObj.allocate_parking && this.dealDetailsObj.allocate_parking.length > 0) {
                        this.parkingTypes.forEach((type) => {
                            this.dealDetailsObj.allocate_parking.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = (element.eligible_no || element.eligible_no === 0) ? element.eligible_no : null;
                                    type.price = (element.price || element.price === 0) ? element.price : null;
                                }
                            })
                        })
                    }
                    else {
                        this.parkingTypes.forEach((ele) => {
                            ele.price = null;
                            ele.number = null;
                        });
                    }
                    // console.log(this.parkingTypes);
                }
                else if (type == 'bicycle-types') {
                    this.bicycleTypes = response.results ? response.results : [];
                    if (this.dealDetailsObj.allocate_bicycle && this.dealDetailsObj.allocate_bicycle.length > 0) {
                        this.bicycleTypes.forEach((type) => {
                            this.dealDetailsObj.allocate_bicycle.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = (element.eligible_no || element.eligible_no === 0) ? element.eligible_no : null;
                                    type.price = (element.price || element.price === 0) ? element.price : null;
                                }
                            })
                        })
                    }
                    else {
                        this.parkingTypes.forEach((ele) => {
                            ele.price = null;
                            ele.number = null;
                        });
                    }
                }
                else if (type == 'locker-types') {
                    this.lockerTypes = response.results ? response.results : [];
                    if (this.dealDetailsObj.allocate_locker && this.dealDetailsObj.allocate_locker.length > 0) {
                        this.lockerTypes.forEach((type) => {
                            this.dealDetailsObj.allocate_locker.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = (element.eligible_no || element.eligible_no === 0) ? element.eligible_no : null;
                                    type.price = (element.price || element.price === 0) ? element.price : null;
                                }
                            })
                        })
                    }
                    else {
                        this.lockerTypes.forEach((ele) => {
                            ele.price = null;
                            ele.number = null;
                        });
                    }
                }
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //AGGREMENT OUT FOR SIGN
    updateAgreementOut(template: TemplateRef<any>) {
        this.formDetails = {
            note_date: moment(new Date()).format('YYYY-MM-DD'),
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updateAggrementOutSign() {
        let data = {
            out_for_sign_date: moment(this.formDetails.note_date).format('YYYY-MM-DD'),
            notes: this.formDetails.notes,
            stage: 'OUT FOR SIGN'
        };
        this.spinnerService.show();
        let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.modalRef.hide();
                    this.getDealDetails();
                    this.getNotesList();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //MANAGE DOCUMENTS 
    uploadDocument(files: FileList) {
        let validation = this.validateModelDocumentUpload(files.item(0).name);
        if (validation) {
            let modelDocument = files.item(0);
            let url = `sales/documents`;
            var formData = new FormData();
            formData.append('file', modelDocument);
            formData.append('deal_id', this.dealsId);
            formData.append('type', 'DEAL_DOCUMENTS');
            this.spinnerService.show();
            this.webService.fileUpload(url, formData).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getDocumentList();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log("error ts: ", error);
            })
        } else {
            this.toastr.error("Please upload only JPG, JPEG,PNG, PDF, DOC, DOCX format", "Error");
        }
    }
    validateModelDocumentUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "pdf", "doc", "docx");
        var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }
    getDocumentList() {
        this.spinnerService.show();
        let url = `sales/documents?deal_id=${this.dealsId}&type=DEAL_DOCUMENTS`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                this.documentsList = [];
                let results = response.results ? response.results : [];
                results.forEach(async (element) => {
                    if (element.document) {
                        let file_extension = element.document.name.split('.').pop().toLowerCase();
                        element.file_type = file_extension;
                        element.name = element.document.name;
                        element.filesize = await this.formatBytes(element.document.size, 3);
                        // element.thumbnailUrl = `${this.baseUrl}${element.document.url}`;
                        element.thumbnailUrl = `${environment.API_ENDPOINT}sales/view-file?dataset=crm_documents&_id=${element._id}&file_type=${element.file_type}`;
                    }
                    this.documentsList.push(element)
                });
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    formatBytes(bytes, decimals) {
        // console.log(bytes)
        return new Promise(resolve => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            resolve(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]);
        });
    }
    openDocumentModal(template: TemplateRef<any>, document) {
        this.selectedDocument = { ...document };
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }
    deleteDocument(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete document?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/documents?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getDocumentList();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    downloadDocument() {

    }

    //MANAGE NOTES
    getNotesList() {
        let url = `sales/notes?deal_id=${this.dealsId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.noteList = response.results && response.results.rows ? response.results.rows : [];
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    openAddNotesModal(template: TemplateRef<any>) {
        this.formDetails = {
            body: ''
        };
        this.isNotesEdit = false;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }
    editNotesModal(template: TemplateRef<any>, item) {
        this.formDetails = { ...item };
        this.isNotesEdit = true;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }
    addNotes() {
        if (!this.formDetails.body) {
            this.toastr.warning(`Please enter the note`, 'Warning');
            return;
        }
        let url = `sales/notes`;
        let data = {
            notes: this.formDetails.body,
            deal_id: this.dealsId
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getNotesList();
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    editNotes() {
        if (!this.formDetails.body) {
            this.toastr.warning(`Please enter the note`, 'Warning');
            return;
        }
        let url = `sales/notes`;
        let data = {
            notes: this.formDetails.body,
            _id: this.formDetails._id,
            deal_id: this.dealsId
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getNotesList();
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    deleteNote(note) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this note ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/notes?_id=${note._id}`;
                    console.log('url', url);
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.getNotesList();
                            this.toastr.success(response.message, 'Success');
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
    }

    //EXECUTE AGREEMENT
    openExecuteAgreementModal(template: TemplateRef<any>) {
        this.formDetails = {
            extension_days: this.dealDetailsObj.extension_days ? this.dealDetailsObj.extension_days : 0,
            cooling_period_extended: this.dealDetailsObj.cooling_period_extended ? this.dealDetailsObj.cooling_period_extended : 0,
            pre_firm_date: this.dealDetailsObj.firm_date ? this.dealDetailsObj.firm_date : '',
        };
        if (this.dealDetailsObj.executed_date && this.dealDetailsObj.executed_date != '') {
            this.formDetails.executed_date = moment(this.dealDetailsObj.executed_date).format('YYYY-MM-DD');
        } else {
            this.formDetails.executed_date = moment(new Date()).format('YYYY-MM-DD');
        }
        var url = `sales/projects?_id=${this.dealDetailsObj.unit.project_id}`;
        this.spinnerService.show();
        this.webService.get(url).toPromise().then((response) => {
            this.spinnerService.hide();
            this.formDetails.default_cooling_period = response.result.default_cooling_period ? response.result.default_cooling_period : 0;
            // console.log(this.formDetails.default_cooling_period ,this.formDetails.cooling_period_extended );
            let fday = moment(this.formDetails.executed_date).add(this.formDetails.default_cooling_period + this.formDetails.cooling_period_extended, 'day');
            this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
        })
            .catch((error => {
                this.formDetails.default_cooling_period = 0;
                // console.log(this.formDetails.default_cooling_period ,this.formDetails.cooling_period_extended );
                let fday = moment(this.formDetails.executed_date).add(this.formDetails.default_cooling_period + this.formDetails.cooling_period_extended, 'day');
                this.formDetails.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
                this.spinnerService.hide();
            }))
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }
    addExecuteAgreement() {
        if (!this.formDetails.executed_date) {
            this.toastr.warning('Please select executed date', 'Warning');
            return;
        }
        let data: any = {};
        data.stage = 'CONDITIONAL';
        data.executed_date = (this.formDetails.executed_date) ? moment(this.formDetails.executed_date).format('YYYY-MM-DD') : '';
        let fday = moment(this.formDetails.executed_date).add(this.formDetails.default_cooling_period + this.formDetails.cooling_period_extended, 'day');
        data.firm_date = moment(fday).startOf('day').format('YYYY-MM-DD');
        this.updateDealAPI(data);
    }

    //EXECUTE DEFAULT AGREEMENT
    openDefaultAgreementModal() {
        let data = {
            stage: 'DEFAULT'
        }
        this.confirmationDialogService.confirm('Confirmation', `Do you want to 'Default' agreement?\nWhen defaulting on an agreement, the unit will return back to inventory and it can be sold to someone else.\nAre you sure you want to continue?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.success) {
                            if (response.status == 1) {
                                this.getDealDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    openWithdrawRecessionModal() {
        let data = {
            stage: 'DEAL WITHDRAW - RECESSION'
        }
        this.confirmationDialogService.confirm('Confirmation', `Does the purchaser wants to withdraw from this Agreement?\n${'Unit will be returned back to inventory and it can be sold to someone else.'}\n${'Are you sure you want to continue?'}`, true)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    // this.spinnerService.show();
                    // this.webService.post(url, data).subscribe((response: any) => {
                    //     this.spinnerService.hide();
                    //     if (response.success) {
                    //         if (response.status == 1) {
                    //             this.getDealDetails();
                    //         }
                    //     } else {
                    //         this.toastr.error(response.message, 'Error');
                    //     }
                    // }, (error) => {
                    //     console.log('error', error);
                    // });
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    //FIRM AGGREMENT MODAL
    openFirmAgreementModal() {
        let data = {
            stage: 'FIRM'
        }
        this.confirmationDialogService.confirm('Confirmation', `Do you want to 'Firm' agreement?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/deals?_id=${this.dealDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.success) {
                            if (response.status == 1) {
                                this.getDealDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    deleteDeal() {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to Delete this Deal?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/deals?_id=${this.dealsId}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.router.navigate(['sales']);
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }
}
