import { Component, OnInit, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-package-models',
    templateUrl: './package-models.component.html',
    styleUrls: ['./package-models.component.css']
})
export class PackageModelsComponent implements OnInit {
    @Input() packageDetails: any = {};
    @Input() packageId: string;
    modelList: any[] = [];
    selectedModelList: any[] = [];
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
    selectedAllModel: boolean = false;
    editModelList = [];
    filterForm: any = {
        searchText: '',
        // model_id: [],
        beds: [],
        baths: [],
        den: [],
        media: [],
        flex: [],
        floor_legal: [],
        type: [],
        collection: [],
        ceiling: []
    };
    ceilingFields: any[] = [
        { _id: 9, value: 9 },
        { _id: 10, value: 10 },
        { _id: 11, value: 11 },
        { _id: 12, value: 12 },
        { _id: 13, value: 13 },
        { _id: 14, value: 14 },
        { _id: 15, value: 15 }
    ];
    modelDropdownSettings: any = {};
    dropdownSettings = {};
    filterModelList: any[] = [];
    numberFields: any[] = [
        { _id: 1, value: 1 },
        { _id: 2, value: 2 },
        { _id: 3, value: 3 },
        { _id: 4, value: 4 },
        { _id: 5, value: 5 }
    ];
    floorList: any = [] = [];
    isClear: boolean = false;
    collectionOptions: any[] = [];
    typeOptions: any[] = [];
    modelFilterForm: any = {
        searchText: '',
        beds: [],
        baths: [],
        den: [],
        media: [],
        flex: [],
        floor_legal: [],
        type: [],
        collection: [],
        ceiling: []
    }
    modelSortOrder: any = 'DESC';
    modelSortedtby: any = '_updated';
    modelOrder: string = '_updated';
    modelReverse: boolean = true;
    isEdit: boolean = false;
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
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

