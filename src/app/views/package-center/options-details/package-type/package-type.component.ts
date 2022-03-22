import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-package-type',
    templateUrl: './package-type.component.html',
    styleUrls: ['./package-type.component.css']
})
export class PackageTypeComponent implements OnInit {
    @Input() optionDetailsObj: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() optionId: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    packageList: any[] = [];
    incompatiblePackagesList: any[] = [];
    soldWithPackagesList: any[] = [];
    dropdownSettings: any = {};
    should_sold_with: boolean = false;
    incompatible_packages: boolean = false;

    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private router: Router,
        private modalService: BsModalService,
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
    getPackagesList(type) {
        this.packageList = [];
        this.spinnerService.show();
        let url = `package-center/packages?project_id=${this.optionDetailsObj.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            const only_sold_with_packages = this.optionDetailsObj.only_sold_with_packages ? this.optionDetailsObj.only_sold_with_packages.map(ele => ele._id) : [];
            const incompatible_packages = this.optionDetailsObj.incompatible_packages ? this.optionDetailsObj.incompatible_packages.map(ele => ele._id) : [];

            if (response.status == 1) {
                if (type == 'only_sold_with_packages') {

                    this.soldWithPackagesList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_packages.indexOf(element._id) == -1 && incompatible_packages.indexOf(element._id) == -1) {
                        if (element._id != this.optionId && incompatible_packages.indexOf(element._id) == -1) {
                            this.soldWithPackagesList.push(element);
                        }
                    });
                }
                else if (type == 'incompatible_packages') {
                    this.incompatiblePackagesList = [];
                    response.results.forEach(element => {
                        // if (element._id != this.optionId && only_sold_with_packages.indexOf(element._id) == -1 && incompatible_packages.indexOf(element._id) == -1) {                        
                        if (element._id != this.optionId && only_sold_with_packages.indexOf(element._id) == -1) {
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

    onChangeSoldWithCheckbox() {

    }

    openAddSoldWithPackages(template: TemplateRef<any>) {
        this.getPackagesList('only_sold_with_packages');
        this.formDetails.only_sold_with_packages = (this.optionDetailsObj.only_sold_with_packages && this.optionDetailsObj.only_sold_with_packages.length > 0) ? this.optionDetailsObj.only_sold_with_packages : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteSoldWithPackage(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.only_sold_with_packages.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.only_sold_with_packages = shallowCopy ? shallowCopy : [];
                    let url = `package-center/options?_id=${this.optionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getOptionDetails();
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

    openAddIncompatiblePackage(template: TemplateRef<any>) {
        this.getPackagesList('incompatible_packages');
        this.formDetails.incompatible_packages = (this.optionDetailsObj.incompatible_packages && this.optionDetailsObj.incompatible_packages.length > 0) ? this.optionDetailsObj.incompatible_packages : [];
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

    }

    deleteIncompatiblePackage(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} Incompatible Option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data: any = {};
                    let shallowCopy = [];
                    this.optionDetailsObj.incompatible_packages.forEach(val => shallowCopy.push(Object.assign({}, val)));
                    shallowCopy.splice(index, 1);
                    data.incompatible_packages = shallowCopy ? shallowCopy : [];
                    let url = `package-center/options?_id=${this.optionId}`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getOptionDetails();
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

    addSoldWithPacakge() {
        if (this.formDetails.only_sold_with_packages.length == 0) {
            this.toastr.warning('Please select package', 'Warning');
            return;
        }
        let data: any = {};
        data.only_sold_with_packages = this.formDetails.only_sold_with_packages ? this.formDetails.only_sold_with_packages : [];
        let url = `package-center/options?_id=${this.optionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getOptionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    addIncompatiblePackages() {
        if (this.formDetails.incompatible_packages.length == 0) {
            this.toastr.warning('Please select incompatible package', 'Warning');
            return;
        }
        let data: any = {};
        data.incompatible_packages = this.formDetails.incompatible_packages ? this.formDetails.incompatible_packages : [];
        let url = `package-center/options?_id=${this.optionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getOptionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onSelectDeSelectAll(type) {
        this.formDetails[type] = event;
    }

    onItemSelect(type) {
        this.formDetails[type] = event;
    }

    getOptionDetails() {
        this.getDetailsEvent.emit(true);
    }
}
