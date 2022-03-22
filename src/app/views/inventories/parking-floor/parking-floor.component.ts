import { Component, OnInit, TemplateRef, Input, DoCheck, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { fabric } from "fabric";
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-parking-floor',
    templateUrl: './parking-floor.component.html',
    styleUrls: ['./parking-floor.component.css']
})
export class ParkingFloorComponent implements OnInit {
    @ViewChild("parkingSlotDesigner", { static: false })
    public parkingSlotDesigner: ElementRef;
    canvas: any;
    floorId: any;
    projectId: any;
    isEdit: boolean = false;
    APICallCompleted: boolean = false;
    modalRef: BsModalRef;
    floorDetailsObj: any = {};
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    paginationObj: any = {};
    projectList: any = [];
    parkingAddons: any = [];
    parkingSpaceList: any = [];
    filteredParkingAddons: any = [];
    filteredParkingMandatoryAddons: any = [];
    filterParkingSpaceMandatoryAddons: any = [];
    filterParkingSpaceAddons: any = [];
    public bulkParkingArray: any = [];
    formDetails: any = {};
    selectedProject: any;
    baseUrl = environment.BASE_URL;
    dropdownSettings = {};
    sortedtby: any = 'number';
    order: string = 'number';
    reverse: boolean = false;
    isClear: boolean = false;
    parkingTypes: any = [];
    dataInsertCounter: number = 0;
    dataUpdateCounter: number = 0;
    public bulkParkingData: any = [];
    public bulkParking: any = [];
    public populateObj: any = {
        prefix: "",
        suffix: "",
        start: 0,
        end: 0,
    };
    parkingObj: any;
    space_object: any = {};
    isAdded: boolean = false;
    selectedItem: any = [];
    openInfoModalRef;
    allowToAssign: boolean = false;
    queueId: any;

