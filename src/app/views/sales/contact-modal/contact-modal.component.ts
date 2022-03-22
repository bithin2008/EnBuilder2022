import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

@Component({
    selector: 'app-contact-modal',
    templateUrl: './contact-modal.component.html',
    styleUrls: ['./contact-modal.component.css']
})
export class ContactModalComponent implements OnInit {
    mobilePhone: FormGroup;
    workPhone: FormGroup;
    homePhone: FormGroup;
    formDetails: any = {};
    @Input() data;
    // territories: any[] = [];
    regions: any = [{
        name: "North America",
        _id: "16vzyq9n0mr-6103ffdf-5875-4c68-8046-c71dede3793c"
    }];
    countries: any = [];
    states: any = [];
    defaultGeoghraphyData: any[] = [];
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    autosearchText: any = '';
    contactList: any = [];
    contactTypeSuggestions: any = [];
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
    dropdownSettings: any = {};
    constructor(
        private webService: WebService,
        private toastr: ToastrService,
        public activeModal: NgbActiveModal,
        private spinnerService: Ng4LoadingSpinnerService,

    ) { }

    ngOnInit(): void {
        // this.getTerritories();
        this.mobilePhone = new FormGroup({
            mobile_phone: new FormControl('', [Validators.required])
        });
        this.workPhone = new FormGroup({
            work_phone: new FormControl('', [Validators.required])
        });
        this.homePhone = new FormGroup({
            home_phone: new FormControl('', [Validators.required])
        });
        this.formDetails = {
            contact_type: this.data && this.data.conatctType ? [{ name: this.data.conatctType }] : '',
            prefix: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            suffix: '',
            display_name: '',
            salutation: '',
            family_salutation: '',
            personal_email: '',
            // territory: '',
            geography: {
                // region: '',
                country: '',
                state: ''
            }
        };

        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
        this.getCountries();
        // this.getRegions().toPromise()
        //     .then((response) => {
        //         this.spinnerService.hide();
        //         if (response.success && response.status == 1) {
        //             this.regions = response.results;
        //             this.getDefaultGeoghraphy();
        //         } else {
        //             this.regions = [];
        //         }
        //     })
        //     .catch((error) => {
        //         console.log('error', error);
        //     });



    }
    addContact() {
        var error = 0;
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        // if (!this.formDetails.contact_type) {
        //     this.toastr.warning('Please select contact type', 'Warning');
        //     return;
        // }
        // if (this.formDetails.contact_type == 'Individual') {
        //     if (!this.formDetails.first_name.trim()) {
        //         this.toastr.warning('Please enter first name', 'Warning');
        //         return;
        //     }
        // }
        // if (!this.formDetails.first_name.trim()) {
        //     this.toastr.warning('Please enter first name', 'Warning');
        //     return;
        // }
        // if (!this.formDetails.last_name.trim()) {
        //     this.toastr.warning('Please enter last name', 'Warning');
        //     return;
        // }
        if (!this.formDetails.display_name || !this.formDetails.display_name.trim()) {
            this.toastr.warning('Please enter display name', 'Warning');
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
        // if (!this.formDetails.personal_email.trim()) {
        //     this.toastr.warning('Please enter personal email', 'Warning');
        //     return;
        // }
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
        // if (this.formDetails.geography.region == '') {
        //     this.toastr.warning('Please select region', 'Warning');
        //     return;
        // }
        // if (this.formDetails.geography.country == '') {
        //     this.toastr.warning('Please select country', 'Warning');
        //     return;
        // }
        // if (this.formDetails.geography.state == '') {
        //     this.toastr.warning('Please select state', 'Warning');
        //     return;
        // }
        // if (this.formDetails.territory == '') {
        //     this.toastr.warning('Please select territory', 'Warning');
        //     return;
        // }
        let data: any = {};
        data.contact_type = [];
        if (this.formDetails.contact_type) {
            this.formDetails.contact_type.forEach(element => {
                data.contact_type.push(element.name);
            });
        }
        data.is_inactive = false;
        data.prefix = this.formDetails.prefix?this.formDetails.prefix.trim():'';
        data.first_name = this.formDetails.first_name?this.formDetails.first_name.trim():'';
        data.middle_name = this.formDetails.middle_name?this.formDetails.middle_name.trim():'';
        data.last_name = this.formDetails.last_name?this.formDetails.last_name.trim():'';
        data.suffix = this.formDetails.suffix.trim()?this.formDetails.suffix.trim():'';
        data.display_name = this.formDetails.display_name.trim();
        data.geography = this.formDetails.geography;
        data.salutation = this.formDetails.salutation?this.formDetails.salutation.trim():'';
        data.family_salutation = this.formDetails.family_salutation?this.formDetails.family_salutation.trim():'';
        // this.territories.forEach(item => {
        //     if (item.name == this.formDetails.territory) {
        //         data.territory = item.name.trim();
        //         data.default_currency = item.currency.trim();
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
                street1: this.formDetails.street1 ? this.formDetails.street1.trim() : '',
                street2: this.formDetails.street2 ? this.formDetails.street2.trim() : '',
                street3: this.formDetails.street3 ? this.formDetails.street3.trim() : '',
                city: this.formDetails.city ? this.formDetails.city.trim() : '',
                state: this.formDetails.geography.state,
                state_code: "",
                zip: this.formDetails.zip ? this.formDetails.zip.trim() : '',
                zip_formatted: "",
                country: this.formDetails.geography.country
            }
        ];
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

