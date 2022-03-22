import { Component, OnInit, Input, EventEmitter, Output, TemplateRef,Renderer2 } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-package-general',
    templateUrl: './package-general.component.html',
    styleUrls: ['./package-general.component.css']
})
export class PackageGeneralComponent implements OnInit {
    @Input() packageDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    baseUrl = environment.BASE_URL;
    @Input() packageId: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    spaceName;
    locationList: any[] = [];
    dropdownSettings = {};
    projectSpaces: any[] = [];
    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private router: Router,
        private modalService: BsModalService,
        private renderer: Renderer2,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'collection_id',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableCheckAll: true,
            allowSearchFilter: true
        };
    }

    ngOnChanges(event) {
        if (this.packageDetails) {
            this.getLocationList();
            this.projectSpaces=[];
            let filterData: any = localStorage.getItem('packageCenterProjectData');
            if (filterData) {
                filterData = JSON.parse(filterData);
                if (filterData && filterData.spaces) {
                    this.projectSpaces=filterData.spaces;
                }
            }
        }
    }

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

    getLocationList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `package-center/project-settings?type=PROJECT-PACKAGE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (this.packageDetails.project_id) {
            url = url + `&project_id=${this.packageDetails.project_id}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `package-center/packages/${this.packageId}` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }


    getPackageDetails() {
        this.getDetailsEvent.emit(true);
    }

    uploadHeroImage(e) {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            let validation = this.validatePhoto(selectedFile.name);
            if (validation) {
                this.spinnerService.show();
                var formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('update_type', 'hero_image');
                formData.append('_id', this.packageId);
                let url = `package-center/packages`;
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getPackageDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `package-center/packages/${this.packageId}` } });
                    }
                }, (error) => {
                    this.spinnerService.hide();
                    console.log('error', error);
                });
            }
            else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }
        }
    }

    //FILE UPLOAD VALIDATION
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
    
    openEditBasicModal(template: TemplateRef<any>) {
        this.formDetails = {
            name: this.packageDetails.name || '',
            is_active: this.packageDetails.is_active ? true : false,
            description: this.packageDetails.description || '',
            caption: this.packageDetails.caption || '',
            is_valid: this.packageDetails.is_valid ? true : false,
            construction_notes: this.packageDetails.construction_notes || '',
            order: this.packageDetails.order || '',
            specifications: this.packageDetails.specifications || '',
            models: this.packageDetails.models || '',
            trades: this.packageDetails.trades || '',
            location: this.packageDetails.location || '',
            _id: this.packageDetails._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    async  updatePackageBasicData() {
        if (!this.formDetails.name) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        if (!this.formDetails.location) {
            this.toastr.warning('Please select location', 'Warning');
            return;
        }

        // if (!(this.formDetails.cost >= 0)) {
        //     this.toastr.warning(`Please enter cost greater than and equal to 0`, 'Warning');
        //     return;
        // }

        // if (!(this.formDetails.price >= 0)) {
        //     this.toastr.warning(`Please enter price greater than and equal to 0`, 'Warning');
        //     return;
        // }

        // if (this.formDetails.cost > this.formDetails.price) {
        //     let confirmed = await this.confirmationDialogService.confirm('Confirm', `Cost is greater than price, Do you want to continue ?`)
        //     if (!confirmed) {
        //         return;
        //     }
        // }

        let data = { ...this.formDetails };
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }


    openEditDescriptionModal(template: TemplateRef<any>) {
        this.formDetails = {
            description: this.packageDetails.description || '',
            construction_notes: this.packageDetails.construction_notes || '',
            _id: this.packageDetails._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateDescription() {
        let data = { ...this.formDetails };
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openPhotoDescription(template: TemplateRef<any>, item) {
        this.formDetails = {
            description: item.description ? item.description : '',
            _id: item._id
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    updatePhotoDescription() {
        // if (!this.formDetails.description) {
        //     this.toastr.warning('Please enter name', 'Warning');
        //     return;
        // }
        let data: any = {};
        this.packageDetails.photos.forEach((element, index) => {
            if (element._id == this.formDetails._id) {
                element.description = this.formDetails.description
            }
        });
        data.photos = this.packageDetails.photos;
        let url = `package-center/packages?_id=${this.packageId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    async uploadPhotos(files) {
        if (files.length > 0) {
            const totalFiles = files.length;
            let validation = false;
            for (let i = 0; i < totalFiles; i++) {
                let photo = files[i];;
                validation = this.validatePhoto(photo.name);
            }

            if (validation) {
                this.spinnerService.show();
                for (let i = 0; i < totalFiles; i++) {
                    let photo = files[i];
                    let formData = new FormData();
                    formData.append('image', photo);
                    formData.append('dataset_id', 'bldr_packages');
                    formData.append('_id', this.packageId);
                    let response: any = await this.asyncImageUploading(formData);
                    if (i == (totalFiles - 1)) {
                        this.spinnerService.hide();
                        this.toastr.success(response.message, 'Success');
                        this.getPackageDetails();
                    }
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }

        }
    }

    asyncImageUploading(formData) {
        let url = `package-center/photos`;
        return new Promise(resolve => {
            this.webService.fileUpload(url, formData).subscribe((response: any) => {
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        resolve(response);
                    }
                    else {
                        this.toastr.error(response.message, 'Error');
                    }
                }

            }, (error) => {
                this.spinnerService.hide();
                console.log("error ts: ", error);
            })
        });
    }

    //DELETE PHOTO FROM GALLErY
    deletePhoto(photo, event) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `package-center/photos?_id=${this.packageId}&dataset_id=bldr_packages&file_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getPackageDetails();
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

    reArrangePhotos(direction, index) {
        if (direction == 'left') {
            let previousPhoto = this.packageDetails.photos[index - 1];
            let currentPhoto = this.packageDetails.photos[index];
            this.packageDetails.photos[index] = previousPhoto;
            this.packageDetails.photos[index - 1] = currentPhoto;
        }
        else if (direction == 'right') {
            let nextPhoto = this.packageDetails.photos[index + 1];
            let currentPhoto = this.packageDetails.photos[index];
            this.packageDetails.photos[index] = nextPhoto;
            this.packageDetails.photos[index + 1] = currentPhoto;
        }
        let url = `package-center/packages?_id=${this.packageId}`;
        let data: any = {}
        data.photos = this.packageDetails.photos;
        // console.log('data.photoArray', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openEditSecondBasicModal(template: TemplateRef<any>) {
        this.formDetails = {
            labour_cost: this.packageDetails.labour_cost || '',
            material_cost:this.packageDetails.material_cost || '',
            _id:this.packageDetails._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updatePackage() {
        if (!this.formDetails.labour_cost) {
            this.toastr.warning('Please enter labour cost', 'Warning');
            return;
        }
        if (!this.formDetails.material_cost) {
            this.toastr.warning('Please enter material cost', 'Warning');
            return;
        }

        let data = { ...this.formDetails };
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openEditSpaces(template: TemplateRef<any>) {
        this.formDetails = {
            spaces: [],
            project_id: this.packageDetails.project_id
        }
        this.projectSpaces.forEach(element => {
            this.formDetails.spaces.push({name:element,is_enable:false});
        });
        let packageSpaces = this.packageDetails.spaces ?  this.packageDetails.spaces :[];
        this.formDetails.spaces.forEach((space) => {
            packageSpaces.forEach((element) => {
                if (element == space.name) {
                    space.is_enable = true;
                }
            })
        })
        this.modalRef = this.modalService.show(template, { class:'modal-lg space-views-list-modal', backdrop: 'static' });

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
                let projectdata= response.result && response.result.row ? response.result.row : {};
                let projectStoreData = {
                    _id:projectdata._id,
                    no_of_floors:projectdata.no_of_floors,
                    spaces:projectdata.spaces
                };
                localStorage.setItem('packageCenterProjectData', JSON.stringify(projectStoreData));
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.spaceName ? this.formDetails.spaces.push({ name: this.spaceName, is_enable: true }) : true;
                this.spaceName = '';
                setTimeout(() => {
                    const id = this.formDetails.spaces.length > 0 ? this.formDetails.spaces.length - 1 : 0;
                    let element: HTMLElement = this.renderer.selectRootElement(`#spaces${id}`);
                    element.focus()
                }, 6);
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    updateSpaces() {
        // let spaces = this.formDetails.spaces.find((element) => element.is_enable);
        var data: any = {
            _id:this.packageDetails._id
        };
        let selectedSpaces = [];
        this.formDetails.spaces.forEach(element => {
            if (element.is_enable) {
                selectedSpaces.push(element.name);
            }
        })
        data.spaces = selectedSpaces;
        // console.log(data);
        let url = `package-center/packages`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getPackageDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    checkExistSpacesName() {
        let currentSapceName = this.spaceName;
        let entries = this.formDetails.spaces.map((element) => element.name == currentSapceName);
        let isDuplicateSpace = entries.includes(true) ? true : false;
        if (isDuplicateSpace) {
            this.toastr.warning('Duplicate space name. Please enter another space name', 'Warning');

        }
        return isDuplicateSpace;
    }

    onDeSelectAll(type, event) {
        this.formDetails[type] = event;
    }

    onSelectAll(type, event) {
        this.formDetails[type] = event;
    }
}
