import { Component, OnInit, TemplateRef, Input, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
// import { CommonService } from '../../service/';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-unit-deals-details',
    templateUrl: './unit-deals-details.component.html',
    styleUrls: ['./unit-deals-details.component.css']
})
export class UnitDealsDetailsComponent implements OnInit {
    unitDetailsObj: any = {};
    project_id = '';
    public modelFlorplanImg: any = [];
    logsData: any = {
        replies: []
    };
    @ViewChildren('canvas') public newcanvas: ElementRef;
    public canvasEl: HTMLCanvasElement;
    private cx: CanvasRenderingContext2D;
    defaultActiveTab: string = 'userSelectionsTab';
    modalRef: BsModalRef;
    packagesList: any = {
        orignalRecords: [],
        records: []
    };
    colorCollection: any = {
        records: []
    };
    optionsList: any = {
        orignalRecords: [],
        records: []
    };
    designStatus: any[] = [
        {
            value: 'NOT STARTED',
            description: ''
        },
        {
            value: 'OPEN',
            description: ''
        },
        {
            value: 'SUBMITTED',
            description: ''
        },
        {
            value: 'SELECTION FINAL',
            description: ''
        },
        {
            value: 'WAITING FOR PAYMENT',
            description: ''
        },
        {
            value: 'COMPLETED',
            description: ''
        },
        {
            value: 'CANCELLED - BY CUSTOMER',
            description: ''
        },
        {
            value: 'CANCELLED - NO PAYMENT',
            description: ''
        }]
    availablePackagesList: any [] = [];
    availableOptionsList: any [] = [];
    availColorCollection: any = {
        records:[],
        total_cost:0,
        total_price:0
    }
    availablePackages: any = {
        records:[],
        total_cost:0,
        total_price:0
    };;
    availableOptions: any = {
        records:[],
        total_cost:0,
        total_price:0
    };
    allAvailablePackagesList: any[]=[];
    allAvailableOptionsList: any []=[];
    unitId: any;
    formDetails: any = {};
    baseUrl = environment.BASE_URL;
    selectedColorCollection: any;
    totalObj = {
        subTotal: 0,
        hst: 0,
        total: 0
    }
    openNoteModalRef;
    locationWiseList: any[] = [];
    package_location: any = '';
    option_location: any = '';
    selected_package_location: any = '';
    selected_option_location: any = '';
    packageLocations: any = [];
    optionsLocations: any = [];
    selectedParkingSelection: any = [];
    selectedLockerSelection: any = [];
    selectedBicycleSelection: any = [];
    modealNumberList: any[] = [];
    categoryList: any[] = [];
    locationList: any[] = [];
    defaultLayoutActiveTab = 0;
    layoutList: any[] = [];
    invoicesList: any[] = [];
    statusList=[]=[{name:'New',value:'NEW'},
                   {name:'Submitted',value:'SUBMITTED'},
                   {name:'Rejected By Builder',value:'REJECTED BY BUILDER'},
                   {name:'Rejected By Client',value:'REJECTED BY CLIENT'},
                   {name:'Price Given',value:'PRICE GIVEN'},
                   {name:'Accepted',value:'ACCEPTED'}]
    constructor(private router: Router,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService,
        private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        public _activatedRoute: ActivatedRoute,
        private ngModalService: NgbModal) { }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        if (localStorage.getItem('purchaserUnitsActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('purchaserUnitsActiveTab');
        }
        this.unitId = this._activatedRoute.snapshot.paramMap.get("unitId");
        this.checkLogin();
    }

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
                else {
                    if (this.unitId) {
                        this.getUnitDetails();
                    }
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    goToPurchaser() {
        this.router.navigate(['purchaser-admin']);
    }

    doTabFunctions(event) {
        if (event.nextId == 'userSelectionsTab') {
            this.onPackageLocationChange(this.package_location);
            this.onOptionLocationChange(this.option_location);
            localStorage.setItem('purchaserUnitsActiveTab', 'userSelectionsTab');
        }
        if (event.nextId == 'availableSelectionTab') {
            this.getUserItems();
            this.getAvailableCollection('COLOR_COLLECTION');
            this.getAvailableCollection('PACKAGE');
            this.getAvailableCollection('PERSONALIZATION_OPTION');

            setTimeout(()=>{
                this.onSelectedPackageLocationChange(this.selected_package_location);
                this.onSelectedOptionLocationChange(this.selected_option_location);
                localStorage.setItem('purchaserUnitsActiveTab', 'availableSelectionTab');
            },2000)
        }
        if (event.nextId == 'lockerSelectionsTab') {
            this.getSelectionData('locker-selection');
            localStorage.setItem('purchaserUnitsActiveTab', 'lockerSelectionsTab');
        }
        if (event.nextId == 'parkingSelectionsTab') {
            this.getSelectionData('parking-selection');
            localStorage.setItem('purchaserUnitsActiveTab', 'parkingSelectionsTab');
        }
        if (event.nextId == 'bicycleSelectionsTab') {
            this.getSelectionData('bicycle-selection');
            localStorage.setItem('purchaserUnitsActiveTab', 'bicycleSelectionsTab');
        }
        if (event.nextId == 'layoutCustomizationTab') {
            localStorage.setItem('purchaserUnitsActiveTab', 'layoutCustomizationTab');
            this.getLayoutCustomization();
        }
        if (event.nextId == 'summaryTab') {
            localStorage.setItem('purchaserUnitsActiveTab', 'summaryTab');
            this.getLocationWiseList();
        }
    }

    onPackageLocationChange(location) {
        this.availablePackages.total_cost=0;
        this.availablePackages.total_price=0;
        if (location && location != '') {
            let items = this.availablePackagesList.filter((element) => element.source.location == location)
            this.availablePackages.records = items;
        }
        else {
            this.availablePackages.records = this.availablePackagesList;
        }
        this.availablePackages.records.forEach(record => {
            if (record.cost) {
                this.availablePackages.total_cost = this.availablePackages.total_cost + record.cost;
            }
            if (record.price) {
                this.availablePackages.total_price = this.availablePackages.total_price + record.price;
            }
        })
    }

    onOptionLocationChange(location) {
        this.availableOptions.total_cost=0;
        this.availableOptions.total_price=0;

        if (location && location != '') {
            let items = this.availableOptionsList.filter((element) => element.source.location == location)
            this.availableOptions.records = items;
        }
        else {
            this.availableOptions.records = this.availableOptionsList;
        }
        this.availableOptions.records.forEach(record => {
            if (record.cost) {
                this.availableOptions.total_cost = this.availableOptions.total_cost + record.cost;
            }
            if (record.price) {
                this.availableOptions.total_price = this.availableOptions.total_price + record.price;
            }
        })
    }

    getUnitDetails() {
        this.spinnerService.show();
        let url = `purchaser-portal/units?_id=${this.unitId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.unitDetailsObj = response.result;
                // if (!this.unitDetailsObj.deal_id) {
                //     // this.defaultActiveTab = 'availableSelectionTab';
                //     this.getAvailableCollection('COLOR_COLLECTION');
                //     this.getAvailableCollection('PACKAGE');
                //     this.getAvailableCollection('PERSONALIZATION_OPTION');
                // }
                // else {
                
                // calls for selection data
                if(this.defaultActiveTab == 'availableSelectionTab'){
                    this.getUserItems();
                    this.getAvailableCollection('COLOR_COLLECTION');
                    this.getAvailableCollection('PACKAGE');
                    this.getAvailableCollection('PERSONALIZATION_OPTION');
    
                }
                if(this.defaultActiveTab == 'userSelectionsTab'){
                    this.getUserItems();
                }
                if (this.defaultActiveTab == 'parkingSelectionsTab') {
                    
                    this.getSelectionData('parking-selection');
                }
                else if (this.defaultActiveTab == 'lockerSelectionsTab') {
                    this.getSelectionData('locker-selection');
                }
                else if (this.defaultActiveTab == 'bicycleSelectionsTab') {
                    this.getSelectionData('bicycle-selection');
                }
                else if (this.defaultActiveTab == 'layoutCustomizationTab') {
                    this.getLayoutCustomization();
                }
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getAvailableCollection(type) {
        this.spinnerService.show();
        let url = `purchaser-portal/available-selections?_id=${this.unitId}&subtype=${type}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (type == 'COLOR_COLLECTION') {
                    let records = response.results ? response.results : [];
                    this.availColorCollection.records=records;
                    this.availColorCollection.records.forEach(record => {
                        if (record.cost) {
                            this.availColorCollection.total_cost = this.availColorCollection.total_cost + record.cost;
                        }
                        if (record.price) {
                            this.availColorCollection.total_price = this.availColorCollection.total_price + record.price;
                        }
                    })
                    this.getSelectedCollectionSource();
                }
                else if (type == 'PACKAGE') {
                    let records =  response.results ? response.results : [];
                    this.allAvailablePackagesList =records;
                    this.getAvailablePackages();
                }
                else if (type == 'PERSONALIZATION_OPTION') {
                    let records =  response.results ? response.results : [];
                    this.allAvailableOptionsList=records;
                    this.getAvailablePersonalOption()
                }
                this.getLocationWiseList();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });

    }

    openEditDescriptionNotesModal(template: TemplateRef<any>, item) {

        this.formDetails = { ...item };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    getUserItems(type?) {
        this.spinnerService.show();
        let url = `purchaser-portal/items-selected`;
        if (this.unitDetailsObj.deal_id) {
            url = url + `?deal_id=${this.unitDetailsObj.deal_id}`;
        }
        else {
            url = url + `?unit_id=${this.unitId}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                // if (type == 'COLOR_COLLECTION') {
                let result = response.result;
                this.colorCollection.records = result.hasOwnProperty('color_collections') ? result.color_collections : [];
                this.colorCollection.total_cost = 0;
                this.colorCollection.total_price = 0;
                this.colorCollection.records.forEach(record => {
                    if (record.cost) {
                        this.colorCollection.total_cost = this.colorCollection.total_cost + record.cost;
                    }
                    if (record.price) {
                        this.colorCollection.total_price = this.colorCollection.total_price + record.price;
                    }
                })
                this.packagesList.records = [];
                this.packagesList.orignalRecords = result.hasOwnProperty('packages') ? result.packages : [];
                this.packagesList.orignalRecords.forEach(element => {
                    this.packagesList.records.push(Object.assign(element));
                });
                //To initialize loctaion selection and total
                this.onSelectedPackageLocationChange(this.selected_package_location);
                this.optionsList.records = [];
                this.optionsList.orignalRecords = result.hasOwnProperty('personalization_options') ? result.personalization_options : [];
                this.optionsList.orignalRecords.forEach(element => {
                    this.optionsList.records.push(Object.assign(element));
                });
                this.onSelectedOptionLocationChange(this.selected_option_location);
                this.getAvailablePackages();
                this.getAvailablePersonalOption();
                this.getSelectedCollectionSource();
                this.getLocationWiseList();
                this.calculateTotal();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onSelectedPackageLocationChange(location) {
        this.packagesList.total_cost = 0;
        this.packagesList.total_price = 0;
        if (location && location != '') {
            let items = this.packagesList.orignalRecords.filter((element) => element.location == location)
            this.packagesList.records = items;
        }
        else {
            this.packagesList.records = this.packagesList.orignalRecords;
        }
        this.packagesList.records.forEach(record => {
            if (record.cost) {
                this.packagesList.total_cost = this.packagesList.total_cost + record.cost;
            }
            if (record.price) {
                this.packagesList.total_price = this.packagesList.total_price + record.price;
            }
        })
    }

    onSelectedOptionLocationChange(location) {
        this.optionsList.total_cost = 0;
        this.optionsList.total_price = 0;
        if (location && location != '') {
            let items = this.optionsList.orignalRecords.filter((element) => element.location == location)
            this.optionsList.records = items;
        }
        else {
            this.optionsList.records = this.optionsList.orignalRecords;
        }

        this.optionsList.records.forEach(record => {
            if (record.cost) {
                this.optionsList.total_cost = this.optionsList.total_cost + record.cost;
            }
            if (record.price) {
                this.optionsList.total_price = this.optionsList.total_price + record.price;
            }
        })
    }

    getAvailablePackages() {
        this.availablePackagesList = [];
        this.availablePackages.total_cost=0;
        this.availablePackages.total_price=0;
        if (this.colorCollection.records && this.colorCollection.records.length > 0) {
            this.allAvailablePackagesList.forEach(element => {
                if (element.hasOwnProperty('source') && element.source.hasOwnProperty('collections') && element.source.collections.length > 0) {
                    let selectedCollection = this.colorCollection.records[0];
                    let collection = element.source.collections.find((collection) => collection.collection_id == selectedCollection.item_id);
                    if (collection) {
                        let existingItems = this.packagesList.orignalRecords.find((ele) => ele.item_id == element.source._id)
                        element.isSelected = existingItems ? true : false;
                        this.availablePackagesList.push(element);
                        this.availablePackages.records = this.availablePackagesList;
                        this.availablePackages.records.forEach(record => {
                            if (record.cost) {
                                this.availablePackages.total_cost = this.availablePackages.total_cost + record.cost;
                            }
                            if (record.price) {
                                this.availablePackages.total_price = this.availablePackages.total_price + record.price;
                            }
                        })
                        this.packageLocations = this.availablePackagesList.map(ele => ele.source.location).filter((ele, i, arr) => arr.indexOf(ele) == i);

                    }
                }
            });
        }
    }

    getAvailablePersonalOption() {
        this.availableOptionsList = [];
        this.availableOptions.total_cost=0;
        this.availableOptions.total_price=0;
        if (this.colorCollection.records && this.colorCollection.records.length > 0) {
            this.allAvailableOptionsList.forEach(element => {
                if (element.hasOwnProperty('source') && element.source.hasOwnProperty('only_sold_with_collections') && element.source.only_sold_with_collections.length > 0) {
                    let selectedCollection = this.colorCollection.records[0];
                    let collection = element.source.only_sold_with_collections.find((item) => item._id == selectedCollection.item_id);
                    if (collection) {
                        let existingItems = this.optionsList.orignalRecords.find((ele) => ele.item_id == element.source._id)
                        element.isSelected = existingItems ? true : false;
                        this.availableOptionsList.push(element);
                        this.availableOptions.records = this.availableOptionsList;
                        this.availableOptions.records.forEach(record => {
                            if (record.cost) {
                                this.availableOptions.total_cost = this.availableOptions.total_cost + record.cost;
                            }
                            if (record.price) {
                                this.availableOptions.total_price = this.availableOptions.total_price + record.price;
                            }
                        })
                        this.optionsLocations = this.availableOptionsList.map(ele => ele.source.location).filter((ele, i, arr) => arr.indexOf(ele) == i);

                    }
                }
            });
        }
    }

    getSelectedCollectionSource() {
        let selectedOne = (this.colorCollection.records && this.colorCollection.records.length > 0) ? this.colorCollection.records[0] : null;
        if (selectedOne) {
            let collection = this.availColorCollection.records.find((element) => element.source._id == selectedOne.item_id)
            this.selectedColorCollection = collection;
        }
    }

    getLocationWiseList() {
        // selected items
        let allItems = [];
        this.locationWiseList = [];
        this.availablePackagesList.forEach(ogPck => {
            this.packagesList.orignalRecords.forEach(pck => {
                if (ogPck.source._id == pck.item_id) {
                    pck['location'] = ogPck.source.location ? ogPck.source.location : '';
                    allItems.push(ogPck);
                }
            });
        });
        this.availableOptionsList.forEach(ogOpt => {
            this.optionsList.orignalRecords.forEach(opt => {
                if (ogOpt.source._id == opt.item_id) {
                    opt['location'] = ogOpt.source.location ? ogOpt.source.location : '';
                    allItems.push(ogOpt);
                }
            });
        });
        let locations = allItems.map(ele => ele.source.location).filter((ele, i, arr) => arr.indexOf(ele) == i);
        // console.log('locations', locations);
        locations.forEach(location => {
            let obj: any = {
                name: location.trim(),
                packages: this.packagesList.orignalRecords.filter((item) => item.location == location),
                options: this.optionsList.orignalRecords.filter((item) => item.location == location),
            }
            this.locationWiseList.push(obj);
        })
        //result
        // console.log('locationWiseList', this.locationWiseList);
    }

    calculateTotal() {
        let subtotal = 0;
        if (this.colorCollection.total_price) {
            subtotal = subtotal + this.colorCollection.total_price;
        }
        if (this.packagesList.total_price) {
            subtotal = subtotal + this.packagesList.total_price;
        } if (this.optionsList.total_price) {
            subtotal = subtotal + this.optionsList.total_price;
        }
        this.totalObj.subTotal = subtotal;
        this.totalObj.hst = subtotal * (13 / 100);
        this.totalObj.total = subtotal + (this.totalObj.hst ? this.totalObj.hst : 0);
    }

    /////Available Selections/////
    async addItem(item, type) {
        let message = '';
        try {
            if (!this.unitDetailsObj.deal_id) {
                if (!item.price || item.price == 0) {
                    message = `Deal is not present for this unit. Do you still want to add it?`;
                }
                else {
                    message = `Deal is not present for this unit. Do you still want to add it? If you add then price will be 0 ( Zero ).?`;
                }

                let confirmed = await this.confirmationDialogService.confirm('Confirmation', message);
                if (!confirmed) {
                    return;
                }
            }

            if (type == 'COLOR_COLLECTION') {

                if (this.colorCollection.records && this.colorCollection.records.length > 0) {
                    let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Changing color collection will reset the selection made on the Package and Personalization Option.Do you want to continue ?`);
                    if (!confirmed) {
                        return;
                    }
                }

                let existingItems = this.colorCollection.records.find((ele) => ele.item_id == item.source._id)
                if (existingItems) {
                    this.toastr.warning('This item is already exist', 'Warning');
                    return;
                }
            }
            if (type == 'PACKAGE') {
                let existingItems = this.packagesList.orignalRecords.find((ele) => ele.item_id == item.source._id)
                if (existingItems) {
                    this.toastr.warning('This item is already exist', 'Warning');
                    return;
                }
            }
            if (type == 'PERSONALIZATION_OPTION') {
                let existingItems = this.optionsList.orignalRecords.find((ele) => ele.item_id == item.source._id)
                if (existingItems) {
                    this.toastr.warning('This item is already exist', 'Warning');
                    return;
                }
            }
            let data: any = {};
            data.deal_id = this.unitDetailsObj.deal_id ? this.unitDetailsObj.deal_id : '';
            data.unit_id = this.unitDetailsObj._id;
            data.item_id = item.source._id;
            data.item_name = item.source.name;
            data.cost = item.cost;
            data.price = this.unitDetailsObj.deal_id ? item.price : 0;
            data.type = type;
            let url = `purchaser-portal/items-add`;
            // console.log('data', data);
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.getUserItems(type);

                        this.toastr.success(response.message, 'Success');
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        catch {
            console.log('User dismissed the dialog ')
        }
    }

    removeUserItems(item, type) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${item.item_name} item?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/items-remove?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getUserItems(type);
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


    //For design studio stages//
    selectDesignStudioStage(item) {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to change the status to ${item.value.toLowerCase()}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data = {
                        design_studio_status: item.value,
                        deal_id: this.unitDetailsObj.deal_id
                    }
                    if (item.value == 'CANCELLED - BY CUSTOMER') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - BY CUSTOMER'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                // console.log('result==>', result);
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else if (item.value == 'CANCELLED - NO PAYMENT') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - NO PAYMENT'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else {
                        this.updateDesignStudioStatus(data)
                    }
                }
            }).catch(() => console.log('User dismissed the dialog '));

    }


    ///Parking Selection////
    selectParkingStage(item) {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to change the status to ${item.value.toLowerCase()}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data = {
                        parking_selection_status: item.value,
                        deal_id: this.unitDetailsObj.deal_id
                    }
                    if (item.value == 'CANCELLED - BY CUSTOMER') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - BY CUSTOMER'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else if (item.value == 'CANCELLED - NO PAYMENT') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - NO PAYMENT'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else {
                        this.updateDesignStudioStatus(data)
                    }
                }
            }).catch(() => console.log('User dismissed the dialog '));
    }

    releaseParkingSpace(obj) {
        this.confirmationDialogService.confirm('Delete', `Do you want to release ${obj.number} parking space for unit ${obj.unit_no} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/parking-selection?space_id=${obj.space_id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getSelectionData('parking-selection');
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    ///Bicycle Parking Selection///
    selectBicycleParkingStage(item) {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to change the status to ${item.value.toLowerCase()}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data = {
                        bicycle_parking_status: item.value,
                        deal_id: this.unitDetailsObj.deal_id
                    }
                    if (item.value == 'CANCELLED - BY CUSTOMER') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - BY CUSTOMER'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else if (item.value == 'CANCELLED - NO PAYMENT') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - NO PAYMENT'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else {
                        this.updateDesignStudioStatus(data)
                    }
                }
            }).catch(() => console.log('User dismissed the dialog '));

    }

    releaseBicycleSpace(obj) {
        this.confirmationDialogService.confirm('Delete', `Do you want to release ${obj.number} bicycle for unit ${obj.unit_no}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/bicycle-selection?space_id=${obj.space_id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getSelectionData('bicycle-selection');
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    ///Locker Selection///
    selectLockerSelectionStage(item) {
        this.confirmationDialogService.confirm('Confirmation', `Do you want to change the status to ${item.value.toLowerCase()}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let data = {
                        locker_selection_status: item.value,
                        deal_id: this.unitDetailsObj.deal_id
                    }
                    if (item.value == 'CANCELLED - BY CUSTOMER') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - BY CUSTOMER'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else if (item.value == 'CANCELLED - NO PAYMENT') {
                        this.openNoteModalRef = this.ngModalService.open(CancelNotesComponent,
                            {
                                size: 'md', backdrop: 'static'
                            })
                        this.openNoteModalRef.componentInstance.data = {
                            type: 'CANCELLED - NO PAYMENT'
                        }
                        this.openNoteModalRef.result.then(async (result) => {
                            if (result) {
                                data['note'] = result.notes;
                                this.updateDesignStudioStatus(data)
                            }
                        }, (reason) => {
                            console.log('reason', reason);
                        })
                    }
                    else {
                        this.updateDesignStudioStatus(data)
                    }
                }
            }).catch(() => console.log('User dismissed the dialog '));

    }

    releaseLockerSpace(obj) {
        this.confirmationDialogService.confirm('Delete', `Do you want to release ${obj.number} locker for unit ${obj.unit_no}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/locker-selection?space_id=${obj.space_id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getSelectionData('locker-selection');
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    updateDesignStudioStatus(data) {
        let url = `purchaser-portal/deals`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.getSelectionUpdatedStatus();
                    this.toastr.success(response.message, 'Success');
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getSelectionUpdatedStatus() {
        this.spinnerService.show();
        let url = `purchaser-portal/units?_id=${this.unitId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.unitDetailsObj = response.result;
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //Invoices
    getInvoices() {
        // this.spinnerService.show();
        // let url = `purchaser-portal/invoices?_id=${this.unitId}`;
        // this.webService.get(url).subscribe((response: any) => {
        //     this.spinnerService.hide();
        //     if (response.success) {
        //      this.invoicesList = response.result;
        //     }
        // }, (error) => {
        //     this.spinnerService.hide();
        //     console.log('error', error);
        // });
    }

    //PARKING/LOCKER/BICYCLE SELECTIONS
    getSelectionData(type) {
        if (this.unitDetailsObj.deal_id) {
            this.spinnerService.show();
            let url = `purchaser-portal/${type}?deal_id=${this.unitDetailsObj.deal_id}`;
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.success) {
                    if (type == 'parking-selection') {
                        this.selectedParkingSelection = response.results ? response.results : [];
                        if (this.unitDetailsObj.deal.allocate_parking && this.unitDetailsObj.deal.allocate_parking.length > 0) {
                            this.unitDetailsObj.deal.allocate_parking.forEach(element => {
                                let filteredParking = this.selectedParkingSelection.filter((parking) => parking.type == element.type);
                                element.totalItem = filteredParking.length;
                            });
                        }
                    }
                    else if (type == 'locker-selection') {
                        this.selectedLockerSelection = response.results ? response.results : [];
                        if (this.unitDetailsObj.deal.allocate_locker && this.unitDetailsObj.deal.allocate_locker.length > 0) {
                            this.unitDetailsObj.deal.allocate_locker.forEach(element => {
                                let filteredParking = this.selectedLockerSelection.filter((parking) => parking.type == element.type);
                                element.totalItem = filteredParking.length;
                            });
                        }
                    }
                    else if (type == 'bicycle-selection') {
                        this.selectedBicycleSelection = response.results ? response.results : [];
                        if (this.unitDetailsObj.deal.allocate_bicycle && this.unitDetailsObj.deal.allocate_bicycle.length > 0) {
                            this.unitDetailsObj.deal.allocate_bicycle.forEach(element => {
                                let filteredParking = this.selectedBicycleSelection.filter((parking) => parking.type == element.type);
                                element.totalItem = filteredParking.length;
                            });
                        }
                    }

                }

            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {

        }
    }

    setOrder(value: string) {
        // if (this.order === value) {
        //     this.reverse = !this.reverse;
        // }
        // this.order = value;
        // this.sortedtby = value;
        // if (this.reverse) {
        //     this.sortOrder = 'DESC';
        // } else {
        //     this.sortOrder = 'ASC';
        // }
        // this.getUnitList();
    }

    loadiamgeToCanvas() {
        let promise = new Promise<void>((resolve, reject) => {
            var canvas = this.canvasEl;
            var ctx = this.cx;
            var img = new Image();
            img.src = (this.defaultLayoutActiveTab > 0 ? this.baseUrl + this.layoutList[this.defaultLayoutActiveTab].file.url : this.baseUrl + this.layoutList[this.defaultLayoutActiveTab].file.url) + '/760';
            //img.src = 'assets/img/floor-plan.png'; //for test
            img.onload = function () {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                ctx.drawImage(img, 0, 0);
                resolve()
            }
        })
        return promise;
    }

    populateCircleinLoop(x, y, v) {
        this.cx.beginPath();
        this.cx.arc(x + 8, y + 10, 20, 0, 2 * Math.PI);
        this.cx.strokeStyle = '#af2626';
        this.cx.lineWidth = 3;
        this.cx.stroke();
        this.cx.font = "16px 'Arial', sans-serif";
        this.cx.strokeText(v, x + 2, y + 14);
    }

    ///// LAYOUT CUSTOMIZATION /////
    getLayoutCustomization() {
        let url = `purchaser-portal/layout-customizations`;
        if (this.unitId) {
            url = url + `?unit_id=${this.unitId}`;
        }
        if (this.project_id) {
            url = url + `&project_id=${this.unitDetailsObj.project_id}`;
        }
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    // this.modelFlorplanImg = (response.layouts && response.layouts.length>0) ? response.layouts :[];
                    // var canvas = <HTMLCanvasElement>document.getElementById('layoutCanvas');
                    // this.canvasEl=canvas;
                    // this.cx = this.canvasEl.getContext('2d');  

                    // this.logsData= response.results ? response.results :[];
                    // if(this.modelFlorplanImg && this.modelFlorplanImg.length>0){
                    //   this.loadiamgeToCanvas();
                    //    setTimeout(()=>{
                    //         this.logsData.forEach((element,index)=>{
                    //           // markCounter++;
                    //           this.populateCircleinLoop(element.posX, element.posY, (index+1));
                    //         })
                    //    },2000);
                    // }

                    this.layoutList = (response.layouts && response.layouts.length > 0) ? response.layouts : [];
                    let results = response.results ? response.results : [];
                    this.layoutList.forEach((element, index) => {
                        let replies = results.filter((item) => item.layout_index == index);
                        element.replies = replies;
                        element.id = index;
                        element.title = element.file ? element.file.name : `Layout ${index + 1}`;
                    });

                    // console.log('layouts',this.layoutList);
                    setTimeout(() => {
                        this.renderCanvas();
                    }, 2000)
                } else {
                    this.toastr.error(response.error, 'Error');
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login']);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    renderCanvas() {
        this.logsData = this.layoutList[this.defaultLayoutActiveTab];

        var canvas = <HTMLCanvasElement>document.getElementById('layoutCanvas');
        this.canvasEl = canvas;
        if(this.canvasEl){
            this.cx = this.canvasEl.getContext('2d');
            
            this.loadiamgeToCanvas();
            setTimeout(() => {
                this.logsData.replies.forEach((element, index) => {
                    this.populateCircleinLoop(element.posX, element.posY, (index + 1));
                })
            }, 2000);
        }
    }
        
    doLayoutTabFunctions(event) {
        this.defaultLayoutActiveTab = event.nextId;
        this.logsData = {
            file: null,
            replies: []
        };
        setTimeout(() => {
            this.renderCanvas();
        }, 1000);

    }

    //////REPLY SECTION IN LAYOUT CUSTOMIZATION///
    openReplyModal(template: TemplateRef<any>, item) {
        this.formDetails = {
            message: '',
            price: '',
            cost: '',
            status: '',
            category: '',
            location: '',
            item_model_number: '',
            construction_notes: '',
            replies: item.replies ? item.replies : [],
            _id: item._id
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateReply() {
        if (!this.formDetails.message) {
            this.toastr.warning('Please enter message', 'Warning');
            return;
        }
        else if (!this.formDetails.status) {
            this.toastr.warning('Please enter status', 'Warning');
            return;
        }

        let data: any = {
            reply: {}
        };
        // if(this.formDetails.replies && this.formDetails.replies.length>0){
        //     this.formDetails.replies.forEach(element => {
        //         data.replies.push(element);
        //     });
        // }
        let newReply = {
            message: this.formDetails.message || '',
            price: this.formDetails.price || '',
            cost: this.formDetails.cost || '',
            category: this.formDetails.category || '',
            location: this.formDetails.location || '',
            item_model_number: this.formDetails.item_model_number || '',
        }
        // data.replies.push(newReply);
        data.reply = newReply;
        data._id = this.formDetails._id;
        data.status = this.formDetails.status ? this.formDetails.status : '';
        data.construction_notes = this.formDetails.construction_notes || '';
        if (data._id) {
            let url = `purchaser-portal/layout-customizations`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
                        this.getLayoutCustomization();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.toastr.error('Id of record not found', 'Error');
        }

    }

    ngOnDestroy() {
        this.layoutList = [];
        this.logsData = {};
    }
}

@Component({
    template: `<div class="modal-header">
    <h4 class="modal-title">Add Note</h4>
    <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
  <form autocomplete="off">
  <div class="row">
      <div class="col-md-12">
          <div class="form-group row">
              <div class="col-sm-12">
                  <textarea class="form-control" [ngModelOptions]="{standalone: true}" [(ngModel)]="note" name="comment"
                      id="comment" cols="55" rows="12">
                  </textarea>
              </div>
          </div>
      </div>
  </div>

</form>  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Close</button>
    <button type="button" class="btn btn-primary" (click)="onSubmit()">Submit</button>
  </div>`,
})
export class CancelNotesComponent {
    @Input() data;
    note: string;
    constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) { }

    onSubmit() {
        if (!this.note || !this.note.trim()) {
            this.toastr.warning('Please enter note', 'Warning')
            return;
        }
        else {
            this.activeModal.close({ notes: this.note });
        }
    }
}
