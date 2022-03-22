import { Component, OnInit, Input, EventEmitter, Output, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-package-packages',
    templateUrl: './packages.component.html',
    styleUrls: ['./packages.component.css']
})
export class PackagePackagesComponent implements OnInit {
    packagesList: any[] = [];
    @Input() packageDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() packageId: string;
    modalRef: BsModalRef;
    formDetails: any = {};
    dropdownSettings: any = {};
    optionList: any[] = [];
    incompatiblePackagesList: any[] = [];
    constructor(private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            // itemsShowLimit: 1,
            allowSearchFilter: true
        };
    }

    getPackageList(type) {
        this.packagesList = [];
        this.spinnerService.show();
        let url = `package-center/packages?project_id=${this.packageDetails.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            let incompatible_package = this.packageDetails.incompatible_packages ? this.packageDetails.incompatible_packages.map(ele => ele._id) : [];
            if (response.status == 1) {
                if (type == 'parent_package') {
                    response.results.forEach(element => {
                        if (element._id != this.packageId) {
                            if (incompatible_package.indexOf(element._id) == -1) {
                                this.packagesList.push(element);
                            }
                        }
                    });
                }
                else if (type == 'incompatible_package') {
                    this.incompatiblePackagesList = [];
                    response.results.forEach(element => {
                        const parentPackageId = this.packageDetails.parent_package ? this.packageDetails.parent_package.id : '';
                        // if (element._id != this.packageId && element._id != parentPackageId && incompatible_package.indexOf(element._id) == -1) {
                        if (element._id != this.packageId && element._id != parentPackageId) {
                            this.incompatiblePackagesList.push(element);
                        }
                    });
                }

                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getPersonalizationOptions() {
        this.spinnerService.show();
        let url = `package-center/options?project_id=${this.packageDetails.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.status == 1) {
                this.optionList = response.results;
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    openAddOptions(template: TemplateRef<any>) {
        this.getPersonalizationOptions();
        this.formDetails.incompatible_personalization_options = this.packageDetails.incompatible_personalization_options ? this.packageDetails.incompatible_personalization_options : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addIncompatibleOptions() {
        if (this.formDetails.incompatible_personalization_options.length == 0) {
            this.toastr.error('Please select incompatible package', 'Error');
            return;
        }
        let data: any = {};
        data.incompatible_personalization_options = this.formDetails.incompatible_personalization_options ? this.formDetails.incompatible_personalization_options : [];
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteIncompatibleOptions(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Incompatible Option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.packageDetails.incompatible_personalization_options.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.incompatible_personalization_options = shallowCopy ? shallowCopy : [];
                    let url = `package-center/packages?_id=${this.packageId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageDetails();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    openAddParentPackage(template: TemplateRef<any>) {
        this.getPackageList('parent_package');
        this.formDetails.parent_package = this.packageDetails.parent_package ? this.packageDetails.parent_package.id : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addParentPackage() {

        if (!this.formDetails.parent_package) {
            this.toastr.error('Please select parent package', 'Error');
            return;
        }
        let data: any = {};
        let selectedPackage = this.packagesList.find((element) => element._id == this.formDetails.parent_package)
        data.parent_package = {
            id: selectedPackage ? selectedPackage._id : '',
            name: selectedPackage ? selectedPackage.name : ''
        }
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openAddIncompatiblePackage(template: TemplateRef<any>) {
        this.getPackageList('incompatible_package');
        this.formDetails.incompatible_packages = (this.packageDetails.incompatible_packages && this.packageDetails.incompatible_packages.length > 0) ? this.packageDetails.incompatible_packages : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addIncompatiblePackage() {
        if (this.formDetails.incompatible_packages.length == 0) {
            this.toastr.error('Please select incompatible package', 'Error');
            return;
        }
        let data: any = {};
        data.incompatible_packages = this.formDetails.incompatible_packages ? this.formDetails.incompatible_packages : [];
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteIncompatiblePackage(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Incompatible Package?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.packageDetails.incompatible_packages.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.incompatible_packages = shallowCopy ? shallowCopy : [];
                    let url = `package-center/packages?_id=${this.packageId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageDetails();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }
    onSelectDeSelectAll(type) {
        this.formDetails[type] = event;
    }

    onItemSelect(type) {
        this.formDetails[type] = event;
    }

    getPackageDetails() {
        this.getDetailsEvent.emit(true);
    }


}
