import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import * as moment from 'moment';
import { CreateDealModalComponent } from '../create-deal-modal/create-deal-modal.component';
@Component({
    selector: 'app-worksheets-details',
    templateUrl: './worksheets-details.component.html',
    styleUrls: ['./worksheets-details.component.css']
})
export class WorksheetsDetailsComponent implements OnInit {
    worksheetId: any;
    worksheetDetailsObj: any = {
       purchasers:[]
    };
    modalRef: BsModalRef;
    formDetails: any = {};
    isEdit: boolean = false;
    projectList: any = [];
    modelList: any = [];
    modelListTwo: any = [];
    modelListThree: any = [];
    user_mobile: FormGroup;
    agent_mobile: FormGroup;
    purchasersGroup: FormGroup;
    solicitor_mobile: FormGroup;

    baseUrl = environment.BASE_URL;
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    createModalRef: any;
    
    constructor(
        public _activatedRoute: ActivatedRoute,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private ngModalService: NgbModal,
        private confirmationDialogService: ConfirmationDialogService,
        private formBuilder: FormBuilder
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
                this.worksheetId = this._activatedRoute.snapshot.paramMap.get("worksheetId");
                this.getWorksheetDetails();
            }
        }else{
            this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
        }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getWorksheetDetails() {
        let url = `sales/worksheets?_id=${this.worksheetId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.worksheetDetailsObj = response.result;
                    if (this.worksheetDetailsObj.dob) {
                        this.worksheetDetailsObj.dob = moment(this.worksheetDetailsObj.dob).format("YYYY-MM-DD");
                    }
                    if (this.worksheetDetailsObj.purchasers) {
                        this.worksheetDetailsObj.purchasers.forEach(element => {
                            element.layouts = [];
                            this.getImgesByPurchaser(element);
                            this.checkPotentialMatch(element);
                        });
                    }
                    if(this.worksheetDetailsObj.agent && this.worksheetDetailsObj.agent.first_name){
                        this.checkPotentialMatchAgent(this.worksheetDetailsObj.agent);
                    }
                    if(this.worksheetDetailsObj.solicitor && this.worksheetDetailsObj.solicitor.first_name){
                        this.checkPotentialMatchSolicitor(this.worksheetDetailsObj.solicitor);
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
    
    getImgesByPurchaser(purchaser) {
        if(purchaser._id){
        this.spinnerService.show();
        let url = `sales/documents?person_id=${purchaser._id}`;
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

    }

    checkPotentialMatch(purchaser) {
        let url = `sales/potential-contact-for-purchasers`;
        let data = {
            first_name: purchaser.first_name,
            last_name: purchaser.last_name,
            email: purchaser.email,
            mobile: purchaser.mobile
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    // console.log('response', response);
                    if (this.worksheetDetailsObj.purchasers) {
                        this.worksheetDetailsObj.purchasers.forEach(element => {
                            if (element._id == purchaser._id) {
                                element.email_matched = response.email_matched ? response.email_matched : [];
                                element.name_matched = response.name_matched ? response.name_matched : [];
                                element.mobile_matched = response.mobile_matched ? response.mobile_matched : [];
                                element.associated = this.getUnique(element,'_id');
                            }
                        });
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

    deleteWorksheet() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete worksheet ${this.worksheetDetailsObj.first_name} ${this.worksheetDetailsObj.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `sales/worksheets?_id=${this.worksheetDetailsObj._id}`;
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

    //// PURCHASER FORM ARRAY /////
    get getPurchasers(): FormArray {
        return this.purchasersGroup.get('purchasers') as FormArray;
    }
    appendPurchaserGroup() {
        this.getPurchasers.push(this.createPurchaserGroup());
    }
    createPurchaserGroup() {
        return this.formBuilder.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            legal_full_name: ['', Validators.required],
            middle_name: [''],
            dob: ["", Validators.required],
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
    appendValueWithPurchaserGroup(element) {
        this.getPurchasers.push(this.patchPurchaserGroup(element));
    }
    patchPurchaserGroup(element) {
        return this.formBuilder.group({
            first_name: [element.first_name || '', Validators.required],
            last_name: [element.last_name || '', Validators.required],
            legal_full_name: [element.legal_full_name || '', Validators.required],
            middle_name: [element.middle_name || ''],
            dob: [element.dob ? element.dob : '', Validators.required],
            address1: [element.address1 || '', Validators.required],
            address2: [element.address2 || ''],
            city: [element.city || '', Validators.required],
            province: [element.province || '', Validators.required],
            zip: [element.zip || '', Validators.required],
            occupation: [element.occupation || '', Validators.required],
            country: [element.country || '', Validators.required],
            mobile: ['', Validators.required],
            email: [element.email || '', [Validators.required, Validators.pattern(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)]],
            home_phone: [''],
            office: [element.office || ''],
            residency: [element.residency || ''],
        })

    }
    addPurchaser() {
        this.appendPurchaserGroup();
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
    deletePurchaser(i) {
        // this.getPurchasers.removeAt(i);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this purchaser ?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (this.worksheetDetailsObj.purchasers) {
                        this.worksheetDetailsObj.purchasers.splice(i, 1);
                        let data: any = {};
                        let purchasers = this.worksheetDetailsObj.purchasers;
                        data['purchasers'] = purchasers;
                        this.updateWorksheetAPI(data)
                    }
                }
            })
            .catch((error) => { });
    }
    deleteChoise(i) {
        if (this.formDetails.choices.length > 1) {
            this.formDetails.choices.splice(i, 1);
        }
    }

    /////Associated Contact Record/////
    uploadImage1(files, item) {
        if (files.length > 0) {
            if (item._id) {
                let validation = this.validateImage(files.item(0).name);
                if (validation) {
                    let document = files.item(0);
                    var formData = new FormData();
                    formData.append('file', document);
                    formData.append('document_type', 'document1');
                    formData.append('person_id', item._id);
                    formData.append('worksheet_id', this.worksheetId);
                    this.spinnerService.show();
                    let url = `sales/documents`;

                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            if (this.worksheetDetailsObj.purchasers) {
                                this.worksheetDetailsObj.purchasers.forEach(element => {
                                    element.layouts = [];
                                    this.getImgesByPurchaser(element);
                                });
                            }
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
                    formData.append('person_id', item._id);
                    formData.append('worksheet_id', this.worksheetId);
                    this.spinnerService.show();
                    let url = `sales/documents`;

                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            if (this.worksheetDetailsObj.purchasers) {
                                this.worksheetDetailsObj.purchasers.forEach(element => {
                                    element.layouts = [];
                                    this.getImgesByPurchaser(element);
                                });
                            }
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
                                if (this.worksheetDetailsObj.purchasers) {
                                    this.worksheetDetailsObj.purchasers.forEach(element => {
                                        element.layouts = [];
                                        this.getImgesByPurchaser(element);
                                    });
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
            })
            .catch((error) => { });
    }
   
    openEditPurchaserModal(template: TemplateRef<any>, item, index) {
        this.purchasersGroup = this.formBuilder.group({
            purchasers: this.formBuilder.array([])
        })
        this.formDetails = Object.assign({}, this.worksheetDetailsObj);
        if (this.worksheetDetailsObj.purchasers && this.worksheetDetailsObj.purchasers.length > 0) {
            this.formDetails['purchasers'] = [];
            this.worksheetDetailsObj.purchasers.forEach((element, index) => {
                this.appendValueWithPurchaserGroup(element);
            });

        }
        if (this.worksheetDetailsObj.purchasers) {
            this.worksheetDetailsObj.purchasers.forEach((element, index) => {
                let group = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString());
                if (element.mobile && element.mobile.number) {
                    group.controls.mobile.setValue({
                        "e164Number": element.mobile.number,
                        "nationalNumber": element.mobile.formatted,
                        "number": element.mobile.number,
                    });
                }
                if (element.home_phone && element.home_phone.number) {
                    group.controls.home_phone.setValue({
                        "e164Number": element.home_phone.number,
                        "nationalNumber": element.home_phone.formatted,
                        "number": element.mobile.number,
                    });
                }
            });
        }
        this.purchasersGroup.updateValueAndValidity();
        this.formDetails.index = index;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    editPurchaser() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        this.formDetails.purchasers = [];
        let purchasersGp = Object.assign({}, this.purchasersGroup.value);
        if (this.worksheetDetailsObj.purchasers) {
            purchasersGp.purchasers.forEach(element => {
                this.formDetails.purchasers.push(Object.assign({}, element));
            });
        }
        var keepGoing = true;
        if (this.worksheetDetailsObj.purchasers) {
            this.formDetails.purchasers.forEach((element, index) => {
                if (index == this.formDetails.index) {
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
                }
            });
        }
        if (keepGoing) {
            let data: any = {};
            let purchasers = [];
            if (this.formDetails && this.formDetails.purchasers && this.formDetails.purchasers.length > 0) {
                this.formDetails.purchasers.forEach((element, index) => {
                    let obj = {
                        _id: element._id,
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
                        office: element.office ? element.office : "",
                        residency: element.residency ? element.residency : "",
                        contact_type: element.contact_type ? element.contact_type : []

                    };

                    let homePhoneControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('home_phone');
                    if (homePhoneControl.value && homePhoneControl.value && homePhoneControl.value.nationalNumber) {
                        let home_phoneObj = {
                            number: homePhoneControl.value.e164Number,
                            formatted: homePhoneControl.value.nationalNumber,
                        }
                        obj['home_phone'] = Object.assign({}, home_phoneObj);

                    }
                    else {
                        obj['home_phone'] = {};
                    }

                    let mobileControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('mobile');
                    if (mobileControl.value && mobileControl.value && mobileControl.value.nationalNumber) {
                        let mobileObj = {
                            number: mobileControl.value.e164Number,
                            formatted: mobileControl.value.nationalNumber,
                        }
                        obj['mobile'] = Object.assign({}, mobileObj);
                    }
                    else {
                        obj['mobile'] = {};
                    }

                    purchasers.push(obj);
                });
            }
            data['purchasers'] = purchasers;
            // console.log('purchasers',data);
            this.updateWorksheetAPI(data)
        }
    }

    ////Choice////
    openEditChoiceModal(template: TemplateRef<any>) {
        this.formDetails = Object.assign({}, this.worksheetDetailsObj);
        this.formDetails.choices = [];
        this.getProjectList();
        if (this.worksheetDetailsObj.choices && this.worksheetDetailsObj.choices.length > 0) {
            this.worksheetDetailsObj.choices.forEach((element, index) => {
                this.formDetails.choices.push(
                    {
                        project_id: element.project_id ? element.project_id : '',
                        project_name: element.project_name ? element.project_name : '',
                        model_id: element.model_id ? element.model_id : '',
                        model_name: element.model_name ? element.model_name : '',
                        level: element.level ? element.level : '',
                    }
                )
                if (element.project_id) {
                    this.getModelList(element.project_id, index);
                }
            });
        }
        else {
            this.addDefaultChoices();
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    editChoice() {
        let data: any = {
            how_did_you_hear: this.formDetails.how_did_you_hear || '',
            online_registration_date: moment(this.formDetails.online_registration_date).format('YYYY-MM-DD') || '',
            parking_required: this.formDetails.parking_required ? true : false,
            locker_required: this.formDetails.locker_required ? true : false,
            bicycle_required: this.formDetails.bicycle_required ? true : false,
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
        // console.log('choices', data);
        this.updateWorksheetAPI(data)

    }

    addDefaultChoices() {
        this.formDetails.choices = [];
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

    ////Agent////
    openEditAgentModal(template: TemplateRef<any>) {
        this.agent_mobile = new FormGroup({
            'mobile': new FormControl('', [Validators.required])
        });
        this.formDetails['agent'] = Object.assign({}, this.worksheetDetailsObj.agent);
        if (this.formDetails.agent && this.formDetails.agent.mobile && this.formDetails.agent.mobile.number) {
            this.agent_mobile.controls.mobile.setValue({
                "number": this.formDetails.agent.mobile.number,
            });
        }

        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editAgent() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
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
        let data: any = {};
        //Formatting mobile fields in the agent
        let agent = Object.assign({}, this.formDetails.agent);
        data['agent'] = agent;
        let agentMobile = Object.assign({}, this.agent_mobile.value.mobile);
        if (this.agent_mobile.value && this.agent_mobile.value.mobile && this.agent_mobile.value.mobile.nationalNumber) {
            let mobileObj = {
                number: this.agent_mobile.value.mobile.e164Number,
                formatted: this.agent_mobile.value.mobile.nationalNumber,
            }
            // delete data.agent['mobile'];
            data['agent'].mobile = mobileObj;
        }

        // console.log('choices', data);
        this.updateWorksheetAPI(data)
    }

    ///Solicitor////
    openEditSolicitorModal(template: TemplateRef<any>) {
        this.solicitor_mobile = new FormGroup({
            'mobile': new FormControl('', [Validators.required])
        });

        this.formDetails['solicitor'] = Object.assign({}, this.worksheetDetailsObj.solicitor);
        if (this.formDetails.solicitor && this.formDetails.solicitor.mobile && this.formDetails.solicitor.mobile.number) {
            this.solicitor_mobile.controls.mobile.setValue({
                "number": this.formDetails.solicitor.mobile.number,
            });
        }
        else {
            this.formDetails.solicitor = {};
        }

        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editSolicitor() {
        let data: any = {};
        //Formatting mobile fields in the solicitor
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
        // console.log('choices', data);
        this.updateWorksheetAPI(data)
    }

    ///Other info///
    openEditOtherModal(template: TemplateRef<any>) {
        this.formDetails = Object.assign({}, this.worksheetDetailsObj);
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editOtherInfo() {
        var data = {
            user_type: this.formDetails.user_type,
            maritial_status: this.formDetails.maritial_status || '',
            no_of_dependants: this.formDetails.no_of_dependants || '',
            rent_or_own: this.formDetails.rent_or_own || '',
            reason_for_purchase: this.formDetails.reason_for_purchase || '',
            deciding_factor: this.formDetails.deciding_factor || '',
            comments: this.formDetails.comments || '',
        }
        // console.log('editOtherInfo', data);
        this.updateWorksheetAPI(data)
    }

    updateWorksheetAPI(data) {
        if(data['agent']){
            if(data['agent'].email_matched){
                delete data['agent'].email_matched;
            }
            if(data['agent'].mobile_matched){
                delete data['agent'].mobile_matched;
            }
            if(data['agent'].name_matched){
                delete data['agent'].name_matched;
            }
            if(data['agent'].associated){
                delete data['agent'].associated;
            }
            
        }
        if(data['solicitor']){
            if(data['solicitor'].email_matched){
                delete data['solicitor'].email_matched;
            }
            if(data['solicitor'].mobile_matched){
                delete data['solicitor'].mobile_matched;
            }
            if(data['solicitor'].name_matched){
                delete data['solicitor'].name_matched;
            }
            if(data['solicitor'].associated){
                delete data['solicitor'].associated;
            }
        }
        if(data['purchasers']){
            data['purchasers'].forEach(element => {
                if(element){
                    if(element.email_matched){
                        delete element.email_matched;
                    }
                    if(element.mobile_matched){
                        delete element.mobile_matched;
                    }
                    if(element.name_matched){
                        delete element.name_matched;
                    }
                    if(element.associated){
                        delete element.associated;
                    }
                }
            });
           
        }
        let url = `sales/worksheets?_id=${this.worksheetId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getWorksheetDetails();
                    if (this.modalRef) {
                        this.modalRef.hide();
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

    goToSales() {
        this.router.navigate(['sales']);
    }

    requestToCreateDeal() {
        if (this.worksheetDetailsObj.purchasers) {
            let records = this.worksheetDetailsObj.purchasers.filter(element => !element.contact_id);
            if (records && records.length > 0) {
                this.toastr.warning('Please create or associate all purchaser contacts before creating Deal', 'Warning');
                return;
            }
            let agent = this.worksheetDetailsObj.agent;
            if (agent && agent.first_name && agent.last_name && !agent.contact_id) {
                this.toastr.warning('Please create or associate agent contact before creating Deal', 'Warning');
                return;
            }
            let solicitor = this.worksheetDetailsObj.solicitor;
            if (solicitor && solicitor.first_name && solicitor.last_name && !solicitor.contact_id) {
                this.toastr.warning('Please create or associate solicitor contact before creating Deal', 'Warning');
                return;
            }
            let data = [];
            this.worksheetDetailsObj.purchasers.forEach(element => {
                let addresses = [
                    {
                        "type": "Home",
                        "is_inactive": false,
                        "street1": element.street1,
                        "street2": element.street2,
                        "street3": '',
                        "city": element.city,
                        "state": element.state,
                        "state_code": '',
                        "zip": element.zip,
                        "zip_formatted": '',
                        "country": element.country
                    }
                ];
                let emails = [
                    {
                        "type": "Personal",
                        "email": element.email,
                        "html_supported": true,
                        "marketing": true,
                        "is_inactive": false
                    }
                ];
                let phones = [
                    {
                        "type": "Mobile",
                        "number": element.mobile.number,
                        "formatted": element.mobile.formatted,
                        "marketing": true,
                        "is_inactive": false
                    },
                ]
                if (element.home_phone && element.home_phone.number) {
                    phones.push({
                        "type": "Home",
                        "number": element.home_phone.number,
                        "formatted": element.home_phone.formatted,
                        "marketing": true,
                        "is_inactive": false
                    })
                }
                let contactDetails: any = {
                    person_id: element._id,
                    worksheet_id: this.worksheetId,
                    addresses: addresses,
                    contact_type: element.contact_type ? element.contact_type : [],
                    emails: emails,
                    geography: { country: "", region: "", state: "" },
                    phones: phones,
                    display_name: `${element.first_name}${element.last_name}`,
                    first_name: element.first_name,
                    last_name: element.last_name,
                    middle_name: element.middle_name || '',
                    _id: element.contact_id
                };
                data.push(contactDetails);
            });
            let extraData:any={
                agent: null,
                solicitor:null
            };
            if(this.worksheetDetailsObj){
                if(this.worksheetDetailsObj.agent && this.worksheetDetailsObj.agent.first_name  && this.worksheetDetailsObj.agent.last_name){
                    extraData.agent=Object.assign({},this.worksheetDetailsObj.agent);
                }
                if(this.worksheetDetailsObj.solicitor && this.worksheetDetailsObj.solicitor.first_name && this.worksheetDetailsObj.solicitor.last_name){
                    extraData.solicitor=Object.assign({},this.worksheetDetailsObj.solicitor);
                }
            }
            // console.log('extraData',extraData);
            this.createModalRef = this.ngModalService.open(CreateDealModalComponent,
                {
                    size: 'lg', backdrop: 'static'
                })
            this.createModalRef.componentInstance.data = {
                component: 'worksheet',
                contact: data,
                extra:extraData
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
        else {
            this.toastr.warning('No purchaser found', 'Warning');
        }
    }

    createContactForPurchaser(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to create contact for ${item.first_name} ${item.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let contactObj = {
                        "person_id": item._id,
                        "contact_type": item.contact_type ? item.contact_type : [],
                        "is_inactive": false,
                        "prefix": "",
                        "first_name": item.first_name,
                        "middle_name": item.middle_name,
                        "last_name": item.last_name,
                        "suffix": "",
                        "display_name": `${item.first_name}${item.last_name}`,
                        "geography": {
                            "country": "Canada",
                            "state": "Alberta"
                        },
                        "salutation": `${item.first_name}${item.last_name}`,
                        "family_salutation": "",
                        "default_currency": "",
                        "addresses": [
                            {
                                "type": "Home",
                                "is_inactive": false,
                                "street1": item.street1,
                                "street2": item.street2,
                                "street3": '',
                                "city": item.city,
                                "state": item.state,
                                "state_code": '',
                                "zip": item.zip,
                                "zip_formatted": '',
                                "country": item.country
                            }
                        ],
                        "emails": [
                            {
                                "type": "Personal",
                                "email": item.email,
                                "html_supported": true,
                                "marketing": true,
                                "is_inactive": false
                            }
                        ],
                        "phones": [
                            {
                                "type": "Mobile",
                                "number": item.mobile.number,
                                "formatted": item.mobile.formatted,
                                "marketing": true,
                                "is_inactive": false
                            },
                        ]
                    }
                    if (item.home_phone && item.home_phone.number) {
                        contactObj.phones.push({
                            "type": "Home",
                            "number": item.home_phone.number,
                            "formatted": item.home_phone.formatted,
                            "marketing": true,
                            "is_inactive": false
                        })
                    }
                    // console.log('contactObj', contactObj);
                    let url = `sales/contacts`;
                    this.spinnerService.show();
                    this.webService.post(url, contactObj).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                if (response.result && response.result.row) {
                                    if (this.worksheetDetailsObj.purchasers) {
                                        this.worksheetDetailsObj.purchasers.forEach((element, index) => {
                                            if (item._id == element._id) {
                                                element.contact_id = response.result.row._id;
                                            }
                                        });
                                        let data: any = {};
                                        data['purchasers'] = this.worksheetDetailsObj.purchasers;
                                        this.updateWorksheetAPI(data)
                                    }
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
            })
            .catch((error) => { });
    }


    // getAssociactedRecords(element){
    //     let allElements=[...element.email_matched , ...element.name_matched,...element.mobile_matched];
    //     let ids= allElements.map(ele=>ele._id);
    //     let uniqueIds= [...new Set(ids)];
    //     console.log(allElements, ids , uniqueIds);
    // }

    getUnique(element, comp) {
         let allElements=[];
         allElements=[...element['email_matched'] , ...element.name_matched,...element.mobile_matched];

        // store the comparison  values in array
        const unique =  allElements.map(e => e[comp])

      // store the indexes of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

      // eliminate the false indexes & return unique objects
        .filter((e) => allElements[e]).map(e => allElements[e]);

        return unique;
    }

    checkPotentialMatchAgent(agent) {
        let url = `sales/potential-contact-for-purchasers`;
        let data = {
            first_name: agent.first_name,
            last_name: agent.last_name,
            email: agent.email,
            mobile: agent.mobile
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    // console.log('response', response);
                    if (this.worksheetDetailsObj.agent) {
                        this.worksheetDetailsObj.agent.email_matched = response.email_matched ? response.email_matched : [];
                        this.worksheetDetailsObj.agent.name_matched = response.name_matched ? response.name_matched : [];
                        this.worksheetDetailsObj.agent.mobile_matched = response.mobile_matched ? response.mobile_matched : [];
                        this.worksheetDetailsObj.agent.associated = this.getUnique(this.worksheetDetailsObj.agent,'_id');
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

    checkPotentialMatchSolicitor(solicitor) {
        let url = `sales/potential-contact-for-purchasers`;
        let data = {
            first_name: solicitor.first_name,
            last_name: solicitor.last_name,
            email: solicitor.email,
            mobile: solicitor.mobile
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    // console.log('response', response);
                    if (this.worksheetDetailsObj.solicitor) {
                        this.worksheetDetailsObj.solicitor.email_matched = response.email_matched ? response.email_matched : [];
                        this.worksheetDetailsObj.solicitor.name_matched = response.name_matched ? response.name_matched : [];
                        this.worksheetDetailsObj.solicitor.mobile_matched = response.mobile_matched ? response.mobile_matched : [];
                        this.worksheetDetailsObj.solicitor.associated = this.getUnique(this.worksheetDetailsObj.solicitor,'_id');
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

    associateContact(contact, purchaser) {
        this.confirmationDialogService.confirm('Delete', `Do you want to associte this contact for ${purchaser.first_name} ${purchaser.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (this.worksheetDetailsObj.purchasers) {
                        this.worksheetDetailsObj.purchasers.forEach((element, index) => {
                            if (purchaser._id == element._id) {
                                element.contact_id = contact._id;
                            }
                        });
                        let data: any = {};
                        data['purchasers'] = this.worksheetDetailsObj.purchasers;
                        this.updateWorksheetAPI(data)
                    }
                }
            })
            .catch((error) => { });
    }

    deAssociateContact(purchaser){
        this.confirmationDialogService.confirm('Delete', `Do you want to De-associte this contact for ${purchaser.first_name} ${purchaser.last_name}?`)
        .then((confirmed) => {
            if (confirmed) {
                if (this.worksheetDetailsObj.purchasers) {
                    let purchasers=[];
                    this.worksheetDetailsObj.purchasers.forEach((element, index) => {
                        purchasers.push(Object.assign({},element));
                    });

                    purchasers.forEach((element, index) => {
                        if(purchaser._id && element._id){
                            if (purchaser._id == element._id) {
                                delete element.contact_id;
                            }
                        }
                    });
                    let data: any = {};
                    data['purchasers'] = purchasers;
                    this.updateWorksheetAPI(data)
                }
            }
        })
        .catch((error) => { });
    }

    navigateToContact(id) {
        if(id){
        let url = `#/sales/contact/${id}`;
        window.open(url, '_blank');
        }
    }


    //Agent
    createContactForAgent() {
        this.confirmationDialogService.confirm('Delete', `Do you want to create contact for ${this.worksheetDetailsObj.agent.first_name} ${this.worksheetDetailsObj.agent.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let contactObj = {
                        // "person_id": this.worksheetDetailsObj.agent._id,
                        "contact_type": this.worksheetDetailsObj.agent.contact_type ? this.worksheetDetailsObj.agent.contact_type : [],
                        "is_inactive": false,
                        "prefix": "",
                        "first_name": this.worksheetDetailsObj.agent.first_name,
                        "middle_name": this.worksheetDetailsObj.agent.middle_name || '',
                        "last_name": this.worksheetDetailsObj.agent.last_name,
                        "suffix": "",
                        "display_name": `${this.worksheetDetailsObj.agent.first_name} ${this.worksheetDetailsObj.agent.last_name}`,
                        "geography": {
                            "country": this.worksheetDetailsObj.agent.country || '',
                            "state":  this.worksheetDetailsObj.agent.province || ''
                        },
                        "salutation": `${this.worksheetDetailsObj.agent.first_name} ${this.worksheetDetailsObj.agent.last_name}`,
                        "family_salutation": "",
                        "default_currency": "",
                        "addresses": [
                            {
                                "type": "Home",
                                "is_inactive": false,
                                "street1": this.worksheetDetailsObj.agent.address1|| '',
                                "street2": this.worksheetDetailsObj.agent.address2 || '',
                                "street3": '',
                                "city": this.worksheetDetailsObj.agent.city || '' ,
                                "state": this.worksheetDetailsObj.agent.province || '',
                                "state_code": '',
                                "zip": this.worksheetDetailsObj.agent.zip || '',
                                "zip_formatted": '',
                                "country": this.worksheetDetailsObj.agent.country || ''
                            }
                        ],
                        "emails": [
                            {
                                "type": "Personal",
                                "email": this.worksheetDetailsObj.agent.email,
                                "html_supported": true,
                                "marketing": true,
                                "is_inactive": false
                            }
                        ],
                        "phones": [
                            {
                                "type": "Mobile",
                                "number": this.worksheetDetailsObj.agent.mobile.number,
                                "formatted": this.worksheetDetailsObj.agent.mobile.formatted,
                                "marketing": true,
                                "is_inactive": false
                            },
                        ]
                    }
                    
                    console.log('contactObj', contactObj);
                    let url = `sales/contacts`;
                    this.spinnerService.show();
                    this.webService.post(url, contactObj).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                if (response.result && response.result.row) {

                                    this.worksheetDetailsObj.agent.contact_id= response.result.row._id;
                                    let data: any = {};
                                    data['agent'] = this.worksheetDetailsObj.agent;
                                    console.log('data',data);
                                    this.updateWorksheetAPI(data)
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
            })
            .catch((error) => { });
    }

    associateAgentContact(contact, agent) {
        this.confirmationDialogService.confirm('Delete', `Do you want to associte this contact for ${agent.first_name} ${agent.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (this.worksheetDetailsObj.agent) {
                        this.worksheetDetailsObj.agent.contact_id = contact._id;
                        let data: any = {};
                        data['agent'] = this.worksheetDetailsObj.agent;
                        this.updateWorksheetAPI(data)
                    }
                }
            })
            .catch((error) => { });
    }

    deAssociateAgentContact(agent){
        this.confirmationDialogService.confirm('Delete', `Do you want to De-associte this contact for ${agent.first_name} ${agent.last_name}?`)
        .then((confirmed) => {
            if (confirmed) {
                if (this.worksheetDetailsObj.agent) {
                    this.worksheetDetailsObj.agent.contact_id='';
                    let data: any = {};
                    data['agent'] = this.worksheetDetailsObj.agent;
                    this.updateWorksheetAPI(data)
                }
            }
        })
        .catch((error) => { });
    }

    //Solicitor
    createContactForSolicitor() {
        this.confirmationDialogService.confirm('Delete', `Do you want to create contact for ${this.worksheetDetailsObj.solicitor.first_name} ${this.worksheetDetailsObj.solicitor.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let contactObj = {
                        // "person_id": this.worksheetDetailsObj.agent._id,
                        "contact_type": this.worksheetDetailsObj.solicitor.contact_type ? this.worksheetDetailsObj.solicitor.contact_type : [],
                        "is_inactive": false,
                        "prefix": "",
                        "first_name": this.worksheetDetailsObj.solicitor.first_name,
                        "middle_name": this.worksheetDetailsObj.solicitor.middle_name || '',
                        "last_name": this.worksheetDetailsObj.solicitor.last_name,
                        "suffix": "",
                        "display_name": `${this.worksheetDetailsObj.solicitor.first_name} ${this.worksheetDetailsObj.solicitor.last_name}`,
                        "geography": {
                            "country": this.worksheetDetailsObj.solicitor.country || '',
                            "state":  this.worksheetDetailsObj.solicitor.province || ''
                        },
                        "salutation": `${this.worksheetDetailsObj.solicitor.first_name} ${this.worksheetDetailsObj.solicitor.last_name}`,
                        "family_salutation": "",
                        "default_currency": "",
                        "addresses": [
                            {
                                "type": "Home",
                                "is_inactive": false,
                                "street1": this.worksheetDetailsObj.solicitor.address1|| '',
                                "street2": this.worksheetDetailsObj.solicitor.address2 || '',
                                "street3": '',
                                "city": this.worksheetDetailsObj.solicitor.city || '' ,
                                "state": this.worksheetDetailsObj.solicitor.province || '',
                                "state_code": '',
                                "zip": this.worksheetDetailsObj.solicitor.zip || '',
                                "zip_formatted": '',
                                "country": this.worksheetDetailsObj.solicitor.country || ''
                            }
                        ],
                        "emails": [
                            {
                                "type": "Personal",
                                "email": this.worksheetDetailsObj.solicitor.email,
                                "html_supported": true,
                                "marketing": true,
                                "is_inactive": false
                            }
                        ],
                        "phones": [
                            {
                                "type": "Mobile",
                                "number": this.worksheetDetailsObj.solicitor.mobile.number,
                                "formatted": this.worksheetDetailsObj.solicitor.mobile.formatted,
                                "marketing": true,
                                "is_inactive": false
                            },
                        ]
                    }
                    
                    console.log('contactObj', contactObj);
                    let url = `sales/contacts`;
                    this.spinnerService.show();
                    this.webService.post(url, contactObj).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                if (response.result && response.result.row) {

                                    this.worksheetDetailsObj.solicitor.contact_id= response.result.row._id;
                                    let data: any = {};
                                    data['solicitor'] = this.worksheetDetailsObj.solicitor;
                                    console.log('data',data);
                                    this.updateWorksheetAPI(data)
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
            })
            .catch((error) => { });
    }

    associateSolicitorContact(contact, solicitor) {
        this.confirmationDialogService.confirm('Delete', `Do you want to associte this contact for ${solicitor.first_name} ${solicitor.last_name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    if (this.worksheetDetailsObj.solicitor) {
                        this.worksheetDetailsObj.solicitor.contact_id = contact._id;
                        let data: any = {};
                        data['solicitor'] = this.worksheetDetailsObj.solicitor;
                        this.updateWorksheetAPI(data)
                    }
                }
            })
            .catch((error) => { });
    }

    deAssociateSolicitorContact(solicitor){
        this.confirmationDialogService.confirm('Delete', `Do you want to De-associte this contact for ${solicitor.first_name} ${solicitor.last_name}?`)
        .then((confirmed) => {
            if (confirmed) {
                if (this.worksheetDetailsObj.solicitor) {
                    this.worksheetDetailsObj.solicitor.contact_id='';
                    let data: any = {};
                    data['solicitor'] = this.worksheetDetailsObj.solicitor;
                    this.updateWorksheetAPI(data)
                }
            }
        })
        .catch((error) => { });
    }

}

 //OPEN EDIT PROJECT MODAL
    // openEditWorksheetModal(template: TemplateRef<any>) {
    //     this.isEdit = true;
    //     this.user_mobile = new FormGroup({
    //         'mobile': new FormControl('', [Validators.required])
    //     });
    //     this.agent_mobile = new FormGroup({
    //         'mobile': new FormControl('', [Validators.required])
    //     });
    //     this.solicitor_mobile = new FormGroup({
    //         'mobile': new FormControl('', [Validators.required])
    //     });

    //     this.purchasersGroup = this.formBuilder.group({
    //         purchasers: this.formBuilder.array([])
    //     })

    //     this.getProjectList();
    //     this.formDetails = Object.assign({}, this.worksheetDetailsObj);
    //     if (this.worksheetDetailsObj.purchasers && this.worksheetDetailsObj.purchasers.length > 0) {
    //         if (this.formDetails.mobile && this.formDetails.mobile.number) {
    //             this.user_mobile.controls.mobile.setValue({
    //                 "number": this.formDetails.mobile.number,
    //             });
    //         }
    //         this.formDetails['purchasers'] = []
    //         this.worksheetDetailsObj.purchasers.forEach((element, index) => {
    //             this.appendValueWithPurchaserGroup(element);
    //         });

    //     }
    //     this.formDetails.choices = [];
    //     if (this.worksheetDetailsObj.choices && this.worksheetDetailsObj.choices.length > 0) {
    //         this.worksheetDetailsObj.choices.forEach((element, index) => {
    //             this.formDetails.choices.push(
    //                 {
    //                     project_id: element.project_id ? element.project_id : '',
    //                     project_name: element.project_name ? element.project_name : '',
    //                     model_id: element.model_id ? element.model_id : '',
    //                     model_name: element.model_name ? element.model_name : '',
    //                     level: element.level ? element.level : '',
    //                 }
    //             )
    //             if (element.project_id) {
    //                 this.getModelList(element.project_id, index);
    //             }
    //         });
    //     }
    //     else {
    //         this.addDefaultChoices();
    //     }
    //     // console.log(this.formDetails.choices);
    //     this.formDetails['agent'] = Object.assign({}, this.worksheetDetailsObj.agent);
    //     // this.formDetails['agent']['mobile'] = Object.assign({}, this.worksheetDetailsObj.agent ? this.worksheetDetailsObj.agent.mobile : {});
    //     if (this.formDetails.agent && this.formDetails.agent.mobile && this.formDetails.agent.mobile.number) {
    //         this.agent_mobile.controls.mobile.setValue({
    //             "number": this.formDetails.agent.mobile.number,
    //         });
    //     }

    //     this.formDetails['solicitor'] = Object.assign({}, this.worksheetDetailsObj.solicitor);
    //     if (this.formDetails.solicitor && this.formDetails.solicitor.mobile && this.formDetails.solicitor.mobile.number) {
    //         this.solicitor_mobile.controls.mobile.setValue({
    //             "number": this.formDetails.solicitor.mobile.number,
    //         });
    //     }
    //     else {
    //         this.formDetails.solicitor = {};
    //     }

    //     this.worksheetDetailsObj.purchasers.forEach((element, index) => {
    //         let group = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString());
    //         if (element.mobile && element.mobile.number) {
    //             group.controls.mobile.setValue({
    //                 "e164Number": element.mobile.number,
    //                 "nationalNumber": element.mobile.formatted,
    //                 "number": element.mobile.number,
    //             });
    //         }
    //         if (element.home_phone && element.home_phone.number) {
    //             group.controls.home_phone.setValue({
    //                 "e164Number": element.home_phone.number,
    //                 "nationalNumber": element.home_phone.formatted,
    //                 "number": element.mobile.number,
    //             });
    //         }
    //     });
    //     this.purchasersGroup.updateValueAndValidity();
    //     // console.log('this.formDetails', this.purchasersGroup);
    //     this.formDetails.type = this.formDetails.investment ? 'investment' : 'rental';
    //     this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    // }

    // editWorksheet() {
    //     var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    //     if (!this.formDetails.first_name) {
    //         this.toastr.warning('Please enter first name', 'Warning');
    //         return;
    //     }
    //     if (!this.formDetails.last_name) {
    //         this.toastr.warning('Please enter last name', 'Warning');
    //         return;
    //     }
    //     if (!this.formDetails.legal_name) {
    //         this.toastr.warning('Please enter legal name', 'Warning');
    //         return;
    //     }
    //     if (!this.formDetails.dob) {
    //         this.toastr.warning('Please enter date of birth', 'Warning');
    //         return;
    //     }
    //     if (!this.formDetails.email) {
    //         this.toastr.warning('Please enter user email', 'Warning');
    //         return;
    //     }
    //     else {
    //         if (reg.test(this.formDetails.email) == false) {
    //             this.toastr.warning(`Please enter valid user email`, 'Warning');
    //             return;
    //         } else {
    //             this.formDetails.email = this.formDetails.email.toLowerCase();
    //         }
    //     }
    //     if (!this.user_mobile.controls['mobile'].value) {
    //         this.toastr.warning('Please enter mobile number', 'Warning');
    //         return;
    //     }
    //     else {
    //         if (this.user_mobile.controls['mobile'].invalid) {
    //             this.toastr.warning('Please enter valid mobile number', 'Warning');
    //             return;
    //         }
    //     }
    //     if ((!this.formDetails.user_type)) {
    //         this.toastr.warning('Please check investment or rental', 'Warning');
    //         return;
    //     }

    //     this.formDetails.purchasers = [];
    //     let purchasersGp = Object.assign({}, this.purchasersGroup.value);
    //     purchasersGp.purchasers.forEach(element => {
    //         this.formDetails.purchasers.push(Object.assign({}, element));
    //     });
    //     // console.log('purchasersGp', purchasersGp);
    //     var keepGoing = true;
    //     this.formDetails.purchasers.forEach((element, index) => {
    //         if (!element.first_name) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} first name`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.last_name) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} last name`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.legal_full_name) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} legal full name`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.dob) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} date of birth`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         } else {
    //             element.dob = moment(element.dob).format('YYYY-MM-DD');
    //         }
    //         if (!element.address1) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} address1`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.city) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} city`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.province) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} province`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.zip) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} zip`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.country) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} country`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.occupation) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} occupation`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         if (!element.mobile) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} mobile`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         }
    //         else {
    //             let mobileControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('mobile');
    //             if (mobileControl && mobileControl.invalid) {
    //                 this.toastr.warning(`Please enter  purchaser${index + 1} valid mobile number`, 'Warning');
    //                 keepGoing = false;
    //                 return;
    //             }
    //         }

    //         if (element.home_phone) {
    //             let homePhoneControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('home_phone');
    //             if (homePhoneControl && homePhoneControl.invalid) {
    //                 this.toastr.warning(`Please enter  purchaser${index + 1} valid home phone number`, 'Warning');
    //                 keepGoing = false;
    //                 return;
    //             }
    //         }

    //         if (!element.email) {
    //             this.toastr.warning(`Please enter purchaser${index + 1} email`, 'Warning');
    //             keepGoing = false;
    //             return;
    //         } else {
    //             if (reg.test(element.email) == false) {
    //                 this.toastr.warning(`Please enter valid purchaser${index + 1} email`, 'Warning');
    //                 keepGoing = false;
    //                 return;
    //             } else {
    //                 element.email = element.email.toLowerCase();
    //             }
    //         }
    //     });
    //     if (keepGoing) {
    //         if (!this.formDetails.agent.first_name) {
    //             this.toastr.warning('Please enter agent first name', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.agent.last_name) {
    //             this.toastr.warning('Please enter agent last name', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.agent.email) {
    //             this.toastr.warning('Please enter agent email', 'Warning');
    //             return;
    //         }
    //         if (reg.test(this.formDetails.agent.email) == false) {
    //             this.toastr.warning(`Please enter valid agent email`, 'Warning');
    //             return;
    //         } else {
    //             this.formDetails.agent.email = this.formDetails.agent.email.toLowerCase();
    //         }
    //         if (!this.formDetails.agent.address1) {
    //             this.toastr.warning('Please enter agent address1', 'Warning');
    //             return;
    //         }

    //         if (!this.formDetails.agent.city) {
    //             this.toastr.warning('Please enter agent city', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.agent.province) {
    //             this.toastr.warning('Please enter agent province', 'Warning');
    //             return;
    //         }
    //         // if (!this.formDetails.agent.zip) {
    //         //     this.toastr.warning('Please enter agent zip', 'Warning');
    //         //     return;
    //         // }
    //         // if (!this.formDetails.agent.country) {
    //         //     this.toastr.warning('Please enter agent country', 'Warning');
    //         //     return;
    //         // }
    //         // if (!this.formDetails.agent.brokerage) {
    //         //     this.toastr.warning('Please enter agent brokerage', 'Warning');
    //         //     return;
    //         // }
    //         if (!this.agent_mobile.controls['mobile'].value) {
    //             this.toastr.warning('Please enter agent mobile number', 'Warning');
    //             return;
    //         }
    //         else {
    //             if (this.agent_mobile.controls['mobile'].invalid) {
    //                 this.toastr.warning('Please enter valid agent mobile number', 'Warning');
    //                 return;
    //             }
    //         }
    //         //solicitor
    //         if (!this.formDetails.solicitor.first_name) {
    //             this.toastr.warning('Please enter solicitor first name', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.solicitor.last_name) {
    //             this.toastr.warning('Please enter solicitor last name', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.solicitor.email) {
    //             this.toastr.warning('Please enter solicitor email', 'Warning');
    //             return;
    //         }
    //         if (reg.test(this.formDetails.solicitor.email) == false) {
    //             this.toastr.warning(`Please enter valid solicitor email`, 'Warning');
    //             return;
    //         } else {
    //             this.formDetails.solicitor.email = this.formDetails.solicitor.email.toLowerCase();
    //         }
    //         if (!this.formDetails.solicitor.address1) {
    //             this.toastr.warning('Please enter solicitor address1', 'Warning');
    //             return;
    //         }

    //         if (!this.formDetails.solicitor.city) {
    //             this.toastr.warning('Please enter solicitor city', 'Warning');
    //             return;
    //         }
    //         if (!this.formDetails.solicitor.province) {
    //             this.toastr.warning('Please enter solicitor province', 'Warning');
    //             return;
    //         }

    //         if (!this.solicitor_mobile.controls['mobile'].value) {
    //             this.toastr.warning('Please enter solicitor mobile number', 'Warning');
    //             return;
    //         }
    //         else {
    //             if (this.solicitor_mobile.controls['mobile'].invalid) {
    //                 this.toastr.warning('Please enter valid solicitor mobile number', 'Warning');
    //                 return;
    //             }
    //         }
    //         var data = {
    //             first_name: this.formDetails.first_name,
    //             middle_name: this.formDetails.middle_name,
    //             last_name: this.formDetails.last_name,
    //             legal_name: this.formDetails.legal_name,
    //             dob: moment(this.formDetails.dob).format('YYYY-MM-DD'),
    //             sin: this.formDetails.sin || '',
    //             occupation: this.formDetails.occupation || '',
    //             // investment: this.formDetails.type == 'investment' ? true : false,
    //             // rental: this.formDetails.type == 'rental' ? true : false,
    //             email: this.formDetails.email,
    //             user_type: this.formDetails.user_type,
    //             purchasers: this.formDetails.purchasers,
    //             how_did_you_hear: this.formDetails.how_did_you_hear || '',
    //             online_registration_date: this.formDetails.online_registration_date || '',
    //             // choices: this.formDetails.choices,
    //             // agent: this.formDetails.agent,
    //             maritial_status: this.formDetails.maritial_status || '',
    //             no_of_dependants: this.formDetails.no_of_dependants || '',
    //             rent_or_own: this.formDetails.rent_or_own || '',
    //             reason_for_purchase: this.formDetails.reason_for_purchase || '',
    //             deciding_factor: this.formDetails.deciding_factor || '',
    //             comments: this.formDetails.comments || '',
    //         }
    //         let userMobileObj = Object.assign({}, this.user_mobile.value.mobile);
    //         if (this.user_mobile.value && this.user_mobile.value.mobile && this.user_mobile.value.mobile.nationalNumber) {
    //             let mobileObj = {
    //                 number: this.user_mobile.value.mobile.e164Number,
    //                 formatted: this.user_mobile.value.mobile.nationalNumber,
    //             }
    //             // delete data.agent['mobile'];
    //             data['mobile'] = Object.assign({}, mobileObj);
    //         }
    //         else {
    //             data['mobile'] = {};
    //         }

    //         let purchasers = [];
    //         if (this.formDetails && this.formDetails.purchasers && this.formDetails.purchasers.length > 0) {
    //             this.formDetails.purchasers.forEach((element, index) => {
    //                 let obj = {
    //                     address1: element.address1 ? element.address1 : "",
    //                     address2: element.address2 ? element.address2 : "",
    //                     city: element.city ? element.city : "",
    //                     country: element.country ? element.country : "",
    //                     dob: element.dob ? moment(element.dob).format('YYYY-MM-DD') : "",
    //                     email: element.email ? element.email : "",
    //                     first_name: element.first_name ? element.first_name : "",
    //                     last_name: element.last_name ? element.last_name : "",
    //                     legal_full_name: element.legal_full_name ? element.legal_full_name : "",
    //                     middle_name: element.middle_name ? element.middle_name : "",
    //                     province: element.province ? element.province : "",
    //                     zip: element.zip ? element.zip : "",
    //                     occupation: element.occupation ? element.occupation : "",
    //                     // mobile: element.mobile ? element.mobile : "",
    //                     // home_phone: element.home_phone ? element.home_phone : "",
    //                     office: element.office ? element.office : "",
    //                     residency: element.residency ? element.residency : "",
    //                 };

    //                 let homePhoneControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('home_phone');
    //                 // console.log('homePhoneControl', homePhoneControl);
    //                 if (homePhoneControl.value && homePhoneControl.value && homePhoneControl.value.nationalNumber) {
    //                     let home_phoneObj = {
    //                         number: homePhoneControl.value.e164Number,
    //                         formatted: homePhoneControl.value.nationalNumber,
    //                     }
    //                     obj['home_phone'] = Object.assign({}, home_phoneObj);

    //                 }
    //                 else {
    //                     obj['home_phone'] = {};
    //                 }

    //                 let mobileControl = <FormGroup>this.purchasersGroup.get('purchasers').get(index.toString()).get('mobile');
    //                 // console.log('mobileControl', mobileControl);
    //                 if (mobileControl.value && mobileControl.value && mobileControl.value.nationalNumber) {
    //                     let mobileObj = {
    //                         number: mobileControl.value.e164Number,
    //                         formatted: mobileControl.value.nationalNumber,
    //                     }
    //                     obj['mobile'] = Object.assign({}, mobileObj);
    //                 }
    //                 else {
    //                     obj['mobile'] = {};
    //                 }

    //                 purchasers.push(obj);
    //             });
    //         }
    //         data['purchasers'] = purchasers;
    //         //Formatting mobile fields in the agent
    //         let agent = Object.assign({}, this.formDetails.agent);
    //         data['agent'] = agent;
    //         let agentMobile = Object.assign({}, this.agent_mobile.value.mobile);
    //         if (this.agent_mobile.value && this.agent_mobile.value.mobile && this.agent_mobile.value.mobile.nationalNumber) {
    //             let mobileObj = {
    //                 number: this.agent_mobile.value.mobile.e164Number,
    //                 formatted: this.agent_mobile.value.mobile.nationalNumber,
    //             }
    //             // delete data.agent['mobile'];
    //             data['agent'].mobile = mobileObj;
    //         }

    //         //Formatting mobile fields in the solicitor
    //         let solicitor = Object.assign({}, this.formDetails.solicitor);
    //         data['solicitor'] = solicitor;
    //         let solicitorMobile = Object.assign({}, this.solicitor_mobile.value.mobile);
    //         if (solicitorMobile) {
    //             if (solicitorMobile.hasOwnProperty('e164Number') && solicitorMobile.nationalNumber) {
    //                 let mobileObj = {
    //                     number: solicitorMobile.e164Number,
    //                     formatted: solicitorMobile.nationalNumber,
    //                 }
    //                 data['solicitor'].mobile = mobileObj;
    //             }
    //             else {
    //                 data['solicitor'].mobile = {};
    //             }
    //         }
    //         else {
    //             data['solicitor'].mobile = {};
    //         }

    //         data['choices'] = [];
    //         if (this.formDetails.choices && this.formDetails.choices.length > 0) {
    //             this.formDetails.choices.forEach((element, index) => {
    //                 let selectedProject = this.projectList.find((ele) => ele._id == element.project_id);
    //                 let selectedModel: any;
    //                 if (index == 0) {
    //                     selectedModel = this.modelList.find((ele) => ele._id == element.model_id);
    //                 }
    //                 else if (index == 1) {
    //                     selectedModel = this.modelListTwo.find((ele) => ele._id == element.model_id);
    //                 }
    //                 else if (index == 2) {
    //                     selectedModel = this.modelListThree.find((ele) => ele._id == element.model_id);
    //                 }
    //                 // console.log('selectedProject', selectedProject);
    //                 if (selectedProject && selectedModel) {
    //                     data['choices'].push(
    //                         {
    //                             project_id: selectedProject._id ? selectedProject._id : '',
    //                             project_name: selectedProject.name ? selectedProject.name : '',
    //                             model_id: selectedModel._id ? selectedModel._id : '',
    //                             model_name: selectedModel.name ? selectedModel.name : '',
    //                             level: element.level ? element.level : '',
    //                         }
    //                     )
    //                 }
    //                 else {
    //                     data['choices'].push(
    //                         {
    //                             project_id: '',
    //                             project_name: '',
    //                             model_id: '',
    //                             model_name: '',
    //                             level: element.level ? element.level : '',
    //                         }
    //                     )
    //                 }

    //             });
    //         }

    //         // console.log('data', data);
    //         let url = `sales/worksheets?_id=${this.formDetails._id}`;
    //         this.spinnerService.show();
    //         this.webService.post(url, data).subscribe((response: any) => {
    //             this.spinnerService.hide();
    //             if (response.is_valid_session) {
    //                 if (response.status == 1) {
    //                     this.toastr.success(response.message, 'Success');
    //                     this.getWorksheetDetails();
    //                     this.modalRef.hide();
    //                 } else {
    //                     this.toastr.error(response.message, 'Error');
    //                 }
    //             } else {
    //                 this.toastr.error('Your Session expired', 'Error');
    //                 this.router.navigate(['/login'], { queryParams: { return_url: 'sales' } });
    //             }
    //         }, (error) => {
    //             console.log('error', error);
    //         });
    //     }
    // }

