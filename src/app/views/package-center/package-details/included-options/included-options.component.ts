import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { element } from 'protractor';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-included-options',
    templateUrl: './included-options.component.html',
    styleUrls: ['./included-options.component.css']
})
export class IncludedOptionsComponent implements OnInit {
    @Input() packageDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    @Input() packageId: string;
    optionsList: any[] = [];
    includedOptionList: any[] = [];
    formDetails: any = {};
    paginationObj: any = {};
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_created';
    modalRef: BsModalRef;
    reverse: boolean = true;
    isBulkDelete: boolean = false;
    selectedAll: boolean = false;
    selectedAllOptions: boolean = false;
    editOptionsList = [];
    baseUrl = environment.BASE_URL;

    constructor(private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
    }
    ngOnChanges() {
        if (this.packageDetails) {
            this.getIncludedOptionList();
        }
    }

    //NON INLINE EDITOR OPTIONS
    public nonInlineEdit: Object = {
        attribution: false,
        heightMax: 200,
        charCounterCount: false,
        pasteDeniedTags: ['img'],
        videoInsertButtons:['videoBack', '|', 'videoByURL', 'videoEmbed'],
        toolbarButtons: {
            'moreText': {

                'buttons': ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
                'buttonsVisible': 4
            
              },
            
              'moreParagraph': {
            
                'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote'],
                'buttonsVisible': 2
            
              },
            
              'moreRich': {
            
                'buttons': ['insertLink', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertHR'],
                'buttonsVisible': 2
            
              },
            
              'moreMisc': {
            
                'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
            
                'align': 'right',
            
                'buttonsVisible': 2
            
              }
            
            },
        key: "te1C2sB5C7D5G4H5B3jC1QUd1Xd1OZJ1ABVJRDRNGGUE1ITrE1D4A3A11B1B6B5B1F4F3==",
    }

    openBulkAddModal(template: TemplateRef<any>) {
        this.getPackageList();
        this.selectedAllOptions = false;
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });

    }

    // openEditDescriptionNotesModal(template: TemplateRef<any>, item) {
    //     this.formDetails = { ...item };
    //     this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    // }
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
        this.getIncludedOptionList();
    }
    selectAll() {
        for (var i = 0; i < this.includedOptionList.length; i++) {
            this.includedOptionList[i].should_delete = this.selectedAll;
        }
        this.onChangeDeleteCheckbox();
    }

    selectAllOptions() {
        for (var i = 0; i < this.optionsList.length; i++) {
            this.optionsList[i].is_selected = this.selectedAllOptions;
        }
    }

    navigateToOption(event, id) {
        event.stopPropagation();
        let url = `#/package-center/options/${id}`;
        window.open(url, '_blank');

    }

    getPackageList() {
        this.optionsList = [];
        this.spinnerService.show();
        let url = `package-center/options?project_id=${this.packageDetails.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.status == 1) {
                // let incompatible_package = this.packageDetails.incompatible_packages ? this.packageDetails.incompatible_packages.map(ele => ele._id) : [];
                // const parentPackageId = this.packageDetails.parent_package ? this.packageDetails.parent_package.id : '';
                let included_options = this.packageDetails.included_options ? this.packageDetails.included_options.map(ele => ele._id) : []
                response.results.forEach(element => {
                    if (included_options.indexOf(element._id) == -1) {
                        this.optionsList.push(element);
                    }
                });
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    getIncludedOptionList() {
        if (this.packageDetails.included_options) {
            this.includedOptionList = this.packageDetails.included_options;
            this.includedOptionList.forEach((element) => {
                element.should_delete = false;
                this.selectedAll = false;

            })
        }
    }
    onChangeDeleteCheckbox() {
        let records = this.includedOptionList.filter(element => element.should_delete == true);
        if (records.length > 0) {
            this.isBulkDelete = true;
        }
        else {
            this.isBulkDelete = false;
        }
    }

    async  addBulkOptions() {
        let selectedElements = this.optionsList.filter(element => element.is_selected);

        if (selectedElements.length == 0) {
            this.toastr.error('Please select option', 'Error');
            return;
        }

        //format the selectedElements
        let existingItems = this.packageDetails.included_options ? this.packageDetails.included_options : [];
        let formattedModels: any[] = [...existingItems];
        selectedElements.forEach((ele) => {
            let obj: any = {
                _id: ele._id,
                name: ele.name
            };
            formattedModels.push(obj);
        });
        const data: any = {
            included_options: formattedModels
        };
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getPackageDetails();
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


    getPackageDetails() {
        this.getDetailsEvent.emit(true);
    }


    deleteOption(item, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.name} option?`)
            .then((confirmed) => {
                if (confirmed) {
                    let existingCollections = this.packageDetails.included_options ? this.packageDetails.included_options : [];
                    existingCollections.splice(index, 1);
                    const data: any = {};
                    data._id = this.packageId;
                    data.included_options = existingCollections;
                    let url = `package-center/packages`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.selectedAll = false;
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

    deleteBulkOptions() {
        let selectedRecords = this.includedOptionList.filter(element => element.should_delete == true);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${selectedRecords.length} options?`)
            .then((confirmed) => {
                if (confirmed) {
                    let finalList: any[] = [];
                    this.includedOptionList.forEach((element, index) => {
                        if (element.should_delete == false) {
                            finalList.push(element);
                        }
                    });
                    const data: any = {};
                    data._id = this.packageId;
                    data.included_options = finalList;
                    let url = `package-center/packages`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageDetails();
                            this.selectedAll = false;
                            this.isBulkDelete = false;
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

    doPaginationWise(page) {
        this.page = page;
        this.getIncludedOptionList();
    }

    setPageSize() {
        this.page = 1;
        this.getIncludedOptionList();
    }
}