        // console.log('data data', data);
        let url = `sales/contacts`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    //this.getcontactList();
                    if (response.result && response.result.row) {
                        let contactDetails: any = {};
                        contactDetails = {
                            addresses: response.result.row.addresses,
                            // territory: response.result.row.territory,
                            contact_type: response.result.row.contact_type,
                            emails: response.result.row.emails,
                            geography: response.result.row.geography,
                            phones: response.result.row.phones,
                            _id: response.result.row._id,
                            last_name: response.result.row.last_name,
                            first_name: response.result.row.first_name,
                            middle_name: response.result.row.middle_name,
                            display_name: response.result.row.display_name
                        }
                        this.activeModal.close(contactDetails);
                    }
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    // setTerritory(country) {
    //     if (country == 'Canada') {
    //         this.formDetails.territory = 'Canada';
    //     }
    //     else if (country == 'USA') {
    //         this.formDetails.territory = 'USA';
    //     }
    //     else if (!country) {
    //         this.formDetails.territory = '';
    //     }
    //     else {
    //         this.formDetails.territory = 'International';
    //     }
    // }


    getDefaultGeoghraphy() {
        let url = `sales/crm-settings?type=DEFAULT-GEOGRAPHY`;
        this.webService.get(url).subscribe(async (response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.defaultGeoghraphyData = response.results;
                // const defaultRegion = this.defaultGeoghraphyData[0].region ? this.defaultGeoghraphyData[0].region : '';
                const defaultCountry = this.defaultGeoghraphyData[0].country ? this.defaultGeoghraphyData[0].country : ''
                const defaultState = this.defaultGeoghraphyData[0].state ? this.defaultGeoghraphyData[0].state : ''
                this.countries = [];
                this.states = [];
                const foundId = this.regions.find(element => element.name == 'North America');
                if (foundId) {
                    this.getDefaultCountry(foundId).toPromise().then((response) => {
                        // console.log('getDefaultCountry', response);
                        if (response.success && response.status == 1) {
                            this.countries = response.results;
                            this.getStates(defaultCountry);
                        } else {
                            this.countries = [];
                        }
                    })
                        .catch((error) => {
                            console.log('error', error);
                        });
                    ;
                }
                else {
                    this.formDetails.geography.country = '';
                    this.formDetails.geography.state = '';
                    // this.formDetails.territory = ''

                }
                //    this.getCountries(defaultRegion);
                // this.getOwners();
                this.formDetails.geography = {
                    // region: defaultRegion,
                    country: defaultCountry,
                    state: defaultState
                };
                if (defaultCountry) {
                    // this.setTerritory(defaultCountry);
                }

            } else {
                this.defaultGeoghraphyData = [];
            }
        }, (error) => {
            console.log('error', error);
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
    //     return this.webService.get(url);
    // }
    getDefaultCountry(foundId) {
        let url = `sales/geography?type=country`;
        url = url + `&parent=${foundId._id}`;
        return this.webService.get(url);
    }
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
        // }
        // else {
        //     this.formDetails.geography.country = '';
        //     this.formDetails.geography.state = '';
        //     // this.formDetails.territory = ''
        // }
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
        else {
            this.formDetails.geography.state = '';
        }
    }

    onClose(data) {
        this.activeModal.close(data);
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

    populateDisplayName() {
        this.formDetails.display_name = `${this.formDetails.prefix || ''} ${this.formDetails.first_name || ''} ${this.formDetails.last_name || ''} ${this.formDetails.suffix || ''}`.trim();
        this.formDetails.salutation = `${this.formDetails.prefix || ''} ${this.formDetails.first_name || ''} ${this.formDetails.last_name || ''} ${this.formDetails.suffix || ''}`.trim();
    }
}
