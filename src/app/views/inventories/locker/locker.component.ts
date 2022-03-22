import { Component, OnInit, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
import { Subscription, Observable } from 'rxjs';

@Component({
    selector: 'app-locker',
    templateUrl: './locker.component.html',
    styleUrls: ['./locker.component.css']
})
export class LockerComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    projectList: any = [];
    selectedProject: any;
    isEdit: boolean = false;
    formDetails: any = {};
    modalRef: BsModalRef;
    lockerFloorPlan: any[] = [];
    lockerTypes: any[] = [];
    lockerTypesPaginationObj: any = {};
    paginationObj: any = {};
    sortedtby: any = 'name';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'name';
    baseUrl = environment.BASE_URL;
    floorplanImage: any;
    lockerTypesFormDetails: any = {
    };
    typeSortedtby: any = 'name';
    typePageSize: Number = 20;
    typeSortOrder: any = 'ASC';
    typePage: Number = 1;
    standardPremiumImages: any[] = [];
    typeOrder: string = 'name';
    reverse: boolean = true;
    typeReverse: boolean = true
    lockerAddons: any[] = [];
    addOnSortedtby: any = 'name';
    addOnSortOrder: any = 'ASC';
    addOnPage: Number = 1;
    addOnPageSize: Number = 20;
    addOnOrder: string = 'name';
    addOnReverse: boolean = true
    addonsFormDetails: any = {
    };
    addOnPaginationObj: any = {};
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
            this.typePage = 1;
            this.addOnPage=1;
            this.pageSize = 20;
            this.typePageSize = 20;
            this.addOnPageSize=20;
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

    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (this.projectList.length > 0) {
                    // this.selectedProject = this.projectList[0]._id;
                    this.getSavedFilterdata();
                   
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getSavedFilterdata() {
        let projectFilterData: any = localStorage.getItem('inventoriesProjectData');
        let lockerFilterData: any = localStorage.getItem('inventoriesLockerData');

        if (projectFilterData) {
            projectFilterData = JSON.parse(projectFilterData);
            if (projectFilterData._id) {
                this.selectedProject = projectFilterData._id;
            } else {
                // this.selectedProject = this.projectList[0]._id;
            }
        }
       

        if (lockerFilterData) {
            lockerFilterData = JSON.parse(lockerFilterData);
            if (lockerFilterData.sortedtby) {
                this.sortedtby = lockerFilterData.sortedtby;
            }
            if (lockerFilterData.sortOrder) {
                this.sortOrder = lockerFilterData.sortOrder;
            }
            if (lockerFilterData.page) {
                this.page = lockerFilterData.page;
            }
            if (lockerFilterData.pageSize) {
                this.pageSize = lockerFilterData.pageSize;
            }

            if (lockerFilterData.typeSortedtby) {
                this.typeSortedtby = lockerFilterData.typeSortedtby;
            }
            if (lockerFilterData.typeSortOrder) {
                this.typeSortOrder = lockerFilterData.typeSortOrder;
            }
            if (lockerFilterData.typePage) {
                this.typePage = lockerFilterData.typePage;
            }
            if (lockerFilterData.typePageSize) {
                this.typePageSize = lockerFilterData.typePageSize;
            }
            if (lockerFilterData.addOnPageSize) {
                this.addOnPageSize = lockerFilterData.addOnPageSize;
            }

            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }

            this.typeOrder = this.typeSortedtby;
            if (this.typeSortOrder == 'DESC') {
                this.typeReverse = true;
            } else {
                this.typeReverse = false;
            }
        }
        this.getLockerFloorList();
        this.getLockerTypeList();
        this.getLockerAddonsList();
    }

    onProjectChange() {
        this.getLockerFloorList();
        this.getLockerTypeList();
        this.getLockerAddonsList();
    }

    ////////////////////////////////////
    //////// Locker Floor /////////////
    ////////////////////////////////////
    openAddLockerFloorModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            project_id: this.selectedProject
        };
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    addLockerFloor() {
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
        parkingFloorObj.append("layout", this.floorplanImage);
        parkingFloorObj.append("project_id", this.formDetails.project_id);
        parkingFloorObj.append("project_name", selectedProject[0].name);
        parkingFloorObj.append("name", this.formDetails.name.trim());
        let url = `inventories/locker-area`;
        this.spinnerService.show();
        this.webService.fileUpload(url, parkingFloorObj).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getLockerFloorList();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    goToFloorDetails(item) {
        this.router.navigate(['inventories/locker-floor/' + item.project_id + '/' + item._id]);
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
            this.formDetails.layout = reader.result;
            // console.log('this.formDetails.layout', this.formDetails.layout);
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }

    setLockerFloorOrder(value: string) {
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
        this.getLockerFloorList();
    }

    getLockerFloorList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/locker-area?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            // console.log('response', response);
            this.spinnerService.hide();
            if (response.status == 1) {
                this.lockerFloorPlan = response.results;
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

    saveFilter() {
        let data = {
            order: this.order,
            reverse: this.reverse,
            sortedtby: this.sortedtby,
            sortOrder: this.sortOrder,
            page: this.page,
            pageSize: this.pageSize,
            typeSortedtby: this.typeSortedtby,
            typeSortOrder: this.typeSortOrder,
            typePage: this.typePage,
            typePageSize: this.typePageSize,
            typeOrder: this.typeOrder,
            typeReverse: this.typeReverse
        }
        localStorage.setItem('inventoriesLockerData', JSON.stringify(data));
    }

    doPaginationWise(page) {
        this.page = page;
        this.getLockerFloorList();
    }

    setPageSizeFloorPlan() {
        this.page = 1;
        this.getLockerFloorList();
    }

    ////////////////////////////////////
    //////// Locker Types /////////////
    ////////////////////////////////////
    getLockerTypeList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/locker-types?typePage=${this.typePage}&typePageSize=${this.typePageSize}`;
        if (this.typeSortedtby)
            url = url + `&sortBy=${this.typeSortedtby}&sortOrder=${this.typeSortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.lockerTypes=[];
            if (response.status == 1) {
                this.lockerTypes = response.results;
                if(this.page == this.lockerTypesPaginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.lockerTypesPaginationObj.totalPages>1 ? this.lockerTypesPaginationObj.totalPages-1 : 1;
                    this.getLockerTypeList()  
                } 
                if (response.pagination) {
                    this.lockerTypesPaginationObj = response.pagination;
                    this.typePageSize = response.pagination.pageSize;
                } else {
                    this.lockerTypesPaginationObj = {
                        total: 0
                    };
                }
            } else {
                this.lockerTypesPaginationObj = {
                    total: 0
                };
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openAddLockerTypeModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.lockerTypesFormDetails = {
            project_id: this.selectedProject,
            type: '',
            standard_available: '',
            premium_available: ''
        };
        if (this.standardPremiumImages.length == 0) {
            this.getStandardPremiumImageList();
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    addLockerTypes() {
        if (!this.lockerTypesFormDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.name || !this.lockerTypesFormDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.standard_available) {
            this.toastr.warning('Please select standard image', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.premium_available) {
            this.toastr.warning('Please select premium image', 'Warning');
            return;
        }
        var selectedProject = this.projectList.filter(o => o._id == this.lockerTypesFormDetails.project_id);
        // console.log('selectedProject 2=>', selectedProject, this.lockerTypesFormDetails);
        var data = {
            name: this.lockerTypesFormDetails.name,
            project_id: this.lockerTypesFormDetails.project_id,
            project_name: selectedProject[0].name,
            standard_available: this.lockerTypesFormDetails.standard_available,
            premium_available: this.lockerTypesFormDetails.premium_available,
        }
        let url = `inventories/locker-types`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getLockerTypeList();
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

    openEditLockerTypesModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.lockerTypesFormDetails = { ...obj };
        if (this.standardPremiumImages.length == 0) {
            this.getStandardPremiumImageList();
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
    }

    editLockerTypes() {
        if (!this.lockerTypesFormDetails.project_id) {
            this.toastr.warning('Please select project', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.name || !this.lockerTypesFormDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.standard_available) {
            this.toastr.warning('Please select standard image', 'Warning');
            return;
        }
        if (!this.lockerTypesFormDetails.premium_available) {
            this.toastr.warning('Please select premium image', 'Warning');
            return;
        }
        var data = {
            name: this.lockerTypesFormDetails.name,
            standard_available: this.lockerTypesFormDetails.standard_available,
            premium_available: this.lockerTypesFormDetails.premium_available,

        }
        let url = `inventories/locker-types?_id=${this.lockerTypesFormDetails._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getLockerTypeList();
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

    getStandardPremiumImageList() {
        this.spinnerService.show();
        let url = `inventories/crm-settings?type=LOCKER-ICON`;
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

    //DELETE LOCKER TYPES
    deleteLockerTypes(type) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete locker type ${type.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/locker-types?_id=${type._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getLockerTypeList();
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

    selectStandardImage(item) {
        this.lockerTypesFormDetails.standard_available = item.value;
    }

    selectPremiumImage(item) {
        this.lockerTypesFormDetails.premium_available = item.value;

    }

    setLockerTypesOrder(value: string) {
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
        this.getLockerTypeList();
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

    doLockerTypesPaginationWise(page) {
        this.page = page;
        this.getLockerTypeList();
    }

    setPageSizeTypes() {
        this.page = 1;
        this.getLockerTypeList();
    }


    ////////////////////////////////////
    //////// locker Addons ////////////
    ////////////////////////////////////

    openAddLockerAddonsModal(template: TemplateRef<any>) {
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

    async addLockerAddons() {
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
                    this.toastr.warning('Please enter total of available locker', 'Warning');
                    return;
                }
                else if (this.addonsFormDetails.total < 0) {
                    this.toastr.warning('Please enter valid total of available locker', 'Warning');
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
                limited_quantity: this.addonsFormDetails.limited_quantity ? true : false,
                // total: this.addonsFormDetails.total,
                sold: this.addonsFormDetails.sold ? this.addonsFormDetails.sold : '',
                cost: this.addonsFormDetails.cost ? this.addonsFormDetails.cost : '',
                price: this.addonsFormDetails.price ? this.addonsFormDetails.price : '',
                status: this.addonsFormDetails.status,
                addon_icon: this.addonsFormDetails.addon_icon,
            }
            if (this.addonsFormDetails.limited_quantity) {
                data['total'] = this.addonsFormDetails.total
            }
            else {
                data['total'] = ''
            }
            let url = `inventories/locker-addons`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getLockerAddonsList();
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

    openEditLockerAddonsModal(template: TemplateRef<any>, obj) {
        this.isEdit = true;
        this.addonsFormDetails = { ...obj };
        if (this.addonsImages.length == 0) {
            this.getAddonsImageList();
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    async editLockerAddons() {
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
                    this.toastr.warning('Please enter total of available locker', 'Warning');
                    return;
                }
                else if (this.addonsFormDetails.total < 0) {
                    this.toastr.warning('Please enter valid total of available locker', 'Warning');
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
                limited_quantity: this.addonsFormDetails.limited_quantity ? true : false,
                // total: this.addonsFormDetails.total,
                sold: this.addonsFormDetails.sold ? this.addonsFormDetails.sold : '',
                cost: this.addonsFormDetails.cost ? this.addonsFormDetails.cost : '',
                price: this.addonsFormDetails.price ? this.addonsFormDetails.price : '',
                status: this.addonsFormDetails.status,
                addon_icon: this.addonsFormDetails.addon_icon,
            }
            if (this.addonsFormDetails.limited_quantity) {
                data['total'] = this.addonsFormDetails.total
            }
            else {
                data['total'] = ''
            }
            let url = `inventories/locker-addons?_id=${this.addonsFormDetails._id}`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getLockerAddonsList();
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
    
    //DELETE PARKING ADDONS
    deleteLockerAddons(addon) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete locker addons ${addon.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/locker-addons?_id=${addon._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getLockerAddonsList();
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

    getLockerAddonsList() {
        this.saveFilter();
        this.spinnerService.show();
        let url = `inventories/locker-addons?addOnPage=${this.addOnPage}&addOnPageSize=${this.addOnPageSize}`;
        if (this.addOnSortedtby)
            url = url + `&sortBy=${this.addOnSortedtby}&sortOrder=${this.addOnSortOrder}`;
        if (this.selectedProject) {
            url = url + `&project_id=${this.selectedProject}`;
        }
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.lockerAddons=[];
            if (response.status == 1) {
                this.lockerAddons = response.results ? response.results : [];
                if(this.page == this.addOnPaginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.addOnPaginationObj.totalPages>1 ? this.addOnPaginationObj.totalPages-1 : 1;
                    this.getLockerTypeList()  
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
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    setLockerAddonsOrder(value: string) {
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
        this.getLockerAddonsList();
    }

    selectAddonsImages(item) {
        this.addonsFormDetails.addon_icon = item.value;

    }

    doAddOnPaginationWise(page) {
        this.page = page;
        this.getLockerAddonsList();
    }
    addOnSetPageSize(event) {
        this.addOnPageSize = event.target.value;
        this.getLockerAddonsList();
    }

    ngOnDestroy() {
        if (this.eventsSubscription) {
            this.eventsSubscription.unsubscribe();
        }
    }
}
