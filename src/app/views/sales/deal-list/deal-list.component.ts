import { Component, OnInit, TemplateRef, Input, DoCheck, ViewChild, ElementRef, ViewChildren, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ExportToCsv } from "export-to-csv";
import * as moment from 'moment';
import { InventoryModalComponent } from '../inventory-modal/inventory-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { AutoComplete } from 'primeng/autocomplete';
import { environment } from '../../../../environments/environment';
import { ExcelService } from '../../../services/excel.service';

@Component({
    selector: 'app-deal-list',
    templateUrl: './deal-list.component.html',
    styleUrls: ['./deal-list.component.css']
})
export class DealListComponent implements OnInit {

    dealList = [];
    paginationObj: any = {};
    projectList: any = [];
    modelList: any[] = [];
    salesAgent: any[] = [];
    outsideAgent: any[] = [];
    outsideBroker: any[] = [];
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_created';
    filterForm: any = {
        project_id: '',
        floor_legal: [],
        sales_agent: [],
        outside_agent: '',
        model_id: [],
        broker: [],
        show_archived:false,
        searchText: ''
    };
    importFileModal:any={};
    fileDocument: any;
    importRecords: any = [];
    baseUrl = environment.BASE_URL;
    formDetails: any = {};
    isClear: boolean = false;
    reverse: boolean = false;
    modalRef: BsModalRef;
    openContactModalRef;
    autosearchText: any = '';
    contactList: any = [];
    unitList: any = [];
    disableUnit: boolean = true;
    contactTypeSuggestions: any = [];
    checkInventoryModalRef;
    dataOfUnits: any;
    private modelChanged: Subject<string> = new Subject<string>();
    private subscription: Subscription;
    depositList: any[] = [];
    isUnitAvailable: boolean = false;
    unitsSoldOut: boolean = false;
    isSearching: boolean = false;
    selectedProject: any;
    modelDropdownSettings: any;
    isSalesPriceAvailable: boolean = true;
    floorList: any = [] = [];
    numberFields: any[] = [
        { _id: 1, value: 1 },
        { _id: 2, value: 2 },
        { _id: 3, value: 3 },
        { _id: 4, value: 4 },
        { _id: 5, value: 5 }
    ];
    dropdownSettings: any = {};
    brokerList: any[] = [];
    salesAgentList: any[] = [];
    depositInfo: any[] = [];
    @ViewChild('autoCompleteObject', { static: false }) public autoCompleteObject: AutoComplete;
    // @ViewChildren('autoCompleteObject') public autoCompleteObject: AutoComplete;
    dealStages: any[] = [
        {
            value: 'NEW',
            description: ''
        },
        {
            value: 'RESERVED',
            description: ''
        },
        {
            value: 'OUT FOR SIGN',
            description: ''
        },
        {
            value: 'SIGNED',
            description: ''
        },
        {
            value: 'REVIEW',
            description: ''
        },
        {
            value: 'VERIFIED',
            description: ''
        },
        {
            value: 'EXECUTED',
            description: ''
        },
        {
            value: 'CONDITIONAL',
            description: ''
        },
        {
            value: 'EXECUTED',
            description: ''
        },
        {
            value: 'FIRM',
            description: ''
        },
        {
            value: 'RECESSION',
            description: ''
        },
        {
            value: 'UNIT RELEASED',
            description: ''
        }
    ]
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private ngModalService: NgbModal,
        private confirmationDialogService: ConfirmationDialogService,
        private renderer: Renderer2,
        private excelService: ExcelService,
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.getProjectList();
        this.getDealList();
        this.getSalesAgentList();
        this.getBrokerList();

        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
        this.modelDropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            itemsShowLimit: 2,
            allowSearchFilter: true
        }
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

    unitInputChanged(value) {
        this.modelChanged.next(value);
        this.formDetails.deposit_structure = '';
        this.depositInfo = [];
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('salesDealsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.project_id) {
                this.filterForm.project_id = filterData.project_id;
                this.getFilterModelList(this.filterForm.project_id);
            }
            else {
                this.floorList = this.numberFields;
            }
            if (filterData.model_id) {
                this.filterForm.model_id = filterData.model_id;
            }
            if (filterData.floor_legal) {
                this.filterForm.floor_legal = filterData.floor_legal;
            }
            if (filterData.sales_agent) {
                this.filterForm.sales_agent = filterData.sales_agent;
            }
            if (filterData.broker) {
                this.filterForm.broker = filterData.broker;
            }
            if (filterData.outside_agent) {
                this.filterForm.outside_agent = filterData.outside_agent;
            }
            if (filterData.show_archived) {
                this.filterForm.show_archived = filterData.show_archived;
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
        else {
            this.floorList = this.numberFields;
        }

    }

    //LOOKUP DATA
    getProjectList() {
        this.spinnerService.show();
        let url = `sales/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                let selectedProject = this.projectList.find((element) => element._id == this.filterForm.project_id);
                if (selectedProject) {
                    this.getFloorList(selectedProject.no_of_floors ? selectedProject.no_of_floors : 0);
                }
                else {
                    this.floorList = this.numberFields;
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onProjectChange(event) {
        let selectedProject = this.projectList.find((element) => element._id == this.filterForm.project_id);
        if (selectedProject && selectedProject.no_of_floors && event) {
            this.getFilterModelList(event);
            this.getFloorList(selectedProject.no_of_floors ? selectedProject.no_of_floors : 0);
        }
        else {
            this.modelList = [];
            this.floorList = this.numberFields;
        }
        this.filterForm.floor_legal = [];
        this.filterForm.model_id = [];
        this.page = 1;
        this.getDealList();
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

        if (this.formDetails.project_id) {
            this.selectedProject = this.projectList.find((project) => project._id == this.formDetails.project_id);
            this.disableUnit = false;
            this.getUnitList();
            this.getDeposit();
        }
        else {
            this.selectedProject = {};
            this.unitList = [];
        }
    }

    //TO GET UNITS
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

    //FILTERS
    getFilterModelList(projectId: string) {
        this.spinnerService.show();
        let url = `sales/models?type=list&project_id=${projectId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.modelList = response.results;
                    // console.log(this.modelList);
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onArchiveChange(){
        this.getDealList();
    }

    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.filterForm.project_id = '';
        this.filterForm.model_id = [];
        this.filterForm.floor_legal = [];
        this.filterForm.sales_agent = [];
        this.filterForm.outside_agent = '';
        this.filterForm.broker = []
        this.getDealList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            project_id: this.filterForm.project_id,
            model_id: this.filterForm.model_id,
            floor_legal: this.filterForm.floor_legal,
            sales_agent: this.filterForm.sales_agent,
            outside_agent: this.filterForm.outside_agent,
            broker: this.filterForm.broker,
            show_archived: this.filterForm.show_archived,
        }
        localStorage.setItem('salesDealsFilterData', JSON.stringify(data));
    }
    
    onItemSelect() {
        this.page = 1;
        this.getDealList();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getDealList();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getDealList();
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
        this.getDealList();
    }

    //SEARCH
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getDealList();
    }

    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getDealList();
    }

    getFloorList(no_of_floors) {
        this.floorList = [];
        if (no_of_floors && no_of_floors > 0) {
            for (let i = 1; i <= no_of_floors; i++) {
                let obj = {
                    _id: i,
                    value: i
                }
                this.floorList.push(obj);
            }
        }
        else {
            this.floorList = this.numberFields;
        }
    }

    //ASSIGN UNIT
    onUnitChange(value) {
        if (value) {
            this.isSearching = true;
            this.formDetails.max_bicycle = null;
            this.formDetails.max_lockers = null;
            this.formDetails.max_parking = null;
            this.formDetails.is_locker = false;
            this.formDetails.locker = '';
            this.formDetails.is_parking = false;
            this.formDetails.parking = '';
            let url = `sales/units?project_id=${this.formDetails.project_id}&searchText=${value}`;
            this.spinnerService.show();
            this.webService.get(url).subscribe((response) => {
                this.spinnerService.hide();
                this.isSearching = false;
                this.isSalesPriceAvailable = true;
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
                this.isSearching = false;
                this.spinnerService.hide();
                console.log("error ts: ", error);
            });
        }
    }
  
    searchAuto(event) {
        this.autosearchText = event.query;
        this.getContactList();
    }

    openNewContact() {
        this.openContactModalRef = this.ngModalService.open(ContactModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.openContactModalRef.componentInstance.data = {
            isEdit: false,
            project_id: null
        }
        this.openContactModalRef.result.then(async (result) => {
            if (result) {
                this.contactList.push(result);
                this.filterContactList();
                let contact_names = [...this.formDetails.contact_name];
                this.contactList.forEach(new_contact => {
                    if (new_contact._id == result._id) {
                        if (this.formDetails.contact_name.length == 0) {
                            this.formDetails.contact_name = [];
                            this.formDetails.contact_name.push(new_contact);
                        }
                        else {
                            this.formDetails.contact_name = [...contact_names];
                            this.formDetails.contact_name.push(new_contact);

                        }
                    }
                });
                console.log('this.autoCompleteObject', this.autoCompleteObject);
                if (this.autoCompleteObject) {
                    this.autoCompleteObject.focusInput();
                }
                // element.focusInput()

                // let new_contact = {
                //     addresses: result.addresses,
                //     territory: result.territory,
                //     contact_type: result.contact_type,
                //     emails: result.emails,
                //     geography: result.geography,
                //     phones: result.phones,
                //     _id: result._id,
                //     last_name: result.last_name,
                //     first_name: result.first_name,
                //     middle_name: result.middle_name,
                //     display_name: result.display_name,
                //     show_name: `${result._id}, ${result.display_name ? result.display_name : ''},  ${result.emails[0].email ? result.emails[0].email : ''}, ${result.phones[0].number ? result.phones[0].number : ''}`
                // }
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }

    getContactList() {
        let url = `sales/contacts?page=1&pageSize=100&sortby=display_name&sortOrder=ASC&searchText=${this.autosearchText}`;
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
                // console.log('result', result);
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
        // this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    //MANAGE DEAL
    getDealList() {
        this.saveFilter();
        let url = `sales/deals?page=${this.page}&pageSize=${this.pageSize}&show_archived=${this.filterForm.show_archived}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.project_id) {
            url = url + `&project_id=${this.filterForm.project_id}`;
        }
        // if (this.filterForm.model_id) {
        //     url = url + `&model_id=${this.filterForm.model_id}`;
        // }
        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&model_id=${valueString}`;
        }
        if (this.filterForm.floor_legal.length > 0) {
            const values = this.filterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&floor_legal=${valueString}`;
        }
        if (this.filterForm.sales_agent.length > 0) {
            const values = this.filterForm.sales_agent.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&sales_agent=${valueString}`;
        }
        if (this.filterForm.broker.length > 0) {
            const values = this.filterForm.broker.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&broker=${valueString}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.dealList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.dealList = response.results;
                    if(this.page >1 && response.results.length==0 && !response.pagination){
                        this.page = this.page > 1? this.page-1 :1;
                        this.getContactList()  
                    } 
                    this.dealList.forEach((deal)=>{
                        deal.parking_price=0;
                        deal.locker_price=0;
                        deal.bicycle_price =0;
                        deal.contract_price=0;
                        if (deal.allocate_parking && deal.allocate_parking.length > 0) {
                            deal.allocate_parking.forEach(element => {
                                let records = (deal.assigned_parking && deal.assigned_parking.length > 0) ? deal.assigned_parking.filter((assigned) => assigned.type == element.type) : [];
                                element.assignedCount = records;
                                deal.parking_price = deal.parking_price + (element.price ? element.price : 0);
                            });
                        }
                        deal.locker_price = 0;
                        if (deal.allocate_locker && deal.allocate_locker.length > 0) {
                            deal.allocate_locker.forEach(element => {
                                let records = (deal.assigned_locker && deal.assigned_locker.length > 0) ? deal.assigned_locker.filter((assigned) => assigned.type == element.type) : [];
                                element.assignedCount = records;
                                deal.locker_price = deal.locker_price + (element.price ? element.price : 0);
                            });
                        }
                        deal.bicycle_price = 0;
                        if (deal.allocate_bicycle && deal.allocate_bicycle.length > 0) {
                            deal.allocate_bicycle.forEach(element => {
                                let records = (deal.assigned_bicycle && deal.assigned_bicycle.length > 0) ? deal.assigned_bicycle.filter((assigned) => assigned.type == element.type) : [];
                                element.assignedCount = records;
                                deal.bicycle_price = deal.bicycle_price + (element.price ? element.price : 0);
                            });
                        }

                        if(deal.unit && deal.unit.sales_price){
                            deal.contract_price= deal.unit.sales_price - (deal.total_discount ?deal.total_discount :0);
                        }
                    })
                    if(response.results.length > 0)
                    this.paginationObj = response.pagination;
                    else
                    this.paginationObj = {
                        total:0
                    }
                    // this.dealList.forEach((element) => {
                    //     if (element.contact.contact_type) {
                    //         let isSalesAgent = element.contact.contact_type.includes('Sales Agent');
                    //         let isBroker = element.contact.contact_type.includes('Broker');
                    //         console.log('dealList', isSalesAgent, isBroker);

                    //     }
                    // })
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //PAGINATION
    doPaginationWise(page) {
        this.page = page;
        this.getDealList();
    }

    setPageSize() {
        this.page = 1;
        this.getDealList();
    }

    //DEAL MANAGEMNT
    openAddDeal(template: TemplateRef<any>) {
        this.autosearchText = '';
        this.formDetails = {
            contact_name: '',
            project_id: ''
        };
        this.depositInfo = [];
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    navigateToContact(event, id) {
        event.stopPropagation();
        let url = `#/sales/contact/${id}`;
        window.open(url, '_blank');

    }

    async createDeal() {
        if (!this.formDetails.contact_name || this.formDetails.contact_name.length == 0) {
            this.toastr.warning('Please enter contact', 'Warning');
            return;
        }
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }

        if (!this.formDetails.unit_id || !this.isUnitAvailable) {
            this.toastr.warning('Please enter valid unit', 'Warning');
            return;
        }
        // if (this.formDetails.is_locker && !this.formDetails.locker) {
        //     this.toastr.warning('Please enter lockers', 'Warning');
        //     return;
        // }
        // if (this.formDetails.locker && this.formDetails.locker > this.formDetails.max_lockers) {
        //     this.toastr.warning(`This unit is eligible for ${this.formDetails.max_lockers} locker`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.is_parking && !this.formDetails.parking) {
        //     this.toastr.warning('Please enter parking', 'Warning');
        //     return;
        // }
        // if (this.formDetails.parking && this.formDetails.parking > this.formDetails.max_parking) {
        //     this.toastr.warning(`This unit is eligible for ${this.formDetails.max_parking} parking`, 'Warning');
        //     return;
        // }
        if (!this.formDetails.deposit_structure) {
            this.toastr.warning('Please select deposit structure', 'Warning');
            return;
        }

        let selectedProject = this.projectList.find((element) => element._id == this.formDetails.project_id);
        let purchaser = [];
        this.formDetails.contact_name.forEach(element => {
            let contact: any = {
                addresses: element.addresses,
                contact_type: element.contact_type,
                emails: element.emails,
                geography: element.geography,
                phones: element.phones,
                display_name: element.display_name,
                first_name: element.first_name,
                last_name: element.last_name,
                middle_name: element.middle_name,
                // territory: element.territory,
                _id: element._id
            }
            purchaser.push(contact);
        })

        let selectedDeposit = this.depositList.find((element) => element._id == this.formDetails.deposit_structure);
        let data = {
            deal_type: this.formDetails.deal_type,
            unit_id: this.formDetails.unit_id,
            deposit_structure_def: selectedDeposit ? selectedDeposit.deposits : [],
            deposit_structure_id: this.formDetails.deposit_structure
        }
        data['purchasers'] = purchaser;
        data['stage'] = 'NEW';
        // if (this.formDetails.is_locker) {
        //     data['is_locker'] = true;
        //     data['locker_no'] = this.formDetails.locker
        // }
        // if (this.formDetails.is_parking) {
        //     data['is_parking'] = true;
        //     data['parking_no'] = this.formDetails.parking
        // }
        // console.log('data=>>', data);
        let url = `sales/deals`;
        this.spinnerService.show();
        let response = await this.webService.post(url, data).toPromise();
        if (response && response.result && response.result.row) {
            this.addDepositDeal(response.result.row);
        }
        else {
            this.spinnerService.hide();
            this.modalRef.hide();
            this.toastr.error('failed to create deal', 'Error');
        }
    }

    //DEPOSIT
    addDepositDeal(dealDetails) {
        let data: any = {};
        data.deposits = this.formatDepositValues(dealDetails);
        data.operation = 'add';
        data.deal_id = dealDetails._id;
        data.project_id = dealDetails.unit.project_id;
        data.project_name = dealDetails.unit.project_name;
        data.unit_id = dealDetails.unit._id;
        data.unit_no = dealDetails.unit.unit_no;
        // console.log('data=>', data);
        let url = 'sales/deals-deposits';
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.modalRef.hide();
                    this.router.navigate(['sales/deals/' + dealDetails._id]);
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
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
        }

    }

    getDeposit() {
        this.spinnerService.show();
        let url = `sales/deposit-structures?project_id=${this.formDetails.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.depositList = response.results;

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

    formatDepositValues(dealDetails) {
        let deposits: any[] = [];
        let selectedDepositeType= this.depositList.find((item)=>item._id==dealDetails.deposit_structure_id);
        if(selectedDepositeType){
            dealDetails.deposit_structure_def.forEach((deposit, index) => {
                let object = {}
                object['deposit_no'] = index + 1;
                if (deposit.type == 'PERCENT-CP') {
                    object['percent'] = parseFloat(deposit.value);
                    if (dealDetails.unit.sales_price) {
                        // object.percent = `${((deposit.value / 100) * this.dealDetailsObj.unit.sales_price).toFixed(2)}%`;
                        object['amount'] = Math.round(((deposit.value / 100) * dealDetails.unit.sales_price)*100)/100;;
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
                if (deposit.date_type == 'FROM-INITIATED' || deposit.date_type =='FROM-EXECUTED') {
                    // deposit. = deposit.days;
                    if (deposit.days) { //adding signed date in deposit days
                        let initiatedDate = moment(dealDetails.initiated_on).format('YYYY-MM-DD');
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
                if(index==1 && selectedDepositeType.deduct_signup){
                    object['amount'] = (object['amount'] && deposits[index-1]['amount']) ? object['amount'] - deposits[index-1]['amount'] :'';
                }
                deposits.push(object);
            });
        }
        else{
            this.toastr.warning('Selected deposit not found', 'Warning')
        }
        return deposits;
    }

    formatAssignDepositValues(selectedUnit, deposit_structure_def) {
        let deposits: any[] = [];
        if(deposit_structure_def.deposits){
            deposit_structure_def.deposits.forEach((deposit, index) => {
                let object = {}
                object['deposit_no'] = index + 1;
                if (deposit.type == 'PERCENT-CP') {
                    object['percent'] = parseFloat(deposit.value);
                    if (selectedUnit.sales_price) {
                        object['amount'] = Math.round(((deposit.value / 100) * selectedUnit.sales_price)*100)/100;
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
                if (deposit.date_type == 'FROM-INITIATED' || deposit.date_type =='FROM-EXECUTED') {
                    if (deposit.days) { //adding signed date in deposit days
                        let initiatedDate = moment(new Date()).format('YYYY-MM-DD');
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
                if(index==1 && deposit_structure_def.deduct_signup){
                    object['amount'] = (object['amount'] && deposits[index-1]['amount']) ? object['amount'] - deposits[index-1]['amount'] :'';
                }
                deposits.push(object);
            });
        }
        else{
            // this.toastr.warning('deposits not found', 'Warning')
        }
        return deposits;
    }

    goToDealDetails(obj) {
        this.router.navigate(['sales/deals/' + obj._id]);
    }

    //LOOKUP DATA
    getSalesAgentList() {
        let url = `sales/contacts?sortby=display_name&contact_type=Sales Agent&sortOrder=ASC`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    let contactList = response.results;
                    let allContactList = [];
                    contactList.forEach(element => {
                        let obj = {
                            _id: element._id,
                            value: element.display_name,
                            contact_type: element.contact_type
                        }
                        allContactList.push(obj);
                    });
                    this.salesAgentList = allContactList.filter((element) => element.contact_type.indexOf('Sales Agent') != -1)
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getBrokerList() {
        let url = `sales/contacts?sortby=display_name&contact_type=Broker&sortOrder=ASC`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    let contactList = response.results;
                    let allContactList = [];
                    contactList.forEach(element => {
                        let obj = {
                            _id: element._id,
                            value: element.display_name,
                            contact_type: element.contact_type
                        }
                        allContactList.push(obj);
                    });
                    this.brokerList = allContactList.filter((element) => element.contact_type.indexOf('Broker') != -1)
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //IMPORT DEAL
    uploadRecordFile(files: FileList) {
        if (files.length > 0) {
            let validation = this.validateProjectDocumentUpload(files.item(0).name);
            if (validation) {
                this.fileDocument = files.item(0);
            } else {
                this.toastr.error("Please upload only CSV", "Error");
            }
        }
    }

    validateProjectDocumentUpload(fileName) {
        var allowed_extensions = new Array("csv");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    openImportDeal(template: TemplateRef<any>) {
        this.fileDocument = null;
        this.importFileModal={
            project_id:this.filterForm.project_id || '',
            stage:''
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    importDeal() {
        if (!this.importFileModal.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.importFileModal.stage) {
            this.toastr.warning('Please select stage', 'Warning');
            return;
        }
        if (!this.fileDocument) {
            this.toastr.warning('Please select file', 'Warning');
            return;
        }
        this.importRecords = [];
        this.excelService.importFromFile(this.fileDocument).then((res) => {
            const records: any = res;
            // console.log('records', records);
            this._handleReaderLoaded(records);
        })
            .catch((error) => {
                this.spinnerService.hide();
                this.toastr.warning('Something went wrong ! please upload right file', 'Error');

            });
    }

    _handleReaderLoaded(records) {
        const filteredList = records.filter((element) => element.length > 0);
        const importedData = filteredList.splice(0, 1);
        // console.log('importedData', importedData);
        let selectedProject= this.projectList.find((project)=>project._id==this.importFileModal.project_id);
        this.filterItems(filteredList).then((res) => {
            let data = {
                project_id:this.importFileModal.project_id,
                project_name:selectedProject.name || '',
                stage:this.importFileModal.stage,
                records:res ? res:[]
            };
            this.spinnerService.show();
            // console.log('before post',data)
            let url = 'sales/import-deal';
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (response.status == 1) {
                        this.modalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        })
            .catch((error) => {
                console.log('error', error);
                this.spinnerService.hide();
                this.toastr.error('Something went wrong ! please upload correct file', 'Error');
            })

    }

    filterItems(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map(arr => {
                let obj: any = {};
                if (arr[0]) {
                    obj.suite = `${arr[0]}`
                }
                if (arr[1]) {
                    obj.p1_email = `${arr[1]}`
                }
                if (arr[2]) {
                    obj.p1_name = `${arr[2]}`
                }
                if (arr[3]) {
                    obj.p2_email = `${arr[3]}`
                }
                if (arr[4]) {
                    obj.p2_name = `${arr[4]}`
                }
                if (arr[5]) {
                    obj.p3_email = `${arr[5]}`
                }
                if (arr[6]) {
                    obj.p3_name = `${arr[6]}`
                }
                if (arr[7]) {
                    obj.p4_email = `${arr[7]}`
                }
                if (arr[8]) {
                    obj.p4_name = `${arr[8]}`
                }
                if (arr[9]) {
                    obj.p5_email = `${arr[9]}`
                }
                if (arr[10]) {
                    obj.p5_name = `${arr[10]}`
                }
                if (arr[11]) {
                    obj.notes = `${arr[11]}`
                }
                return obj;
            })
            resolve(data);
        });
    }

    downloadTemplatefile() {
        let link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = 'assets/templates/deal_template.xlsx';
        link.download = 'deal-template.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}