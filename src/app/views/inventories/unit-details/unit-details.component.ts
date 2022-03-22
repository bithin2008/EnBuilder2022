import { Component, OnInit, TemplateRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import * as moment from 'moment';
import { FileSaverService } from 'ngx-filesaver';
import { element } from 'protractor';
import { environment } from "../../../../environments/environment";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-unit-details',
    templateUrl: './unit-details.component.html',
    styleUrls: ['./unit-details.component.css']
})
export class UnitDetailsComponent implements OnInit {
    unitDetailsObj: any = {};
    measureUnits: any[] = [];
    unitId: string = '';
    noteList: any[] = [];
    modalRef: BsModalRef;
    formDetails: any = {};
    isEdit: boolean = false;
    defaultActiveTab: any;
    modelList: any[] = [];
    lotTypeList: any[] = [];
    dropdownSettings = {};
    projectViews: any[] = [];
    projectSpaces: any[] = [];
    projectList: any[] = [];
    autosearchText: string = '';
    contactList: any[] = [];
    selectedProject: any = {};
    customAttributes: any[] = [];
    modelListSuggestions: any[] = [];
    collectionList: any[] = [];
    typeOptions: any[] = [];
    parkingTypes: any[] = [];
    bicycleTypes: any[] = [];
    lockerTypes: any[] = [];
    floorLayoutList: any = [];
    electricalLayoutList: any = [];
    suiteLayoutList: any = [];
    videoDetails: any = {};
    mediaPhotoList: any = [];
    mediaVideoList: any = [];
    selectedPhotoPath: any = {};
    selectedVideoPath: any = {};
    paginationObj: any = {};
    baseUrl = environment.BASE_URL;
    keyMapsList: any = [];
    currentModalData: any = {};
    spaceName: string = '';
    constructor(public _activatedRoute: ActivatedRoute,
        private router: Router,
        private webService: WebService,
        private FileSaverService: FileSaverService,
        protected sanitizer: DomSanitizer,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };

        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'value',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
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

    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {

                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                }
                else {
                    this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];
                    this.unitId = this._activatedRoute.snapshot.paramMap.get("unitId");
                    this.getUnitDetails();
                    this.getLotTypeList();
                    this.getNotesList();
                    this.getCustomAttributes();
                    this.getMediaList();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    goToFinance() {
        this.router.navigate(['inventories']);
    }