    constructor(
        public _activatedRoute: ActivatedRoute,
        private httpClient: HttpClient,
        protected sanitizer: DomSanitizer,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        private ngModalService: NgbModal
    ) { }
    ngOnInit(): void {
        this.checkLogin();
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.dropdownSettings = {
            singleSelection: false,
            idField: '_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 1,
            allowSearchFilter: true
        };


    }
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                }
                else {
                    this.floorId = this._activatedRoute.snapshot.paramMap.get("floorId");
                    this.projectId = this._activatedRoute.snapshot.paramMap.get("projectId");
                    this.getFloorDetails();
                    this.getParkingAddonsList();
                    this.getParkingTypeList();
                    this.bulkParking = Array.from(
                        this.bulkParkingArray ? this.bulkParkingArray : []
                    );
                   
            
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (this.projectList.length > 0) {
                    this.getParkingAddonsList();
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getParkingAddonsList() {
        this.spinnerService.show();
        let url = `inventories/parking-addons?project_id=${this.projectId}&page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.parkingAddons = [];
                response.results.forEach(element => {
                    let addon: any = {};
                    if (element) {
                        addon._id = element._id;
                        addon.name = element.name;
                        addon.price = element.price ? element.price : '';
                        addon.cost = element.cost ? element.price : '';
                        addon.addon_icon = element.addon_icon ? element.addon_icon : ''
                    }
                    this.parkingAddons.push(addon);
                });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getParkingTypeList() {
        this.spinnerService.show();
        let url = `inventories/parking-types?project_id=${this.projectId}&type=list&typePage=1&typePageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.parkingTypes = response.results;
            } else {
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    goToInventory() {
        this.router.navigate(['inventories']);
    }


    ///////////////////////////////////////////////
    //////// Parking Floor and Floor plan //////////
    //////////////////////////////////////////////
    getFloorDetails() {
        let url = `inventories/parking-floors?_id=${this.floorId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.floorDetailsObj = {};
                    this.floorDetailsObj = response.result;
                    this.getParkingSpaceList();
                    this.queueId = setInterval(() => {
                        this.getParkingSpaceList();
                   }, 180000);
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
    //OPEN EDIT PARKING MODAL
    openEditParkingFloorModal(template: TemplateRef<any>) {
        this.getProjectList();
        this.formDetails = { ...this.floorDetailsObj };
        if (this.formDetails.hasOwnProperty('layout')) {
            this.formDetails.layout = this.baseUrl + this.formDetails.layout.url + '/400';
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    async editParkingFloor() {
        // if (!this.formDetails.project_id) {
        //     this.toastr.warning('Please select project', 'Warning');
        //     return;
        // }
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter floor name', 'Warning');
            return;
        }
        // if (!this.formDetails.layout) {
        //     this.toastr.warning('Please upload floorplan', 'Warning');
        //     return;
        // }
        let data: any = {};
        data.name = this.formDetails.name;
        // var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
        // var parkingFloorObj = new FormData();
        // parkingFloorObj.append("project_id", this.formDetails.project_id);
        // parkingFloorObj.append("project_name", selectedProject[0].name);
        // parkingFloorObj.append("name", this.formDetails.name ? this.formDetails.name.trim() : '');
        let url = `inventories/parking-floors?_id=${this.formDetails._id}`;
        this.spinnerService.show();
        this.webService.fileUpload(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getFloorDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    deleteFloorplan() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete parking floor ${this.floorDetailsObj.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/parking-floors?_id=${this.floorDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.router.navigate(['inventories']);
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
    uploadFloorplan(files: FileList) {
        var floorPlan = files.item(0);
        if (floorPlan) {
            let validation = this.validateDocumentUpload(floorPlan.name);
            if (validation) {
                var formData = new FormData();
                formData.append("file", floorPlan);
                formData.append("project_id", this.floorDetailsObj.project_id);
                formData.append("project_name", this.floorDetailsObj.project_name);
                formData.append("name", this.floorDetailsObj.name ? this.floorDetailsObj.name.trim() : '');
                let url = `inventories/parking-floors?_id=${this.floorDetailsObj._id}`;
                this.spinnerService.show();
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getFloorDetails();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                }, (error) => {
                    console.log("error ts: ", error);
                })
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }
        }
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


    ///// Parking Units ///////
    getParkingSpaceList() {
        this.spinnerService.show();
        this.APICallCompleted = false;
        let url = `inventories/parking-spaces?project_id=${this.floorDetailsObj.project_id}&floor_id=${this.floorId}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                this.APICallCompleted = true;
                setTimeout(() => {
                    if (response.status == 1) {
                        this.canvas = new fabric.Canvas("parkingSlotDesigner", { renderOnAddRemove: true });
                        this.canvas.on({
                            'object:moving': ((event) => {
                                event.target.lockMovementX = true;
                                event.target.lockMovementY = true;
                            })
                        });

                        this.parkingSpaceList = response.results;
                        // this.canvas.clear();
                        var startCount = 0;
                        var endCount = 1;
                        var notesArray = [];
                        this.parkingSpaceList.forEach((element, index) => {
                            if (element) {
                                let textVal = {
                                    parking: element.number || '',
                                    type: element.type || '',
                                    Price: element.price || '',
                                    status: element.status || '',
                                    unit_no: element.unit_no || ''
                                };

                                notesArray.push(textVal);
                                if (element.space_object) {
                                    element.space_object.objects[0].lotId = element._id;
                                    element.space_object.objects[0].src = 'assets/img/parking-icons/' + this.getImageUrl(element);

                                    if (element.status == "SOLD") {
                                        // if (element.type.toLowerCase() == "single car") {
                                        //     element.space_object.objects[0].src = environment.BASE_URL + "/app/assets/img/single-sold.png";
                                        // }
                                        // if (element.type.toLowerCase() == "tandem car") {
                                        //     element.space_object.objects[0].src = environment.BASE_URL + "/app/assets/img/tandem-sold.png";
                                        // }
                                    }
                                    if (element.status == "AVAILABLE") {
                                        // if (element.type.toLowerCase() == "single car") {
                                        //     element.space_object.objects[0].src = environment.BASE_URL + "/assets/img/single-available.png";
                                        // }
                                        // if (element.type.toLowerCase() == "tandem car") {
                                        //     element.space_object.objects[0].src = environment.BASE_URL + "/assets/img/tandem-available.png";
                                        // }
                                    }
                                    fabric.util.enlivenObjects(
                                        [element.space_object.objects[0]],
                                        (objects) => {
                                            // console.log('element', element, notesArray);
                                            var origRenderOnAddRemove = this.canvas.renderOnAddRemove;
                                            this.canvas.renderOnAddRemove = false;
                                            var complete = false;
                                            objects.forEach((obj, indx) => {
                                                this.canvas.add(obj);
                                            });
                                            if (this.canvas.getObjects()[startCount]) {

                                                // this.canvas.setActiveObject(element.space_object);
                                                let group1 = this.canvas.getObjects()[startCount];
                                                group1.set({
                                                    selectable: false,
                                                    hasControls: false,
                                                    objectCaching: false,
                                                })

                                                let top = 0;
                                                let left = 0;

                                                let mdiv = (element.addons && element.addons.length > 0) ? element.addons.length % 2 :0 % 2;;
                                                let initialPoints = -(5 * mdiv);
                                                let group = new fabric.Group([group1], {
                                                    index: index,
                                                    left: element.space_object.left,
                                                    top: element.space_object.top,
                                                    angle: element.space_object.angle,
                                                    originX: "center",
                                                    originY: "center",
                                                    scaleX: 1,
                                                    scaleY: 1,
                                                    objectCaching: false,
                                                    selectable: true,
                                                    hasBorders: false,
                                                    hasControls: false,
                                                });
                                                //FOR ADDONS
                                                if (element.addons && element.addons.length > 0) {
                                                    // let group = new fabric.Group([group1], {
                                                    //     index: index,
                                                    //     left: element.space_object.left,
                                                    //     top: element.space_object.top,
                                                    //     angle: element.space_object.angle,
                                                    //     originX: "center",
                                                    //     originY: "center",
                                                    //     scaleX: 1,
                                                    //     scaleY: 1,
                                                    //     objectCaching: false,
                                                    //     selectable: true,
                                                    //     hasBorders: false,
                                                    //     hasControls: false,
                                                    // });
                                                    element.addons.forEach((addon, index) => {
                                                        let imageUrl = this.getImageNameByAddon(addon) ? 'assets/img/addons-icon/' + this.getImageNameByAddon(addon) : '';
                                                        fabric.Image.fromURL(imageUrl, (img) => {
                                                            // console.log('dotImg', group1);
                                                            if (group1.angle >= -45 && group1.angle <= 45) {//group1.angle == 0=>middle vertical
                                                                left = group1.translateX + initialPoints;
                                                                top = group1.translateY + (group1.height / 4) + 5
                                                            }
                                                            else if (group1.angle >= 46 && group1.angle <= 135) { //group1.angle == 89.46=>left
                                                                left = group1.translateX + (group1.width / 2) + 5;
                                                                top = group1.translateY + initialPoints
                                                            }
                                                            else if ((group1.angle >= 136 && group1.angle <= 180) || (group1.angle >= -180 && group1.angle <= -135)) { //group1.angle == 179.48 => bottom
                                                                left = group1.translateX + initialPoints;
                                                                top = group1.translateY - (group1.height / 4) - 5
                                                            }
                                                            else if (group1.angle >= -136 && group1.angle <= -44) {//group1.angle == -91.16 =>right
                                                                left = group1.translateX - (group1.width / 2) - 5;
                                                                top = group1.translateY + initialPoints
                                                            }
                                                            // console.log('<=>', left, top, initialPoints);

                                                            var dotImg = img.set({
                                                                id: 1,
                                                                left: left,
                                                                top: top,
                                                                originX: "center",
                                                                originY: "center",
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                selectable: false,
                                                                objectCaching: false,
                                                                hasControls: false,
                                                            });
                                                            group.add(dotImg.setCoords());
                                                            this.canvas.add(group.setCoords());
                                                            this.canvas.renderAll();
                                                            // console.log('group1', group);
                                                            initialPoints = initialPoints + 10;
                                                        });

                                                    })
                                                    group.on('selected', (e) => {
                                                        let text = notesArray[index];
                                                        this.openDialogBox(text);
                                                    });
                                                    this.canvas.renderAll();
                                                }

                                                //FOR MANDATORY -ADDONS
                                                if (element.mandatory_addons && element.mandatory_addons.length > 0) {
                                                    // let group = new fabric.Group([group1], {
                                                    //     index: index,
                                                    //     left: element.space_object.left,
                                                    //     top: element.space_object.top,
                                                    //     angle: element.space_object.angle,
                                                    //     originX: "center",
                                                    //     originY: "center",
                                                    //     scaleX: 1,
                                                    //     scaleY: 1,
                                                    //     objectCaching: false,
                                                    //     selectable: true,
                                                    //     hasBorders: false,
                                                    //     hasControls: false,
                                                    // });
                                                    element.mandatory_addons.forEach((addon, index) => {
                                                        // console.log('<=', left, top, initialPoints);
                                                        let imageUrl = this.getImageNameByAddon(addon) ? 'assets/img/addons-icon/' + this.getImageNameByAddon(addon) : '';
                                                        fabric.Image.fromURL(imageUrl, (img) => {
                                                            // console.log('dotImg', group1);
                                                            if (group1.angle >= -45 && group1.angle <= 45) {//group1.angle == 0=>middle vertical
                                                                left = group1.translateX + initialPoints;
                                                                top = group1.translateY + (group1.height / 4) + 5
                                                            }
                                                            else if (group1.angle >= 46 && group1.angle <= 135) { //group1.angle == 89.46=>left
                                                                left = group1.translateX + (group1.width / 2) + 5;
                                                                top = group1.translateY + initialPoints
                                                            }
                                                            else if ((group1.angle >= 136 && group1.angle <= 180) || (group1.angle >= -180 && group1.angle <= -135)) { //group1.angle == 179.48 => bottom
                                                                left = group1.translateX + initialPoints;
                                                                top = group1.translateY - (group1.height / 4) - 5
                                                            }
                                                            else if (group1.angle >= -136 && group1.angle <= -44) {//group1.angle == -91.16 =>right
                                                                left = group1.translateX - (group1.width / 2) - 5;
                                                                top = group1.translateY + initialPoints
                                                            }
                                                            // console.log('<=>', left, top, initialPoints);

                                                            var dotImg = img.set({
                                                                id: 1,
                                                                left: left,
                                                                top: top,
                                                                originX: "center",
                                                                originY: "center",
                                                                scaleX: 1,
                                                                scaleY: 1,
                                                                selectable: false,
                                                                objectCaching: false,
                                                                hasControls: false,
                                                            });
                                                            group.add(dotImg.setCoords());
                                                            this.canvas.add(group.setCoords());
                                                            this.canvas.renderAll();
                                                            // console.log('group1', group);
                                                            initialPoints = initialPoints + 10;
                                                        });

                                                    })
                                                    group.on('selected', (e) => {
                                                        let text = notesArray[index];
                                                        this.openDialogBox(text);
                                                    });
                                                    this.canvas.renderAll();
                                                }

                                                //FOR NON- ADDON AND MANDATORY-ADDONS
                                                if ((!element.addons || element.addons.length == 0) && (!element.mandatory_addons || element.mandatory_addons.length == 0)) {
                                                    let imageUrl = 'assets/img/addons-icon/red-dot.png'
                                                    fabric.Image.fromURL(imageUrl, (img) => {
                                                        let group = new fabric.Group([group1], {
                                                            index: index,
                                                            left: element.space_object.left,
                                                            top: element.space_object.top,
                                                            angle: element.space_object.angle,
                                                            originX: "center",
                                                            originY: "center",
                                                            scaleX: 1,
                                                            scaleY: 1,
                                                            objectCaching: false,
                                                            selectable: true,
                                                            hasBorders: false,
                                                            hasControls: false,
                                                        });
                                                        group.on('selected', (e) => {
                                                            let text = notesArray[index];
                                                            this.openDialogBox(text);
                                                        });
                                                        this.canvas.add(group.setCoords());
                                                        this.canvas.renderAll();
                                                    })
                                                }

                                            }
                                            startCount = startCount + 1;
                                            this.canvas.renderAll();
                                            this.canvas.forEachObject((fig) => {
                                                fig.selectable = true;
                                                fig.objectCaching = false;
                                                fig.hasControls = false;
                                            });
                                        });

                                }
                            }
                        });
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
                }, 1000)

            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openDialogBox(value) {
        if (value) {
            this.openInfoModalRef = this.ngModalService.open(SpaceInfoComponent,
                {
                    size: 'md', backdrop: 'static'
                })
            this.openInfoModalRef.componentInstance.data = {
                info: value
            }
            this.openInfoModalRef.result.then(async (result) => {
                if (result) {
                    // console.log('result==>', result);
                }
            }, (reason) => {
                console.log('reason', reason);
            })
        }
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
        this.getParkingSpaceList();
    }

    getImageNameByAddon(addon) {
        let selectedAddon = this.parkingAddons.find((element) => element._id == addon._id);
        if (selectedAddon && selectedAddon.addon_icon) {
            return selectedAddon.addon_icon;
        }
        else {
            return undefined;
        }
    }

    getImageUrl(item) {
        let imageUrl: string = '';
        if (item.type) {
            this.parkingTypes.forEach(element => {
                if (element.name == item.type) {
                    if (item.is_premium) {
                        if (element.premium_available) {
                            imageUrl = element.premium_available
                        }
                        else {
                            // this.toastr.error('Please select parking type', 'Error');
                        }
                    }
                    else {
                        if (element.standard_available) {
                            imageUrl = element.standard_available;
                        }
                        else {
                            // this.toastr.error('Please select parking type', 'Error');
                        }
                    }
                }

            });
        }

        return imageUrl;
    }

    refreshSpaceData(){
        this.getParkingSpaceList();
    }
   
    openBulkAddModal(template: TemplateRef<any>) {
        this.bulkParkingData = [];
        this.populateObj = {};
        this.isEdit = false;
        // this.getParkingTypeList();
        this.formDetails = {
            projectId: this.floorDetailsObj.project_id,
            floorId: this.floorId,
            // parkingSpaces: parseInt(this.parkingFloorObj.spaces),
            floorName: this.floorDetailsObj.name,
            addedParkinNumber: this.bulkParkingArray
                ? this.bulkParkingArray.length
                : 0,
            bulkParking: [],
        };
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl ', backdrop: 'static' });
    }

    async updateBulkParking() {
        try {
            let inValidType = this.bulkParkingData.find((element) => (!element.type || element.type == ''));
            if (inValidType) {
                this.toastr.warning(`Select type for ${inValidType.number} parking`);
                return;
            }

            let selectedRecord = this.bulkParkingData.find((element) => ((element.cost < 0 || (!element.cost && element.cost != 0)) || (element.price < 0 || ((!element.price && element.price != 0)))));
            if (selectedRecord) {
                if (selectedRecord.cost < 0) {
                    this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                else if (selectedRecord.cost != 0 && !selectedRecord.cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                if (selectedRecord.price < 0) {
                    this.toastr.warning(`Please enter price greater than and equal to 0 for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                else if (selectedRecord.price != 0 && !selectedRecord.price) {
                    this.toastr.warning(`Please enter price for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
            }

            let inValidEntry = this.bulkParkingData.find((element) => element.cost > element.price);
            if (inValidEntry) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${inValidEntry.number} space, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }
            this.dataUpdateCounter = 0;
            this.spinnerService.show();
            this.bulkParkingData.forEach((element, index) => {
                element.project_id = this.projectId;
                element.floor_id = this.floorId;
                element.floor_name = this.floorDetailsObj.name;
                element.project_name = this.floorDetailsObj.project_name;
                element.is_premium = element.is_premium ? element.is_premium : false;
                if (element.addons && element.addons.length > 0) {
                    element.addons = this.appendKeys(false, element.addons); //to append another property in object 
                } else {
                    element.addons = [];
                }
                if (element.mandatory_addons && element.mandatory_addons.length > 0) {
                    element.mandatory_addons = this.appendKeys(true, element.mandatory_addons);//to append another property in object 
                } else {
                    element.mandatory_addons = [];
                }
                this.dataUpdateCounter++;
                this.updateParkingData(element, this.dataUpdateCounter);
                if (index == this.bulkParkingData.length - 1) {
                    setTimeout(() => {
                        this.spinnerService.hide();
                        this.modalRef.hide();
                    }, 500);
                }
            });
        }
        catch {
            console.log('User dismissed the dialog ')
        }
    }

    updateParkingData(obj, dataUpdateCounter) {
        let url = `inventories/parking-spaces?_id=${obj._id}`;
        this.webService.post(url, obj).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success("Parking data updated");
                    if (this.bulkParkingData.length == dataUpdateCounter) {
                        this.getParkingSpaceList();
                    }
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
    
    openBulkEditModal(template: TemplateRef<any>) {
        this.bulkParkingData = [];
        this.parkingSpaceList.forEach(element => {
            if (element.status == 'SOLD') {
                element.space_status = 'SOLD';
            }
            this.bulkParkingData.push({ ...element });
        });
        this.bulkParkingData.sort((a, b) => parseFloat(a.number) - parseFloat(b.number));

        this.isEdit = true;
        // this.getParkingTypeList();
        this.formDetails = {
            projectId: this.floorDetailsObj.project_id,
            floorId: this.floorId,
            // parkingSpaces: parseInt(this.parkingFloorObj.spaces),
            floorName: this.floorDetailsObj.name,
            addedParkinNumber: this.bulkParkingArray
                ? this.bulkParkingArray.length
                : 0,
            bulkParking: [],
        };

        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl', backdrop: 'static' });
    }

    async addBulkParking() {
        try {
            if (this.bulkParkingData.length == 0) {
                this.toastr.success("No parkings added");
                return false;
            }
            let inValidType = this.bulkParkingData.find((element) => (!element.type || element.type == ''));
            if (inValidType) {
                this.toastr.warning(`Select type for ${inValidType.number} parking`);
                return;
            }

            let selectedRecord = this.bulkParkingData.find((element) => ((element.cost < 0 || (!element.cost && element.cost != 0)) || (element.price < 0 || ((!element.price && element.price != 0)))));
            if (selectedRecord) {
                if (selectedRecord.cost < 0) {
                    this.toastr.warning(`Please enter cost greater than and equal to 0 for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                else if (selectedRecord.cost != 0 && !selectedRecord.cost) {
                    this.toastr.warning(`Please enter cost for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                else if (selectedRecord.price < 0) {
                    this.toastr.warning(`Please enter price greater than and equal to 0 for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
                else if (selectedRecord.price != 0 && !selectedRecord.price) {
                    this.toastr.warning(`Please enter price for ${selectedRecord.number} parking`, 'Warning');
                    return;
                }
            }
            let inValidEntry = this.bulkParkingData.find((element) => element.cost > element.price);
            if (inValidEntry) {
                let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price for ${inValidEntry.number} space, Do you want to continue ?`)
                if (!confirmed) {
                    return;
                }
            }
            this.bulkParkingData.forEach(async (element, index) => {
                element.project_id = this.projectId;
                element.floor_id = this.floorId;
                element.floor_name = this.floorDetailsObj.name;
                element.project_name = this.floorDetailsObj.project_name;
                element.is_premium = element.is_premium ? element.is_premium : false;

                this.insertParkingData(element);
                if (index == this.bulkParkingData.length - 1) {
                    setTimeout(() => {
                        this.modalRef.hide();
                    }, 500);
                }
            })
        }
        catch {
            console.log('User dismissed the dialog ')
        }
    }

    insertParkingData(obj) {
        let url = "inventories/parking-spaces";
        this.spinnerService.show();
        this.webService.post(url, obj).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success("Parking data added");
                    this.dataInsertCounter++;
                    if (this.bulkParkingData.length == this.dataInsertCounter) {
                        this.getParkingSpaceList();
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



    /// action 1///
    openAssignModal(template: TemplateRef<any>, obj) {
        this.formDetails = { ...obj }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    assignParkingSpace() {
        if (!this.formDetails.unit) {
            this.toastr.warning(`Please enter unit`);
            return;
        }
        if (!this.allowToAssign) {
            this.toastr.warning(`This unit cannot be assigned`);
            return;
        }
        if (!this.formDetails.deal_id) {
            this.toastr.warning(`This unit cannot be assigned deal is not available`);
            return;
        }
        if (!this.formDetails.unit_id) {
            this.toastr.warning(`This unit cannot be assigned unit is not available`);
            return;
        }
        let data: any = {};
        data.space_id = this.formDetails._id;
        data.deal_id = this.formDetails.deal_id;
        data.unit_id = this.formDetails.unit_id;
        data.unit_no = this.formDetails.unit_no;
        data.project_id = this.formDetails.project_id;
        data.project_name = this.formDetails.project_name;
        data.cost = this.formDetails.cost;
        data.price = this.formDetails.price;
        data.floor_id = this.formDetails.floor_id;
        data.floor_name = this.formDetails.floor_name;
        data.number = this.formDetails.number;
        data.type = this.formDetails.type;
        data.addons = this.formDetails.addons;
        data.is_premium = this.formDetails.is_premium;
        // console.log('assignParkingSpace', data);
        let url = `inventories/parking-selection`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getParkingSpaceList();
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

    checkUnitExistance(value) {
        if (value && value > 0) {
            let url = `inventories/units?project_id=${this.formDetails.project_id}&unit_no=${value}`;
            this.spinnerService.show();
            this.webService.get(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    if (response.results && response.results.length == 0) {
                        this.toastr.warning(`This unit is not found`);
                        this.allowToAssign = false;
                        return;
                    }
                    else {
                        let record = response.results.find((element) => element.unit_no == value);
                        if (record != null && record.deal_id) {
                            this.formDetails.deal_id = record.deal_id;
                            this.formDetails.unit_no = record.unit_no;
                            this.formDetails.unit_id = record._id;
                            let url = `inventories/deals?_id=${record.deal_id}`
                            this.webService.get(url).subscribe((response: any) => {
                                let allocate_parking = (response.result && response.result.allocate_parking && response.result.allocate_parking.length > 0) ? response.result.allocate_parking : [];
                                if (allocate_parking.length > 0) {
                                    let element = allocate_parking.find((element) => element.type == this.formDetails.type);
                                    if (element && element.type) {
                                        let assigned_parking = (response.result && response.result.assigned_parking && response.result.assigned_parking.length > 0) ? response.result.assigned_parking : [];
                                        let assignedTypes = assigned_parking.filter(element => element.type == this.formDetails.type);
                                        if(element.eligible_no){
                                            if (assignedTypes.length < element.eligible_no) {
                                                this.formDetails.assigned_parking = [];
                                                //allow to assign

                                                this.allowToAssign = true;
                                            }
                                            else {
                                                this.allowToAssign = false;
                                                this.toastr.warning(`Cannont assign unit as maximum limit is full`);
                                            }
                                        }
                                        else{
                                            this.allowToAssign = false;
                                            this.toastr.warning(`Please add eligible number for selected type`);
                                        }
                                    }
                                    else {
                                        this.allowToAssign = false;
                                        this.toastr.warning(`Select type does not exist in deal`);
                                    }
                                }
                                else {
                                    this.allowToAssign = false;
                                    this.toastr.warning(`No allocate parking is available`);

                                }
                            }, (error) => {
                                this.allowToAssign = false;
                                console.log('error', error);
                            });

                        }
                        else {
                            this.allowToAssign = false;
                            this.toastr.warning(`Deal is not found for this unit`);
                        }
                    }
                }
                else {

                }
            }, (error) => {
                console.log('error', error);
            })
        }
    }

    /// action 2///
    releaseParkingSpace(obj) {
        this.confirmationDialogService.confirm('Delete', `Do you want to release ${obj.number} parking space for unit ${obj.unit_no} ?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/parking-selection?space_id=${obj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getParkingSpaceList();
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

    /// action 3///
    openEditParkingModal(template: TemplateRef<any>, obj) {
        this.isEdit = false;
        this.getProjectList();
        // this.getParkingTypeList();
        this.formDetails = { ...obj }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    async editParkingSpaces(obj) {
        try {
            if (this.formDetails.price == null) {
                this.toastr.warning('Please enter parking price', 'Warning');
                return;
            }
            if (this.formDetails.cost == null) {
                this.toastr.warning('Please enter parking cost', 'Warning');
                return;
            }
            if (!this.formDetails.type) {
                this.toastr.warning('Please select parking type', 'Warning');
                return;
            }
            if (!this.formDetails.status) {
                this.toastr.warning('Please select parking status', 'Warning');
                return;
            }

            if ((this.formDetails.cost < 0 || (!this.formDetails.cost && this.formDetails.cost != 0)) || (this.formDetails.price < 0 || ((!this.formDetails.price && this.formDetails.price != 0)))) {
                if (this.formDetails.cost < 0) {
                    this.toastr.warning(`Please enter cost greater than and equal to 0 for ${this.formDetails.number} parking`, 'Warning');
                    return;
                }
                else if (this.formDetails.cost != 0 && !this.formDetails.cost) {
                    this.toastr.warning(`Please enter cost for ${this.formDetails.number} parking`, 'Warning');
                    return;
                }
                else if (this.formDetails.price < 0) {
                    this.toastr.warning(`Please enter price greater than and equal to 0 for ${this.formDetails.number} parking`, 'Warning');
                    return;
                }
                else if (this.formDetails.price != 0 && !this.formDetails.price) {
                    this.toastr.warning(`Please enter price for ${this.formDetails.number} parking`, 'Warning');
                    return;
                }
            }
            if (this.formDetails.cost >= 0 && this.formDetails.price >= 0) {
                if (this.formDetails.cost > this.formDetails.price) {
                    let confirmed = await this.confirmationDialogService.confirm('Confirmation', `Cost is greater than price, Do you want to continue ?`)
                    if (!confirmed) {
                        return;

                    }
                }

            }
            var selectedProject = this.projectList.filter(o => o._id == this.formDetails.project_id);
            // this.formDetails.addons.forEach(element => {
            //     this.parkingAddons.forEach(item => {
            //         if (element.item_id == item._id) {
            //             selectedAddons.push({
            //                 id: item._id,
            //                 name: item.name,
            //                 price: item.price,
            //                 cost: item.cost,
            //             });
            //         }
            //     });
            // });
            var data = {
                price: this.formDetails.price,
                cost: this.formDetails.cost,
                addons: this.appendKeys(false, this.formDetails.addons),//to append another property in object 
                mandatory_addons: this.appendKeys(true, this.formDetails.mandatory_addons),// to append another property in object
                type: this.formDetails.type,
                status: this.formDetails.status,
                is_premium: this.formDetails.is_premium
            }

            // console.log('data==>', data);
            let url = `inventories/parking-spaces?_id=${obj._id}`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getParkingSpaceList();
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
        catch {
            console.log('User dismissed the dialog ')
        }
    }

    format(mandatory_addons) {
        let maddons = [];
        mandatory_addons.forEach(element => {
            let obj: any = {};
            obj.name = element.name;
            obj.value = {
                ...element
            }
            maddons.push(obj);
        });
        return maddons;
    }

    openInfoModal(template, element) {
        this.modalRef = this.modalService.show(template, { class: 'custom-size modal-xl ', backdrop: 'static' });

    }

    //to append another property in addons object
    appendKeys(isMandatory, addons) {
        if (addons && addons.length > 0) {
            addons.forEach((addon) => {
                this.parkingAddons.forEach((element) => {
                    if (addon._id == element._id) {
                        addon.cost = element.cost,
                            addon.price = element.price,
                            addon.mandatory = isMandatory
                    }
                });
            });
            return addons;
        } else {
            return []
        }

    }  

    /// action 4 ///
    openParkingDesignerModal(template: TemplateRef<any>, obj) {
        this.parkingObj = { ...obj };
        // const imageUrl = this.getImageUrl(this.parkingObj);
        const imageUrl = 'assets/img/parking-icons/' + this.getImageUrl(this.parkingObj);
        this.modalRef = this.modalService.show(template, { class: 'modal-xl', backdrop: 'static' });
        this.canvas = new fabric.Canvas("space-designer");
        this.canvas.transparentCorners = false;
        // console.log('parkingObj', this.parkingObj);
        if (!this.parkingObj.hasOwnProperty("space_object")) {
            if (this.parkingObj.hasOwnProperty("type")) {
                // if (this.parkingObj.type.toLowerCase() == "single car") {
                fabric.Image.fromURL(imageUrl, (img) => {
                    var carImg = img.set({
                        id: this.parkingObj.number,
                        // width: 28,
                        // height: 67,
                        // width: 100,
                        // height: 150,
                        left: 486,
                        top: 200,
                    });
                    this.space_object = new fabric.Group([carImg], {
                        originX: "center",
                        originY: "center",
                    });
                    this.canvas.add(this.space_object);
                    this.canvas.setActiveObject(this.space_object);
                    this.isAdded = true;
                });
                // }
                // if (this.parkingObj.type.toLowerCase() == "tandem car") {
                //     fabric.Image.fromURL("/assets/img/tandem-available.png", (img) => {
                //         var carImg = img.set({
                //             id: this.parkingObj.locker,
                //             width: 28,
                //             height: 135,
                //             left: 486,
                //             top: 200,
                //         });
                //         this.space_object = new fabric.Group([carImg], {
                //             originX: "center",
                //             originY: "center",
                //         });
                //         this.canvas.add(this.space_object);
                //         this.canvas.setActiveObject(this.space_object);
                //         this.isAdded = true;
                //     });
                // }
            }
        } else {
            if (Object.keys(this.parkingObj.space_object).length != 0) {
                this.parkingObj.space_object.objects[0].src = imageUrl;
                if (this.parkingObj.status == "SOLD") {
                    // if (
                    //     this.parkingObj.parkingTypes.toLowerCase() ==
                    //     "single car parking"
                    // ) {
                    //     this.parkingObj.space_object.objects[0].src =
                    //         environment.BASE_URL +
                    //         "/apps/parking/assets/img/single-sold.png";
                    // }
                    // if (
                    //     this.parkingObj.parkingTypes.toLowerCase() ==
                    //     "tandem car parking"
                    // ) {
                    //     this.parkingObj.space_object.objects[0].src =
                    //         environment.BASE_URL +
                    //         "/apps/parking/assets/img/tandem-sold.png";
                    // }
                }
                if (this.parkingObj.status == "AVAILABLE") {
                    // if (
                    //     this.parkingObj.type.toLowerCase() ==
                    //     "single car"
                    // ) {
                    //     this.parkingObj.space_object.objects[0].src =
                    //         environment.BASE_URL +
                    //         "/assets/img/single-available.png";
                    // }
                    // if (
                    //     this.parkingObj.type.toLowerCase() ==
                    //     "tandem car"
                    // ) {
                    //     this.parkingObj.space_object.objects[0].src =
                    //         environment.BASE_URL +
                    //         "/assets/img/tandem-available.png";
                    // }
                }
                fabric.util.enlivenObjects(
                    [this.parkingObj.space_object.objects[0]],
                    (objects) => {
                        var origRenderOnAddRemove = this.canvas.renderOnAddRemove;
                        this.canvas.renderOnAddRemove = false;
                        objects.forEach((o, index) => {
                            this.canvas.add(o);
                        });
                        this.canvas.renderOnAddRemove = origRenderOnAddRemove;
                        if (this.parkingObj.space_object.angle == 0) {
                            // let calcLeft = this.parkingObj.space_object.left;
                            // let calcRight = this.parkingObj.space_object.top;
                            // // console.log('this.canvas.getObjects() 2', this.canvas.getObjects()),
                            // this.space_object = new fabric.Group(

                            //     this.canvas.getObjects(),
                            //     {
                            //         left: calcLeft,
                            //         top: calcRight,
                            //         angle: 0,
                            //         originX: "center",
                            //         originY: "center",
                            //     }
                            // );
                            var objs = this.canvas._objects.filter(function (obj) {
                                return obj;
                            });
                            this.space_object = new fabric.Group([objs[0]], {
                                left: this.parkingObj.space_object.left,
                                top: this.parkingObj.space_object.top,
                                angle: 0,
                                originX: "center",
                                originY: "center",
                            });
                        } else {
                            // let angleCalcLeft = this.parkingObj.space_object.left;
                            // let angleCalcRight = this.parkingObj.space_object.top;
                            // this.space_object = new fabric.Group(
                            //     this.canvas.getObjects(),
                            //     {
                            //         left: angleCalcLeft,
                            //         top: angleCalcRight,
                            //         angle: this.parkingObj.space_object.angle,
                            //         originX: "center",
                            //         originY: "center",
                            //     }
                            // );
                            var objs = this.canvas._objects.filter(function (obj) {
                                return obj;
                            });
                            this.space_object = new fabric.Group([objs[0]], {
                                left: this.parkingObj.space_object.left,
                                top: this.parkingObj.space_object.top,
                                angle: this.parkingObj.space_object.angle,
                                originX: "center",
                                originY: "center",
                            });
                        }
                        this.canvas.add(this.space_object);
                        this.canvas.setActiveObject(this.space_object);
                        this.space_object.setCoords();
                        this.canvas.renderAll();
                    }
                );
                // setTimeout(() => {
                //     var objs = this.canvas.getObjects().map(function (o) {
                //         return o.set("active", true);
                //     });
                //     var group = new fabric.Group(objs, {
                //         originX: "center",
                //         originY: "center",
                //     });
                //     this.canvas._activeObject = null;
                //     group.top = this.lockerObj.space_object.top;
                //     group.left = this.lockerObj.space_object.left;
                //     group.angle = this.lockerObj.space_object.angle;
                //     this.canvas.setActiveObject(group.setCoords()).renderAll();
                // }, 500);
            }
        }
    }
    
    populateParkingRow() {
        if (this.populateObj.start == null) {
            this.toastr.warning('Enter start number', 'Warning');
            return;
        }
        if (this.populateObj.end == null) {
            this.toastr.warning("Enter End number");
            return false;
        }
        if (this.populateObj.start > this.populateObj.end) {
            this.toastr.warning("Start Number can't be greater than end number");
            return false;
        }
        if (this.populateObj.start && this.populateObj.end) {
            this.bulkParkingData = [];
            var difference = this.populateObj.end - this.populateObj.start;
            for (var i = this.populateObj.start; i <= this.populateObj.end; i++) {
                var numberPad = this.pad(i, 2);
                this.bulkParkingData.push({
                    number:
                        (this.populateObj.prefix ? this.populateObj.prefix : "") +
                        numberPad +
                        (this.populateObj.suffix ? this.populateObj.suffix : ""),
                    type: (this.parkingTypes && this.parkingTypes.length) > 0 ? this.parkingTypes[0].name : '',
                    addons: [],
                    price: 0,
                    cost: 0,
                    // mandatory_addons: [],
                    status: 'AVAILABLE',
                });
            }
        }
    }
    pad(str, max) {
        str = str.toString();
        return str.length < max ? this.pad("0" + str, max) : str;
    }
    filterMandatoryAddons(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.parkingAddons.length; i++) {
            let parkingAddons = this.parkingAddons[i];
            if (parkingAddons.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push({ id: parkingAddons._id, name: parkingAddons.name });
            }
        }
        this.filteredParkingMandatoryAddons = filtered;
    }
    filterSpaceMandatoryAddons(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.parkingAddons.length; i++) {
            let parkingAddons = this.parkingAddons[i];
            if (parkingAddons.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push({ id: parkingAddons._id, name: parkingAddons.name });
            }
        }
        this.filterParkingSpaceMandatoryAddons = filtered;
    }
    filterAddons(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.parkingAddons.length; i++) {
            let parkingAddons = this.parkingAddons[i];
            if (parkingAddons.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push({ id: parkingAddons._id, name: parkingAddons.name });
            }
        }
        this.filteredParkingAddons = filtered;
    }
    filterSpaceAddons(event) {
        //in a real application, make a request to a remote url with the query and return filtered results, for demo we filter at client side
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < this.parkingAddons.length; i++) {
            let parkingAddons = this.parkingAddons[i];
            if (parkingAddons.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push({ id: parkingAddons._id, name: parkingAddons.name });
            }
        }
        this.filterParkingSpaceAddons = filtered;
    }

    deleteParking(item, i) {
        this.bulkParkingData.splice(i, 1);
    }


    rotateCounterClock() {
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            this.toastr.warning('Please select the parking image', 'Warning');
            return;
        }
        else if (!activeObject._objects) {
            var objs = this.canvas.getObjects().map(function (o) {
                return o.set("active", true);
            });
            var group = new fabric.Group(objs, {
                originX: "center",
                originY: "center",
            });
            this.canvas._activeObject = null;
            group.top = this.parkingObj.space_object.top;
            group.left = this.parkingObj.space_object.left;
            group.angle = this.parkingObj.space_object.angle;
            this.canvas.setActiveObject(group.setCoords()).renderAll();
            activeObject = this.canvas.getActiveObject();

        }
        if (this.space_object && !this.isAdded) {
            var items = activeObject._objects;
            activeObject._restoreObjectsState();
            this.canvas.remove(activeObject);
            var objs = this.canvas._objects.filter(function (obj) {
                return obj;
            });
            this.space_object = new fabric.Group([objs[0]], {
                originX: "center",
                originY: "center",
            });
            this.canvas.add(this.space_object);
            this.canvas.setActiveObject(this.space_object);
        }
        this.space_object.angle -= 22.5;
        this.space_object.setCoords();
        this.onRotating();
        this.canvas.renderAll();
    }
    rotateClock() {
        var activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            this.toastr.warning('Please select the parking image', 'Warning');
            return;
        }
        else if (!activeObject._objects) {
            var objs = this.canvas.getObjects().map(function (o) {
                return o.set("active", true);
            });
            var group = new fabric.Group(objs, {
                originX: "center",
                originY: "center",
            });
            this.canvas._activeObject = null;
            group.top = this.parkingObj.space_object.top;
            group.left = this.parkingObj.space_object.left;
            group.angle = this.parkingObj.space_object.angle;
            this.canvas.setActiveObject(group.setCoords()).renderAll();
            activeObject = this.canvas.getActiveObject();

        }
        if (this.space_object && !this.isAdded) {
            var items = activeObject._objects;
            activeObject._restoreObjectsState();
            this.canvas.remove(activeObject);
            var objs = this.canvas._objects.filter(function (obj) {
                return obj;
            });
            this.space_object = new fabric.Group([objs[0]], {
                originX: "center",
                originY: "center",
            });
            this.canvas.add(this.space_object);
            this.canvas.setActiveObject(this.space_object);
        }

        this.space_object.angle += 22.5;
        this.space_object.setCoords();
        this.onRotating();
        this.canvas.renderAll();
    }
    increaseSize() {
        let activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            this.toastr.warning('Please select the parking image', 'Warning');
            return;
        }
        else if (!activeObject._objects) {
            var objs = this.canvas.getObjects().map(function (o) {
                return o.set("active", true);
            });
            var group = new fabric.Group(objs, {
                originX: "center",
                originY: "center",
            });
            this.canvas._activeObject = null;
            group.top = this.parkingObj.space_object.top;
            group.left = this.parkingObj.space_object.left;
            group.angle = this.parkingObj.space_object.angle;
            this.canvas.setActiveObject(group.setCoords()).renderAll();
            activeObject = this.canvas.getActiveObject();

        }
        var items = activeObject._objects;
        activeObject._restoreObjectsState();
        this.canvas.remove(activeObject);
        for (var i = 0; i < items.length; i++) {
            items[i].scaleY += 0.25;
            items[i].scaleX += 0.25;
            if (items[i].type == "image") {
                items[i].left += 5;
            }
            this.canvas.add(items[i]);
            this.canvas.item(this.canvas.size() - 1).hasControls = true;
        }
        var objs = this.canvas._objects.filter(function (obj) {
            return obj;
        });
        this.space_object = new fabric.Group([objs[0]], {
            originX: "center",
            originY: "center",
        });
        this.canvas.add(this.space_object);
        this.canvas.setActiveObject(this.space_object);
        this.canvas.renderAll();
    }

    decreaseSize() {
        let activeObject = this.canvas.getActiveObject();
        if (!activeObject) {
            this.toastr.warning('Please select the parking image', 'Warning');
            return;
        }
        else if (!activeObject._objects) {
            var objs = this.canvas.getObjects().map(function (o) {
                return o.set("active", true);
            });
            var group = new fabric.Group(objs, {
                originX: "center",
                originY: "center",
            });
            this.canvas._activeObject = null;
            group.top = this.parkingObj.space_object.top;
            group.left = this.parkingObj.space_object.left;
            group.angle = this.parkingObj.space_object.angle;
            this.canvas.setActiveObject(group.setCoords()).renderAll();
            activeObject = this.canvas.getActiveObject();

        }
        var items = activeObject._objects;
        activeObject._restoreObjectsState();
        this.canvas.remove(activeObject);
        for (var i = 0; i < items.length; i++) {
            items[i].scaleY -= 0.25;
            items[i].scaleX -= 0.25;
            if (items[i].type == "image") {
                items[i].left -= 5;
            }
            this.canvas.add(items[i]);
            this.canvas.item(this.canvas.size() - 1).hasControls = true;
        }
        var objs = this.canvas._objects.filter(function (obj) {
            return obj;
        });
        this.space_object = new fabric.Group([objs[0]], {
            originX: "center",
            originY: "center",
        });
        this.canvas.add(this.space_object);
        this.canvas.setActiveObject(this.space_object);
        this.canvas.renderAll();

    }
    onRotating() {
        var ang = this.space_object.angle % 360;
        if (ang < 270) {
            if (ang > 180) {
                ang = this.space_object.angle % 180;
            } else if (ang > 90) {
                ang = 180 + this.space_object.angle;
            }
        }
    }
    saveCanvas() {
        if (Object.keys(this.space_object).length != 0) {
            this.canvas.setActiveObject(this.space_object);
            var activeObject = this.canvas.getActiveObject();
            var items = activeObject._objects;
            activeObject._restoreObjectsState();
            this.canvas.remove(activeObject);
            for (var i = 0; i < items.length; i++) {
                this.canvas.add(items[i]);
                this.canvas.item(this.canvas.size() - 1).hasControls = true;
            }
            var objs = this.canvas._objects.filter(function (obj) {
                return obj;
            });
            this.space_object = new fabric.Group([objs[0]], {
                originX: "center",
                originY: "center",
            });
            this.canvas.add(this.space_object);
            var json = JSON.stringify(this.canvas);
            // console.log(json);
            this.canvas.loadFromJSON(json, () => {
                //  this.canvas.renderAll();
                //  this.canvas.item(0);
                //  console.log(this.canvas.item(0));
                var prsedJson = JSON.parse(json);
                prsedJson.objects[
                    prsedJson.objects.length - 1
                ].objects[0].lotId = this.parkingObj._id;
                let data = {
                    space_object: prsedJson.objects[prsedJson.objects.length - 1],
                };
                let url = `inventories/parking-spaces?_id=${this.parkingObj._id}`;
                this.spinnerService.show();
                this.webService.post(url, data).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.toastr.success("Parking space added successfully", 'Success');
                            this.modalRef.hide();
                            this.getFloorDetails();
                            // this.getParkingSpaceList();

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
            });
        } else {
            let data = {
                space_object: {},
            };
            let url = `inventories/parking-units?_id=${this.parkingObj._id}`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success("Parking unit added successfully.", 'Success');
                        this.modalRef.hide();
                        // this.getLockerUnitList();
                        this.getFloorDetails();
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
    }

    /// action 5///
    deleteParkinSpace(obj, i?) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete parking space ${obj.number}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/parking-spaces?_id=${obj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getParkingSpaceList();
                                if (this.isEdit) {
                                    this.bulkParkingData.splice(i, 1);
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
            })
            .catch((error) => { });
    }
    // doPaginationWise(page) {
    //     this.page = page;
    //     this.getParkingSpaceList();
    // }
    // setPageSize() {
    //     this.page = 1;
    //     this.getParkingSpaceList();
    // }

    ngOnDestroy() {
        if (this.queueId) {
          clearInterval(this.queueId);
        }
      }
}


@Component({
    template: `<div class="modal-header">
    <h4 class="modal-title">Space Information</h4>
    <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
  <div class="row">
      <div class="col-md-12">
            <dl class="row mb-0">
                <dd class="col-md-5"> Parking Number</dd>
                <dd class="col-md-7">: {{data?.info?.parking}}</dd>
                <dd class="col-md-5"> Parking Type</dd>
                <dd class="col-md-7">: {{data?.info?.type}}</dd>
                <dd class="col-md-5"> Status </dd>
                <dd class="col-md-7">: {{data?.info?.status}}</dd>
                <dd class="col-md-5"> Unit No</dd>
                <dd class="col-md-7">: {{data?.info?.unit_no}}</dd>
                <dd class="col-md-5"> Price</dd>
                <dd class="col-md-7">: {{data?.info?.price | currency:'USD'}} </dd>
            </dl>
      </div>
  </div>
</div>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Close</button>
  </div>`,
})
export class SpaceInfoComponent {
    @Input() data;
    constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) { }

}