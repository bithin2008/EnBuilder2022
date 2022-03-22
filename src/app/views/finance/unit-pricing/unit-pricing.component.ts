import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment.prod';
@Component({
    selector: 'app-unit-pricing',
    templateUrl: './unit-pricing.component.html',
    styleUrls: ['./unit-pricing.component.css']
})
export class UnitPricingComponent implements OnInit {
    unitPricingList: any[] = [];
    paginationObj: any = {};
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    filterForm = {
        project_id: '',
        // builder_id: '',
        searchText: '',
        model_id: [],
        building_type:[],
        beds: [],
        baths: [],
        den: [],
        media: [],
        flex: [],
        floor_legal: [],
        collection: [],
        type: []
    }
    dynamicColumns:any=[
        {
            fieldNum:'price',
            name:'Base Price',
            isEnable:false
        },
        {
            fieldNum:'unit_premium',
            name:'Unit Premium',
            isEnable:false
        },
        {
            fieldNum:'floor_premium',
            name:'Floor Premium',
            isEnable:false
        },
        {
            fieldNum:'tax',
            name:'Tax',
            isEnable:false
        },
        {
            fieldNum:'sales_price',
            name:'Sales Price',
            isEnable:false
        }
    ];
    colSpanVal:number=3;
    baseUrl = environment.BASE_URL;
    isClear: boolean = false;
    order: string = '_created';
    reverse: boolean = true;
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    formDetails: any = {};
    modalRef: BsModalRef;
    modelDropdownSettings: any = {};
    dropdownSettings = {};
    filterModelList: any[] = [];
    // numberFields: any[] = [
    //     { _id: 1, value: 1 },
    //     { _id: 2, value: 2 },
    //     { _id: 3, value: 3 },
    //     { _id: 4, value: 4 },
    //     { _id: 5, value: 5 }
    // ];
    numberFields: any[] = [];
    floorList: any = [];
    modelcCollectionList: any = [];
    modelList: any = [];
    collectionOptions: any[] = [];
    typeOptions: any[] = [];
    percentageDetails: any = {};
    measureUnits: any[] = [];
    projectDetails:any={};
    addtionalDetails:any={};
    buildingTypeList:any[]=[{
        _id:'condominium',
        value:'Condominium'
    },
    {
        _id:'townhouse',
        value:'Townhouse'
    },
    {
        _id:'semi-detached',
        value:'Semi-detached'
    },
    {
        _id:'detached',
        value:'Detached'
    }];
    constructor(private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
        let priceUnit= {
            fieldNum:'psf',
            name:`Price per ${this.measureUnits[0].area}`,
            isEnable:false
        }
        this.dynamicColumns.push(priceUnit);
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.pageSize = 20;
            this.filterForm.building_type=[];
            this.floorList=[];  
            this.addtionalDetails=[];  
            this.filterForm.floor_legal = [];
            if (response) {
                this.filterForm.project_id = response.project_id;
                // this.filterForm.builder_id = response.builder_id;
                this.onProjectChange();
                this.addtionalDetails=response.additional_info ? response.additional_info:[];
                // [{"type":"condominium","total_units":100,"total_floors":12},{"type":"townhouse","total_buildings":30,"total_homes":30},{"type":"semi-detached","total_units":10,"total_homes":10},{"type":"detached","total_units":25,"total_floors":0}];               
            }
        });
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
    }

    // ngDoCheck() {
    //     this.formDetails.sales_price = 0;
    //     if (this.formDetails.base_price > 0) {
    //         this.formDetails.sales_price = this.formDetails.sales_price + this.formDetails.base_price;
    //     }
    //     if (this.formDetails.unit_premium > 0) {
    //         this.formDetails.sales_price = this.formDetails.sales_price + this.formDetails.unit_premium;
    //     }
    //     if (this.formDetails.floor_premium > 0) {
    //         this.formDetails.sales_price = this.formDetails.sales_price + this.formDetails.floor_premium;
    //     }
    //     if (this.formDetails.tax > 0) {
    //         this.formDetails.sales_price = this.formDetails.sales_price + this.formDetails.tax;
    //     }
    // }
    setSalePrice(value) {
        if (value > 0) {
            this.formDetails.sales_price = this.formDetails.sales_price + value;
        }
        else {
            this.formDetails.sales_price = this.formDetails.sales_price + 0;
        }
    }

    getSavedFilterdata() {
        this.colSpanVal=3;
        let projectFilterData: any = localStorage.getItem('financeTabData');
        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData.project_id) {
                this.filterForm.project_id = projectFilterData.project_id;
                // this.getFloorList(projectFilterData.no_of_floors ? projectFilterData.no_of_floors : 0);
                this.addtionalDetails= projectFilterData.additional_info ? projectFilterData.additional_info:[];
                // [{"type":"condominium","total_units":100,"total_floors":12},{"type":"townhouse","total_buildings":30,"total_homes":30},{"type":"semi-detached","total_units":10,"total_homes":10},{"type":"detached","total_units":25,"total_floors":0}];
                this.getUnitStoredData();
            }
            else {
                this.floorList = this.numberFields;
                this.getProjectList();
            }
            // if (projectFilterData.builder_id) {
            //     this.filterForm.builder_id = projectFilterData.builder_id;
            // }
        }
        else {
            this.floorList = this.numberFields;
            this.getProjectList();

        }
    }

    getUnitStoredData(){
        let filterData: any = localStorage.getItem('fiannaceUnitPriceFilterData');
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
            if (filterData.model_id) {
                this.filterForm.model_id = filterData.model_id;
            }
            if (filterData.collection) {
                this.filterForm.collection = filterData.collection;
            }
            if (filterData.type) {
                this.filterForm.type = filterData.type;
            }
            if (filterData.building_type) {
                this.filterForm.building_type = filterData.building_type;
                if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                    let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                    this.getFloorList(floors);
                }
            }
            if (filterData.beds) {
                this.filterForm.beds = filterData.beds;
            }
            if (filterData.baths) {
                this.filterForm.baths = filterData.baths;
            }
            if (filterData.media) {
                this.filterForm.media = filterData.media;
            }
            if (filterData.flex) {
                this.filterForm.flex = filterData.flex;
            }
            if (filterData.floor_legal) {
                this.filterForm.floor_legal = filterData.floor_legal;
            }
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getSettings();
        this.getProjecDetails();
        this.getUnitPricing();
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
        this.getModelsList();

    }

    getProjectList() {
        this.spinnerService.show();
        let url = `finance/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                let projectList = response.results;
                this.filterForm.project_id= projectList[0] ? projectList[0]._id :'';
                let data = {
                    project_id: this.filterForm.project_id,
                }
                localStorage.setItem('financeTabData', JSON.stringify(data));
                this.getUnitStoredData();
               }
        }, (error) => {
            console.log('error', error);
        });
    }

    getSettings() {
        let url = `finance/crm-settings?type=TAX_PERCENTAGE`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.percentageDetails = (response.results && response.results.length > 0) ? response.results[0] : {};
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getProjecDetails() {
        if(this.filterForm.project_id){
            this.spinnerService.show();
            let url = `finance/projects?_id=${this.filterForm.project_id}`;
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                this.initialColsSettings();
                if (response.status == 1) {
                    this.projectDetails = response.result;
                    if(this.projectDetails.unit_pricing_display_settings){
                        this.dynamicColumns.forEach(element => {
                            if(this.projectDetails.unit_pricing_display_settings[element.fieldNum]){
                                element.isEnable=true;
                            }
                            else{
                                element.isEnable=false;
                            }
                           let records= this.dynamicColumns.map((ele)=>ele.isEnable);
                           this.colSpanVal= this.colSpanVal+records.length;
                        });
                    }
                   
                }

            }, (error) => {
                console.log('error', error);
            });
        }
        else{
            this.initialColsSettings();
        }
    }

    initialColsSettings(){
        this.dynamicColumns.forEach(element => {
            element.isEnable=false;
        });
    }

    openEnableCols(template: TemplateRef<any>){
        this.formDetails.cols=[];
        this.dynamicColumns.forEach(element => {
            this.formDetails.cols.push(Object.assign({},element));
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    onSettingsSave(){
        let data:any={};
        data.unit_pricing_display_settings= { };
        this.formDetails.cols.forEach(element => {
            if(element){
                data.unit_pricing_display_settings[element.fieldNum]=element.isEnable;
            }
        });
        // console.log('data',data);

        if(this.filterForm.project_id){
            let url = `finance/projects?_id=${this.filterForm.project_id}`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getUnitPricing();
                        this.getProjecDetails();
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else{
            this.toastr.warning(`Please select project`, 'Warning');
        }

    }

    getOptionsTypeList() {
        this.typeOptions = [];
        let url = `finance/options-of-model-types`;
        if(this.filterForm.project_id){
            url =url + `?project_id=${this.filterForm.project_id}`;
         }
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
        this.collectionOptions = [];
        let url = `finance/options-of-model-collections`;
        if(this.filterForm.project_id){
           url =url + `?project_id=${this.filterForm.project_id}`;
        }
        this.spinnerService.show();
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

    // filterCollections() {
    //     this.modelcCollectionList = this.modelList.map(ele => ele.collection).filter((ele, i, arr) => arr.indexOf(ele) == i);
    // }

    getModelsList() {
        let url = `finance/options-of-models`;
        let data: any = {};
        if(this.filterForm.project_id){
            data.project_id = this.filterForm.project_id;
         }
         
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

    getUnitPricing() {
        this.spinnerService.show();
        this.saveFilter();
        let data: any = {};
        let url = `finance/units-list`
        data.page = this.page;
        data.pageSize = this.pageSize;
        if (this.sortedtby) {
            data.sortBy = this.sortedtby;
            data.sortOrder = this.sortOrder;
        }
        if (this.filterForm.project_id) {
            data.project_id = this.filterForm.project_id;
        }
        // if (this.filterForm.builder_id) {
        //     data.builder_id = this.filterForm.builder_id;
        // }
        if (this.filterForm.searchText && this.filterForm.searchText.trim())
            data.searchText = this.filterForm.searchText.trim();
        if (this.filterForm.model_id.length > 0) {
            const values = this.filterForm.model_id.map((ele) => ele._id);
            const valueString = values.join();
            data.model_id = valueString;
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
        if (this.filterForm.building_type.length > 0) {
            const values = this.filterForm.building_type.map((ele) => ele._id);
            const valueString = values.join();
            data.building_type = valueString;
        }
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            this.unitPricingList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitPricingList = response.results;
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
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openUnitDetailsPage(item) {
        let url = `#/inventories/unit/${item._id}`;
        window.open(url, '_blank');
    }

    openEditUnitPriceModal(template: TemplateRef<any>, item) {
        this.formDetails.unit_no = item.unit_no ? item.unit_no : '';
        // this.formDetails.price = item.price ? item.price : null;
        this.formDetails.floor_premium = item.floor_premium ? item.floor_premium : 0;
        this.formDetails.unit_premium = item.unit_premium ? item.unit_premium : 0;
        this.formDetails.project_name = item.project_name ? item.project_name : '';
        this.formDetails.builder_name = item.builder_name ? item.builder_name : '';
        this.formDetails._id = item._id ? item._id : '';
        this.formDetails.price = item.price ? item.price : null;
        this.formDetails.tax = item.tax ? item.tax : 0;
        this.formDetails.sales_price = item.sales_price ? item.sales_price : 0;
        if (this.formDetails.price && this.formDetails.tax == 0) {
            this.formDetails.tax = (this.percentageDetails.percentage / 100) * this.formDetails.price;
        }
        this.formDetails.psf = item.psf ? item.psf : '';
        // this.formDetails.psu = item.psu ? item.psu : '';
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
        // this.onUnitPriceChange();
    }
    
    editUnitPriceModal() {
        // console.log('formDeatils', this.formDetails);
        if (!this.formDetails.price && this.formDetails.price != 0) {
            this.toastr.warning(`Please enter base price`, 'Warning');
            return;
        }
        if (this.formDetails.price < 0) {
            this.toastr.warning(`Please enter base price greater than and equal to 0`, 'Warning');
            return;
        }
        // if (!this.formDetails.price && this.formDetails.price != 0) {
        //     this.toastr.warning(`Please enter unit price`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.price < 0) {
        //     this.toastr.warning(`Please enter unit price greater than and equal to 0`, 'Warning');
        //     return;
        // }
        if (!this.formDetails.sales_price && this.formDetails.sales_price != 0) {
            this.toastr.warning(`Please enter sales price`, 'Warning');
            return;
        }
        if (this.formDetails.sales_price < 0) {
            this.toastr.warning(`Please enter sales price greater than and equal to 0`, 'Warning');
            return;
        }
        if (!this.formDetails.tax && this.formDetails.tax != 0) {
            this.toastr.warning(`Please enter tax`, 'Warning');
            return;
        }
        if (this.formDetails.tax < 0) {
            this.toastr.warning(`Please enter tax greater than and equal to 0`, 'Warning');
            return;
        }
        let data = Object.assign({},this.formDetails);
        delete data.unit_no;
        delete data.project_name;
        delete data.builder_name;
        data.price = data.price ? Math.round(data.price*100)/100 : 0;
        data.tax = data.tax ? Math.round(data.tax*100)/100 : 0;
        data.sales_price = data.sales_price ? Math.round(data.sales_price*100)/100 : 0;
        data.floor_premium = data.floor_premium ? Math.round(data.floor_premium*100)/100 : 0;
        data.unit_premium = data.unit_premium ? Math.round(data.unit_premium*100)/100 : 0;
        data.psf = data.psf ? Math.round(data.psf*100)/100 : '';

        // console.log('finance/unit-pricing', data);
        let url = `finance/units`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getUnitPricing();
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'finance' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onBasePriceChange(event) {
        this.formDetails.tax = event.target.value ? (this.percentageDetails.percentage / 100) * event.target.value : 0;
        const price = event.target.value > 0 ? event.target.value : 0;
        const floor_premium = this.formDetails.floor_premium > 0 ? this.formDetails.floor_premium : 0;
        const unit_premium = this.formDetails.unit_premium > 0 ? this.formDetails.unit_premium : 0;
        const tax = this.formDetails.tax > 0 ? this.formDetails.tax : 0;
        this.calculateSalesPrice(price, floor_premium, unit_premium, tax);
        // else {
        //     this.formDetails.tax = 0;
        // }
    }
    onFloorPremiumChange(event) {
        const price = this.formDetails.price > 0 ? this.formDetails.price : 0;
        const floor_premium = event.target.value > 0 ? event.target.value : 0;
        const unit_premium = this.formDetails.unit_premium > 0 ? this.formDetails.unit_premium : 0;
        const tax = this.formDetails.tax > 0 ? this.formDetails.tax : 0;
        this.calculateSalesPrice(price, floor_premium, unit_premium, tax);
    }
    onUnitPremiumChange(event) {
        const price = this.formDetails.price > 0 ? this.formDetails.price : 0;
        const floor_premium = this.formDetails.floor_premium > 0 ? this.formDetails.floor_premium : 0;
        const unit_premium = event.target.value > 0 ? event.target.value : 0;
        const tax = this.formDetails.tax > 0 ? this.formDetails.tax : 0;
        this.calculateSalesPrice(price, floor_premium, unit_premium, tax);
    }
    onTaxChange(event) {
        const price = this.formDetails.price > 0 ? this.formDetails.price : 0;
        const floor_premium = this.formDetails.floor_premium > 0 ? this.formDetails.floor_premium : 0;
        const unit_premium = this.formDetails.unit_premium > 0 ? this.formDetails.unit_premium : 0;
        const tax = event.target.value > 0 ? event.target.value : 0;
        this.calculateSalesPrice(price, floor_premium, unit_premium, tax);
    }
    calculateSalesPrice(basePrice, FloorPrimiun, UnitPremium, taxVlaue) {
        this.formDetails.sales_price = 0;
        this.formDetails.sales_price = parseFloat(basePrice) + parseFloat(FloorPrimiun) + parseFloat(UnitPremium) + parseFloat(taxVlaue);
    }
    onProjectChange() {
        this.filterModelList = [];
        this.modelcCollectionList = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.filterForm.model_id = [];
        this.getProjecDetails();
        this.getOptionsTypeList();
        this.getOptionsCollectionList();
        this.getModelsList();
        this.getUnitPricing();
    }

    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getUnitPricing();
    }
    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterForm.searchText = '';
        this.getUnitPricing();
    }
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm.searchText = '';
        this.filterForm.model_id = [];
        this.filterForm.collection = [];
        this.filterForm.type = [];
        this.filterForm.beds = [];
        this.filterForm.baths = [];
        this.filterForm.floor_legal = [];
        this.filterForm.den = [];
        this.filterForm.media = [];
        this.filterForm.flex = [];
        this.filterForm.building_type=[];
        this.isClear = false;
        this.floorList=[];
        this.getUnitPricing();
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
        this.getUnitPricing();
    }
    doPaginationWise(page) {
        this.page = page;
        this.getUnitPricing();
    }
    setPageSize() {
        this.page = 1;
        this.getUnitPricing();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            model_id: this.filterForm.model_id,
            collection: this.filterForm.collection,
            type: this.filterForm.type,
            beds: this.filterForm.beds,
            baths: this.filterForm.baths,
            media: this.filterForm.media,
            flex: this.filterForm.flex,
            floor_legal: this.filterForm.floor_legal,
            building_type: this.filterForm.building_type
        }
        localStorage.setItem('fiannaceUnitPriceFilterData', JSON.stringify(data));
    }
    onItemSelect(type?) {
        this.page = 1;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if(type!='floor_legal'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
        }     
        if(type=='building_type'){
            if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                this.getFloorList(floors);
            }
        }
        this.getUnitPricing();
    }
    onDeSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if(type!='floor_legal'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
        }     
         if(type=='building_type'){
            if(this.filterForm.building_type.length==1 && this.filterForm.building_type[0]._id=='condominium'){
                let floors= this.addtionalDetails[0] ? this.addtionalDetails[0].total_floors :0;
                this.getFloorList(floors);
            }
        }
        this.getUnitPricing();
    }
    onSelectAll(type, event) {
        this.page = 1;
        this.filterForm[type] = event;
        if (type == 'collection' || type == 'type') {
            this.getModelsList();
        }
        if(type!='floor_legal'){            
            this.floorList=[];
            this.filterForm.floor_legal = [];
        }     
        this.getUnitPricing();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

}
