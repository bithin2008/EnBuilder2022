import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { AutoComplete } from 'primeng/autocomplete';
import { environment } from '../../../../environments/environment';
import { InventoryModalComponent } from '../inventory-modal/inventory-modal.component';
import { Router } from '@angular/router';
import { fromEvent, Subject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
    selector: 'app-create-deal-modal',
    templateUrl: './create-deal-modal.component.html',
    styleUrls: ['./create-deal-modal.component.css']
})
export class CreateDealModalComponent implements OnInit {
    formDetails: any = {
        contact_name: [],
        project_id: ''
    };
    @Input() data: any;
    contactList: any = [];
    autosearchText: any = '';
    modalRef: BsModalRef;
    openContactModalRef;
    checkInventoryModalRef;
    unitList: any = [];
    isUnitAvailable: boolean = false;
    unitsSoldOut: boolean = false;
    isSalesPriceAvailable: boolean = true;
    selectedProject: any;
    isSearching: boolean = false;
    depositList: any[] = [];
    projectList: any[] = [];
    disableUnit: boolean = true;
    private modelChanged: Subject<string> = new Subject<string>();
    private subscription: Subscription;
    depositInfo:any[]=[];
    extraData:any=null;
    @ViewChild('autoCompleteObject', { static: false }) public autoCompleteObject: AutoComplete;

    constructor(
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private ngModalService: NgbModal,
        private router: Router,
        public activeModal: NgbActiveModal
    ) { }

    ngOnInit(): void {
        this.getProjectList();
        if (this.data && this.data.contact && this.data.contact.length > 0) {
            this.contactList = this.data.contact;
            this.extraData=this.data.extra;
            this.filterContactList();
            let contact_names = [...this.formDetails.contact_name];
            this.contactList.forEach(new_contact => {
                // let contact = this.data.contact.find((ele) => new_contact._id == ele._id);
                // if (contact) {
                if (this.formDetails.contact_name.length == 0) {
                    this.formDetails.contact_name = [];
                    this.formDetails.contact_name.push(new_contact);
                }
                else {
                    // this.formDetails.contact_name = [...contact_names];
                    this.formDetails.contact_name.push(new_contact);

                }
                // console.log('contactList', this.formDetails.contact_name);
                // }
            });
            if (this.autoCompleteObject) {
                this.autoCompleteObject.focusInput();
            }
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

    searchAuto(event) {
        this.autosearchText = event.query;
        this.getContactList();
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

    getProjectList() {
        this.spinnerService.show();
        let url = `sales/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                // let selectedProject = this.projectList.find((element) => element._id == this.filterForm.project_id);
                // if (selectedProject) {
                //     this.getFloorList(selectedProject.no_of_floors ? selectedProject.no_of_floors : 0);
                // }
                // else {
                //     this.floorList = this.numberFields;
                // }
            }
        }, (error) => {
            console.log('error', error);
        });
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

            }
        }, (reason) => {
            console.log('reason', reason);
        })
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

    unitInputChanged(value) {
        this.modelChanged.next(value);
        this.formDetails.deposit_structure = '';
        this.depositInfo = [];
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

    //TO GET DEPOSITS
    getDeposit() {
        this.spinnerService.show();
        let url = `sales/deposit-structures?project_id=${this.formDetails.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.depositList = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

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
        let worksheetId = '';
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
            if (element.person_id) {
                contact.person_id = element.person_id;
            }
            if (element.worksheet_id) {
                worksheetId = element.worksheet_id;
            }
            purchaser.push(contact);
        })


        let selectedDeposit = this.depositList.find((element) => element._id == this.formDetails.deposit_structure);
        let data :any= {
            deal_type: this.formDetails.deal_type ? this.formDetails.deal_type :'',
            unit_id: this.formDetails.unit_id,
            deposit_structure_def: selectedDeposit ? selectedDeposit.deposits : [],
            deposit_structure_id: this.formDetails.deposit_structure
        }
        if (worksheetId) {
            data['worksheet_id'] = worksheetId;
            if(this.extraData){
                if(this.extraData.agent){
                    data['brokers'] = [];
                    let newBroker: any = {
                        email: this.extraData.agent.email ? this.extraData.agent.email : '',
                        phone: (this.extraData.agent.mobile && this.extraData.agent.mobile.number) ? this.extraData.agent.mobile.number : '',
                        broker_name: `${this.extraData.agent.first_name} ${this.extraData.agent.last_name}`,
                        broker_id: this.extraData.agent.contact_id
                    }
                    data.brokers.push(newBroker);
                }
                if(this.extraData.solicitor){
                    let addresses= [
                        {
                            "type": "Home",
                            "is_inactive": false,
                            "street1": this.extraData.solicitor.address1|| '',
                            "street2": this.extraData.solicitor.address2 || '',
                            "street3": '',
                            "city": this.extraData.solicitor.city || '' ,
                            "state": this.extraData.solicitor.province || '',
                            "state_code": '',
                            "zip": this.extraData.solicitor.zip || '',
                            "zip_formatted": '',
                            "country": this.extraData.solicitor.country || ''
                        }
                    ];
                    let emails= [
                        {
                            "type": "Personal",
                            "email": this.extraData.solicitor.email,
                            "html_supported": true,
                            "marketing": true,
                            "is_inactive": false
                        }
                    ]
                    let phones= [
                        {
                            "type": "Mobile",
                            "number": this.extraData.solicitor.mobile.number,
                            "formatted": this.extraData.solicitor.mobile.formatted,
                            "marketing": true,
                            "is_inactive": false
                        },
                    ]
                    let geography= {
                        "country": this.extraData.solicitor.country || '',
                        "state":  this.extraData.solicitor.province || ''
                    }
                    let newSolicitor = {
                        addresses: addresses,
                        contact_type: this.extraData.solicitor.contact_type ||['Solicitor'],
                        emails:emails,
                        geography: geography,
                        phones: phones,
                        display_name: `${this.extraData.solicitor.first_name} ${this.extraData.solicitor.last_name}`,
                        first_name: this.extraData.solicitor.first_name,
                        last_name: this.extraData.solicitor.last_name,
                        middle_name: this.extraData.solicitor.middle_name,
                        _id: this.extraData.solicitor.contact_id
                    };
                    data['solicitor'] = newSolicitor;

                }
            }
        }
        data['purchasers'] = purchaser;
        data['stage'] = 'NEW';
        console.log('data=>>', data);
        let url = `sales/deals`;
        this.spinnerService.show();
        let response = await this.webService.post(url, data).toPromise();
        if (response && response.result && response.result.row) {
            this.addDepositDeal(response.result.row);
        }
        else {
            this.spinnerService.hide();
            this.activeModal.close({ response: false });
            this.toastr.error('failed to create deal', 'Error');
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
        }

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
                        object['amount'] = Math.round((deposit.value / 100) * selectedUnit.sales_price);
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
                    this.toastr.success(response.message, 'Success');
                    this.activeModal.close({ response: dealDetails });
                }
            } else {
                this.toastr.error(response.message, 'Error');
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
                        object['amount'] = Math.round((deposit.value / 100) * dealDetails.unit.sales_price);
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
                    if (deposit.days) { //adding initiate date in deposit days
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
        return deposits;
    }

}