    updateUnitAPI(data): void {
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getUnitDetails();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteUnit() {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete unit ${this.unitDetailsObj.unit_no}?`)
            .then((confirmed) => {
                if (confirmed) {
                    // console.log(item);
                    let url = `inventories/units?_id=${this.unitDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.router.navigate(['inventories']);

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

    navigateToUnitDetails(id) {
        let url = `#/inventories/unit/${id}`;
        window.open(url, '_blank');
    }

    //// LOOK UP DATA ////
    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?_id=${this.unitDetailsObj.project_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.selectedProject = response.result;
                    if (this.selectedProject) {
                        this.projectViews = this.selectedProject.views ? this.selectedProject.views.length > 0 ? this.selectedProject.views : [] : []
                        this.projectSpaces = this.selectedProject.spaces ? this.selectedProject.spaces.length > 0 ? this.selectedProject.spaces : [] : []
                    }
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    // getOptionsTypeList() {
    //     let url = `inventories/options-of-model-types?project_id=${this.unitDetailsObj.project_id}`;
    //     this.spinnerService.show();
    //     this.typeOptions = [];
    //     this.webService.get(url).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.status == 1) {
    //             if (response.results && response.results.length > 0) {
    //                 response.results.forEach(element => {
    //                     if (element && element != '') {
    //                         this.typeOptions.push(element);
    //                     }
    //                 });
    //             }
    //         }
    //     }, (error) => {
    //         this.spinnerService.hide();
    //         console.log('error', error);
    //     });
    // }

    //// UNIT DETAILS ////
    getUnitDetails() {
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.unitDetailsObj = response.result;
                    if (!this.selectedProject || Object.keys(this.selectedProject).length == 0) {
                        this.getProjectList();
                        this.getFloorPlanList();
                        this.getKeyMapsList();
                        this.getElectricalLayouts();
                        this.getSuiteLayouts();
                        // this.getOptionsTypeList();

                    }
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

    openEditUnitModal(template: TemplateRef<any>, tab) {
        this.isEdit = true;
        this.formDetails = Object.assign({}, this.unitDetailsObj);
        if (tab == 'basicTab') {
            this.autosearchText = '';
            if (this.formDetails.status == 'BROKER ALLOCATED') {
                this.formDetails['contact_name'] = {};
                this.formDetails['contact_name']['_id'] = this.formDetails['broker_id'];
                this.formDetails['contact_name']['display_name'] = this.formDetails['broker_name'];
            }
            if (!this.formDetails.hasOwnProperty('status') || !this.formDetails.status) {
                this.formDetails.status = '';
            }
            this.formDetails.model_id = {
                name: this.formDetails.model_name,
                _id: this.unitDetailsObj.model_id,
                collection: this.formDetails.collection
            }
            this.formDetails.building_type = this.formDetails.building_type ? this.formDetails.building_type.toLowerCase() : 'condominium';
            this.getModelList(this.formDetails.project_id);

        }
        if (tab == 'otherTab') {
        }

        if (tab == 'editUnitViews') {
            this.formDetails.views = this.unitDetailsObj.views ? this.unitDetailsObj.views.length > 0 ? this.unitDetailsObj.views : [] : [];

        }
        if (tab == 'spacesTab') {
            // this.formDetails.spaces = this.modelDetailsObj.spaces ? this.modelDetailsObj.spaces.length > 0 ? this.modelDetailsObj.spaces : [] : [];
            // this.formDetails.spaces.map((element, index) => {
            //     element.is_enable = false;
            // })
            this.formDetails.spaces = [];
            let spaces = this.projectSpaces ? this.projectSpaces.length > 0 ? this.projectSpaces : [] : [];
            let modelSpaces = this.unitDetailsObj.spaces ? this.unitDetailsObj.spaces.length > 0 ? this.unitDetailsObj.spaces : [] : [];
            spaces.forEach((space) => {
                this.formDetails.spaces.push({ name: space, is_enable: false, size: '' });
            })
            // console.log('spaces',spaces,modelSpaces );
            // console.log(this.formDetails.spaces);
            this.formDetails.spaces.forEach((space) => {
                modelSpaces.forEach((element) => {
                    if (element.name == space.name) {
                        space.is_enable = true;
                        space.size = element.size;
                    }
                })
            })
        }
        if (tab == 'buildingViewTab') {
            if (this.formDetails.building_view) {
                this.formDetails.building_view_floor = this.formDetails.building_view.floor;
                this.formDetails.building_view_height = this.formDetails.building_view.height;
                this.formDetails.building_view_unit = this.formDetails.building_view.unit;
                this.formDetails.building_view_width = this.formDetails.building_view.width;
            }
        }
        if (tab == 'lotInfoTab') {
            if (this.formDetails.lot_information) {
                this.formDetails.lot_type = this.formDetails.lot_information.lot_id;
                this.formDetails.lot_area = this.formDetails.lot_information.lot_area;
                this.formDetails.width = this.formDetails.lot_information.width;
                this.formDetails.depth = this.formDetails.lot_information.depth;
                this.formDetails.is_irregular = this.formDetails.lot_information.is_irregular ? true : false
            }

        }

        this.defaultActiveTab = tab;
        const className= (tab=='spacesTab') ? 'modal-lg space-views-list-modal' : 'modal-lg';
        setTimeout(() => {
            this.modalRef = this.modalService.show(template, { class: className, backdrop: 'static' });
        }, 1000)

    }

    /// Edit basic details ///
    editBasicDetails() {
        if (!this.formDetails.collection) {
            this.toastr.warning('Please select model collection', 'Warning');
            return;
        }
        if (!this.formDetails.model_id || !this.formDetails.model_id._id) {
            this.toastr.warning('Please enter model', 'Warning');
            return;
        }
        if (!this.formDetails.unit_no || !this.formDetails.unit_no.trim()) {
            this.toastr.warning('Please enter unit number', 'Warning');
            return;
        }

        if (!this.formDetails.status || this.formDetails.status == '') {
            this.toastr.warning('Please slelect status', 'Warning');
            return;
        }

        if (this.formDetails.status == 'BROKER ALLOCATED' && !this.formDetails.contact_name) {
            this.toastr.warning('Please slelect broker', 'Warning');
            return;
        }
        if (this.formDetails.status == 'BROKER ALLOCATED' && !this.formDetails.contact_name._id) {
            this.toastr.warning('Selected person is not a constituent', 'Warning');
            return;
        }

        if (this.formDetails.status == 'MERGED & RETIRED' && !this.formDetails.merged_unit_no_old) {
            this.toastr.warning('Please enter merged unit no old', 'Warning');
            return;
        }
        if (this.formDetails.status == 'MERGED & RETIRED' && !this.formDetails.merged_unit_no_new) {
            this.toastr.warning('Please enter merged unit no new', 'Warning');
            return;
        }
        let data: any = {};
        let selectedModel = this.modelList.find((o) => o._id == this.formDetails.model_id._id);
        // console.log('selectedModel', selectedModel);
        data.status = this.formDetails.status ? this.formDetails.status : '';
        data.unit_no = this.formDetails.unit_no;
        data.building_type = this.formDetails.building_type || '';
        data.model_id = this.formDetails.model_id._id;
        data.model_name = this.formDetails.model_id.name;
        data.type = (this.formDetails.type && this.formDetails.type.trim()) ? this.formDetails.type : (selectedModel && selectedModel.type) ? selectedModel.type.trim() : '';
        data.collection = this.formDetails.model_id.collection ? this.formDetails.model_id.collection : '';
        data.floor_marketing = this.formDetails.floor_marketing ? this.formDetails.floor_marketing : '';
        data.floor_legal = this.formDetails.floor_legal ? this.formDetails.floor_legal : '';
        data.unit_no_marketing = this.formDetails.unit_no_marketing ? this.formDetails.unit_no_marketing : '';
        data.unit_no_legal = this.formDetails.unit_no_legal ? this.formDetails.unit_no_legal : '';
        //   add condition for broker type checking
        if (this.formDetails.status == 'BROKER ALLOCATED') {
            data['broker_id'] = this.formDetails.contact_name._id;
            data['broker_name'] = this.formDetails.contact_name.display_name
        }
        // condition for reserved status
        if (this.formDetails.status == 'RESERVED') {
            data['reservation_notes'] = this.formDetails.reservation_notes ? this.formDetails.reservation_notes : ''
        }
        data['merged_unit'] = this.formDetails.merged_unit ? this.formDetails.merged_unit : false;
        if (this.formDetails.status == 'MERGED & RETIRED') {
            data['merged_units'] = this.formDetails.merged_units ? this.formDetails.merged_units : [];
            // data['merged_unit_no_old'] = this.formDetails.merged_unit_no_old;
            // data['merged_unit_no_new'] = this.formDetails.merged_unit_no_new;
            // data['merged_retire_notes'] = this.formDetails.merged_retire_notes
        }
        else {
            // data['merged_unit_no_old'] = '';
            // data['merged_unit_no_new'] = '';
            // data['merged_retire_notes'] = '';
        }
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    searchAuto(event) {
        this.autosearchText = event.query;
        this.getContactList();
    }

    getContactList() {
        let url = `sales/contacts?page=1&pageSize=100&sortBy=display_name&sortOrder=ASC&searchText=${this.autosearchText}`;
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.results.length > 0) {
                    this.contactList = response.results;
                }
                this.contactList.forEach(item => {
                    if (item.phones && item.phones.length > 0) {
                        let keepGoing = true;
                        item.phones.forEach(phone => {
                            if (keepGoing) {
                                if (!phone.is_inactive) {
                                    item.phones = {
                                        number: phone.number
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.phones = {
                            number: ''
                        }
                    }
                    if (item.emails && item.emails.length > 0) {
                        let keepGoing = true;
                        item.emails.forEach(email => {
                            if (keepGoing) {
                                if (!email.is_inactive) {
                                    item.emails = {
                                        email: email.email
                                    };
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.emails = {
                            email: ''
                        }
                    }
                    if (item.addresses && item.addresses.length > 0) {
                        let keepGoing = true;
                        item.addresses.forEach(address => {
                            if (keepGoing) {
                                if (!address.is_inactive) {
                                    item.addresses = address;
                                    keepGoing = false;
                                }
                            }
                        });
                    } else {
                        item.addresses = {};
                    }
                    item.show_name = `${item._id}, ${item.display_name ? item.display_name : ''},  ${item.emails.email ? item.emails.email : ''}, ${item.phones.number ? item.phones.number : ''}`;
                });
            } else {
                this.contactList = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getModelList(projectId: string) {
        this.spinnerService.show();
        let url = `inventories/models?page=1&pageSize=200&type=list`;
        if (projectId) {
            url = url + `&project_id=${projectId}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.modelList = response.results ? response.results : [];
                    this.filterCollections();
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    filterCollections() {
        this.collectionList = this.modelList.map(ele => ele.collection).filter((ele, i, arr) => arr.indexOf(ele) == i);
    }

    collectionChange() {
        this.formDetails.model_id = '';
    }

    filterModel(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        if (this.modelList.length > 0) {
            let filterModels = this.modelList.filter((ele) => ele.collection == this.formDetails.collection);
            if (filterModels.length > 0) {
                for (let i = 0; i < filterModels.length; i++) {
                    let model = filterModels[i];
                    if (model.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(model);
                    }
                }
            }
            else {
                for (let i = 0; i < this.modelList.length; i++) {
                    let model = this.modelList[i];
                    if (model.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(model);
                    }
                }
            }

            this.modelListSuggestions = filtered;
        }
    }

    onModelSection(event) {
        if (this.formDetails.model_id && this.formDetails.model_id._id) {
            this.formDetails.model = this.formDetails.model_id.name;
            this.formDetails.collection = (this.formDetails.model_id && this.formDetails.model_id.collection) ? this.formDetails.model_id.collection : '';
            this.formDetails.type = (this.formDetails.model_id && this.formDetails.model_id.type) ? this.formDetails.model_id.type : '';;

        }
    }

    ////Edit other deatils ///
    editOtherDetails() {
        if (this.formDetails.is_parking_eligible && !this.formDetails.max_parking) {
            this.toastr.warning('Please enter max parking', 'Warning');
            return;
        }
        if (this.formDetails.is_locker_eligible && !this.formDetails.max_lockers) {
            this.toastr.warning('Please enter max lockers', 'Warning');
            return;
        }
        if (this.formDetails.is_bicycle_eligible && !this.formDetails.max_bicycle) {
            this.toastr.warning('Please enter max bicycles', 'Warning');
            return;
        }

        let data: any = {};
        // var selectedModel = this.modelList.filter(o => o._id == this.formDetails.model_id);
        // data.model_id = this.formDetails.model_id;
        // data.model_name = selectedModel[0].name;
        data.bath = this.formDetails.bath ? this.formDetails.bath : '';
        data.bed = this.formDetails.bed ? this.formDetails.bed : '';
        data.den = this.formDetails.den ? this.formDetails.den : '';
        data.media = this.formDetails.media ? this.formDetails.media : '';
        data.flex = this.formDetails.flex ? this.formDetails.flex : '';
        data.area = this.formDetails.area ? this.formDetails.area : '';
        data.ceiling = this.formDetails.ceiling ? this.formDetails.ceiling : '';
        data.outdoor_area = this.formDetails.outdoor_area ? this.formDetails.outdoor_area : '';
        data.outdoor_type = this.formDetails.outdoor_type;
        data.is_parking_eligible = this.formDetails.is_parking_eligible ? true : false;
        data.is_locker_eligible = this.formDetails.is_locker_eligible ? true : false;
        data.is_bicycle_eligible = this.formDetails.is_bicycle_eligible ? true : false;

        // conditions for max parkings
        if (data.is_parking_eligible) {
            data['max_parking'] = this.formDetails.max_parking
        }
        if (data.is_locker_eligible) {
            data['max_lockers'] = this.formDetails.max_lockers
        }
        if (data.is_bicycle_eligible) {
            data['max_bicycle'] = this.formDetails.max_bicycle
        }
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //// Custom Attributes ////
    getCustomAttributes() {
        let url = 'inventories/crm-settings?type=MODEL_UNIT_CUSTOM_ATTRIBUTES';
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.customAttributes = response.results;
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

    openCustomAttributesModal(template: TemplateRef<any>) {
        this.formDetails.atrributes = this.customAttributes;
        this.formDetails.atrributes.forEach(element => {
            if (element.data_type == 'STRING') {
                element.input_type = 'text'
            }
            else if (element.data_type == 'NUMBER') {
                element.input_type = 'number'
            }
            else if (element.data_type == 'DATE') {
                element.input_type = 'text'
            }

            element.value = this.unitDetailsObj[element.attribute_id] ? this.unitDetailsObj[element.attribute_id] : '';
        });

        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    updateCustomAttributes() {
        let invalidRecord = this.formDetails.atrributes.find((attribute) => attribute.required && !attribute.value)
        if (invalidRecord) {
            this.toastr.warning(`Please enter value for ${invalidRecord.attribute_name} `, 'Warning');
            return;
        }

        let object: any = {};
        this.formDetails.atrributes.forEach(element => {
            if (element.data_type == 'DATE') {
                object[element.attribute_id] = element.value ? moment(element.value).format('YYYY-MM-DD') : '';

            } else if (element.data_type == 'NUMBER') {
                object[element.attribute_id] = parseFloat(element.value);
            }
            else {
                object[element.attribute_id] = element.value;
            }
        });
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, object).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    ////LOT TYPE LIST///
    getLotTypeList() {
        this.spinnerService.show();
        let url = `inventories/lot-types?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.lotTypeList = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    editLotInfo() {
        let data: any = {};
        if (this.formDetails.lot_type) {
            let selectedLotType = this.lotTypeList.find(o => o._id == this.formDetails.lot_type);
            data['lot_information'] = {
                lot_name: selectedLotType.lot_name,
                lot_id: this.formDetails.lot_type,
                lot_area: this.formDetails.lot_area,
                width: this.formDetails.width,
                depth: this.formDetails.depth,
                is_irregular: this.formDetails.is_irregular ? true : false
            }
        }
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getLotTypeList();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onTypeChange(event) {
        if (event) {
            let selectedLot = this.lotTypeList.find((element) => element._id == event);
            if (selectedLot) {
                this.formDetails.lot_area = selectedLot.lot_area;
                this.formDetails.width = selectedLot.width;
                this.formDetails.depth = selectedLot.depth;
                this.formDetails.is_irregular = selectedLot.is_irregular ? true : false;
            }
        }
        else {
            this.formDetails.lot_area = null;
            this.formDetails.width = null;
            this.formDetails.depth = null;
            this.formDetails.is_irregular = false;

        }
    }

    //// BUILDING VIEW ////
    editBuildingViewInfo() {
        if (!this.formDetails.building_view_floor) {
            this.toastr.warning('Please enter building view floor', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_unit) {
            this.toastr.warning('Please enter building view unit', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_width) {
            this.toastr.warning('Please enter building view width', 'Warning');
            return;
        }
        if (!this.formDetails.building_view_height) {
            this.toastr.warning('Please enter building view height', 'Warning');
            return;
        }
        let data: any = {};
        data['building_view'] = {
            floor: this.formDetails.building_view_floor,
            unit: this.formDetails.building_view_unit,
            width: this.formDetails.building_view_width,
            height: this.formDetails.building_view_height
        }
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //// EDIT VIEWS ////
    editModelViews() {
        let data: any = {};
        if (this.formDetails.views.length > 0) {
            data['views'] = this.formDetails.views;
        } else {
            data['views'] = [];
        }
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    onViewsSelect(type, event) {
        this.formDetails[type] = event;
    }

    //// EDIT SPACES ////
    editModelSpaces() {
        let spaces = this.formDetails.spaces.find((element) => element.is_enable && !element.size);
        if (spaces && spaces.is_enable) {
            this.toastr.warning(`Please enter size for ${spaces.name}`, 'Warning');
            return;
        }
        var data: any = {};
        let selectedSpaces = [];
        this.formDetails.spaces.forEach(element => {
            if (element.is_enable && element.size) {
                selectedSpaces.push({ name: element.name, size: element.size });
            }
        })
        data.spaces = selectedSpaces;
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.unitDetailsObj = response.result && response.result.row ? response.result.row : {};
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    checkExistSpacesName() {
        let currentSapceName = this.spaceName.trim();
        let entries = this.formDetails.spaces.map((element) => element.name.trim() == currentSapceName);
        let isDuplicateSpace = entries.includes(true) ? true : false;
        if (isDuplicateSpace) {
            this.toastr.warning('Duplicate space name. Please enter another space name', 'Warning');

        }
        return isDuplicateSpace;
    }

    addSpaces() {
        if (!this.spaceName || !this.spaceName.trim()) {
            this.toastr.warning('Please enter space value', 'Warning');
            return;
        }
        let returnValue = this.checkExistSpacesName();
        if (returnValue) {
            return;
        }
        let existingSpaces = this.formDetails.spaces.map((element) => element.name); //extracting name only
        existingSpaces.push(this.spaceName.trim());
        let data = {
            _id: this.formDetails.project_id,
            spaces: existingSpaces
        }
        let url = `projects/projects`;
        // console.log(data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getUnitDetails();
                this.getProjectList();
                this.spaceName ? this.formDetails.spaces.push({ name: this.spaceName, is_enable: true, size: '' }) : true;
                this.spaceName = '';
                setTimeout(() => {
                    const id = this.formDetails.spaces.length > 0 ? this.formDetails.spaces.length - 1 : 0;
                    let element: HTMLElement = this.renderer.selectRootElement(`#space${id}`);
                    element.focus()
                }, 5);
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }



    /// NOTES ///
    openAddNotesModal(template: TemplateRef<any>) {
        this.formDetails = {
            body: ''
        };
        this.isEdit = false;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    editNotesModal(template: TemplateRef<any>, item) {
        this.formDetails = { ...item };
        this.isEdit = true;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    addNotes() {
        let data = {
            unit_id: this.unitId,
            body: this.formDetails.body
        }
        let url = `inventories/notes`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getNotesList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    editNotes() {
        let data = {
            _id: this.formDetails._id,
            unit_id: this.unitId,
            body: this.formDetails.body
        }
        let url = `inventories/notes`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getNotesList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getNotesList() {
        let url = `inventories/notes?unit_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.noteList = response.results && response.results.rows ? response.results.rows : [];;
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteNote(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this note ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/notes?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getNotesList();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });

    }


    //// DEAL DETAILS ////
    navigateToContact(id) {
        let url = `#/sales/contact/${id}`;
        window.open(url, '_blank');
    }

    navigateToDealDetails(id) {
        let url = `#/sales/deals/${id}`;
        window.open(url, '_blank');
    }


    //// ALLOCATE PARKING, LOCKERS, BICYCLES ////
    openAllocateParking(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('parking-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    openAllocateBicycle(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('bicycle-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    openAllocateLocker(template: TemplateRef<any>) {
        this.formDetails = {};
        this.getAllocateDataByType('locker-types');
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }


    getAllocateDataByType(type) {
        this.spinnerService.show();
        let url = `inventories/${type}`;
        if (this.selectedProject) {
            url = url + `?project_id=${this.unitDetailsObj.project_id}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (type == 'parking-types') {
                    this.parkingTypes = response.results ? response.results : [];

                    if (this.unitDetailsObj.allocate_parking && this.unitDetailsObj.allocate_parking.length > 0) {
                        this.parkingTypes.forEach((type) => {
                            this.unitDetailsObj.allocate_parking.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = element.eligible_no;
                                }
                            })
                        })
                    }
                }
                else if (type == 'bicycle-types') {
                    this.bicycleTypes = response.results ? response.results : [];
                    if (this.unitDetailsObj.allocate_bicycle && this.unitDetailsObj.allocate_bicycle.length > 0) {
                        this.bicycleTypes.forEach((type) => {
                            this.unitDetailsObj.allocate_bicycle.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = element.eligible_no;
                                }
                            })
                        })
                    }
                }
                else if (type == 'locker-types') {
                    this.lockerTypes = response.results ? response.results : [];
                    if (this.unitDetailsObj.allocate_locker && this.unitDetailsObj.allocate_locker.length > 0) {
                        this.lockerTypes.forEach((type) => {
                            this.unitDetailsObj.allocate_locker.forEach((element) => {
                                if (element.type == type.name) {
                                    type.number = element.eligible_no;
                                }
                            })
                        })
                    }
                }
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    allocateParking() {
        let item = this.parkingTypes.find((element) => (element.number < 0))
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.parkingTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
            };
            parking.push(obj);
        })
        let data = {
            allocate_parking: parking
        }
        // console.log(data);
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(`Parking updated successfully.`, 'Success');
                    this.getUnitDetails();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    allocateBicycle() {
        let item = this.bicycleTypes.find((element) => (element.number < 0))
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.bicycleTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
            };
            parking.push(obj);
        })
        let data = {
            allocate_bicycle: parking
        }
        // console.log(data);
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(`Bicycle updated successfully.`, 'Success');
                    this.getUnitDetails();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    allocateLocker() {
        let item = this.lockerTypes.find((element) => (element.number < 0))
        if (item) {
            this.toastr.warning(`Please enter number value greater than or equal to 0 for type ${item.name}`, 'Warning');
            return;
        }
        let parking = [];
        this.lockerTypes.forEach((element) => {
            let obj: any = {
                type: element.name,
                eligible_no: element.number ? element.number : '',
            };
            parking.push(obj);
        })
        let data = {
            allocate_locker: parking
        }
        // console.log(data);
        let url = `inventories/units?_id=${this.unitId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(`Locker updated successfully.`, 'Success');
                    this.getUnitDetails();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    //// FLOOR LAYOUT ////
    getFloorPlanList() {
        this.spinnerService.show();
        let url = `inventories/photo?type=FLOOR-LAYOUT&source=UNIT&unit_id=${this.unitId}&page=1&pageSize=20`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.floorLayoutList = [];
                    let result = response.results ? response.results : [];
                    result.forEach(async (element) => {
                        if (element.file) {
                            let file_extension = element.file.name.split('.').pop().toLowerCase();
                            element.file_type = file_extension;
                            element.name = element.file.name;
                            if (file_extension == 'pdf') {
                                element.thumbnailUrl = `${environment.API_ENDPOINT}inventories/view-file?dataset=crm_media&_id=${element._id}&file_type=${element.file_type}`;
                            }
                            else {
                                element.thumbnailUrl = `${this.baseUrl}${element.file.url}`;
                            }

                        }
                        console.log(this.floorLayoutList);
                        this.floorLayoutList.push(element)
                    });
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    uploadFloorLayout(files: FileList) {
        const totalFiles = files.length;
        if (totalFiles > 0) {
            let url = `inventories/photo`;
            let validation = false;
            for (let i = 0; i < totalFiles; i++) {
                let layoutPhoto = files[i];
                validation = this.validatePhotoUpload(layoutPhoto.name);
            }
            if (validation) {
                this.spinnerService.show();
                for (let i = 0; i < totalFiles; i++) {
                    let layoutPhoto = files[i];
                    var formData = new FormData();
                    formData.append('file', layoutPhoto);
                    formData.append('unit_id', this.unitId);
                    formData.append('type', 'FLOOR-LAYOUT');
                    formData.append('source', 'UNIT');
                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        if (response.is_valid_session) {
                            if (i == (totalFiles - 1)) {
                                this.spinnerService.hide();
                                if (response.status == 1) {
                                    this.toastr.success(response.message, 'Success');
                                    this.getFloorPlanList();
                                } else {
                                    this.toastr.error(response.message, 'Error');
                                }
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }
                    }, (error) => {
                        this.spinnerService.hide();
                        console.log("error ts: ", error);
                    })
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF,PDF format", 'Error');
            }
        }

    }

    //DELETE FLOOR LAYOUT
    deleteFloorLayout(photo) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete floor layout?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/photo?_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getFloorPlanList();
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

    //// KEY MAPS ////
    getKeyMapsList() {
        this.spinnerService.show();
        let url = `inventories/photo?type=KEY-MAP&source=UNIT&unit_id=${this.unitId}&page=1&pageSize=20`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.keyMapsList = [];
                    let result = response.results ? response.results : [];
                    result.forEach(async (element) => {
                        if (element.file) {
                            let file_extension = element.file.name.split('.').pop().toLowerCase();
                            element.file_type = file_extension;
                            element.name = element.file.name;
                            if (file_extension == 'pdf') {
                                element.thumbnailUrl = `${environment.API_ENDPOINT}inventories/view-file?dataset=crm_media&_id=${element._id}&file_type=${element.file_type}`;
                            }
                            else {
                                element.thumbnailUrl = `${this.baseUrl}${element.file.url}`;
                            }

                        }
                        this.keyMapsList.push(element)
                    });
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    uploadKeyMaps(files: FileList) {
        let url = `inventories/photo`;
        const totalFiles = files.length;
        if (totalFiles > 0) {
            let validation = false;
            for (let i = 0; i < totalFiles; i++) {
                let layoutPhoto = files[i];
                validation = this.validatePhotoUpload(layoutPhoto.name);
            }
            if (validation) {
                this.spinnerService.show();
                for (let i = 0; i < totalFiles; i++) {
                    let layoutPhoto = files[i];
                    let formData = new FormData();
                    formData.append('file', layoutPhoto);
                    formData.append('unit_id', this.unitId);
                    formData.append('type', 'KEY-MAP');
                    formData.append('source', 'UNIT');
                    this.webService.fileUpload(url, formData).subscribe((response: any) => {
                        if (response.is_valid_session) {
                            if (i == (totalFiles - 1)) {
                                if (response.status == 1) {
                                    this.spinnerService.hide();
                                    this.toastr.success(response.message, 'Success');
                                    this.getKeyMapsList();
                                } else {
                                    this.toastr.error(response.message, 'Error');
                                }
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                        }

                    }, (error) => {
                        this.spinnerService.hide();
                        console.log("error ts: ", error);
                    })
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF,PDF format", 'Error');
            }
        }
    }

    deleteKeyMaps(photo) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete key map?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/photo?_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getKeyMapsList();
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

    ///Electrical Layout///
    uploadElectricalLayout(files: FileList) {
      let url = `inventories/photo`;
      const totalFiles = files.length;
      if (totalFiles) {
          let validation = false;
          for (let i = 0; i < totalFiles; i++) {
              let layoutPhoto = files[i];
              validation = this.validatePhotoUpload(layoutPhoto.name);
          }
          if (validation) {
              this.spinnerService.show();
              for (let i = 0; i < totalFiles; i++) {
                  let layoutPhoto = files[i];
                  let formData = new FormData();
                  formData.append('file', layoutPhoto);
                  formData.append('unit_id', this.unitId);
                  formData.append('type', 'ELECTRICAL-LAYOUT');
                  formData.append('source', 'UNIT');
                  this.webService.fileUpload(url, formData).subscribe((response: any) => {
                      if (response.is_valid_session) {
                          if (i == (totalFiles - 1)) {
                              if (response.status == 1) {
                                  this.spinnerService.hide();
                                  this.toastr.success(response.message, 'Success');
                                  this.getElectricalLayouts();
                              } else {
                                  this.toastr.error(response.message, 'Error');
                              }
                          }
                      } else {
                          this.toastr.error('Your Session expired', 'Error');
                          this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                      }

                  }, (error) => {
                      console.log("error ts: ", error);
                  })
              }
          } else {
              this.toastr.error("Please upload only JPG, PNG, GIF,PDF format", 'Error');
          }
      }

  }

  getElectricalLayouts() {
      this.spinnerService.show();
      let url = `inventories/photo?type=ELECTRICAL-LAYOUT&source=UNIT&unit_id=${this.unitId}&page=1&pageSize=20`;
      this.webService.get(url).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.is_valid_session) {
              if (response.status == 1) {
                  this.electricalLayoutList = [];
                  let result = response.results ? response.results : [];
                  result.forEach(async (element) => {
                      if (element.file) {
                          let file_extension = element.file.name.split('.').pop().toLowerCase();
                          element.file_type = file_extension;
                          element.name = element.file.name;
                          if (file_extension == 'pdf') {
                              element.thumbnailUrl = `${environment.API_ENDPOINT}inventories/view-file?dataset=crm_media&_id=${element._id}&file_type=${element.file_type}`;
                          }
                          else {
                              element.thumbnailUrl = `${this.baseUrl}${element.file.url}`;
                          }
                      }
                      // console.log(this.floorLayoutList);
                      this.electricalLayoutList.push(element)
                  });
              }
          } else {
              this.toastr.error('Your Session expired', 'Error');
              this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
          }
      }, (error) => {
          console.log('error', error);
      });
  }

  //DELETE ELECTRICAL LAYOUT
  deleteElectricalLayout(photo) {
      this.confirmationDialogService.confirm('Delete', `Do you want to delete electrical layout?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `inventories/photo?_id=${photo._id}`;
                  this.spinnerService.show();
                  this.webService.delete(url).subscribe((response: any) => {
                      this.spinnerService.hide();
                      if (response.is_valid_session) {
                          if (response.status == 1) {
                              this.toastr.success(response.message, 'Success');
                              this.getElectricalLayouts();
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

    ///Suite Layout///
    uploadSuiteLayout(files: FileList) {
      let url = `inventories/photo`;
      const totalFiles = files.length;
      if (totalFiles > 0) {
          let validation = false;
          for (let i = 0; i < totalFiles; i++) {
              let layoutPhoto = files[i];
              validation = this.validatePhotoUpload(layoutPhoto.name);
          }
          if (validation) {
              this.spinnerService.show();
              for (let i = 0; i < totalFiles; i++) {
                  let layoutPhoto = files[i];
                  let formData = new FormData();
                  formData.append('file', layoutPhoto);
                  formData.append('unit_id', this.unitId);
                  formData.append('type', 'SUITE-LAYOUT');
                  formData.append('source', 'UNIT');
                  this.webService.fileUpload(url, formData).subscribe((response: any) => {
                      if (response.is_valid_session) {
                          if (i == (totalFiles - 1)) {
                              this.spinnerService.hide();
                              if (response.status == 1) {
                                  this.toastr.success(response.message, 'Success');
                                  this.getSuiteLayouts();
                              } else {
                                  this.toastr.error(response.message, 'Error');
                              }
                          }
                      } else {
                          this.toastr.error('Your Session expired', 'Error');
                          this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                      }
                  }, (error) => {
                      console.log("error ts: ", error);
                  })
              }
          } else {
              this.toastr.error("Please upload only JPG, PNG, GIF,PDF format", 'Error');
          }
      }

  }

  getSuiteLayouts() {
      this.spinnerService.show();
      let url = `inventories/photo?type=SUITE-LAYOUT&source=UNIT&unit_id=${this.unitId}&page=1&pageSize=20`;
      this.webService.get(url).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.is_valid_session) {
              if (response.status == 1) {
                  this.suiteLayoutList = [];
                  let result = response.results ? response.results : [];
                  result.forEach(async (element) => {
                      if (element.file) {
                          let file_extension = element.file.name.split('.').pop().toLowerCase();
                          element.file_type = file_extension;
                          element.name = element.file.name;
                          if (file_extension == 'pdf') {
                              element.thumbnailUrl = `${environment.API_ENDPOINT}inventories/view-file?dataset=crm_media&_id=${element._id}&file_type=${element.file_type}`;
                          }
                          else {
                              element.thumbnailUrl = `${this.baseUrl}${element.file.url}`;
                          }
                      }
                      this.suiteLayoutList.push(element)
                  });
              }
          } else {
              this.toastr.error('Your Session expired', 'Error');
              this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
          }
      }, (error) => {
          console.log('error', error);
      });
  }

  ////To Update Suite Layout title //////
    openImageTitleModal(template: TemplateRef<any>, item) {
        this.formDetails = {
            title: item.title ? item.title : '',
            _id: item._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateImageTitle() {
        // if (!this.formDetails.description) {
        //     this.toastr.warning('Please enter name', 'Warning');
        //     return;
        // }
        let data: any = {
            _id: this.formDetails._id,
            title: this.formDetails.title
        };
        // console.log(data);
        let url = `inventories/photo`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                // this.getMediaList();
                this.getSuiteLayouts();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //DELETE SUITE LAYOUT
    deleteSuiteLayout(photo) {
      this.confirmationDialogService.confirm('Delete', `Do you want to delete suite layout?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `inventories/photo?_id=${photo._id}`;
                  this.spinnerService.show();
                  this.webService.delete(url).subscribe((response: any) => {
                      this.spinnerService.hide();
                      if (response.is_valid_session) {
                          if (response.status == 1) {
                              this.toastr.success(response.message, 'Success');
                              this.getSuiteLayouts();
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

    ///Video Gallery///
    deleteVideo(item, event) {
      event.stopPropagation();
      this.confirmationDialogService.confirm('Delete', `Do you want to delete video?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `inventories/videos?_id=${item._id}`;
                  this.spinnerService.show();
                  this.webService.delete(url).subscribe((response: any) => {
                      this.spinnerService.hide();
                      if (response.status == 1) {
                          this.toastr.success(response.message, 'Success');
                          this.getMediaList();
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

  openAddVideoModal(template: TemplateRef<any>) {
      this.videoDetails = {
          video_type: ''
      };
      this.formDetails = { ...this.unitDetailsObj };
      this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
  }
  addModelVideos() {
      let error = 0;
      // var videoRegx = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
      if (!this.videoDetails.video_type) {
          this.toastr.warning('Please select video type', 'Warning');
          error++;
      }
      else if (!this.videoDetails.url) {
          this.toastr.warning('Please enter video url', 'Warning');
          error++;
      }
      // else if (!videoRegx.test(this.videoDetails.url)) {
      //     this.toastr.warning("Please enter valid video URL", 'Warning!');
      //     return;
      // }
      else if (this.videoDetails.video_type == 'YOUTUBE') {
          var yId = this.getYoutubeId(this.videoDetails.url);
          if (yId) {
              this.videoDetails.video_id = yId;
              // delete this.videoDetails.url;
          }
          else {
              error++;
              this.toastr.warning("Please enter valid youtube URL", 'Warning!');
          }
      }
      else if (this.videoDetails.video_type == 'VIMEO') {
          var vId = this.getVimeoId(this.videoDetails.url)
          if (vId) {
              this.videoDetails.video_id = vId;
              // delete this.videoDetails.url;
          }
          else {
              error++;
              this.toastr.warning("Please enter valid vimeo URL", 'Warning!');
          }
      }
      else if (this.videoDetails.video_type == 'MP4' && !this.validateMP4(this.videoDetails.url)) {
          error++;
          this.toastr.warning("Please enter valid mp4 URL", 'Warning!');
      }
      if (error == 0) {
          if (this.formDetails.hasOwnProperty('videos')) {
              this.formDetails.videos.push(this.videoDetails);
          } else {
              this.formDetails.videos = [];
              this.formDetails.videos.push(this.videoDetails);
          }
          var data: any = { ...this.videoDetails };
          data.unit_id = this.unitId;
          data.type = 'VIDEO';
          data.source = 'MEDIA';
          let url = `inventories/videos`;
          this.spinnerService.show();
          this.webService.post(url, data).subscribe((response: any) => {
              this.spinnerService.hide();
              if (response.status == 1) {
                  this.toastr.success(response.message, 'Success');
                  this.getMediaList();
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

  openVideoViewer(template, item) {
      this.selectedVideoPath = {
          path: item.showing_url,
          name: item.title,
          body: item.body

      };
      this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
  }
  //MP4 VALIDATION
  validateMP4(fileName) {
      var allowed_extensions = new Array("mp4");
      var file_extension = fileName.split(".").pop().toLowerCase();
      for (var i = 0; i <= allowed_extensions.length; i++) {
          if (allowed_extensions[i] == file_extension) {
              return true; // valid file extension
          }
      }
      return false;
  }
  //GET YOUTUBE ID
  getYoutubeId(url) {
      if (url) {
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          return (match && match[7].length == 11) ? match[7] : false;
      }
  }
  //GET VIMEO ID
  getVimeoId(url) {
      if (url) {
          var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/
          var parseUrl = regExp.exec(url);
          return parseUrl ? parseUrl[5] : false;
      }
  }

    ///Photo Gallery///
    openPhotoDescription(template: TemplateRef<any>, item) {
      this.formDetails = {
          description: item.description ? item.description : '',
          _id: item._id
      }
      this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

  }

  uploadModelPhoto(files: FileList) {
      if (files.length > 0) {
          let url = `inventories/photo`;
          const totalFiles = files.length;
          let validation = false;
          for (let i = 0; i < totalFiles; i++) {
              let projectPhoto = files[i];;
              validation = this.validatePhoto(projectPhoto.name);
          }

          if (validation) {
              this.spinnerService.show();
              for (let i = 0; i < totalFiles; i++) {
                  let projectPhoto = files[i];
                  let formData = new FormData();
                  formData.append('file', projectPhoto);
                  formData.append('unit_id', this.unitId);
                  formData.append('type', 'PHOTO');
                  formData.append('source', 'MEDIA');
                  this.webService.fileUpload(url, formData).subscribe((response: any) => {
                      if (response.is_valid_session) {
                          if (i == (totalFiles - 1)) {
                              this.spinnerService.hide();
                              if (response.status == 1) {
                                  this.toastr.success(response.message, 'Success');
                                  this.getMediaList();
                              } else {
                                  this.toastr.error(response.message, 'Error');
                              }
                          }
                      }

                  }, (error) => {
                      this.spinnerService.hide();
                      console.log("error ts: ", error);
                  })
              }
          } else {
              this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
          }
      }
  }

  validatePhoto(fileName) {
      var allowed_extensions = new Array("jpg", "jpeg", "png", "gif");
      var file_extension = fileName.split(".").pop().toLowerCase();
      for (var i = 0; i <= allowed_extensions.length; i++) {
          if (allowed_extensions[i] == file_extension) {
              return true; // valid file extension
          }
      }
      return false;
  }

  //DELETE PROJECT PHOTO
  deletePhoto(photo, event) {
      event.stopPropagation();
      this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `inventories/photo?_id=${photo._id}`;
                  this.spinnerService.show();
                  this.webService.delete(url).subscribe((response: any) => {
                      this.spinnerService.hide();
                      if (response.status == 1) {
                          this.toastr.success(response.message, 'Success');
                          this.getMediaList();
                      } else {
                          this.toastr.error(response.message, 'Error');
                      }
                  }, (error) => {
                      console.log('error', error);
                  });
              }
          })
          .catch((error) => { });
  }

  openPhotoBox(template, path, item): void {
      this.selectedPhotoPath = {
          path: path,
          name: item.file.name,
          description: item.description ? item.description : '',
      };
      this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });

  }

  ///Photo Description///
  updatePhotoDescription() {
      // if (!this.formDetails.description) {
      //     this.toastr.warning('Please enter name', 'Warning');
      //     return;
      // }
      let data: any = {
          _id: this.formDetails._id,
          description: this.formDetails.description ? this.formDetails.description.trim() :''
      };

      let url = `inventories/photo`;
      this.spinnerService.show();
      this.webService.post(url, data).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.status == 1) {
              this.toastr.success(response.message, 'Success');
              this.getMediaList();
              this.modalRef.hide();
          } else {
              this.toastr.error(response.message, 'Error');
          }
      }, (error) => {
          this.spinnerService.hide();
          console.log('error', error);
      });
  }

    ///MODEL LIST///
    getMediaList() {
      this.spinnerService.show();
      let url = `inventories/photo?unit_id=${this.unitId}`;
      this.webService.get(url).subscribe((response: any) => {
          this.spinnerService.hide();
          if (response.status == 1) {
              this.mediaPhotoList = [];
              this.mediaVideoList = [];
              response.results.forEach(element => {
                  if (element.type == 'PHOTO' && element.source == 'MEDIA') {
                      this.mediaPhotoList.push(element)
                  }
                  if (element.type == 'VIDEO' && element.source == 'MEDIA') {
                      this.mediaVideoList.push(element)
                  }
              });
              if (this.mediaVideoList.length > 0) {
                  this.mediaVideoList.forEach(element => {
                      if (element.video_type == 'VIMEO') {
                          element.url = `https://player.vimeo.com/video/${element.video_id}`;
                      }
                      if (element.video_type == 'YOUTUBE') {
                          element.url = `https://www.youtube.com/embed/${element.video_id}`;
                      }
                      element.showing_url = this.sanitizer.bypassSecurityTrustResourceUrl(element.url);
                  });
              }
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
          console.log('error', error);
      });
  }

  //MODEL DETAILS///
  getModelDetails() {
      let url = `inventories/models?_id=${this.unitId}`;
      this.spinnerService.show();
      // this.webService.get(url).subscribe((response: any) => {
      //     this.spinnerService.hide();
      //     if (response.is_valid_session) {
      //         if (response.status == 1) {
      //             this.unitDetailsObj = response.result;
      //             this.getMediaList();
      //             // this.getDocumentList();
      //             this.getFloorPlanList();
      //             this.getElectricalLayouts();
      //             this.getSuiteLayouts();
      //             this.getNotesList();
      //         } else {
      //             this.toastr.error(response.message, 'Error');
      //         }
      //     } else {
      //         this.toastr.error('Your Session expired', 'Error');
      //         this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
      //     }
      // }, (error) => {
      //     console.log('error', error);
      // });
  }

  // updateModelAPI(data): void {
  //     let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
  //     this.spinnerService.show();
  //     this.webService.post(url, data).subscribe((response: any) => {
  //         this.spinnerService.hide();
  //         if (response.is_valid_session) {
  //             if (response.status == 1) {
  //                 this.toastr.success(response.message, 'Success');
  //                 this.getModelDetails();
  //                 this.modalRef.hide();
  //             } else {
  //                 this.toastr.error(response.message, 'Error');
  //             }
  //         } else {
  //             this.toastr.error('Your Session expired', 'Error');
  //             this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
  //         }
  //     }, (error) => {
  //         console.log('error', error);
  //     });
  // }

  deleteModel() {
      this.confirmationDialogService.confirm('Delete', `Do you want to delete model ${this.unitDetailsObj.name}?`)
          .then((confirmed) => {
              if (confirmed) {
                  let url = `inventories/models?_id=${this.unitDetailsObj._id}`;
                  this.spinnerService.show();
                  // this.webService.delete(url).subscribe((response: any) => {
                  //     this.spinnerService.hide();
                  //     if (response.is_valid_session) {
                  //         if (response.status == 1) {
                  //             this.toastr.success(response.message, 'Success');
                  //             this.router.navigate(['inventories']);
                  //         } else {
                  //             this.toastr.error(response.message, 'Error');
                  //         }
                  //     } else {
                  //         this.toastr.error('Your Session expired', 'Error');
                  //         this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                  //     }
                  // }, (error) => {
                  //     console.log('error', error);
                  // });
              }
          })
          .catch((error) => { });
  }

  // //FILE/DOCUMENT UPLOAD VALIDATION///
  // uploadModelDocument(files: FileList) {
  //     let validation = this.validateModelDocumentUpload(files.item(0).name);
  //     if (validation) {
  //         this.unitDocument = files.item(0);
  //         let url = `inventories/model-documents`;
  //         var formData = new FormData();
  //         formData.append('file', this.modelDocument);
  //         formData.append('model_id', this.modelId);
  //         formData.append('type', 'MODEL');
  //         this.spinnerService.show();
  //         this.webService.fileUpload(url, formData).subscribe((response: any) => {
  //             this.spinnerService.hide();
  //             if (response.is_valid_session) {
  //                 if (response.status == 1) {
  //                     this.toastr.success(response.message, 'Success');
  //                     this.getDocumentList();
  //                 } else {
  //                     this.toastr.error(response.message, 'Error');
  //                 }
  //             } else {
  //                 this.toastr.error('Your Session expired', 'Error');
  //                 this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
  //             }
  //         }, (error) => {
  //             console.log("error ts: ", error);
  //         })
  //     } else {
  //         this.toastr.error("Please upload only PDF, DOC,DOCX format", "Error");
  //     }
  // }

  // validateModelDocumentUpload(fileName) {
  //     var allowed_extensions = new Array("pdf", "doc", "docx");
  //     var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
  //     for (var i = 0; i <= allowed_extensions.length; i++) {
  //         if (allowed_extensions[i] == file_extension) {
  //             return true; // valid file extension
  //         }
  //     }
  //     return false;
  // }

  // getDocumentList() {
  //     this.spinnerService.show();
  //     let url = `inventories/model-documents?model_id=${this.modelId}&page=${this.page}&pageSize=${this.pageSize}`;
  //     this.webService.get(url).subscribe((response: any) => {
  //         this.spinnerService.hide();
  //         if (response.is_valid_session) {
  //             if (response.status == 1) {
  //                 this.documentList = [];
  //                 response.results.forEach(element => {
  //                     this.documentList.push(element)
  //                 });
  //                 if (response.pagination)
  //                     this.paginationObj = response.pagination;
  //                 else
  //                     this.paginationObj = {
  //                         total: 0
  //                     };
  //             } else {
  //                 this.paginationObj = {
  //                     total: 0
  //                 };
  //             }
  //         } else {
  //             this.toastr.error('Your Session expired', 'Error');
  //             this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
  //         }
  //     }, (error) => {
  //         console.log('error', error);
  //     });
  // }

  // downloadDocument(obj) {
  //     const fileName = obj.document.name;
  //     this.httpClient.get(this.baseUrl + obj.document.url, {
  //         observe: 'response',
  //         responseType: 'blob'
  //     }).subscribe(res => {
  //         this.FileSaverService.save(res.body, fileName);
  //     });
  //     return;
  // }

  // deleteDocument(item) {
  //     this.confirmationDialogService.confirm('Delete', `Do you want to delete document?`)
  //         .then((confirmed) => {
  //             if (confirmed) {
  //                 let url = `inventories/model-documents?_id=${item._id}`;
  //                 this.spinnerService.show();
  //                 this.webService.delete(url).subscribe((response: any) => {
  //                     this.spinnerService.hide();
  //                     if (response.is_valid_session) {
  //                         if (response.status == 1) {
  //                             this.toastr.success(response.message, 'Success');
  //                             this.getDocumentList();
  //                         } else {
  //                             this.toastr.error(response.message, 'Error');
  //                         }
  //                     } else {
  //                         this.toastr.error('Your Session expired', 'Error');
  //                         this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
  //                     }
  //                 }, (error) => {
  //                     console.log('error', error);
  //                 });
  //             }
  //         })
  //         .catch((error) => { });
  // }


    validatePhotoUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "gif", "pdf");
        var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    openImageViewerBox(type, path: string, template: TemplateRef<any>, fileType) {
        this.currentModalData['name'] = type;
        this.currentModalData['path'] = path;
        this.currentModalData['file_type'] = fileType;
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }


    // modelChange() {
    //     let selectedModel = this.modelList.filter(o => o._id == this.formDetails.model_id);
    //     if (selectedModel) {
    //         this.formDetails.model = selectedModel[0].name;
    //         if (!this.isEdit) {
    //             this.getModelDetails(selectedModel[0]._id);
    //         }

    //     }
    // }

    // getModelDetails(id) {
    //     this.spinnerService.show();
    //     let url = `inventories/models?_id=${id}`;
    //     this.webService.get(url).subscribe((response: any) => {
    //         this.spinnerService.hide();
    //         if (response.is_valid_session) {
    //             if (response.status == 1) {
    //                 // console.log('selectedModel', response.result);
    //                 const { area, bath, bed, views, ceiling, flex, collection, media, den, outdoor_type, is_bicycle_eligible, outdoor_area, is_locker_eligible, is_parking_eligible, max_lockers, max_parking, max_bicycle } = response.result;
    //                 this.formDetails.outdoor_type = outdoor_type;
    //                 this.formDetails.area = area;
    //                 this.formDetails.bed = bed;
    //                 this.formDetails.bath = bath;
    //                 this.formDetails.den = den;
    //                 this.formDetails.media = media;
    //                 this.formDetails.flex = flex;
    //                 this.formDetails.collection = collection;
    //                 this.formDetails.ceiling = ceiling;
    //                 this.formDetails.outdoor_area = outdoor_area;
    //                 this.formDetails.views = views ? views.length > 0 ? views : [] : [];
    //                 this.formDetails.is_parking_eligible = is_parking_eligible;
    //                 this.formDetails.is_locker_eligible = is_locker_eligible;
    //                 this.formDetails.is_bicycle_eligible = is_bicycle_eligible;
    //                 this.formDetails.max_parking = max_parking;
    //                 this.formDetails.max_lockers = max_lockers;
    //                 this.formDetails.max_bicycle = max_bicycle;
    //             } else {
    //                 // this.builderList = [];
    //             }
    //         } else {
    //             this.toastr.error('Your Session expired', 'Error');
    //             this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
    //         }
    //     }, (error) => {
    //         this.spinnerService.hide();
    //         console.log('error', error);
    //     });
    // }



}
