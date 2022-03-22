import { Component, OnInit, TemplateRef, Input, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { Subscription, Observable } from 'rxjs';
@Component({
    selector: 'app-parking',
    templateUrl: './parking.component.html',
    styleUrls: ['./parking.component.css']
})
export class ParkingComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    @Input() returnUrl: String;
    paginationObj: any = {};
    addOnPaginationObj: any = {};
    typePaginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {
        views: []
    };
    addonsFormDetails: any = {
    };
    filterForm: any = {
        searchText: ''
    };
    sortedtby: any = 'name';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'name';
    addOnSortedtby: any = 'name';
    addOnSortOrder: any = 'ASC';
    addOnPage: Number = 1;
    addOnPageSize: Number = 20;
    addOnOrder: string = 'name';
    typeSortedtby: any = 'name';
    typeSortOrder: any = 'ASC';
    typePage: Number = 1;
    typePageSize: Number = 20;
    typeOrder: string = 'name';
    reverse: boolean = true;
    addOnReverse: boolean = true
    typeReverse: boolean = true
    isClear: boolean = false;
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    parkingFloorPlan: any = [];
    parkingAddons: any = [];
    projectList: any = [];
    parkingTypes: any = [];
    modalProjectList: any = [];
    selectedProject: any;
    floorplanImage: any;
    uploadedPhoto: boolean = false;
    parkingTypesFormDetails: any = {
    };
    standardPremiumImages: any[] = [];
    addonsImages: any[] = [];
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.getProjectList();
        this.eventsSubscription = this.events.subscribe((response: any) => {
            this.page = 1;
            this.addOnPage = 1;
            this.typePage = 1;
            this.pageSize = 20;
            this.addOnPageSize = 20;
            this.typePageSize = 20;
            if (response) {
                this.selectedProject = response._id;
                this.onProjectChange();
            }
            else {
                this.selectedProject = '';
                this.onProjectChange();
            }
        });
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        let parkingFilterData: any = localStorage.getItem('inventoriesParkingData');

        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.selectedProject = projectFilterData._id;
            } 
            else {
                // this.selectedProject = this.projectList[0]._id;
            }
        }
        
        if (parkingFilterData) {
            parkingFilterData = JSON.parse(parkingFilterData);
            if (parkingFilterData.sortedtby) {
                this.sortedtby = parkingFilterData.sortedtby;
            }
            if (parkingFilterData.sortOrder) {
                this.sortOrder = parkingFilterData.sortOrder;
            }
            if (parkingFilterData.page) {
                this.page = parkingFilterData.page;
            }
            if (parkingFilterData.pageSize) {
                this.pageSize = parkingFilterData.pageSize;
            }

            if (parkingFilterData.addOnSortedtby) {
                this.addOnSortedtby = parkingFilterData.addOnSortedtby;
            }
            if (parkingFilterData.addOnSortOrder) {
                this.addOnSortOrder = parkingFilterData.addOnSortOrder;
            }
            if (parkingFilterData.addOnPage) {
                this.addOnPage = parkingFilterData.addOnPage;
            }
            if (parkingFilterData.addOnPageSize) {
                this.addOnPageSize = parkingFilterData.addOnPageSize;
            }
            if (parkingFilterData.typeSortedtby) {
                this.typeSortedtby = parkingFilterData.typeSortedtby;
            }
            if (parkingFilterData.typeSortOrder) {
                this.typeSortOrder = parkingFilterData.typeSortOrder;
            }
            if (parkingFilterData.typePage) {
                this.typePage = parkingFilterData.typePage;
            }
            if (parkingFilterData.typePageSize) {
                this.typePageSize = parkingFilterData.typePageSize;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
            this.addOnOrder = this.addOnSortedtby;
            if (this.addOnSortOrder == 'DESC') {
                this.addOnReverse = true;
            } else {
                this.addOnReverse = false;
            }
            this.typeOrder = this.typeSortedtby;
            if (this.typeSortOrder == 'DESC') {
                this.typeReverse = true;
            } else {
                this.typeReverse = false;
            }

        }
        this.getParkingFloorList();
        this.getParkingAddonsList();
        this.getParkingTypeList();
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                this.modalProjectList = response.results;
                if (this.projectList.length > 0) {
                    this.getSavedFilterdata();
                   
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    onProjectChange() {
        this.getParkingFloorList();
        this.getParkingAddonsList();
        this.getParkingTypeList();
    }

    saveFilter() {
        let data = {
            sortedtby: this.sortedtby,
            sortOrder: this.sortOrder,
            page: this.page,
            pageSize: this.pageSize,
            order: this.order,
            addOnSortedtby: this.addOnSortedtby,
            addOnSortOrder: this.addOnSortOrder,
            addOnPage: this.addOnPage,
            addOnPageSize: this.addOnPageSize,
            addOnOrder: this.addOnOrder,
            typeSortedtby: this.typeSortedtby,
            typeSortOrder: this.typeSortOrder,
            typePage: this.typePage,
            typePageSize: this.typePageSize,
            typeOrder: this.typeOrder,
            reverse: this.reverse,
            addOnReverse: this.addOnReverse,
            typeReverse: this.typeReverse
        }
        localStorage.setItem('inventoriesParkingData', JSON.stringify(data));
    }

    
    //////////////////////////////////
    //////// PARKING FLOOR  //////////
    //////////////////////////////////
    getParkingFloorList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/parking-floors?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.parkingFloorPlan = response.results;
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

    setParkingFloorOrder(value: string) {
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
        this.getParkingFloorList();
    }

    //OPEN ADD PARKING MODAL
    openAddParkingFloorModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            project_id: this.selectedProject,
            views: [],
            spaces: []
        };
        this.uploadedPhoto = false;
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    uploadFloorplan(files: FileList) {
        if(files.item(0)){
        let validation = this.validateDocumentUpload(files.item(0).name);
        if (validation) {
            this.floorplanImage = files.item(0);
            this.getBase64(files.item(0));
            // this.formDetails.logo.hasImg = true;
        } else {
            this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
        }
    }
    }
    //FILE UPLAOD TO BASE64 CONVERSION
    getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // console.log(reader.result);
            // this.uploadedPhoto = true;
            this.formDetails.layout = reader.result;
            // console.log('formDetails?.layout', this.formDetails.layout);
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }
    //FILE UPLOAD VALIDATION
    validateDocumentUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "gif");
        var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }
    addParkingFloor() {
        if (!this.formDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter floor name', 'Warning');
            return;
        }
        if (!this.formDetails.layout) {
            this.toastr.warning('Please upload floorplan', 'Warning');
            return;
        }
        var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        var parkingFloorObj = new FormData();
        parkingFloorObj.append("file", this.floorplanImage);
        parkingFloorObj.append("project_id", this.formDetails.project_id);
        parkingFloorObj.append("project_name", selectedProject[0].name);
        parkingFloorObj.append("name", this.formDetails.name.trim());
        let url = `inventories/parking-floors`;
        this.spinnerService.show();
        this.webService.fileUpload(url, parkingFloorObj).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getParkingFloorList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    goToFloorDetails(item) {
        this.router.navigate(['inventories/parking-floor/' + item.project_id + '/' + item._id]);
    }

    doPaginationWise(page) {
        this.page = page;
        this.getParkingFloorList();
    }

    setPageSize() {
        this.page = 1;
        this.getParkingFloorList();
    }

    //////////////////////////////////
    /// PARKING ADDONS  ///
    //////////////////////////////////
    setParkingAddonsOrder(value: string) {
        if (this.addOnOrder === value) {
            this.addOnReverse = !this.addOnReverse;
        }
        this.addOnOrder = value;
        this.addOnSortedtby = value;
        if (this.addOnReverse) {
            this.addOnSortOrder = 'DESC';
        } else {
            this.addOnSortOrder = 'ASC';
        }
        this.getParkingAddonsList();
    }

    getParkingAddonsList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/parking-addons?addOnPage=${this.addOnPage}&addOnPageSize=${this.addOnPageSize}`;
        if (this.addOnSortedtby)
            url = url + `&sortBy=${this.addOnSortedtby}&sortOrder=${this.addOnSortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.parkingAddons=[];
            if (response.status == 1) {
                this.parkingAddons = response.results;
                if(this.page == this.addOnPaginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.addOnPaginationObj.totalPages>1 ? this.addOnPaginationObj.totalPages-1 : 1;
                    this.getParkingAddonsList()  
                } 
                if (response.pagination) {
                    this.addOnPaginationObj = response.pagination;
                    this.addOnPageSize = response.pagination.pageSize;
                }
                else
                    this.addOnPaginationObj = {
                        total: 0
                    };
            } else {
                this.addOnPaginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openAddParkingAddonsModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.addonsFormDetails = {
            project_id: this.selectedProject,
            status: ''
        };
        if (this.addonsImages.length == 0) {
            this.getAddonsImageList();
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    async addParkingAddons() {
        try {
            if (!this.addonsFormDetails.project_id) {
                this.toastr.warning('Please select project', 'Warning');
                return;
            }
            if (!this.addonsFormDetails.name || !this.addonsFormDetails.name.trim()) {
                this.toastr.warning('Please enter name', 'Warning');
                return;
            }
            if (!this.addonsFormDetails.addon_icon) {
                this.toastr.warning('Please select addon icon', 'Warning');
                return;
            }
            // if (!this.addonsFormDetails.total) {
            //     this.toastr.warning('Please enter total amount', 'Warning');
            //     return;
            // }
            if (this.addonsFormDetails.limited_quantity) {
                if (!this.addonsFormDetails.total) {
                    this.toastr.warning('Please enter total of available parking', 'Warning');
                    return;
                }
                else if (this.addonsFormDetails.total < 0) {
                    this.toastr.warning('Please enter valid total of available parking', 'Warning');
                    return;
                }
            }
            if (this.addonsFormDetails.cost >= 0 && this.addonsFormDetails.price >= 0) {
                if (this.addonsFormDetails.cost > this.addonsFormDetails.price) {
                    let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price, Do you want to continue ?`)
                    if (!confirmed) {
                        return;

                    }
                }

            }

            var selectedProject = this.projectList.filter(o => o._id == this.addonsFormDetails.project_id);
            var data = {
                name: this.addonsFormDetails.name,
                project_id: this.addonsFormDetails.project_id,
                project_name: selectedProject[0].name,
                // total: this.addonsFormDetails.total,
                sold: this.addonsFormDetails.sold ? this.addonsFormDetails.sold : '',
                cost: this.addonsFormDetails.cost ? this.addonsFormDetails.cost : '',
                price: this.addonsFormDetails.price ? this.addonsFormDetails.price : '',
                status: this.addonsFormDetails.status,
                addon_icon: this.addonsFormDetails.addon_icon,
                limited_quantity: this.addonsFormDetails.limited_quantity ? true : false
            }
            if (this.addonsFormDetails.limited_quantity) {
                data['total'] = this.addonsFormDetails.total
            }
            else {
                data['total'] = ''
            }
            let url = `inventories/parking-addons`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getParkingAddonsList();
                        this.modalRef.hide();
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
        catch{
            console.log('User dismissed the dialog ')
        }
    }

    openEditParkingAddonsModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.addonsFormDetails = { ...obj };
        if (this.addonsImages.length == 0) {
            this.getAddonsImageList();
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    async editParkingAddons() {
        try {
            if (!this.addonsFormDetails.project_id) {
                this.toastr.warning('Please select project', 'Warning');
                return;
            }
            if (!this.addonsFormDetails.name) {
                this.toastr.warning('Please enter name', 'Warning');
                return;
            }
            if (!this.addonsFormDetails.addon_icon) {
                this.toastr.warning('Please select addon icon', 'Warning');
                return;
            }
            // if (!this.addonsFormDetails.total) {
            //     this.toastr.warning('Please enter total amount', 'Warning');
            //     return;
            // }
            if (this.addonsFormDetails.limited_quantity) {
                if (!this.addonsFormDetails.total) {
                    this.toastr.warning('Please enter total of available parking', 'Warning');
                    return;
                }
                else if (this.addonsFormDetails.total < 0) {
                    this.toastr.warning('Please enter valid total of available parking', 'Warning');
                    return;
                }
            }
            if (this.addonsFormDetails.cost >= 0 && this.addonsFormDetails.price >= 0) {
                if (this.addonsFormDetails.cost > this.addonsFormDetails.price) {
                    let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price, Do you want to continue ?`)
                    if (!confirmed) {
                        return;
                    }
                }
            }
            var selectedProject = this.projectList.filter(o => o._id == this.addonsFormDetails.project_id);
            var data = {
                name: this.addonsFormDetails.name,
                project_id: this.addonsFormDetails.project_id,
                project_name: selectedProject[0].name,
                // total: this.addonsFormDetails.total,
                sold: this.addonsFormDetails.sold ? this.addonsFormDetails.sold : '',
                cost: this.addonsFormDetails.cost ? this.addonsFormDetails.cost : '',
                price: this.addonsFormDetails.price ? this.addonsFormDetails.price : '',
                status: this.addonsFormDetails.status,
                addon_icon: this.addonsFormDetails.addon_icon,
                limited_quantity: this.addonsFormDetails.limited_quantity ? true : false
            }
            if (this.addonsFormDetails.limited_quantity) {
                data['total'] = this.addonsFormDetails.total
            }
            else {
                data['total'] = ''
            }
            let url = `inventories/parking-addons?_id=${this.addonsFormDetails._id}`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getParkingAddonsList();
                        this.modalRef.hide();
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
        catch{
            console.log('User dismissed the dialog ')
        }
    }
    
    getAddonsImageList() {
        this.spinnerService.show();
        let url = `inventories/crm-settings?type=ADDONS-ICON`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (this.projectList.length > 0) {
                    this.addonsImages = response.results ? response.results : [];
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    selectAddonsImages(item) {
        this.addonsFormDetails.addon_icon = item.value;
    }

    doAddOnPaginationWise(page) {
        this.page = page;
        this.getParkingAddonsList();
    }
    addOnSetPageSize(event) {
        this.addOnPageSize = event.target.value;
        this.getParkingAddonsList();
    }

    //DELETE PARKING ADDONS
    deleteParkingAddons(addon) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete parking addons ${addon.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/parking-addons?_id=${addon._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getParkingAddonsList();
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

    //////////////////////////////////
    /// PARKING TYPES  ///
    //////////////////////////////////
    setParkingTypesOrder(value: string) {
        if (this.typeOrder === value) {
            this.typeReverse = !this.typeReverse;
        }
        this.typeOrder = value;
        this.typeSortedtby = value;
        if (this.typeReverse) {
            this.typeSortOrder = 'DESC';
        } else {
            this.typeSortOrder = 'ASC';
        }
        this.getParkingTypeList();
    }
    
    openAddParkingTypesModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.parkingTypesFormDetails = {
            project_id: this.selectedProject,
            type: '',
            standard_available: '',
            premium_available: '',
            limited_quantity: false

        };
        if (this.standardPremiumImages.length == 0) {
            this.getStandardPremiumImageList();
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    addParkingTypes() {
        if (!this.parkingTypesFormDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.name || !this.parkingTypesFormDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.standard_available) {
            this.toastr.warning('Please select standard image', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.premium_available) {
            this.toastr.warning('Please select premium image', 'Warning');
            return;
        }
        var selectedProject = this.projectList.filter(o => o._id == this.parkingTypesFormDetails.project_id);
        // console.log('selectedProject 2=>', selectedProject, this.parkingTypesFormDetails);
        var data = {
            name: this.parkingTypesFormDetails.name,
            project_id: this.parkingTypesFormDetails.project_id,
            project_name: selectedProject[0].name,
            standard_available: this.parkingTypesFormDetails.standard_available,
            premium_available: this.parkingTypesFormDetails.premium_available,
        }
        let url = `inventories/parking-types`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getParkingTypeList();
                    this.modalRef.hide();
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

    openEditParkingTypesModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.parkingTypesFormDetails = { ...obj };
        if (this.standardPremiumImages.length == 0) {
            this.getStandardPremiumImageList();
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    editParkingTypes() {
        if (!this.parkingTypesFormDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.name) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.standard_available) {
            this.toastr.warning('Please select standard image', 'Warning');
            return;
        }
        if (!this.parkingTypesFormDetails.premium_available) {
            this.toastr.warning('Please select premium image', 'Warning');
            return;
        }
        var data = {
            name: this.parkingTypesFormDetails.name,
            standard_available: this.parkingTypesFormDetails.standard_available,
            premium_available: this.parkingTypesFormDetails.premium_available,

        }
        let url = `inventories/parking-types?_id=${this.parkingTypesFormDetails._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getParkingTypeList();
                    this.modalRef.hide();
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

    getParkingTypeList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/parking-types?typePage=${this.typePage}&typePageSize=${this.typePageSize}`;
        if (this.typeSortedtby)
            url = url + `&sortBy=${this.typeSortedtby}&sortOrder=${this.typeSortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.parkingTypes =[];
            if (response.status == 1) {
                this.parkingTypes = response.results;
                if(this.page == this.typePaginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.typePaginationObj.totalPages>1 ? this.typePaginationObj.totalPages-1 : 1;
                    this.getParkingTypeList()  
                } 
                if (response.pagination) {
                    this.typePaginationObj = response.pagination;
                    this.typePageSize = response.pagination.pageSize;
                } else {
                    this.typePaginationObj = {
                        total: 0
                    };
                }
            } else {
                this.typePaginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    typeSetPageSize() {
        this.typePageSize = this.typePageSize;
        this.getParkingTypeList();
    }

    doTypesPaginationWise(page) {
        this.page = page;
        this.getParkingTypeList();
    }

    //DELETE PARKING TYPES
    deleteParkingTypes(type) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete parking type ${type.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/parking-types?_id=${type._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getParkingTypeList();
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

    getStandardPremiumImageList() {
        this.spinnerService.show();
        let url = `inventories/crm-settings?type=PARKING-ICON`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                if (this.projectList.length > 0) {
                    this.standardPremiumImages = response.results;
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    selectStandardImage(item) {
        this.parkingTypesFormDetails.standard_available = item.value;
    }

    selectPremiumImage(item) {
        this.parkingTypesFormDetails.premium_available = item.value;

    }


    // async  uploadImages(type, files: FileList) {
    //     if (files && files.item(0)) {
    //         let validation = this.validateDocumentUpload(files.item(0).name);
    //         if (validation) {
    //             let file = files.item(0);
    //             var reader = new FileReader();
    //             let size = await this.formatBytes(file.size, 0);
    //             reader.readAsDataURL(file);
    //             if (size > 50) {
    //                 this.toastr.error("Maximum size of the photo should be 50 Kb", "Error");
    //                 return;
    //             }
    //             else {
    //                 reader.onload = (event) => {
    //                     const img = new Image();
    //                     img.src = window.URL.createObjectURL(file);
    //                     img.onload = (e: any) => {
    //                         const height = e.path[0].height;
    //                         const width = e.path[0].width;
    //                         if (width >= 150 || height >= 150) {
    //                             this.toastr.error("Maximum resolution of the photo should be 150 x 150", "Error");
    //                         }
    //                         else {
    //                             this.parkingTypesFormDetails[type] = reader.result;
    //                         }
    //                     }
    //                 };
    //                 reader.onerror = function (error) {
    //                     console.log("Error: ", error);
    //                 };

    //             }
    //         } else {
    //             this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
    //         }
    //     }

    // }

    // formatBytes(bytes, decimals) {
    //     // console.log(bytes)
    //     return new Promise(resolve => {
    //         if (bytes === 0) return '0 Bytes';
    //         const k = 1024;
    //         const dm = decimals < 0 ? 0 : decimals;
    //         // const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    //         // const i = Math.floor(Math.log(bytes) / Math.log(k));
    //         resolve(parseFloat((bytes / Math.pow(k, 1)).toFixed(dm)));
    //     });
    // }
    // validateParkingTypeImage(fileName) {
    //     var allowed_extensions = new Array("jpg", "jpeg", "png", "gif");
    //     var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
    //     for (var i = 0; i <= allowed_extensions.length; i++) {
    //         if (allowed_extensions[i] == file_extension) {
    //             return true; // valid file extension
    //         }
    //     }
    //     return false;
    // }


}

