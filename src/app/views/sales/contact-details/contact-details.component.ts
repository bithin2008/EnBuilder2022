import { Component, OnInit, TemplateRef, Input, DoCheck, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { environment } from "../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import * as moment from 'moment';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateDealModalComponent } from '../create-deal-modal/create-deal-modal.component';

@Component({
    selector: 'app-contact-details',
    templateUrl: './contact-details.component.html',
    styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent implements OnInit {
    separateDialCode = false;
    dealDetailsObj: any = {
        deals: []
    };
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    contactId: any;
    contactDetails: any = {};
    regions: any = [{
        name: "North America",
        _id: "16vzyq9n0mr-6103ffdf-5875-4c68-8046-c71dede3793c"
    }];
    countries: any = [];
    lists: any = [];
    states: any = [];
    formDetails: any = {};
    territories: any = [];
    modalRef: BsModalRef;
    contactTypes: any = [
        {
            value: 'Sales Agent',
            isSelected: false
        },
        {
            value: 'Broker',
            isSelected: false
        },
        {
            value: 'Trade',
            isSelected: false
        },
        {
            value: 'Staff',
            isSelected: false
        },
        {
            value: 'Solicitor',
            isSelected: false
        },
        {
            value: 'End-User',
            isSelected: false
        }
    ];
    contactModalSection: any;
    mobilePhone: FormGroup;
    workPhone: FormGroup;
    homePhone: FormGroup;
    basicFormDetails: any = {};
    emailDetails: any = {};
    editEmail: boolean = false;
    emailTypes: any = [];
    getSelectedContacts: string;
    phoneDetails: any = {};
    phoneTypes: any = [];
    contactLists: any = [];
    phoneForm = new FormGroup({
        phone: new FormControl(undefined, [Validators.required])
    });
    editPhone: boolean = false;
    editAddress: boolean = false;
    addressTypes: any = [];
    addressDetails: any = {};
    createModalRef: any;

    constructor(
        public _activatedRoute: ActivatedRoute,
        private ngZone: NgZone,
        private httpClient: HttpClient,
        private FileSaverService: FileSaverService,
        protected sanitizer: DomSanitizer,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private ngModalService: NgbModal
    ) {
        this.contactId = this._activatedRoute.snapshot.paramMap.get("contactId");
    }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
                }
                else {
                    this.getLists();
                    this.getEmailTypes();
                    this.getPhoneTypes();
                    setTimeout(() => {
                        this.getContactDetails();

                    }, 200);
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    goToSales() {
        this.router.navigate(['sales']);
    }
    getContactDetails() {
        let url = `sales/contacts?_id=${this.contactId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.contactDetails = response.result;
                if (this.contactDetails.contact_type) {
                    this.contactDetails.contact_type.forEach(element => {
                        this.contactTypes.forEach(item => {
                            if (element == item.value) {
                                item.isSelected = true;
                            }
                        });
                    });
                }

                if (this.contactDetails.emails) {
                    let index = 0;
                    this.contactDetails.emails.forEach((item: any) => {
                        item.index = index;
                        index++;
                    });
                } else {
                    this.contactDetails.emails = [];
                }
                if (this.contactDetails.phones) {
                    let index = 0;
                    this.contactDetails.phones.forEach((item: any) => {
                        item.index = index;
                        index++;
                    });
                } else {
                    this.contactDetails.phones = [];
                }
                if (this.contactDetails.addresses) {
                    let index = 0;
                    this.contactDetails.addresses.forEach((item: any) => {
                        item.index = index;
                        index++;
                    });
                } else {
                    this.contactDetails.addresses = [];
                }
                this.contactLists = [];
                if (this.contactDetails.lists) {
                    this.contactDetails.lists.forEach(element => {
                        let listData = this.lists.find(item => item._id == element);
                        this.contactLists.push(listData);
                    });
                }
                this.getSelectedContact();
                this.getDeals();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    getSelectedContact() {
        let getSelectedContact = this.contactTypes.filter((element) => element.isSelected);
        let filterOne = getSelectedContact.map((ele) => ele.value);
        this.getSelectedContacts = filterOne.join();
    }
    openBasicContactModal(template: TemplateRef<any>) {
        let data: any = { ...this.contactDetails };
        this.basicFormDetails.prefix = data.prefix || '';
        this.basicFormDetails.first_name = data.first_name || '';
        this.basicFormDetails.middle_name = data.middle_name || '';
        this.basicFormDetails.last_name = data.last_name || '';
        this.basicFormDetails.suffix = data.suffix || '';
        this.basicFormDetails.display_name = data.display_name || '';
        this.basicFormDetails.salutation = data.salutation || '';
        this.basicFormDetails.family_salutation = data.family_salutation || '';
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    updateBasicDetails() {
        var error = 0;
        // if (!this.basicFormDetails.first_name.trim()) {
        //     this.toastr.warning('Please enter first name', 'Warning');
        //     return;
        // }
        // if (!this.basicFormDetails.last_name.trim()) {
        //     this.toastr.warning('Please enter last name', 'Warning');
        //     return;
        // }
        if (!this.basicFormDetails.display_name || !this.basicFormDetails.display_name.trim()) {
            this.toastr.warning('Please enter display name', 'Warning');
            return;
        }
        let data: any = {};
        data.prefix = this.basicFormDetails.prefix ? this.basicFormDetails.prefix.trim() : '';
        data.first_name = this.basicFormDetails.first_name ? this.basicFormDetails.first_name.trim() : '';
        data.middle_name = this.basicFormDetails.middle_name? this.basicFormDetails.middle_name.trim() : '';
        data.last_name = this.basicFormDetails.last_name ? this.basicFormDetails.last_name.trim() : '';
        data.suffix = this.basicFormDetails.suffix? this.basicFormDetails.suffix.trim() : '';
        data.display_name = this.basicFormDetails.display_name.trim();
        data.salutation = this.basicFormDetails.salutation? this.basicFormDetails.salutation.trim() : '';
        data.family_salutation = this.basicFormDetails.family_salutation? this.basicFormDetails.family_salutation.trim() : '';
        this.updateContactAPI(data);
    }
    updateContactAPI(data: any) {
        this.spinnerService.show();
        let url = `sales/contacts?_id=${this.contactId}`;
        // console.log('basic contact data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getContactDetails();
                    this.modalRef ? this.modalRef.hide() : false;
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openEditContactType(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    onUpdateContactType() {
        console.log('contactTypes', this.contactTypes);
        let data: any = {
            contact_type: []
        };
        this.contactTypes.forEach(element => {
            if (element.isSelected) {
                data.contact_type.push(element.value);
            }
        });
        this.updateContactAPI(data);
        let url = `sales/contacts?_id=${this.contactId}`;
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getContactDetails();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    // getRegions() {
    //     let url = `sales/geography?type=region`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         // console.log(response);
    //         this.spinnerService.hide();
    //         if (response.success && response.status == 1) {
    //             this.regions = response.results;
    //             this.getCountries(this.contactDetails.geography.region);
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
        // if (foundId) {
        let url = `sales/geography?type=country`;
        url = url + `&parent=16vzyq9n0mr-6103ffdf-5875-4c68-8046-c71dede3793c,16xfyhd3nt1-3f769db2-6390-4f55-a67e-19284f98220f`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.countries = response.results;
                this.getStates(this.contactDetails.geography.country);
            } else {
                this.countries = [];
            }
        }, (error) => {
            console.log('error', error);
        });
        // }
    }
    getStates(country) {
        this.states = [];
        const foundId = this.countries.find(element => element.name == country);
        let url = `sales/geography?type=state`;
        if (foundId) {
            url = url + `&parent=${foundId._id}`;
            this.webService.get(url).subscribe((response: any) => {
                console.log(response);
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
    getTerritories() {
        let url = `sales/territories`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                this.territories = response.results;
            } else {
                this.territories = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    deleteContact() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete contact ${this.contactDetails.display_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/contacts?_id=${this.contactId}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.router.navigate(['sales']);
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
    resetPassword() {
        this.confirmationDialogService.confirm('Confirm', `Resetting Password will set a random password and send and email to user with a password. User will have to reset the password once logging in`)
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    let url = `sales/contact-reset-password`;
                    let data = {
                        _id: this.contactId
                    }
                    this.webService.post(url, data).subscribe((response: any) => {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getContactDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    // for email
    openEditEmail(template: TemplateRef<any>, data) {
        this.editEmail = true;
        this.emailDetails = Object.assign({}, data);
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    openAddEmail(template: TemplateRef<any>) {
        this.editEmail = false;
        this.emailDetails = {
            type: this.emailTypes[0].value,
            email: '',
            marketing: true,
            is_inactive: false,
            is_primary: false
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    deleteEmail() {
        this.confirmationDialogService.confirm('Delete', 'Do you want to delete this email ?')
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    var emailsToUpdate = [];
                    this.contactDetails.emails.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.index != this.emailDetails.index) {
                            delete obj.index;
                            emailsToUpdate.push(obj);
                        }
                    });
                    let data = {
                        emails: emailsToUpdate
                    };
                    delete this.emailDetails.index;

                    this.updateContactAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    async updateEmail() {
        var emailRegx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (this.emailDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.emailDetails.email == '') {
            this.toastr.warning('Please enter email', 'Warning');
        }
        else if (!emailRegx.test(this.emailDetails.email)) {
            this.toastr.warning('Please enter valid email', 'Warning');
        } else {
            let duplicate = false;
            this.contactDetails.emails.forEach((item: any) => {
                if (item.email == this.emailDetails.email && item.index != this.emailDetails.index) {
                    duplicate = true;
                }
            });
            if (duplicate) {
                this.toastr.warning('This email already exist in this constituent', 'Warning');
            } else {
                let emailExist = await this.checkEmailExist(this.emailDetails.email);
                if (emailExist) {
                    this.toastr.warning('This email already exist in other constituent', 'Warning');
                } else {
                    this.spinnerService.show();
                    var emailsToUpdate = [];
                    this.contactDetails.emails.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (this.emailDetails.is_primary) {
                            obj.is_primary = false;
                        }
                        if (obj.index == this.emailDetails.index) {
                            obj = this.emailDetails;
                        }
                        delete obj.index;
                        emailsToUpdate.push(obj);
                    });
                    let data = {
                        emails: emailsToUpdate
                    };
                    this.updateContactAPI(data);
                }
            }
        }
    }
    checkEmailExist(email) {
        return new Promise(resolve => {
            let url = `sales/check-email-exist?id=${this.contactId}&email=${email}`;
            this.webService.get(url).subscribe((response: any) => {
                if (response.success) {
                    if (response.exist) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            }, (error) => {
                console.log('error', error);
            });
        });
    }
    async addEmail() {
        var emailRegx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (this.emailDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.emailDetails.email == '') {
            this.toastr.warning('Please enter email', 'Warning');
        }
        else if (!emailRegx.test(this.emailDetails.email)) {
            this.toastr.warning('Please enter valid email', 'Warning');
        } else {
            let duplicate = false;
            this.contactDetails.emails.forEach((item: any) => {
                if (item.email == this.emailDetails.email) {
                    duplicate = true;
                }
            });
            if (duplicate) {
                this.toastr.warning('This email already exist', 'Warning');
            } else {
                let emailExist = await this.checkEmailExist(this.emailDetails.email);
                if (emailExist) {
                    this.toastr.warning('This email already exist in other constituent', 'Warning');
                } else {
                    this.spinnerService.show();
                    var emailsToUpdate = [];
                    this.contactDetails.emails.forEach((item: any) => {
                        let obj = Object.assign({}, item);
                        if (this.emailDetails.is_primary) {
                            obj.is_primary = false;
                        }
                        delete obj.index;
                        emailsToUpdate.push(obj);
                    });
                    let newEmail = Object.assign({}, this.emailDetails);
                    delete newEmail.index;
                    emailsToUpdate.push(newEmail);
                    let data = {
                        emails: emailsToUpdate
                    };
                    this.updateContactAPI(data);
                }
            }
        }
    }
    getEmailTypes() {
        let url = `sales/crm-settings?type=EMAIL-TYPE`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.emailTypes = response.results;
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `sales` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    // for phones
    getPhoneTypes() {
        let url = `sales/crm-settings?type=PHONE-TYPE`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.phoneTypes = response.results;
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `sales` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openEditPhone(template: TemplateRef<any>, data) {
        this.editPhone = true;
        this.phoneDetails = Object.assign({}, data);
        this.phoneForm.controls.phone.setValue({
            "number": this.phoneDetails.number,
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    openAddPhone(template: TemplateRef<any>) {
        this.editPhone = false;
        this.phoneDetails = {
            type: this.phoneTypes[0].value,
            number: '',
            marketing: false,
            is_inactive: false,
        };
        this.phoneForm.reset()
        this.phoneForm.controls.phone.setValue({});
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    deletePhone() {
        this.confirmationDialogService.confirm('Delete', 'Do you want to delete this phone ?')
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    var phonesToUpdate = [];
                    this.contactDetails.phones.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.index != this.phoneDetails.index) {
                            delete obj.index;
                            phonesToUpdate.push(obj);
                        }
                    });
                    let data = {
                        phones: phonesToUpdate
                    };
                    this.updateContactAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    updatePhone() {
        // console.log(this.phoneForm.value);
        // console.log(this.phoneForm.controls['phone'].invalid);
        if (this.phoneDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.phoneForm.controls['phone'].invalid) {
            this.toastr.warning('Please enter valid number', 'Warning');
        }
        else {
            let duplicate = false;
            this.contactDetails.phones.forEach((item: any) => {
                if (item.number == this.phoneForm.value.phone.e164Number && item.index != this.phoneDetails.index) {
                    duplicate = true;
                    // return;
                }
            });
            if (duplicate) {
                this.toastr.warning('This number already exist', 'Warning');
            } else {
                this.spinnerService.show();
                var phonesToUpdate = [];
                this.contactDetails.phones.forEach((item: any) => {
                    var obj: any = Object.assign({}, item);
                    if (this.phoneDetails.is_primary) {
                        obj.is_primary = false;
                    }
                    if (obj.index == this.phoneDetails.index) {
                        obj = this.phoneDetails;
                        obj.number = this.phoneForm.value.phone.e164Number;
                        obj.formatted = this.phoneForm.value.phone.nationalNumber;
                    }
                    delete obj.index;
                    phonesToUpdate.push(obj);
                });
                let data = {
                    phones: phonesToUpdate
                };
                this.updateContactAPI(data);
            }
        }
    }
    addPhone() {
        if (this.phoneDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.phoneForm.controls['phone'].invalid) {
            this.toastr.warning('Please enter number', 'Warning');
        }
        else {
            let duplicate = false;
            this.contactDetails.phones.forEach((item: any) => {
                if (item.number == this.phoneForm.value.phone.e164Number) {
                    duplicate = true;
                    // return;
                }
            });
            if (duplicate) {
                this.toastr.warning('This number already exist', 'Warning');
            } else {
                this.spinnerService.show();
                var phonesToUpdate = [];
                this.contactDetails.phones.forEach((item: any) => {
                    let obj = Object.assign({}, item);
                    if (this.phoneDetails.is_primary) {
                        obj.is_primary = false;
                    }
                    delete obj.index;
                    phonesToUpdate.push(obj);
                });
                let newPhone: any = Object.assign({}, this.phoneDetails);
                newPhone.number = this.phoneForm.value.phone.e164Number;
                newPhone.formatted = this.phoneForm.value.phone.nationalNumber;
                delete newPhone.index;
                phonesToUpdate.push(newPhone);
                let data = {
                    phones: phonesToUpdate
                };
                this.updateContactAPI(data);
            }
        }
    }
    // for address
    getAddressTypes() {
        let url = `sales/crm-settings?type=ADDRESS-TYPE`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.addressTypes = response.results;
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `sales` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openEditAddress(template: TemplateRef<any>, data) {
        this.getAddressTypes();
        this.editAddress = true;
        this.addressDetails = Object.assign({}, data);
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    openAddAddress(template: TemplateRef<any>) {
        this.getAddressTypes();
        this.editAddress = false;
        this.addressDetails = {
            type: '',
            street1: '',
            street2: '',
            street3: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            is_inactive: false,
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    deleteAddress() {
        this.confirmationDialogService.confirm('Delete', 'Do you want to delete this address ?')
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    var addressToUpdate = [];
                    this.contactDetails.addresses.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.index != this.addressDetails.index) {
                            delete obj.index;
                            addressToUpdate.push(obj);
                        }
                    });
                    let data = {
                        addresses: addressToUpdate
                    };
                    this.updateContactAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    updateAddress() {
        if (this.addressDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.addressDetails.street1 == '') {
            this.toastr.warning('Please enter street', 'Warning');
        }
        else {
            this.spinnerService.show();
            var addressToUpdate = [];
            this.contactDetails.addresses.forEach((item: any) => {
                var obj = Object.assign({}, item);
                if (this.addressDetails.is_primary) {
                    obj.is_primary = false;
                }
                if (obj.index == this.addressDetails.index) {
                    obj = this.addressDetails;
                }
                delete obj.index;
                addressToUpdate.push(obj);
            });
            let data = {
                addresses: addressToUpdate
            };
            this.updateContactAPI(data);
        }
    }
    addAddress() {
        if (this.addressDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.addressDetails.street1 == '') {
            this.toastr.warning('Please enter street', 'Warning');
        }
        else {
            this.spinnerService.show();
            var addressToUpdate = [];
            this.contactDetails.addresses.forEach((item: any) => {
                let obj = Object.assign({}, item);
                if (this.addressDetails.is_primary) {
                    obj.is_primary = false;
                }
                delete obj.index;
                addressToUpdate.push(obj);
            });
            let newAddress = Object.assign({}, this.addressDetails);
            delete newAddress.index;
            addressToUpdate.push(newAddress);
            let data = {
                addresses: addressToUpdate
            };
            this.updateContactAPI(data);
        }
    }

    // For list
    getLists() {
        let url = `sales/lists`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.lists = response.results && response.results.rows ? response.results.rows : [];
            } else {
                this.lists = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    openAddToList(template: TemplateRef<any>) {
        this.formDetails = {
            list: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md' });
    }
    addToList() {
        // console.log(this.formDetails);
        if (this.contactDetails.lists) {
            this.contactDetails.lists.push(this.formDetails.list);
        }
        else {
            this.contactDetails.lists = [];
            this.contactDetails.lists.push(this.formDetails.list);
        }
        let data: any = {
            lists: this.contactDetails.lists
        };
        this.updateContactAPI(data);
    }
    deleteFromList(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to remove the list '${item.name}' ?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    this.contactDetails.lists.splice(index, 1);
                    // console.log(this.contactDetails.lists);
                    let data: any = {
                        lists: this.contactDetails.lists
                    };
                    this.updateContactAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }

    // For Deal
    getDeals() {
        this.spinnerService.show();
        let url = `sales/deals?contact_id=${this.contactId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success && response.status == 1) {
                this.dealDetailsObj.deals = response.results && response.results ? response.results : [];
            } else {
                this.dealDetailsObj.deals = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    requestToCreateDeal() {

        // API call for create deal request
        let contactDetails: any = {
            addresses: this.contactDetails.addresses,
            contact_type: this.contactDetails.contact_type,
            emails: this.contactDetails.emails,
            geography: this.contactDetails.geography,
            phones: this.contactDetails.phones,
            display_name: this.contactDetails.display_name,
            first_name: this.contactDetails.first_name,
            last_name: this.contactDetails.last_name,
            middle_name: this.contactDetails.middle_name,
            // territory: this.contactDetails.territory,
            _id: this.contactDetails._id
        };
        let data = [];
        data.push(contactDetails);
        this.createModalRef = this.ngModalService.open(CreateDealModalComponent,
            {
                size: 'lg', backdrop: 'static'
            })
        this.createModalRef.componentInstance.data = {
            component: 'contact',
            contact: data,
        }
        this.createModalRef.result.then(async (result) => {
            if (result) {
                //code to call deatils API
                this.router.navigate(['sales/deals/' + result.response._id]);
            }
            else {
                //code to call deatils API
            }
        }, (reason) => {
            console.log('deal modal closed');
        })
    }

    navigateToDealDetials(id) {
        let url = `#/sales/deals/${id}`;
        window.open(url, '_blank');
    }

    // Purchaser portal
    allowLogin() {
        let data: any = {};
        data.allow_login = this.contactDetails.allow_login ? this.contactDetails.allow_login : false;
        this.updateContactAPI(data);
    }


}
