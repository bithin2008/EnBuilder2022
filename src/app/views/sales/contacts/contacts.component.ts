import { Component, OnInit, TemplateRef, Input, DoCheck, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ExportToCsv } from "export-to-csv";
import * as moment from 'moment';
import { ExcelService } from '../../../services/excel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
    @Input() user_id: String;
    @Input() returnUrl: String;
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    contactList: any = [];
    contactList2: any = [];
    // territories: any = [];
    paginationObj: any = {};
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isClear: boolean = false;
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        contact_type: '',
        jamati: '',
        // region: '',
        country: '',
        state: '',
        // territory: '',
        searchText: '',
        month: '',
        startDate: '',
        endDate: '',
        list: []
    };
    openContactModalRef;
    regions: any = [{
        name: "North America",
        _id: "16vzyq9n0mr-6103ffdf-5875-4c68-8046-c71dede3793c"
    }];
    countries: any = [];
    states: any = [];
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
    public exportReportColumns: any = [];
    contactTypeSuggestions: any = [];
    public selectedFields: any = [];
    public csvExporter: any;
    contactListForExport: any = [];
    owners: any = [];
    exoprtBtnDisable: boolean = false;
    addressArray = ['Street1', 'Street2', 'Street3', 'City', 'State', 'Country', 'Zip'];
    userId: String = '';
    mobilePhone: FormGroup;
    workPhone: FormGroup;
    homePhone: FormGroup;
    selectedAll: boolean = false;
    isProcessBtnShow: boolean = false;
    lists: any = [];
    defaultGeoghraphyData: any[] = [];
    minDate: any;
    dateDiff: any;
    isDisabled: boolean = false;
    importFileModal: any;
    contactForm: FormGroup;
    fileDocument: any;
    fileChoosed: boolean = false;
    importRecords: any = [];
    importModalRef: BsModalRef;
    dropdownSettings: any = {};
    listData: any = [];
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private excelService: ExcelService,
        private ngModalService: NgbModal,
        private cdk: ChangeDetectorRef,
        private formBuilder: FormBuilder
    ) { }
    ngOnInit(): void {
        this.userId = this.user_id;
        // this.getTerritories();
        //  this.getContactTypes();
        // this.getDefaultGeoghraphy();
        this.getSavedFilterdata();

        this.contactForm = this.formBuilder.group({
            contacts: this.formBuilder.array([])
        });
        // this.getCountries('North America');
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
    }
    ngDoCheck() {
        // console.log(this.user_id);
        if (this.user_id != this.userId) {
            this.userId = this.user_id;
            this.getContactList();
        }

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
            this.getContactList();
        }

    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('contactFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            // console.log('filterData', filterData);
            // if (filterData.region) {
            //     this.filterForm.region = filterData.region;
            //     setTimeout(() => {
            //         this.getCountries(filterData.region);
            //     }, 1000);
            // } else {
            //     this.getCountries('');
            // }
            this.getCountries();
            if (filterData.country) {
                this.filterForm.country = filterData.country;
                setTimeout(() => {
                    this.getStates(filterData.country);
                }, 1500);
            } else {
                this.getStates('');
            }
            if (filterData.state) {
                this.filterForm.state = filterData.state;
            }
            // if (filterData.territory) {
            //     this.filterForm.territory = filterData.territory;
            // }
            if (filterData.jamati) {
                this.filterForm.jamati = filterData.jamati;
            }
            if (filterData.contact_type) {
                this.filterForm.contact_type = filterData.contact_type;
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
            if (filterData.month) {
                this.filterForm.month = filterData.month;
            }
            if (filterData.startDate) {
                this.filterForm.startDate = filterData.startDate;
            }
            if (filterData.endDate) {
                this.filterForm.endDate = filterData.endDate;
            }
            if (filterData.list) {
                this.filterForm.list = filterData.list;
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
            this.getContactList();
        }
        this.getLists();

    }

    ////FILTERS////
    filterByDateControle() {
        this.page = 1;
        this.changeDateControle();
    }

    filterByCustomDate() {
        this.page = 1;
        this.getContactList();
    }

    filterContactTypes(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.contactTypes.length; i++) {
            let contactTypes = this.contactTypes[i];
            if (contactTypes.value.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push({ name: contactTypes.value });
            }
        }
        this.contactTypeSuggestions = filtered;
    }

    // for export contacts
    openExportContact(template: TemplateRef<any>) {
        this.exoprtBtnDisable = false;
        this.selectedFields = [];
        this.exportReportColumns = [
            { name: "Type", isEnable: true, fieldNum: "field1" },
            { name: "##", isEnable: true, fieldNum: "field2" },
            { name: "First Name", isEnable: true, fieldNum: "field3" },
            { name: "Last Name", isEnable: true, fieldNum: "field4" },
            { name: "Display Name", isEnable: true, fieldNum: "field5" },
            { name: "Phone", isEnable: true, fieldNum: "field6" },
            { name: "Email", isEnable: true, fieldNum: "field7" },
            // { name: "Since", isEnable: true, fieldNum: "field8" },
            // { name: "Territory", isEnable: true, fieldNum: "field9" },
            { name: "Address", isEnable: true, fieldNum: "field8" },
            // { name: "Region", isEnable: true, fieldNum: "field11" },
            // { name: "Country", isEnable: true, fieldNum: "field12" },
            // { name: "State", isEnable: true, fieldNum: "field13" },
        ];
        this.exportReportColumns.forEach(element => {
            if (element.name == 'Address') {
                this.selectedFields = this.selectedFields.concat(this.addressArray);
            }
            else {
                this.selectedFields.push(element.name);
            }
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    selectFields(item, i) {
        if (item.isEnable) {
            if (item.name == 'Address') {
                this.selectedFields = this.selectedFields.concat(this.addressArray);
            }
            else {
                this.selectedFields.push(item.name);
            }
        }
        else {
            if (item.name == 'Address') {
                this.addressArray.forEach(address => {
                    let arrIndex = this.selectedFields.findIndex(element => element == address);
                    if (arrIndex > -1) {
                        this.selectedFields.splice(arrIndex, 1);
                    }
                });
            } else {
                let arrIndex = this.selectedFields.findIndex(element => element == item.name);
                if (arrIndex > -1) {
                    this.selectedFields.splice(arrIndex, 1);
                }
            }
        }
    }

    async exportContact() {
        this.exoprtBtnDisable = true;
        this.spinnerService.show();
        this.contactListForExport = [];
        let page = 1;
        let pageSize = 500;
        let totalPages = Math.ceil(this.paginationObj.total / pageSize);
        for (var i = 0; i < totalPages; i++) {
            let data = await this.getContactsForExport(page, pageSize);
            this.contactListForExport = this.contactListForExport.concat(data);
            page++;
        }
        let data = [];
        var options = {
            fieldSeparator: ",",
            quoteStrings: '"',
            decimalSeparator: ".",
            showLabels: true,
            showTitle: true,
            filename: "Contact_Report",
            title: "Contacts Report",
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: false,
            headers: this.selectedFields,
        };
        this.csvExporter = new ExportToCsv(options);
        this.contactListForExport.forEach(element => {
            if (element) {
                let reportObj: any = {};
                this.selectedFields.forEach((fieldName) => {
                    if (fieldName == "Type") {
                        let contact_type = [];
                        let value = '';
                        if (element.contact_type && element.contact_type.length > 0) {
                            element.contact_type.forEach(element => {
                                value = value ? value + `\n${element}` : element.trim();
                            });
                            contact_type.push(value);
                        }

                        reportObj.type = contact_type.length > 0 ? `${contact_type[0]}` : [];
                    }
                    if (fieldName == "##") {
                        reportObj._id = element._id;
                    }
                    if (fieldName == "First Name") {
                        reportObj.first_name = element.first_name || '';
                    }
                    if (fieldName == "Last Name") {
                        reportObj.last_name = element.last_name || '';
                    }
                    if (fieldName == "Display Name") {
                        reportObj.display_name = element.display_name || '';
                    }
                    if (fieldName == "Phone") {
                        if (element.phones && element.phones.length > 0) {
                            let keepGoing = true;
                            element.phones.forEach(phone => {
                                if (keepGoing) {
                                    if (!phone.is_inactive) {
                                        element.phones = {
                                            number: phone.formatted
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            element.phones = {
                                number: ''
                            }
                        }
                        reportObj.phone = element.phones.number ? element.phones.number : '';
                    }
                    if (fieldName == "Email") {
                        if (element.emails && element.emails.length > 0) {
                            let keepGoing = true;
                            element.emails.forEach(email => {
                                if (keepGoing) {
                                    if (!email.is_inactive) {
                                        element.emails = {
                                            email: email.email
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            element.emails = {
                                email: ''
                            }
                        }
                        reportObj.email = element.emails.email ? element.emails.email : '';
                    }
                    // if (fieldName == "Since") {
                    //     reportObj.since = moment(element.since).format('YYYY-MM-DD');
                    // }
                    // if (fieldName == "Territory") {
                    //     reportObj.territory = element.territory || '';
                    // }
                    if (element.addresses && element.addresses.length > 0) {
                        let keepGoing = true;
                        element.addresses.forEach(address => {
                            if (keepGoing) {
                                if (!address.is_inactive) {
                                    if (fieldName == 'Street1') {
                                        reportObj.street1 = address.street1 ? address.street1 : '';
                                    }
                                    if (fieldName == 'Street2') {
                                        reportObj.street2 = address.street2 ? address.street2 : '';
                                    }
                                    if (fieldName == 'Street3') {
                                        reportObj.street3 = address.street3 ? address.street3 : '';
                                    }
                                    if (fieldName == 'City') {
                                        reportObj.city = address.city ? address.city : '';
                                    }
                                    if (fieldName == 'State') {
                                        reportObj.state = address.state ? address.state : '';
                                    }
                                    if (fieldName == 'Country') {
                                        reportObj.country = address.country ? address.country : '';
                                    }
                                    if (fieldName == 'Zip') {
                                        reportObj.zip = address.zip ? address.zip : '';
                                    }
                                    keepGoing = false;
                                }
                            }
                        });
                    }
                    // if (fieldName == "Region") {
                    //   if (element.geography && element.geography.region)
                    //     reportObj.geography_region = element.geography.region;
                    //   else
                    //     reportObj.geography_region = '';
                    // }
                    // if (fieldName == "Country") {
                    //   if (element.geography && element.geography.country)
                    //     reportObj.geography_country = element.geography.country;
                    //   else
                    //     reportObj.geography_country = '';
                    // }
                    // if (fieldName == "State") {
                    //   if (element.geography && element.geography.state)
                    //     reportObj.geography_state = element.geography.state;
                    //   else
                    //     reportObj.geography_state = '';
                    // }
                });
                data.push(reportObj);
            }
        });
        this.spinnerService.hide();
        this.csvExporter.generateCsv(data);
        this.modalRef.hide();
    }
    getContactsForExport(page, pageSize) {
        return new Promise(resolve => {
            let url = `sales/contacts?page=${page}&pageSize=${pageSize}&sortby=${this.sortedtby}&sortOrder=${this.sortOrder}`;
            if (this.sortedtby)
                url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
            if (this.filterForm.contact_type)
                url = url + `&contact_type=${this.filterForm.contact_type}`;
            // if (this.filterForm.region)
            //     url = url + `&region=${this.filterForm.region}`;
            if (this.filterForm.country)
                url = url + `&country=${this.filterForm.country}`;
            // if (this.filterForm.territory)
            //     url = url + `&territory=${this.filterForm.territory}`;
            if (this.filterForm.state)
                url = url + `&state=${this.filterForm.state}`;
            if (this.filterForm.jamati)
                url = url + `&jamati=${this.filterForm.jamati}`;
            if (this.filterForm.searchText)
                url = url + `&searchText=${this.filterForm.searchText}`;
            this.webService.get(url).subscribe((response: any) => {
                if (response.success) {
                    let results = response.results && response.results ? response.results : [];
                    resolve(results);
                } else {
                    resolve({});
                }
            }, (error) => {
                console.log('error', error);
            });
        })
    }
    getContactList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `sales/contacts?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.userId)
            url = url + `&user=${this.userId}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.contact_type)
            url = url + `&contact_type=${this.filterForm.contact_type}`;
        // if (this.filterForm.region)
        //     url = url + `&region=${this.filterForm.region}`;
        if (this.filterForm.country)
            url = url + `&country=${this.filterForm.country}`;
        // if (this.filterForm.territory)
        //     url = url + `&territory=${this.filterForm.territory}`;
        if (this.filterForm.state)
            url = url + `&state=${this.filterForm.state}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        if (this.filterForm.month)
            url = url + `&start_date=${this.filterForm.startDate}&end_date=${this.filterForm.endDate}`;
        if (this.filterForm.list && this.filterForm.list.length > 0) {
            const values = this.filterForm.list.map((ele) => ele._id);
            const valueString = values.join();
            url = url + `&list=${valueString}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.contactList=[];
            if (response.success) {
                this.contactList = response.results;
                if(this.page >1 && response.results.length==0 && !response.pagination){
                    this.page = this.page > 1? this.page-1 :1;
                    this.getContactList()  
                } 
                if (this.contactList.length>0) {
                    this.contactList.forEach(item => {
                        if (item.phones && item.phones.length > 0) {
                            let keepGoing = true;
                            item.phones.forEach(phone => {
                                if (keepGoing) {
                                    if (!phone.is_inactive) {
                                        item.phones = {
                                            formatted: phone.formatted
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            item.phones = {
                                formatted: ''
                            }
                        }
                        if (item.emails && item.emails.length > 0) {
                            let keepGoing = true;
                            item.emails.forEach(email => {
                                if (keepGoing) {
                                    if (!email.is_inactive) {
                                        item.emails = {
                                            email: email.email
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            item.emails = {
                                email: ''
                            }
                        }
                    });
                }
                if (response.results2) {
                    this.contactList2 = response.results2;
                    this.contactList2.forEach(item => {
                        if (item.phones && item.phones.length > 0) {
                            let keepGoing = true;
                            item.phones.forEach(phone => {
                                if (keepGoing) {
                                    if (!phone.is_inactive) {
                                        item.phones = {
                                            number: phone.number
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            item.phones = {
                                number: ''
                            }
                        }
                        if (item.emails && item.emails.length > 0) {
                            let keepGoing = true;
                            item.emails.forEach(email => {
                                if (keepGoing) {
                                    if (!email.is_inactive) {
                                        item.emails = {
                                            email: email.email
                                        };
                                        keepGoing = false;
                                    }
                                }
                            });
                        } else {
                            item.emails = {
                                email: ''
                            }
                        }
                    });
                } else {
                    this.contactList2 = [];
                }
                if (response.pagination)
                    this.paginationObj = response.pagination;
                else
                    this.paginationObj = {
                        total: 0
                    };
            } else {
                this.contactList = [];
                this.contactList2 = [];
                this.paginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            console.log('error', error);
        });
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
        this.getContactList();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getContactList();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getContactList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.getContactList();
    }
    setPageSize() {
        this.page = 1;
        this.getContactList();
    }
    goToDetails(id) {
        this.router.navigate([`/sales/contact/${id}`], { queryParams: { return_url: this.returnUrl } });
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            contact_type: this.filterForm.contact_type,
            jamati: this.filterForm.jamati,
            // region: this.filterForm.region,
            country: this.filterForm.country,
            state: this.filterForm.state,
            // territory: this.filterForm.territory,
            month: this.filterForm.month,
            startDate: this.filterForm.startDate,
            endDate: this.filterForm.endDate,
            list: this.filterForm.list
        }
        localStorage.setItem('contactFilterData', JSON.stringify(data));
    }
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            contact_type: '',
            jamati: '',
            // region: '',
            country: '',
            state: '',
            // territory: '',
            searchText: '',
            month: '',
            startDate: '',
            endDate: '',
            list: []
        };
        this.isClear = false;
        this.isDisabled = true;
        this.getContactList();
    }

    getOwners() {
        let url = `owner`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.owners = response.results;
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
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
                this.router.navigate([`/sales/contact/${result._id}`], { queryParams: { return_url: this.returnUrl } });
            }
        }, (reason) => {
            console.log('reason', reason);
        })
    }


    // openAddContact(template: TemplateRef<any>) {
    //     const defaultRegion = this.defaultGeoghraphyData[0].region ? this.defaultGeoghraphyData[0].region : '';
    //     const defaultCountry = this.defaultGeoghraphyData[0].country ? this.defaultGeoghraphyData[0].country : ''
    //     const defaultState = this.defaultGeoghraphyData[0].state ? this.defaultGeoghraphyData[0].state : ''
    //     this.getCountries(defaultRegion);
    //     this.getStates(defaultCountry);

    //     // this.getOwners();
    //     this.formDetails = {
    //         contact_type: '',
    //         prefix: '',
    //         first_name: '',
    //         middle_name: '',
    //         last_name: '',
    //         suffix: '',
    //         display_name: '',
    //         salutation: '',
    //         family_salutation: '',
    //         personal_email: '',
    //         territory: '',
    //         geography: {
    //             region: defaultRegion,
    //             country: defaultCountry,
    //             state: defaultState
    //         }
    //     };
    //     if (defaultCountry) {
    //         this.setTerritory(defaultCountry);
    //     }
    //     this.mobilePhone = new FormGroup({
    //         mobile_phone: new FormControl('', [Validators.required])
    //     });
    //     this.workPhone = new FormGroup({
    //         work_phone: new FormControl('', [Validators.required])
    //     });
    //     this.homePhone = new FormGroup({
    //         home_phone: new FormControl('', [Validators.required])
    //     });
    //     this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    // }
    // addContact() {
    //     var error = 0;
    //     var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    //     if (!this.formDetails.contact_type) {
    //         this.toastr.warning('Please select contact type', 'Warning');
    //         return;
    //     }
    //     if (this.formDetails.contact_type == 'Individual') {
    //         if (!this.formDetails.first_name.trim()) {
    //             this.toastr.warning('Please enter first name', 'Warning');
    //             return;
    //         }
    //     }
    //     if (!this.formDetails.last_name.trim()) {
    //         this.toastr.warning('Please enter last name', 'Warning');
    //         return;
    //     }
    //     if (!this.formDetails.display_name.trim()) {
    //         this.toastr.warning('Please enter display name', 'Warning');
    //         return;
    //     }
    //     if (this.homePhone.value.home_phone) {
    //         if (this.homePhone.controls['home_phone'].invalid) {
    //             this.toastr.warning('Please enter valid home phone number', 'Warning');
    //             return;
    //         }
    //     }
    //     if (this.mobilePhone.value.mobile_phone) {
    //         if (this.mobilePhone.controls['mobile_phone'].invalid) {
    //             this.toastr.warning('Please enter valid mobile phone number', 'Warning');
    //             return;
    //         }
    //     }
    //     if (this.workPhone.value.work_phone) {
    //         if (this.workPhone.controls['work_phone'].invalid) {
    //             this.toastr.warning('Please enter valid work phone number', 'Warning');
    //             return;
    //         }
    //     }
    //     if (!this.formDetails.personal_email.trim()) {
    //         this.toastr.warning('Please enter personal email', 'Warning');
    //         return;
    //     }
    //     if (reg.test(this.formDetails.personal_email) == false) {
    //         this.toastr.warning('Please enter valid personal email', 'Warning');
    //         return;
    //     }
    //     if (this.formDetails.work_email) {
    //         if (reg.test(this.formDetails.work_email) == false) {
    //             this.toastr.warning('Please enter valid work email', 'Warning');
    //             return;
    //         } else if (this.formDetails.personal_email.trim() == this.formDetails.work_email.trim()) {
    //             this.toastr.warning('Work email and personal email can\'t be same', 'Warning');
    //             return;
    //         }
    //     }
    //     if (this.formDetails.geography.region == '') {
    //         this.toastr.warning('Please select region', 'Warning');
    //         return;
    //     }
    //     if (this.formDetails.geography.country == '') {
    //         this.toastr.warning('Please select country', 'Warning');
    //         return;
    //     }
    //     if (this.formDetails.geography.state == '') {
    //         this.toastr.warning('Please select state', 'Warning');
    //         return;
    //     }
    //     if (this.formDetails.territory == '') {
    //         this.toastr.warning('Please select territory', 'Warning');
    //         return;
    //     }
    //     let data: any = {};
    //     data.contact_type = [];
    //     this.formDetails.contact_type.forEach(element => {
    //         data.contact_type.push(element.name);
    //     });
    //     data.is_inactive = false;
    //     data.prefix = this.formDetails.prefix.trim();
    //     data.first_name = this.formDetails.first_name.trim();
    //     data.middle_name = this.formDetails.middle_name.trim();
    //     data.last_name = this.formDetails.last_name.trim();
    //     data.suffix = this.formDetails.suffix.trim();
    //     data.display_name = this.formDetails.display_name.trim();
    //     data.geography = this.formDetails.geography;
    //     data.salutation = this.formDetails.salutation.trim();
    //     data.family_salutation = this.formDetails.family_salutation.trim();
    //     this.territories.forEach(item => {
    //         if (item.name == this.formDetails.territory) {
    //             data.territory = item.name.trim();
    //             data.default_currency = item.currency.trim();
    //         }
    //     });
    //     if (!data.territory) {
    //         data.territory = '';
    //         data.default_currency = '';
    //     }
    //     data.addresses = [
    //         {
    //             type: "Home",
    //             is_inactive: false,
    //             street1: this.formDetails.street1 ? this.formDetails.street1.trim() : '',
    //             street2: this.formDetails.street2 ? this.formDetails.street2.trim() : '',
    //             street3: this.formDetails.street3 ? this.formDetails.street3.trim() : '',
    //             city: this.formDetails.city ? this.formDetails.city.trim() : '',
    //             state: this.formDetails.geography.state,
    //             state_code: "",
    //             zip: this.formDetails.zip ? this.formDetails.zip.trim() : '',
    //             zip_formatted: "",
    //             country: this.formDetails.geography.country
    //         }
    //     ];
    //     data.emails = [];
    //     if (this.formDetails.personal_email.trim()) {
    //         let obj = {
    //             type: "Personal",
    //             email: this.formDetails.personal_email.trim().toLowerCase(),
    //             html_supported: true,
    //             marketing: true,
    //             is_inactive: false
    //         }
    //         data.emails.push(obj);
    //     }
    //     if (this.formDetails.work_email) {
    //         let obj = {
    //             type: "Work",
    //             email: this.formDetails.work_email.trim().toLowerCase(),
    //             html_supported: true,
    //             marketing: true,
    //             is_inactive: false
    //         }
    //         data.emails.push(obj);
    //     }
    //     data.phones = [];
    //     if (this.formDetails.home_phone) {
    //         let objHome = {
    //             type: "Home",
    //             number: this.homePhone.value.home_phone.e164Number,
    //             formatted: this.homePhone.value.home_phone.nationalNumber,
    //             marketing: true,
    //             is_inactive: false
    //         }
    //         data.phones.push(objHome);
    //     }
    //     if (this.formDetails.mobile_phone) {
    //         let objMobile = {
    //             type: "Mobile",
    //             number: this.mobilePhone.value.mobile_phone.e164Number,
    //             formatted: this.mobilePhone.value.mobile_phone.nationalNumber,
    //             marketing: true,
    //             is_inactive: false
    //         }
    //         data.phones.push(objMobile);
    //     }
    //     if (this.formDetails.work_phone) {
    //         let objWork = {
    //             type: "Work",
    //             number: this.workPhone.value.work_phone.e164Number,
    //             formatted: this.workPhone.value.work_phone.nationalNumber,
    //             marketing: true,
    //             is_inactive: false
    //         }
    //         data.phones.push(objWork);
    //     }
    //     // if (this.formDetails.owner) {
    //     //   const foundId = this.owners.find(element => element._id == this.formDetails.owner);
    //     //   if (foundId) {
    //     //     data.owner_id = foundId._id;
    //     //     data.owner_name = foundId.firstName + ' ' + foundId.lastName;
    //     //   }
    //     // }
    //     console.log('data data', data);
    //     let url = `sales/contacts`;
    //     this.webService.post(url, data).subscribe((response: any) => {
    //         if (response.success) {
    //             if (response.status == 1) {
    //                 this.toastr.success(response.message, 'Success');
    //                 //this.getcontactList();
    //                 this.router.navigate([`/sales/contact/${response.result.row._id}`], { queryParams: { return_url: this.returnUrl } });
    //                 this.modalRef.hide();
    //             }
    //         } else {
    //             this.toastr.error(response.message, 'Error');
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }
    // setTerritory(country) {
    //     if (country == 'Canada') {
    //         this.formDetails.territory = 'Canada';
    //     }
    //     else if (country == 'USA') {
    //         this.formDetails.territory = 'USA';
    //     } else {
    //         this.formDetails.territory = 'International';
    //     }
    // }
    
    // for add to list
    selectAll() {
        for (var i = 0; i < this.contactList.length; i++) {
            this.contactList[i].selected = this.selectedAll;
        }
        this.showProcessBtn();
    }
    showProcessBtn() {
        var selected = 0;
        for (var i = 0; i < this.contactList.length; i++) {
            if (this.contactList[i].selected == true) {
                selected++;
            }
        }
        if (selected > 0) {
            this.isProcessBtnShow = true;
        } else {
            this.isProcessBtnShow = false;
        }
    }
    getLists() {
        let url = `sales/lists`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.lists = response.results && response.results.rows ? response.results.rows : [];
                this.listData = [];
                this.lists.forEach(element => {
                    let obj = {
                        value: element.name,
                        _id: element._id
                    }
                    this.listData.push(obj);
                });
            } else {
                this.lists = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getDefaultGeoghraphy() {
        let url = `sales/crm-settings?type=DEFAULT-GEOGRAPHY`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.defaultGeoghraphyData = response.results;
                // const defaultRegion = this.defaultGeoghraphyData[0].region ? this.defaultGeoghraphyData[0].region : '';
                // const defaultCountry = this.defaultGeoghraphyData[0].country ? this.defaultGeoghraphyData[0].country : ''
                // const defaultState = this.defaultGeoghraphyData[0].state ? this.defaultGeoghraphyData[0].state : ''

                // this.getRegions();

            } else {
                this.defaultGeoghraphyData = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openAddToList(template: TemplateRef<any>) {
        // this.getLists();
        let contactIds = [];
        for (var i = 0; i < this.contactList.length; i++) {
            if (this.contactList[i].selected == true) {
                contactIds.push(this.contactList[i]._id);
            }
        }
        this.formDetails = {
            list: '',
            contactIds: contactIds
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    }
    async addToList() {
        let error = 0;
        let data: any = {
            contactIds: this.formDetails.contactIds
        };
        if (this.formDetails.list == '') {
            error++;
            this.toastr.warning('Please select a list', 'Warning');
        } else {
            if (this.formDetails.list == 'newList') {
                if (!this.formDetails.name) {
                    error++;
                    this.toastr.warning('Please enter name', 'Warning');
                } else {
                    let listData: any = await this.addLists({ name: this.formDetails.name });
                    if (listData._id) {
                        data.list = listData._id;
                    } else {
                        error++;
                        this.toastr.error('Could not create list', 'Error');
                    }
                }
            } else {
                data.list = this.formDetails.list;
            }
        }
        if (error == 0) {
            let url = `sales/add-to-list`;
            this.webService.post(url, data).subscribe((response: any) => {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getContactList();
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
    addLists(data) {
        return new Promise(resolve => {
            let url = `sales/lists`;
            this.webService.post(url, data).subscribe((response: any) => {
                if (response.success) {
                    resolve(response.result.row);
                } else {
                    resolve({});
                }
            }, (error) => {
                console.log('error', error);
            });
        });
    }
    // for territories
    // getTerritories() {
    //     let url = `sales/territories`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         if (response.success) {
    //             this.territories = response.results;
    //         } else {
    //             this.territories = [];
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }
    // for regions
    // getRegions() {
    //     let url = `sales/geography?type=region`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         console.log(response);
    //         this.spinnerService.hide();
    //         if (response.success && response.status == 1) {
    //             this.regions = response.results;
    //         } else {
    //             this.regions = [];
    //         }
    //     }, (error) => {
    //         console.log('error', error);
    //     });
    // }

    getCountries() {
        this.countries = [];
        this.states = [];
        // const foundId = this.regions.find(element => element.name == region);
        let url = `sales/geography?type=country`;
        url = url + `&parent=16vzyq9n0mr-6103ffdf-5875-4c68-8046-c71dede3793c,16xfyhd3nt1-3f769db2-6390-4f55-a67e-19284f98220f`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.countries = response.results;
            } else {
                this.countries = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getStates(country) {
        this.states = [];
        const foundId = this.countries.find(element => element.name == country);
        let url = `sales/geography?type=state`;
        if (foundId) {
            url = url + `&parent=${foundId._id}`;
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success && response.status == 1) {
                    this.states = response.results;
                } else {
                    this.states = [];
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }

    //FOR IMPORT FUNCTIONALITY
    downloadTemplatefile() {
        let link = document.createElement('a');
        link.setAttribute('type', 'hidden');
        link.href = 'assets/templates/contact-records-format.xlsx';
        link.download = 'contact-template.xlsx';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    openImportContact(template: TemplateRef<any>) {
        this.importFileModal = {
            file: '',
            unique_field:'Display Name'
        };
        this.fileChoosed = false;
        this.fileDocument = null;
        this.contactForm.patchValue({
            contacts: []
        })
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

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

    async  onImportContact(template: TemplateRef<any>) {

        if (!this.fileDocument) {
            this.toastr.warning('Please select file', 'Warning');
            return;
        }
        this.importRecords = [];
        this.fileChoosed = true;
        this.cdk.detectChanges();
        this.excelService.importFromFile(this.fileDocument).then((res) => {
            const records: any = res;
            this._handleReaderLoaded(template, records);
        })
            .catch((error) => {
                this.fileChoosed = false;
                this.spinnerService.hide();
                this.toastr.warning('Something went wrong ! please upload right file', 'Error');

            });
    }

    get getContacts(): FormArray {
        return this.contactForm.get('contacts') as FormArray;
    }
    appendContactGroup(item) {
        this.getContacts.push(this.createContactGroup(item));
    }
    clearModelBulkEditModal() {
        this.getContacts.clear();
    }

    createContactGroup(item) {
        // console.log('item', item);
        return this.formBuilder.group({
            first_name: [item.first_name ? item.first_name.trim() : ''],//, [Validators.required]
            last_name: [item.last_name ? item.last_name.trim() : ''], //, [Validators.required]
            middle_name: [item.middle_name ? item.middle_name.trim() : ''],
            display_name: [item.display_name ? item.display_name.trim() : '', [Validators.required]],
            contact_type: [item.contact_type ? item.contact_type : ''],
            mobile: [item.mobile ? item.mobile.trim() : ''],
            email: [item.email ? item.email.trim() : ''],
            // region: [item.region ? item.region : ''],
            country: [item.country ? item.country.trim() : ''],
            country_code: [],
            state: [item.state ? item.state.trim() : ''],
            street1: [item.street1 ? item.street1.trim() : ''],
            street2: [item.street2 ? item.street2.trim() : ''],
            street3: [item.street3 ? item.street3.trim() : ''],
            city: [item.city ? item.city.trim() : ''],
            zip: [item.zip ? item.zip.trim() : ''],
            // territory: [item.territory ? item.territory.trim() : ''],
            state_code: [''],
            type: ['Home'],
            zip_formatted: [''],
            is_inactive: [false]
        })
    }

    //HANDLING RECORDS AFTER IMPORT EXCEL FILE
    async _handleReaderLoaded(template, records) {
        const filteredList = records.filter((element) => element.length > 0);
        const importedData = filteredList.splice(0, 1);
        // console.log('importedData', importedData);
        this.getContacts.clear();
        this.filterItems(filteredList).then((res) => {
            this.importRecords = res;
            this.importRecords.forEach(contact => { //CREATNG GROUP CONTROL FOR EACH RECORD
                this.appendContactGroup(contact);
            });
            // console.log('importRecords', this.importRecords);
            if(this.importFileModal.unique_field=='Email'){
                let emails = this.importRecords.map((ele)=>ele.email);
                let data={
                    unique_field:'email',
                    records:emails
                }
                this.getDuplicateRecords(data);
            }
            else if(this.importFileModal.unique_field=='Display Name'){
                let displayNames = this.importRecords.map((ele)=>ele.display_name);
                let data={
                    unique_field:'display_name',
                    records:displayNames
                }
                this.getDuplicateRecords(data);

            }
            
            this.modalRef.hide();
            this.fileChoosed = false;
            this.importModalRef = this.modalService.show(template, { class: 'custom-wide-modal modal-xl', backdrop: 'static' });
        })
            .catch((error) => {
                console.log('error', error);
                this.fileChoosed = false;
                this.spinnerService.hide();
                this.toastr.error('Something went wrong ! please upload correct file', 'Error');
            })

    }


    getDuplicateRecords(data){
        let url = `sales/check-duplicate-contacts`; 
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    let results = response.results ? response.results :[];     
                    if(data.unique_field =='email'){
                        // let emails=results.map((record)=>record.emails[0].email);
                        let emails=[];
                        results.forEach(element => {
                            let useremails=element.emails.map((record)=>record.email);
                            emails=[...emails, ...useremails];
                        });

                        this.importRecords.forEach((element,index) => {
                            if(emails.indexOf(element.email)!=-1){
                                this.getContacts.at(index).get('email').setErrors({'incorrect':true});           
                                }
                        });
                    }
                    else if(data.unique_field =='display_name'){
                        let displayNames=results.map((record)=>record.display_name);
                        this.importRecords.forEach((element,index) => {
                            if(displayNames.indexOf(element.display_name)!=-1){
                                this.getContacts.at(index).get('display_name').setErrors({'incorrect':true});           
                                }
                        });
                    }             
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

    filterItems(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map(arr => {
                let obj: any = {};
                if (arr[0]) {
                    obj.contact_type = `${arr[0]}`
                }
                if (arr[1]) {
                    obj.first_name = `${arr[1]}`
                }
                if (arr[2]) {
                    obj.last_name = `${arr[2]}`
                }
                if (arr[3]) {
                    obj.middle_name = `${arr[3]}`
                }
                if (arr[4]) {
                    obj.display_name = `${arr[4]}`
                }
                if (arr[5]) {
                    obj.email = `${arr[5]}`
                }
                if (arr[6]) {
                    obj.mobile = `${arr[6]}`
                }
                if (arr[7]) {
                    obj.street1 = `${arr[7]}`
                }
                if (arr[8]) {
                    obj.street2 = `${arr[8]}`
                }
                if (arr[9]) {
                    obj.street3 = `${arr[9]}`
                }
                if (arr[10]) {
                    obj.city = `${arr[10]}`
                }
                if (arr[11]) {
                    obj.zip = `${arr[11]}`
                }
                // if (arr[12]) {
                //     obj.region = `${arr[12}`]
                // }
                if (arr[12]) {
                    obj.state = `${arr[12]}`
                }
                if (arr[13]) {
                    obj.country = `${arr[13]}`
                }
                // if (arr[15]) {
                //     obj.territory = arr[15]
                // }
                return obj;
            })
            resolve(data);
        });
    }


    checkDuplicateRecords(){
    let data={
        unique_field:'',
        records:[]
    }
    let contacts= this.getContacts.getRawValue();
    if(this.importFileModal.unique_field=='Email'){
        let records = contacts.map((ele)=>ele.email);
        data.unique_field = 'email';
        data.records = records;
        
    }
    else if(this.importFileModal.unique_field=='Display Name'){
        let displayNames = contacts.map((ele)=>ele.display_name);
        data.unique_field = 'display_name';
        data.records = displayNames;   
    }
    if(data.records.length>0){
        this.checkDuplicateRecordsAPI(data);
    }
    else{
        this.addImportedFinalRecord();
    }
    }

    checkDuplicateRecordsAPI(data){
    this.spinnerService.show();
    let url = `sales/check-duplicate-contacts`; 
    this.webService.post(url, data).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.is_valid_session) {
            if (response.status == 1) {
                let results = response.results ? response.results :[];  
                if(results && results.length>0){
                    let contacts= this.getContacts.getRawValue();
                    if(data.unique_field =='email'){
                        let emails=[];
                        results.forEach(element => {
                            let useremails=element.emails.map((record)=>record.email);
                            emails=[...emails, ...useremails];
                        });
                        contacts.forEach((element,index) => {
                            if(emails.indexOf(element.email)!=-1){
                                this.getContacts.at(index).get('email').setErrors({'incorrect':true});           
                            }
                        });
                    }
                    else if(data.unique_field =='display_name'){
                        let displayNames=results.map((record)=>record.display_name);
                        contacts.forEach((element,index) => {
                            if(displayNames.indexOf(element.display_name)!=-1){
                                this.getContacts.at(index).get('display_name').setErrors({'incorrect':true});           
                            }
                        });
                    }   
                }
                else{
                    this.addImportedFinalRecord();
                }            
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

    //API CALL FOR VALIDATED IMPORTED RECORDS
    addImportedFinalRecord() {
        this.filterContacts(this.contactForm.value.contacts).then((filtereContacts: any) => {
            if (filtereContacts && filtereContacts.length > 0) {
                let allContacts = [];
                filtereContacts.forEach(contact => {
                    let data: any = {};
                    data.contact_type = [];
                    if (contact.contact_type) {
                        if ((contact.contact_type.indexOf('/')) != -1) {
                            let contact_types = contact.contact_type.split('/');
                            let trimedContacts = [];
                            contact_types.forEach((view) => {
                                trimedContacts.push(view.trim());

                            });
                            contact.contact_type = trimedContacts;
                        }
                        else if ((contact.contact_type.indexOf(',')) != -1) {
                            let contact_types = contact.contact_type.split(',');
                            let trimedContacts = [];
                            contact_types.forEach((view) => {
                                trimedContacts.push(view.trim());

                            });
                            contact.contact_type = trimedContacts;
                        }
                        else {
                            let contact_types = contact.contact_type.split(',');
                            contact.contact_type = contact_types.length > 0 ? contact_types : [];
                        }
                    }
                    data.contact_type = contact.contact_type

                    data.is_inactive = false;
                    // data.prefix = contact.prefix.trim();
                    data.first_name = contact.first_name ? contact.first_name.trim() : '';
                    data.middle_name = contact.middle_name ? contact.middle_name.trim() : '';
                    data.last_name = contact.last_name ? contact.last_name.trim() : '';
                    // data.suffix = contact.suffix;
                    data.display_name = contact.display_name ? contact.display_name.trim() : '';
                    data.geography = {
                        state: contact.state ? contact.state.trim() : '',
                        // region: contact.region ? contact.region : '',
                        country: contact.country ? contact.country.trim() : '',
                    };
                    // data.salutation = contact.salutation.trim();
                    // data.family_salutation = contact.family_salutation.trim();
                    // this.territories.forEach(item => {
                    //     if (item.name == contact.territory) {
                    //         data.territory = item.name ? item.name.trim() : '';
                    //         data.default_currency = item.currency ? item.currency.trim() : '';
                    //     }
                    // });
                    if (!data.territory) {
                        // data.territory = '';
                        data.default_currency = '';
                    }
                    data.addresses = [
                        {
                            type: "Home",
                            is_inactive: false,
                            street1: contact.street1 ? contact.street1.trim() : '',
                            street2: contact.street2 ? contact.street2.trim() : '',
                            street3: contact.street3 ? contact.street3.trim() : '',
                            city: contact.city ? contact.city.trim() : '',
                            state: contact.state?contact.state.trim():'',
                            state_code: "",
                            zip: contact.zip ? contact.zip.trim() : '',
                            zip_formatted: "",
                            country: contact.country ? contact.country.trim() : ''
                        }
                    ];
                    data.emails = [];
                    // data.emails = [];
                    if (contact.email && contact.email.trim()) {
                        let obj = {
                            type: "Personal",
                            email: contact.email.trim().toLowerCase(),
                            html_supported: true,
                            marketing: true,
                            is_inactive: false
                        }
                        data.emails.push(obj);
                    }
                    data.phones = [];
                    if (contact.mobile) {
                        let mobileNo = `${contact.mobile}`;
                        mobileNo = mobileNo.replace(/[-]/g, '');
                        mobileNo = mobileNo.trim();
                        if (mobileNo.length == 10) {
                            mobileNo = `1${mobileNo}`;
                        }
                        let e164Number = (mobileNo.indexOf('+') && mobileNo.indexOf('+') != 0) ? `+${mobileNo}` : `${mobileNo}`; //+
                        let nationalNumber = `${mobileNo}`; //()
                        let obj = {
                            type: "Mobile",
                            number: e164Number,
                            formatted: nationalNumber,
                            marketing: true,
                            is_inactive: false
                        }
                        data.phones.push(obj);
                    }
                    allContacts.push(data);
                })
                // console.log('filtereContacts', allContacts);
                // API call for sending records to server
                this.spinnerService.show();
                let data = { 'records': allContacts };
                let url = `sales/contacts-import`; //for unit unit-import
                this.webService.post(url, data).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.importRecords = [];
                            this.importModalRef.hide();
                            this.getContacts.clear();
                            this.getContactList();
                            this.toastr.success(response.message, 'Success');
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
        }).catch((error) => {
            console.log('error', error);
            this.spinnerService.hide();
            this.toastr.warning('Sorry something went wrong', 'Error');

        });
    }

    //TOTAL 21 entry
    filterContacts(filteredList) {
        return new Promise((resolve, reject) => {
            let data = filteredList.map((key) => {
                let obj: any = {};
                if (key.contact_type) {
                    obj.contact_type = key.contact_type
                }
                if (key.first_name) {
                    obj.first_name = key.first_name;
                }
                if (key.last_name) {
                    obj.last_name = key.last_name;
                }
                if (key.middle_name) {
                    obj.middle_name = key.middle_name;
                }
                if (key.display_name) {
                    obj.display_name = key.display_name;
                }
                if (key.mobile) {
                    obj.mobile = key.mobile;
                }
                if (key.email) {
                    obj.email = key.email;
                }
                if (key.street1) {
                    obj.street1 = key.street1
                }
                if (key.street2) {
                    obj.street2 = key.street2
                }
                if (key.street3) {
                    obj.street3 = key.street3
                }
                if (key.city) {
                    obj.city = key.city
                }
                if (key.zip) {
                    obj.zip = key.zip
                }
                // if (key.region) {
                //     obj.region = key.region
                // }
                if (key.state) {
                    obj.state = key.state
                }
                if (key.country) {
                    obj.country = key.country
                }
                // if (key.territory) {
                //     obj.territory = key.territory
                // }
                if (key.type) {
                    obj.type = key.type
                }
                if (key.zip_formatted) {
                    obj.zip_formatted = key.zip_formatted
                }
                if (key.is_inactive) {
                    obj.is_inactive = key.is_inactive
                }
                if (key.state_code) {
                    obj.state_code = key.state_code
                }
                if (key.country_code) {
                    obj.country_code = key.country_code
                }
                return obj;

            })
            resolve(data);
        });
    }

    onItemSelect() {
        this.page = 1;
        this.getContactList();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getContactList();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        this.getContactList();
    }

}
