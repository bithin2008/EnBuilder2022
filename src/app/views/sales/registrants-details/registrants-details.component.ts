import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-registrants-details',
    templateUrl: './registrants-details.component.html',
    styleUrls: ['./registrants-details.component.css']
})
export class RegistrantsDetailsComponent implements OnInit {
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];

    registrantId: any;
    registrantDetailsObj: any = {
        deal_found: { "name_matched": [], "email_matched": [], "mobile_matched": [] },
        contact_found: { "name_matched": [], "email_matched": [], "mobile_matched": [] },
        registrant_found: { "name_matched": [], "email_matched": [], "mobile_matched": [] }
    };
    getSelectedContacts: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    desiredProjects: any[] = [];
    desiredUnitTypes: any[] = [];
    desiredPriceRange: any[] = [];
    // howDidYouHere: any[] = [];
    phoneForm = new FormGroup({
        phone: new FormControl(undefined, [Validators.required])
    });
    editPhone: boolean = false;
    editAddress: boolean = false;
    addressTypes: any = [];
    addressDetails: any = {};
    phoneTypes: any = [];
    phoneDetails: any = {};
    emailDetails: any = {};
    editEmail: boolean = false;
    emailTypes: any = [];
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
            value: 'Company',
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
    constructor(public _activatedRoute: ActivatedRoute,
        private router: Router,
        private webService: WebService,
        private spinnerService: Ng4LoadingSpinnerService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }

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
                    this.getLookupData();
                    this.registrantId = this._activatedRoute.snapshot.paramMap.get("registrantId");
                    if (this.registrantId) {
                        this.getRegistrantDetails();
                        this.getEmailTypes();
                        this.getPhoneTypes();
                    }
                }
            } else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });

            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    getRegistrantDetails() {
        let url = `sales/registrants?_id=${this.registrantId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.registrantDetailsObj = response.result;
                    this.registrantDetailsObj['deal_found'] = response.deal_found ? response.deal_found : { "name_matched": [], "email_matched": [], "mobile_matched": [] };
                    this.registrantDetailsObj['contact_found'] = response.contact_found ? response.contact_found : { "name_matched": [], "email_matched": [], "mobile_matched": [] };
                    this.registrantDetailsObj['registrant_found'] = response.registrant_found ? response.registrant_found : { "name_matched": [], "email_matched": [], "mobile_matched": [] };
                    this.registrantDetailsObj['associated'] = this.getUnique(this.registrantDetailsObj.contact_found, '_id');
                    if (this.registrantDetailsObj.contact_type) {
                        this.registrantDetailsObj.contact_type.forEach(element => {
                            this.contactTypes.forEach(item => {
                                if (element == item.value) {
                                    item.isSelected = true;
                                }
                            });
                        });
                    }
                    if (this.registrantDetailsObj.emails) {
                        let index = 0;
                        this.registrantDetailsObj.emails.forEach((item: any) => {
                            item.index = index;
                            index++;
                        });
                    } else {
                        this.registrantDetailsObj.emails = [];
                    }
                    if (this.registrantDetailsObj.phones) {
                        let index = 0;
                        this.registrantDetailsObj.phones.forEach((item: any) => {
                            item.index = index;
                            index++;
                        });
                    } else {
                        this.registrantDetailsObj.phones = [];
                    }
                    if (this.registrantDetailsObj.addresses) {
                        let index = 0;
                        this.registrantDetailsObj.addresses.forEach((item: any) => {
                            item.index = index;
                            index++;
                        });
                    } else {
                        this.registrantDetailsObj.addresses = [];
                    }
                    this.getSelectedContact();
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

    getUnique(element, comp) {
        let allElements = [];
        allElements = [...element['email_matched'], ...element.name_matched, ...element.mobile_matched];

        // store the comparison  values in array
        const unique = allElements.map(e => e[comp])

            // store the indexes of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)

            // eliminate the false indexes & return unique objects
            .filter((e) => allElements[e]).map(e => allElements[e]);

        return unique;
    }

    deleteRegistrant() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete registrant ${this.registrantDetailsObj.first_name} ${this.registrantDetailsObj.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/registrants?_id=${this.registrantDetailsObj._id}`;
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

    getSelectedContact() {
        let getSelectedContact = this.contactTypes.filter((element) => element.isSelected);
        let filterOne = getSelectedContact.map((ele) => ele.value);
        this.getSelectedContacts = filterOne.join();
    }

    goToSales() {
        this.router.navigate(['sales']);
    }

    openEditRegistrantsModal(template: TemplateRef<any>) {
        this.formDetails = {};
        this.formDetails = {
            desired_price_range: this.registrantDetailsObj.desired_price_range,
            desired_project: this.registrantDetailsObj.desired_project,
            desired_unit_type: this.registrantDetailsObj.desired_unit_type,
            // email: this.registrantDetailsObj.email,
            first_name: this.registrantDetailsObj.first_name,
            // how_did_you_hear: this.registrantDetailsObj.how_did_you_hear,
            last_name: this.registrantDetailsObj.last_name
            // _id: this.registrantDetailsObj._id
        }
        // this.formDetails.mobile.formatted = item.mobile.formatted;
        // this.formDetails.mobile = item.mobile.number;
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
        // if (!this.formDetails.email) {
        //     this.toastr.warning(`Please enter registrant email`, 'Warning');
        //     return;
        // } else {
        //     if (reg.test(this.formDetails.email) == false) {
        //         this.toastr.warning(`Please enter valid registrant email`, 'Warning');
        //         return;
        //     } else {
        //         this.formDetails.email = this.formDetails.email.toLowerCase();
        //     }
        // }
        // if (!this.formDetails.mobile) {
        //     this.toastr.warning('Please enter mobile', 'Warning');
        //     return;
        // }
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
        let data = { ...this.formDetails };
        // delete data._id;
        if (this.registrantId) {
            this.updateRegistrantAPI(data);
        }

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
                // this.howDidYouHere = response[3].length > 0 ? response[3] : [];
            } else {
                // this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    updateRegistrantAPI(data: any) {
        // console.log('basic contact data', data);

        if (data.email_matched) {
            delete data.email_matched;
        }
        if (data.mobile_matched) {
            delete data.mobile_matched;
        }
        if (data.name_matched) {
            delete data.name_matched;
        }
        if (data.associated) {
            delete data.associated;
        }
        let url = `sales/registrants?_id=${this.registrantId}`;
        this.spinnerService.hide();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getRegistrantDetails();
                if (this.modalRef) {
                    this.modalRef.hide();
                }
            } else {
                this.toastr.error(response.message, 'Error');
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
                    this.registrantDetailsObj.phones.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.index != this.phoneDetails.index) {
                            delete obj.index;
                            phonesToUpdate.push(obj);
                        }
                    });
                    let data = {
                        phones: phonesToUpdate
                    };
                    this.updateRegistrantAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    updatePhone() {
        console.log(this.phoneForm.value);
        console.log(this.phoneForm.controls['phone'].invalid);
        if (this.phoneDetails.type == '') {
            this.toastr.warning('Please select type', 'Warning');
        }
        else if (this.phoneForm.controls['phone'].invalid) {
            this.toastr.warning('Please enter valid number', 'Warning');
        }
        else {
            let duplicate = false;
            this.registrantDetailsObj.phones.forEach((item: any) => {
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
                // console.log('obj', this.registrantDetailsObj.phones);
                this.registrantDetailsObj.phones.forEach((item: any) => {
                    var obj: any = Object.assign({}, item);
                    // console.log('obj 1', item);
                    if (this.phoneDetails.is_primary) {
                        obj.is_primary = false;
                    }
                    // console.log('phoneDetails 1', this.phoneDetails);
                    if (obj.index == this.phoneDetails.index) {
                        obj = this.phoneDetails;
                        obj.number = this.phoneForm.value.phone.e164Number;
                        obj.formatted = this.phoneForm.value.phone.nationalNumber;
                        // console.log('obj 2', obj);
                    }
                    delete obj.index;
                    phonesToUpdate.push(obj);
                });
                let data = {
                    phones: phonesToUpdate
                };
                this.updateRegistrantAPI(data);
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
            this.registrantDetailsObj.phones.forEach((item: any) => {
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
                this.registrantDetailsObj.phones.forEach((item: any) => {
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
                this.updateRegistrantAPI(data);
            }
        }
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
                    this.registrantDetailsObj.emails.forEach((item: any) => {
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

                    this.updateRegistrantAPI(data);
                }
            })
            .catch(() => console.log('User dismissed the dialog '));
    }
    updateEmail() {
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
            this.registrantDetailsObj.emails.forEach((item: any) => {
                if (item.email == this.emailDetails.email && item.index != this.emailDetails.index) {
                    duplicate = true;
                }
            });
            if (duplicate) {
                this.toastr.warning('This email already exist in this registrant', 'Warning');
            } else {
                // let emailExist = await this.checkEmailExist(this.emailDetails.email);
                // if (emailExist) {
                //     this.toastr.warning('This email already exist in other constituent', 'Warning');
                // } else {
                this.spinnerService.show();
                var emailsToUpdate = [];
                this.registrantDetailsObj.emails.forEach((item: any) => {
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
                this.updateRegistrantAPI(data);
                // }
            }
        }
    }
    checkEmailExist(email) {
        return new Promise(resolve => {
            let url = `sales/check-email-exist?id=${this.registrantId}&email=${email}`;
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
            this.registrantDetailsObj.emails.forEach((item: any) => {
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
                    this.registrantDetailsObj.emails.forEach((item: any) => {
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
                    this.updateRegistrantAPI(data);
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
                    this.registrantDetailsObj.addresses.forEach((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.index != this.addressDetails.index) {
                            delete obj.index;
                            addressToUpdate.push(obj);
                        }
                    });
                    let data = {
                        addresses: addressToUpdate
                    };
                    this.updateRegistrantAPI(data);
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
            this.registrantDetailsObj.addresses.forEach((item: any) => {
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
            this.updateRegistrantAPI(data);
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
            this.registrantDetailsObj.addresses.forEach((item: any) => {
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
            this.updateRegistrantAPI(data);
        }
    }

    //SUBMIT WORKSHEET
    requestToSubmitWorkSheet() {
        this.confirmationDialogService.confirm('Confirm', `Do you want to submit the request for worksheet ?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    let url = `sales/worksheet-request`;
                    let data = {
                        _id: this.registrantId
                    }
                    this.webService.post(url, data).subscribe((response: any) => {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getRegistrantDetails();
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

    requestToCreateWorksheet() {
        this.confirmationDialogService.confirm('Confirm', `Do you want to create the worksheet ?`)
            .then((confirmed) => {
                if (confirmed) {
                    this.spinnerService.show();
                    let url = `sales/worksheets`;
                    var data = {
                        user_type: '',
                        purchasers: [],
                        how_did_you_hear: this.registrantDetailsObj.how_did_you_hear || '',
                        online_registration_date: '',
                        maritial_status: '',
                        no_of_dependants: '',
                        rent_or_own: '',
                        reason_for_purchase: '',
                        deciding_factor: '',
                        comments: '',
                        desired_project: this.registrantDetailsObj.desired_project || '',
                        desired_unit_type: this.registrantDetailsObj.desired_unit_type || '',
                        desired_price_range: this.registrantDetailsObj.desired_price_range || '',
                        rid: this.registrantId,
                    }
                    let purchasers = [];
                    let existingAddress = null;
                    if (this.registrantDetailsObj.addresses) {
                        let primaryRecord = this.registrantDetailsObj.addresses.find((address) => address.is_primary);
                        if (primaryRecord) {
                            existingAddress = primaryRecord;
                        }
                        else {
                            if (this.registrantDetailsObj.addresses.length > 0) {
                                existingAddress = this.registrantDetailsObj.addresses[0];
                            }
                        }
                    }
                    let obj = {
                        _id: uuidv4(),
                        address1: existingAddress ? existingAddress.street1 : "",
                        address2: existingAddress ? existingAddress.street2 : "",
                        city: existingAddress ? existingAddress.city : "",
                        country: existingAddress ? existingAddress.country : "",
                        dob: "",
                        contact_type: this.registrantDetailsObj.contact_type ? this.registrantDetailsObj.contact_type : [],
                        email: this.registrantDetailsObj.emails[0].email || "",
                        first_name: this.registrantDetailsObj.first_name || "",
                        last_name: this.registrantDetailsObj.last_name || "",
                        legal_full_name: "",
                        middle_name: this.registrantDetailsObj.middle_name || "",
                        province: existingAddress ? existingAddress.state : "",
                        zip: existingAddress ? existingAddress.zip : "",
                        occupation: "",
                        home_phone: {},
                        office: "",
                        residency: "",
                    };

                    let mobileObj_ = this.registrantDetailsObj.phones.find((element) => element.type == 'Mobile');
                    if (mobileObj_) {
                        let mobileObj = {
                            number: mobileObj_.number,
                            formatted: mobileObj_.formatted,
                        }
                        // delete element['mobile'];
                        obj['mobile'] = Object.assign({}, mobileObj);
                    }
                    else {
                        obj['mobile'] = {};
                    }

                    purchasers.push(obj);

                    data['purchasers'] = purchasers;
                    data['agent'] = {};
                    data['solicitor'] = {};
                    data['choices'] = [];
                    // Formatting mobile fields in the agent
                    this.webService.post(url, data).subscribe((response: any) => {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getRegistrantDetails();
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

    //CONTNET TYPE
    openEditContactType(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    onUpdateContactType() {
        // console.log('contactTypes', this.contactTypes);
        let data: any = {
            contact_type: []
        };
        this.contactTypes.forEach(element => {
            if (element.isSelected) {
                data.contact_type.push(element.value);
            }
        });
        this.updateRegistrantAPI(data);
        let url = `sales/registrants?_id=${this.registrantId}`;
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.success) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getRegistrantDetails();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    navigateToDeal(id) {
        let url = `#/sales/deals/${id}`;
        window.open(url, '_blank');

    }

    navigateToContact(id) {
        let url = `#/sales/contact/${id}`;
        if (id) {
            window.open(url, '_blank');
        }

    }

    //ASSOCIATE CONTACTS
    associateContact(contact) {
        this.confirmationDialogService.confirm('Delete', `Do you want to associte this contact for ${this.registrantDetailsObj.first_name} ${this.registrantDetailsObj.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (contact && contact._id) {
                        let data: any = {
                            contact_id: contact._id
                        };
                        this.updateRegistrantAPI(data);
                    }
                }
            })
            .catch((error) => { });
    }

    deAssociateContact() {
        this.confirmationDialogService.confirm('Delete', `Do you want to De-associte this contact for ${this.registrantDetailsObj.first_name} ${this.registrantDetailsObj.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (this.registrantDetailsObj.contact_id) {
                        let data: any = {
                            contact_id: ''
                        };
                        this.updateRegistrantAPI(data);
                    }
                }
            })
            .catch((error) => { });
    }
}