        let filterData: any = localStorage.getItem('packageCenterProjectData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData && filterData._id) {
                this.getFloorList(filterData.no_of_floors ? filterData.no_of_floors : 0);
            }
            else {
                this.floorList = this.numberFields;
            }
        }
        else {
            this.floorList = this.numberFields;
        }
    }

    ngOnChanges() {
        if (this.packageDetails) {

            this.getSavedFilterdata();
        }
    }


    getSavedFilterdata() {

        let filterData: any = localStorage.getItem('packagesModelFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
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
            if (filterData.type) {
                this.modelFilterForm.type = filterData.type;
            }
            if (filterData.collection) {
                this.modelFilterForm.collection = filterData.collection;
            }
            if (filterData.beds) {
                this.modelFilterForm.beds = filterData.beds;
            }
            if (filterData.den) {
                this.modelFilterForm.den = filterData.den;
            }
            if (filterData.baths) {
                this.modelFilterForm.baths = filterData.baths;
            }

            if (filterData.media) {
                this.modelFilterForm.media = filterData.media;
            }
            if (filterData.flex) {
                this.modelFilterForm.flex = filterData.flex;
            }
            if (filterData.floor_legal) {
                this.modelFilterForm.floor_legal = filterData.floor_legal;
            }
            if (filterData.searchText) {
                this.modelFilterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getSeletedModelList();
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
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

    openBulkEditModal(template: TemplateRef<any>) {
        this.editModelList = [];
        this.isEdit = true;
        this.getEditModelsList();
        // this.selectedModelList.forEach(val => this.editModelList.push(Object.assign({}, val)));
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });

    }

    openBulkAddModal(template: TemplateRef<any>) {
        this.getModelList();
        this.selectedAllModel = false;
        this.isEdit = false;
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });

    }

    openEditDescriptionNotesModal(template: TemplateRef<any>, item) {
        this.formDetails = { ...item };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
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
        this.getSeletedModelList();
    }
    selectAll() {
        for (var i = 0; i < this.selectedModelList.length; i++) {
            this.selectedModelList[i].should_delete = this.selectedAll;
        }
        this.onChangeDeleteCheckbox();
    }

    selectAllModel() {
        for (var i = 0; i < this.modelList.length; i++) {
            this.modelList[i].is_selected = this.selectedAllModel;
        }
    }


    getOptionsTypeList() {
        let url = `package-center/options-of-model-types?project_id=${this.packageDetails.project_id}`;
        this.typeOptions = [];
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (response.results && response.results.length > 0) {
                    response.results.forEach(element => {
                        if (element && element != '') {
                            this.typeOptions.push(element);
                        }
                    });
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getOptionsCollectionList() {
        let url = `package-center/options-of-model-collections?project_id=${this.packageDetails.project_id}`;
        this.spinnerService.show();
        this.collectionOptions = [];
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (response.results && response.results.length > 0) {
                    response.results.forEach(element => {
                        if (element && element != '') {
                            this.collectionOptions.push(element);
                        }
                    });
                }
            }
        }, (error) => {
            console.log('error', error);
        });
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

    clearFilter() {
        // this.filterForm.model_id = [];
        this.filterForm.beds = [];
        this.filterForm.baths = [];
        this.filterForm.floor_legal = [];
        this.filterForm.searchText = '';
        this.filterForm.den = [];
        this.filterForm.media = [];
        this.filterForm.flex = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.filterForm.ceiling = [];

        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }

    getModelList() {
        let url = `package-center/models-list`;
        let data: any = {};
        data._id = this.packageId;
        data.purpose = `add`;
        data.project_id = this.packageDetails.project_id;
        data.subtype = `PACKAGE`;
        if (this.modelSortedtby) {
            data.sortBy = this.modelSortedtby;
            data.sortOrder = this.modelSortOrder;
        }
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
            data.searchText = this.filterForm.searchText.trim();

        if (this.filterForm.collection.length > 0) {
            const values = this.filterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }
        if (this.filterForm.type.length > 0) {
            const values = this.filterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.filterForm.floor_legal.length > 0) {
            const values = this.filterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.filterForm.beds.length > 0) {
            const values = this.filterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
        }
        if (this.filterForm.media.length > 0) {
            const values = this.filterForm.media.map((ele) => ele.value);
            const valueString = values.join();
            data.media = valueString;
        }
        if (this.filterForm.flex.length > 0) {
            const values = this.filterForm.flex.map((ele) => ele.value);
            const valueString = values.join();
            data.flex = valueString;
        }
        if (this.filterForm.den.length > 0) {
            const values = this.filterForm.den.map((ele) => ele.value);
            const valueString = values.join();
            data.den = valueString;
        }
        if (this.filterForm.baths.length > 0) {
            const values = this.filterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
        }
        if (this.filterForm.ceiling.length > 0) {
            const values = this.filterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                // this.toastr.success(response.message, 'Success');
                this.modelList = response.result;
                this.modelList.forEach((element) => {
                    element.is_selected = false;
                    element.upgraded = true;
                    element.model_cost = 0;
                    element.model_price = 0;
                })
                // if (response.pagination)
                //     this.paginationObj = response.pagination;
                // else
                //     this.paginationObj = {
                //         total: 0
                //     };
            } else {
                // this.paginationObj = {
                //     total: 0
                // };
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getSeletedModelList() {
        let url = `package-center/models-list`;
        let data: any = {};
        data._id = this.packageId;
        data.purpose = `list`;
        data.project_id = this.packageDetails.project_id;
        data.subtype = `PACKAGE`;
        data.page = this.page;
        data.pageSize = this.pageSize;

        if (this.sortedtby) {
            data.sortBy = this.sortedtby;
            data.sortOrder = this.sortOrder;
        }
        if (this.modelFilterForm.searchText && this.modelFilterForm.searchText.trim())
            data.searchText = this.modelFilterForm.searchText.trim();

        if (this.modelFilterForm.collection.length > 0) {
            const values = this.modelFilterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }
        if (this.modelFilterForm.type.length > 0) {
            const values = this.modelFilterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.modelFilterForm.floor_legal.length > 0) {
            const values = this.modelFilterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.modelFilterForm.beds.length > 0) {
            const values = this.modelFilterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
        }
        if (this.modelFilterForm.media.length > 0) {
            const values = this.modelFilterForm.media.map((ele) => ele.value);
            const valueString = values.join();
            data.media = valueString;
        }
        if (this.modelFilterForm.flex.length > 0) {
            const values = this.modelFilterForm.flex.map((ele) => ele.value);
            const valueString = values.join();
            data.flex = valueString;
        }
        if (this.modelFilterForm.den.length > 0) {
            const values = this.modelFilterForm.den.map((ele) => ele.value);
            const valueString = values.join();
            data.den = valueString;
        }
        if (this.modelFilterForm.baths.length > 0) {
            const values = this.modelFilterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
        }
        if (this.modelFilterForm.ceiling.length > 0) {
            const values = this.modelFilterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }
        this.saveFilter();
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            this.selectedModelList=[];
            if (response.status == 1) {
                // this.toastr.success(response.message, 'Success');
                this.selectedModelList = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages > 1? this.paginationObj.totalPages-1 :1;
                    this.getSeletedModelList()  
                } 
                this.selectedModelList.forEach((element) => {
                    element.is_selected = true;
                    element.should_delete = false;
                });
                this.selectedAll = false;

                if (response.pagination)
                    this.paginationObj = response.pagination;
                else
                    this.paginationObj = {
                        total: 0
                    };
            } else {
                this.paginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }

    getEditModelsList() {
        let url = `package-center/models-list`;
        let data: any = {};
        data._id = this.packageId;
        data.purpose = `list`;
        data.project_id = this.packageDetails.project_id;
        data.subtype = `PACKAGE`;
        data.page = 1;
        data.pageSize = this.paginationObj.total;
        if (this.modelSortedtby) {
            data.sortBy = this.modelSortedtby;
            data.sortOrder = this.modelSortOrder;
        }
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
            data.searchText = this.filterForm.searchText.trim();

        if (this.filterForm.collection.length > 0) {
            const values = this.filterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }
        if (this.filterForm.type.length > 0) {
            const values = this.filterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.filterForm.floor_legal.length > 0) {
            const values = this.filterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.filterForm.beds.length > 0) {
            const values = this.filterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
        }
        if (this.filterForm.media.length > 0) {
            const values = this.filterForm.media.map((ele) => ele.value);
            const valueString = values.join();
            data.media = valueString;
        }
        if (this.filterForm.flex.length > 0) {
            const values = this.filterForm.flex.map((ele) => ele.value);
            const valueString = values.join();
            data.flex = valueString;
        }
        if (this.filterForm.den.length > 0) {
            const values = this.filterForm.den.map((ele) => ele.value);
            const valueString = values.join();
            data.den = valueString;
        }
        if (this.filterForm.baths.length > 0) {
            const values = this.filterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
        }
        if (this.filterForm.ceiling.length > 0) {
            const values = this.filterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                // this.toastr.success(response.message, 'Success');
                this.editModelList = response.results ? response.results : [];
                this.editModelList.forEach((element) => {
                    element.is_selected = true;
                });
                this.selectedAll = false;
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onChangeDeleteCheckbox() {
        let records = this.selectedModelList.filter(element => element.should_delete == true);
        if (records.length > 0) {
            this.isBulkDelete = true;
        }
        else {
            this.isBulkDelete = false;
        }
    }

    async  addBulkModels() {
        try {
            let selectedElements = this.modelList.filter(element => element.is_selected);

            if (selectedElements.length == 0) {
                this.toastr.error('Please select models', 'Error');
                return;
            }

            let upgradedInvalidElement = selectedElements.filter((ele) => ele.upgraded && (!ele.model_price || !(ele.model_price > 0)));
            // console.log('upgradedInvalidElement', upgradedInvalidElement);
            if (upgradedInvalidElement && upgradedInvalidElement.length > 0) {
                let invalidElement: any = selectedElements.find((ele) => ele.upgraded && (!ele.model_price || !(ele.model_price > 0)));
                if (invalidElement) {
                    // if (invalidElement.model_price <= 0) {
                    //     this.toastr.warning(`Please enter price greater than and equal to 0 for ${invalidElement.name} model`, 'Warning');
                    //     return;
                    // }
                    if (invalidElement.model_price != 0 && !invalidElement.model_price) {
                        this.toastr.warning(`Please enter price for ${invalidElement.name} model`, 'Warning');
                        return;
                    }
                }
            }
            // let selectedRecord = this.modelList.find((element) => element.is_selected && ((element.model_cost < 0 || (!element.model_cost && element.model_cost != 0)) || (element.model_price < 0 || ((!element.model_price && element.model_price != 0)))));
            let selectedRecord = this.modelList.find((element) => element.is_selected && (element.model_cost < 0 || (!element.model_cost && element.model_cost != 0)));
            // console.log('selectedRecord', selectedRecord)
            if (selectedRecord && selectedRecord.is_selected) {
                // if (selectedRecord.model_cost < 0) {
                //     this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.name} model`, 'Warning');
                //     return;
                // }
                if (selectedRecord.model_cost != 0 && !selectedRecord.model_cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.name} model`, 'Warning');
                    return;
                }

            }
            let invalidRecord = this.modelList.find((element) => element.upgraded && (element.model_cost > element.model_price));
            if (invalidRecord) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${invalidRecord.name} model, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }
            //format the selectedElements
            let formattedModels: any[] = [];
            selectedElements.forEach((ele) => {
                let obj: any = {};
                obj.model_id = ele._id;
                obj.model_name = ele.name;
                obj.cost = ele.model_cost;
                obj.price = ele.model_price;
                obj.upgraded = ele.upgraded;
                obj.collection = ele.collection;
                obj.model_type = ele.type || '';
                formattedModels.push(obj);
            });
            const data: any = {};
            data._id = this.packageId;
            data.project_id = this.packageDetails.project_id;
            data.subtype = 'PACKAGE';
            data.models = formattedModels
            let url = `package-center/models`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getSeletedModelList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        catch{
            console.log('User dismissed the dialog ')
        }
    }

    async updateBulkModels() {
        try {
            let upgradedInvalidElement = this.editModelList.filter((ele) => ele.upgraded && (!ele.price || !(ele.price > 0)));
            // console.log('upgradedInvalidElement', upgradedInvalidElement);
            if (upgradedInvalidElement && upgradedInvalidElement.length > 0) {
                let invalidElement: any = this.editModelList.find((ele) => ele.upgraded && (!ele.price || !(ele.price > 0)));
                if (invalidElement) {
                    // if (invalidElement.price <= 0) {
                    //     this.toastr.warning(`Please enter price greater than and equal to 0 for ${invalidElement.model_name} model`, 'Warning');
                    //     return;
                    // }
                    if (invalidElement.price != 0 && !invalidElement.price) {
                        this.toastr.warning(`Please enter price for ${invalidElement.model_name} model`, 'Warning');
                        return;
                    }
                }
            }
            let selectedRecord = this.editModelList.find((element) => element.is_selected && (element.cost < 0 || (!element.cost && element.cost != 0)));
            if (selectedRecord && selectedRecord.is_selected) {
                // if (selectedRecord.cost < 0) {
                //     this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.model_name} model`, 'Warning');
                //     return;
                // }
                if (selectedRecord.cost != 0 && !selectedRecord.cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.model_name} model`, 'Warning');
                    return;
                }
            }
            let invalidRecord = this.editModelList.find((element) => element.upgraded && (element.cost > element.price));
            if (invalidRecord) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${invalidRecord.model_name} model, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }

            let selectedElements = this.editModelList.filter(element => element.is_selected);
            //format the selectedElements
            let formattedModels: any[] = [];
            selectedElements.forEach((ele) => {
                let obj: any = {};
                obj.model_id = ele.model_id;
                obj.model_name = ele.model_name;
                obj.model_type = ele.model_type || '';
                obj.cost = ele.cost;
                obj.price = ele.price;
                obj.upgraded = ele.upgraded
                formattedModels.push(obj);
            });
            const data: any = {};
            data._id = this.packageId;
            data.project_id = this.packageDetails.project_id;
            data.subtype = 'PACKAGE';
            data.models = formattedModels
            let url = `package-center/models`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getSeletedModelList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        catch{
            console.log('User dismissed the dialog ')
        }
    }

    deleteModel(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.model_name} model?`)
            .then((confirmed) => {
                if (confirmed) {
                    let id = [item._id];
                    const data: any = {};
                    data.ids = id;
                    const url = `package-center/models-delete`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.page = 1;
                            this.getSeletedModelList();
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

    deleteBulkModels() {
        let selectedRecords = this.selectedModelList.filter(element => element.should_delete == true);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${selectedRecords.length} model?`)
            .then((confirmed) => {
                if (confirmed) {
                    let ids = selectedRecords.map((element) => element._id);
                    const data: any = {};
                    data.ids = ids;
                    const url = `package-center/models-delete`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.isBulkDelete = false;
                            this.page = 1;
                            this.getSeletedModelList();
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

    updateDescriptionNotes() {
        const data: any = {};
        data._id = this.formDetails._id;
        data.description = this.formDetails.description;
        data.construction_notes = this.formDetails.construction_notes;
        let url = `package-center/pc-models-units`;
        this.spinnerService.show();
        this.webService.put(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getSeletedModelList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }
    doPaginationWise(page) {
        this.page = page;
        this.getSeletedModelList();
    }

    onStatusChange(item) {
        item.upgraded == true ? item.model_price = 0 : item.model_price = 0;
    }

    onEditStatusChange(item) {
        item.upgraded == true ? item.price = 0 : item.price = 0;

    }

    setPageSize() {
        this.page = 1;
        this.getSeletedModelList();
    }

    onItemSelect(type?) {
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }
    onDeSelectAll(type, event) {
        this.filterForm[type] = event;
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }
    onSelectAll(type, event) {
        this.filterForm[type] = event;
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }

    setModelOrder(value: string) {
        if (this.modelOrder === value) {
            this.modelReverse = !this.modelReverse;
        }
        this.modelOrder = value;
        this.modelSortedtby = value;
        if (this.modelReverse) {
            this.modelSortOrder = 'DESC';
        } else {
            this.modelSortOrder = 'ASC';
        }
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }

    doModelSearch() {
        if (this.modelFilterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getSeletedModelList();
    }

    clearModelSearch() {
        this.page = 1;
        this.isClear = false;
        this.modelFilterForm.searchText = '';
        this.getSeletedModelList();
    }


    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.modelFilterForm.searchText,
            collection: this.modelFilterForm.collection,
            beds: this.modelFilterForm.beds,
            den: this.modelFilterForm.den,
            baths: this.modelFilterForm.baths,
            media: this.modelFilterForm.media,
            flex: this.modelFilterForm.flex,
            floor_legal: this.modelFilterForm.floor_legal,
            type: this.modelFilterForm.type,
            ceiling: this.modelFilterForm.ceiling,

        }
        localStorage.setItem('packagesModelFilterData', JSON.stringify(data));
    }

    clearModelFilters() {
        this.page = 1;
        this.modelFilterForm.beds = [];
        this.modelFilterForm.baths = [];
        this.modelFilterForm.floor_legal = [];
        this.modelFilterForm.searchText = '';
        this.modelFilterForm.den = [];
        this.modelFilterForm.media = [];
        this.modelFilterForm.flex = [];
        this.modelFilterForm.collection = [];
        this.modelFilterForm.type = [];
        this.modelFilterForm.ceiling = [];

        this.getSeletedModelList();
    }

    clearSearch() {
        this.isClear = false;
        this.filterForm.searchText = '';
        if (this.isEdit) {
            this.getEditModelsList();
        }
        else {
            this.getModelList();
        }
    }

    onItemSelectFilters(type?) {
        this.page = 1;
        this.getSeletedModelList();
    }
    onDeSelectAllFilters(type, event) {
        this.page = 1;
        this.modelFilterForm[type] = event;
        this.getSeletedModelList();
    }

    onSelectAllFilters(type, event) {
        this.page = 1;
        this.modelFilterForm[type] = event;
        this.getSeletedModelList();
    }

}
