import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-units',
    templateUrl: './units.component.html',
    styleUrls: ['./units.component.css']
})
export class UnitsComponent implements OnInit {
    @Input() collectionId: string;
    @Input() collectionDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    filterForm: any = {
        searchText: '',
        model_id: [],
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
    unitList: any[] = [];
    selectedUnitList: any[] = [];
    editUnitList = [];
    selectedAll: boolean = false;
    selectedAllUnit: boolean = false;
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
    ceilingFields: any[] = [
        { _id: 9, value: 9 },
        { _id: 10, value: 10 },
        { _id: 11, value: 11 },
        { _id: 12, value: 12 },
        { _id: 13, value: 13 },
        { _id: 14, value: 14 },
        { _id: 15, value: 15 }
    ];
    floorList: any = [] = [];
    isClear: boolean = false;
    collectionOptions: any[] = [];
    typeOptions: any[] = [];
    unitFilterForm: any = {
        searchText: '',
        model_id: [],
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
    unitSortOrder: any = 'DESC';
    unitSortedtby: any = '_updated';
    unitOrder: string = '_updated';
    unitReverse: boolean = true;
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

    getSavedFilterdata() {

        let filterData: any = localStorage.getItem('colorCollectionUnitFilterData');
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
                this.unitFilterForm.type = filterData.type;
            }
            if (filterData.model_id) {
                this.unitFilterForm.model_id = filterData.model_id;
            }
            if (filterData.collection) {
                this.unitFilterForm.collection = filterData.collection;
            }
            if (filterData.beds) {
                this.unitFilterForm.beds = filterData.beds;
            }
            if (filterData.den) {
                this.unitFilterForm.den = filterData.den;
            }
            if (filterData.baths) {
                this.unitFilterForm.baths = filterData.baths;
            }
            if (filterData.media) {
                this.unitFilterForm.media = filterData.media;
            }
            if (filterData.flex) {
                this.unitFilterForm.flex = filterData.flex;
            }
            if (filterData.ceiling) {
                this.unitFilterForm.ceiling = filterData.ceiling;
            }
            if (filterData.floor_legal) {
                this.unitFilterForm.floor_legal = filterData.floor_legal;
            }
            if (filterData.searchText) {
                this.unitFilterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getSeletedUnitList();
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
        this.getModelsList();
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

    ngOnChanges() {
        if (this.collectionDetails) {
            this.getSavedFilterdata();
        }
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

    getOptionsTypeList() {
        let url = `package-center/options-of-model-types?project_id=${this.collectionDetails.project_id}`;
        this.spinnerService.show();
        this.typeOptions = [];
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
        let url = `package-center/options-of-model-collections?project_id=${this.collectionDetails.project_id}`;
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

    getModelsList() {
        let url = `package-center/options-of-models`;
        let data: any = {};
        data.project_id = this.collectionDetails.project_id;
        if (this.filterForm.type.length > 0) {
            const values = this.filterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.filterForm.collection.length > 0) {
            const values = this.filterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }

        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.filterModelList = response.results ? response.results : [];
                this.filterModelList.length == 0 ? this.filterForm.model_id = [] : true;
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    getSeletedUnitList() {
        let url = `package-center/units-list`;
        let data: any = {};
        data._id = this.collectionId;
        data.purpose = 'list';
        data.project_id = this.collectionDetails.project_id;
        data.subtype = 'COLOR_COLLECTION';
        data.page = this.page;
        data.pageSize = this.pageSize;
        if (this.sortedtby) {
            data.sortBy = this.sortedtby;
        }
        if (this.sortOrder) {
            data.sortOrder = this.sortOrder;
        }
        if (this.unitFilterForm.searchText && this.unitFilterForm.searchText.trim())
            data.searchText = this.unitFilterForm.searchText.trim();
        if (this.unitFilterForm.model_id.length > 0) {
            const values = this.unitFilterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
        }
        if (this.unitFilterForm.floor_legal.length > 0) {
            const values = this.unitFilterForm.floor_legal.map((ele) => ele._id);
            const valueString = values.join();
            data.floor_legal = valueString;
        }
        if (this.unitFilterForm.beds.length > 0) {
            const values = this.unitFilterForm.beds.map((ele) => ele.value);
            const valueString = values.join();
            data.bed = valueString;
        }
        if (this.unitFilterForm.media.length > 0) {
            const values = this.unitFilterForm.media.map((ele) => ele.value);
            const valueString = values.join();
            data.media = valueString;
        }
        if (this.unitFilterForm.flex.length > 0) {
            const values = this.unitFilterForm.flex.map((ele) => ele.value);
            const valueString = values.join();
            data.flex = valueString;
        }
        if (this.unitFilterForm.den.length > 0) {
            const values = this.unitFilterForm.den.map((ele) => ele.value);
            const valueString = values.join();
            data.den = valueString;
        }
        if (this.unitFilterForm.baths.length > 0) {
            const values = this.unitFilterForm.baths.map((ele) => ele.value);
            const valueString = values.join();
            data.bath = valueString;
        }
        if (this.unitFilterForm.collection.length > 0) {
            const values = this.unitFilterForm.collection.map((ele) => ele);
            const valueString = values.join();
            data.collection = valueString;
        }
        if (this.unitFilterForm.type.length > 0) {
            const values = this.unitFilterForm.type.map((ele) => ele);
            const valueString = values.join();
            data.type = valueString;
        }
        if (this.unitFilterForm.ceiling.length > 0) {
            const values = this.unitFilterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }

        this.saveFilter();
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            this.selectedUnitList=[];
            if (response.status == 1) {
                // this.toastr.success(response.message, 'Success');
                this.selectedUnitList = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages >1? this.paginationObj.totalPages-1 :1;
                    this.getSeletedUnitList()  
                } 

                this.selectedUnitList.forEach((element) => {
                    element.is_selected = true;
                    element.should_delete = false;
                })
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

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.unitFilterForm.searchText,
            collection: this.unitFilterForm.collection,
            beds: this.unitFilterForm.beds,
            den: this.unitFilterForm.den,
            baths: this.unitFilterForm.baths,
            media: this.unitFilterForm.media,
            flex: this.unitFilterForm.flex,
            floor_legal: this.unitFilterForm.floor_legal,
            type: this.unitFilterForm.type,
            model_id: this.unitFilterForm.model_id,
            ceiling: this.unitFilterForm.ceiling,

        }
        localStorage.setItem('colorCollectionUnitFilterData', JSON.stringify(data));
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
        this.getSeletedUnitList();
    }

    clearSearch() {
        this.isClear = false;
        this.filterForm.searchText = '';
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }

    clearFilter() {
        this.filterForm.model_id = [];
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
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }

    selectAll() {
        for (var i = 0; i < this.selectedUnitList.length; i++) {
            this.selectedUnitList[i].should_delete = this.selectedAll;
        }
        this.onChangeDeleteCheckbox();
    }

    selectAllUnit() {
        for (var i = 0; i < this.unitList.length; i++) {
            this.unitList[i].is_selected = this.selectedAllUnit;
        }
    }

    onChangeDeleteCheckbox() {
        let records = this.selectedUnitList.filter(element => element.should_delete == true);
        if (records.length > 0) {
            this.isBulkDelete = true;
        }
        else {
            this.isBulkDelete = false;
            this.selectedAll = false;
        }
    }

    deleteUnit(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.unit_name} unit?`)
            .then((confirmed) => {
                if (confirmed) {
                    let id = [item._id];
                    const data: any = {};
                    data.ids = id;
                    const url = `package-center/units-delete`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.page = 1;
                            this.getSeletedUnitList();
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

    deleteBulkUnits() {
        let selectedRecords = this.selectedUnitList.filter(element => element.should_delete == true);
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${selectedRecords.length} unit?`)
            .then((confirmed) => {
                if (confirmed) {
                    let ids = selectedRecords.map((element) => element._id);
                    const data: any = {};
                    data.ids = ids;
                    const url = `package-center/units-delete`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.isBulkDelete = false;
                            this.selectedAll = false;
                            this.page = 1;
                            this.getSeletedUnitList();
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

    excludedChange(item) {
        if (item.excluded) {
            item.upgraded = false;
            item.unit_cost = 0;
            item.unit_price = 0;
        }
    }

    editExcludedChange(item) {
        if (item.excluded) {
            item.upgraded = false;
            item.cost = 0;
            item.price = 0;
        }

    }

    doPaginationWise(page) {
        this.page = page;
        this.getSeletedUnitList();
    }

    onStatusChange(item) {
        item.upgraded == true ? item.unit_price = 0 : item.unit_price = 0;
    }

    onEditStatusChange(item) {
        item.upgraded == true ? item.price = 0 : item.price = 0;

    }

    setPageSize() {
        this.page = 1;
        this.getSeletedUnitList();
    }

    onItemSelect(type?) {
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }
    onDeSelectAll(type, event) {

        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }
    onSelectAll(type, event) {
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }

    openBulkEditUnit(template: TemplateRef<any>) {
        this.editUnitList = [];
        this.isEdit = true;
        this.getEditUnitsList();
        // this.selectedUnitList.forEach(val => this.editUnitList.push(Object.assign({}, val)));
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });

    }

    async updateBulkUnits() {
        try {
            let upgradedInvalidElement = this.editUnitList.filter((ele) => ele.upgraded && (!ele.price || !(ele.price > 0)));
            if (upgradedInvalidElement && upgradedInvalidElement.length > 0) {
                let invalidElement: any = upgradedInvalidElement.find((ele) => ele.upgraded && (!ele.price || !(ele.price > 0)));
                if (invalidElement) {
                    // if (invalidElement.price <= 0) {
                    //     this.toastr.warning(`Please enter price greater than and equal to 0 for ${invalidElement.unit_name} unit`, 'Warning');
                    //     return;
                    // }
                    if (invalidElement.price != 0 && !invalidElement.price) {
                        this.toastr.warning(`Please enter price for ${invalidElement.unit_name} unit`, 'Warning');
                        return;
                    }
                }

            }

            let selectedRecord = this.editUnitList.find((element) => element.is_selected && (element.cost < 0 || (!element.cost && element.cost != 0)));
            if (selectedRecord && selectedRecord.is_selected) {
                // if (selectedRecord.cost < 0) {
                //     this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.unit_name} unit`, 'Warning');
                //     return;
                // }
                if (selectedRecord.cost != 0 && !selectedRecord.cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.unit_name} unit`, 'Warning');
                    return;
                }
            }
            let invalidRecord = this.editUnitList.find((element) => element.upgraded && (element.cost > element.price));
            if (invalidRecord) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${invalidRecord.unit_name} unit, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }

            let selectedElements = this.editUnitList.filter(element => element.is_selected);

            let formattedModels: any[] = [];
            selectedElements.forEach((ele) => {
                let obj: any = {};
                obj.unit_id = ele.unit_id;
                obj.unit_name = ele.unit_name;
                obj.cost = ele.cost;
                obj.price = ele.price;
                obj.upgraded = ele.upgraded;
                obj.excluded = ele.excluded;
                obj.model_name = ele.model_name;
                obj.model_id = ele.model_id;
                obj.collection = ele.collection;
                obj.model_type = ele.model_type || '';
                formattedModels.push(obj);
            });
            const data: any = {};
            data._id = this.collectionId;
            data.project_id = this.collectionDetails.project_id;
            data.subtype = 'COLOR_COLLECTION';
            data.units = formattedModels
            let url = `package-center/units`;
            // console.log('data', data);
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getSeletedUnitList();
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

    getEditUnitsList() {
        let url = `package-center/units-list`;
        let data: any = {};
        data._id = this.collectionId;
        data.purpose = 'list';
        data.project_id = this.collectionDetails.project_id;
        data.subtype = 'COLOR_COLLECTION';
        data.page = 1;
        data.pageSize = this.paginationObj.total;
        if (this.unitSortedtby) {
            data.sortBy = this.unitSortedtby;
        }
        if (this.unitSortOrder) {
            data.sortOrder = this.unitSortOrder;
        }
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
            data.searchText = this.filterForm.searchText.trim();
        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
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
                this.editUnitList = response.results ? response.results : [];
                this.editUnitList.forEach((element) => {
                    element.is_selected = true;
                })
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }


    openBulkAddUnit(template: TemplateRef<any>) {
        this.getUnitList();
        this.isEdit = false;
        this.selectedAllUnit = false;
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });
    }

    async  addBulkUnits() {
        try {
            let selectedElements = this.unitList.filter(element => element.is_selected);
            if (selectedElements.length == 0) {
                this.toastr.error('Please select unit', 'Error');
                return;
            }

            let upgradedInvalidElement = selectedElements.filter((ele) => ele.upgraded && (!ele.unit_price || !(ele.unit_price > 0)));
            // console.log('upgradedInvalidElement', upgradedInvalidElement);
            if (upgradedInvalidElement && upgradedInvalidElement.length > 0) {
                let invalidElement: any = selectedElements.find((ele) => ele.upgraded && (!ele.unit_price || !(ele.unit_price > 0)));
                if (invalidElement) {
                    // if (invalidElement.unit_price <= 0) {
                    //     this.toastr.warning(`Please enter price greater than and equal to 0 for ${invalidElement.unit_no} unit`, 'Warning');
                    //     return;
                    // }
                    if (invalidElement.unit_price != 0 && !invalidElement.unit_price) {
                        this.toastr.warning(`Please enter price for ${invalidElement.unit_no} unit`, 'Warning');
                        return;
                    }
                }

            }

            let selectedRecord = this.unitList.find((element) => element.is_selected && (element.unit_cost < 0 || (!element.unit_cost && element.unit_cost != 0)));
            if (selectedRecord && selectedRecord.is_selected) {
                // if (selectedRecord.unit_cost < 0) {
                //     this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.unit_no} unit`, 'Warning');
                //     return;
                // }
                if (selectedRecord.unit_cost != 0 && !selectedRecord.unit_cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.unit_no} unit`, 'Warning');
                    return;
                }
            }
            let invalidRecord = this.unitList.find((element) => element.upgraded && (element.unit_cost > element.unit_price));
            if (invalidRecord) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${invalidRecord.unit_no} unit, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }


            //format the selectedElements
            let formattedModels: any[] = [];
            selectedElements.forEach((ele) => {
                let obj: any = {};
                obj.unit_id = ele._id;
                obj.model_name = ele.model_name;
                obj.model_id = ele.model_id;
                obj.excluded = ele.excluded;
                obj.collection = ele.collection;
                obj.unit_name = ele.unit_no;
                obj.cost = ele.unit_cost;
                obj.price = ele.unit_price;
                obj.model_type = ele.type || '';
                obj.upgraded = ele.upgraded
                formattedModels.push(obj);
            });
            let data: any = {};
            data._id = this.collectionId;
            data.project_id = this.collectionDetails.project_id;
            data.subtype = 'COLOR_COLLECTION';
            data.units = formattedModels
            let url = `package-center/units`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getSeletedUnitList();
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

    getUnitList() {
        this.spinnerService.show();
        let url = `package-center/units-list`;
        let data: any = {};
        data._id = this.collectionId;
        data.purpose = 'add';
        data.project_id = this.collectionDetails.project_id;
        data.subtype = 'COLOR_COLLECTION';
        if (this.unitSortedtby) {
            data.sortBy = this.unitSortedtby;
        }
        if (this.unitSortOrder) {
            data.sortOrder = this.unitSortOrder;
        }
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
            data.searchText = this.filterForm.searchText.trim();
        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
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
        if (this.filterForm.ceiling.length > 0) {
            const values = this.filterForm.ceiling.map((ele) => ele.value);
            const valueString = values.join();
            data.ceiling = valueString;
        }
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.unitList = response.result;
                this.unitList.forEach((element) => {
                    element.is_selected = false;
                    element.upgraded = false;
                    element.unit_cost = 0;
                    element.unit_price = 0;
                })
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    setUnitOrder(value: string) {
        if (this.unitOrder === value) {
            this.unitReverse = !this.unitReverse;
        }
        this.unitOrder = value;
        this.unitSortedtby = value;
        if (this.unitReverse) {
            this.unitSortOrder = 'DESC';
        } else {
            this.unitSortOrder = 'ASC';
        }
        if (this.isEdit) {
            this.getEditUnitsList();
        }
        else {
            this.getUnitList();
        }
    }
    
    doUnitSearch() {
        if (this.unitFilterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getSeletedUnitList();
    }

    clearUnitSearch() {
        this.page = 1;
        this.isClear = false;
        this.unitFilterForm.searchText = '';
        this.getSeletedUnitList();
    }


    clearUnitFilters() {
        this.page = 1;
        this.unitFilterForm.beds = [];
        this.unitFilterForm.baths = [];
        this.unitFilterForm.floor_legal = [];
        this.unitFilterForm.searchText = '';
        this.unitFilterForm.den = [];
        this.unitFilterForm.media = [];
        this.unitFilterForm.flex = [];
        this.unitFilterForm.collection = [];
        this.unitFilterForm.type = [];
        this.unitFilterForm.ceiling = [];
        this.unitFilterForm.model_id = [];
        this.getSeletedUnitList();
    }

    onItemSelectFilters(type?) {
        this.page = 1;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getSeletedUnitList();
    }
    onDeSelectAllFilters(type, event) {
        this.page = 1;
        this.unitFilterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getSeletedUnitList();
    }

    onSelectAllFilters(type, event) {
        this.page = 1;
        this.unitFilterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        this.getSeletedUnitList();
    }


    openEditDescriptionNotesModal(template: TemplateRef<any>, item) {
        this.formDetails = { ...item };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
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
                this.getSeletedUnitList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }
}
