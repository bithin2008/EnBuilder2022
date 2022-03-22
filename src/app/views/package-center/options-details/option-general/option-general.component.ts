import { Component, OnInit, Input, OnChanges, EventEmitter, Output, TemplateRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-option-general',
    templateUrl: './option-general.component.html',
    styleUrls: ['./option-general.component.css']
})
export class OptionGeneralComponent implements OnInit {
    @Input() optionDetailsObj: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    baseUrl = environment.BASE_URL;
    @Input() optionId: string;
    formDetails: any = {};
    modalRef: BsModalRef;
    spaceName;
    locationList: any[] = [];
    categoryList: any[] = [];
    constructor(private spinnerService: Ng4LoadingSpinnerService,
        private webService: WebService,
        private toastr: ToastrService,
        private router: Router,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
    }

    ngOnChanges(event) {
        if (this.optionDetailsObj) {
            this.getCategoryList();
            this.getLocationList();
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

    uploadHeroImage(e) {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            let validation = this.validatePhoto(selectedFile.name);
            if (validation) {
                this.spinnerService.show();
                var formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('update_type', 'hero_image');
                formData.append('_id', this.optionId);
                let url = `package-center/options`;
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
                        this.router.navigate(['/login'], { queryParams: { return_url: `package-center/options/${this.optionId}` } });
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

    getPackageDetails() {
        this.getDetailsEvent.emit(true);
    }

    openEditBasicModal(template: TemplateRef<any>) {
        this.formDetails = {
            name: this.optionDetailsObj.name,
            is_active: this.optionDetailsObj.is_active ? true : false,
            description: this.optionDetailsObj.description ? this.optionDetailsObj.description : '',
            caption: this.optionDetailsObj.caption ? this.optionDetailsObj.caption : '',
            is_valid: this.optionDetailsObj.is_valid ? true : false,
            construction_notes: this.optionDetailsObj.construction_notes ? this.optionDetailsObj.construction_notes : '',
            order: this.optionDetailsObj.order,
            specifications: this.optionDetailsObj.specifications ? this.optionDetailsObj.specifications : '',
            models: this.optionDetailsObj.models ? this.optionDetailsObj.models : '',
            trades: this.optionDetailsObj.trades ? this.optionDetailsObj.trades : '',
            location: this.optionDetailsObj.location ? this.optionDetailsObj.location : '',
            category_id: this.optionDetailsObj.category_id ? this.optionDetailsObj.category_id : '',
            category_name: this.optionDetailsObj.category_name ? this.optionDetailsObj.category_name : '',
            _id: this.optionDetailsObj._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

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
        this.optionDetailsObj.photos.forEach((element, index) => {
            if (element._id == this.formDetails._id) {
                element.description = this.formDetails.description
            }
        });
        data.photos = this.optionDetailsObj.photos;
        let url = `package-center/options?_id=${this.optionId}`;
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

    async updateBasicOption() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }

        if (!this.formDetails.category_id) {
            this.toastr.warning('Please select category', 'Warning');
            return;
        }
        if (!this.formDetails.location) {
            this.toastr.warning('Please select location', 'Warning');
            return;
        }

        let selectedCategory = this.categoryList.find((element) => element._id == this.formDetails.category_id);

        let data = { ...this.formDetails };

        data.category_name = (selectedCategory && selectedCategory.name) ? selectedCategory.name : '';
        // console.log('data', data);
        let url = `package-center/options?_id=${this.optionId}`;
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
            description: this.optionDetailsObj.description || '',
            construction_notes: this.optionDetailsObj.construction_notes || '',
            _id: this.optionDetailsObj._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    updateDescription() {
        let data = { ...this.formDetails };
        let url = `package-center/options`;
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
    getLocationList() {
        // let url = `service/crm-settings?type=BUILDER-ISSUE-LOCATION`;
        let url = `package-center/project-settings?type=PROJECT-PACKAGE-LOCATION&page=1&pageSize=200&sortBy=order&sortOrder=ASC`;
        if (this.optionDetailsObj.project_id) {
            url = url + `&project_id=${this.optionDetailsObj.project_id}`;
        }

        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.locationList = response.results ? response.results : [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `package-center/options/${this.optionId}` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getCategoryList() {
        let url = `package-center/options-categories`;
        if (this.optionDetailsObj) {
            url = url + `?project_id=${this.optionDetailsObj.project_id}`;
        }
        this.spinnerService.show();
        this.categoryList = [];
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.categoryList = response.results;
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
                    formData.append('dataset_id', 'bldr_personalization_options');
                    formData.append('_id', this.optionId);
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
                    let url = `package-center/photos?_id=${this.optionId}&dataset_id=bldr_personalization_options&file_id=${photo._id}`;
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
            let previousPhoto = this.optionDetailsObj.photos[index - 1];
            let currentPhoto = this.optionDetailsObj.photos[index];
            this.optionDetailsObj.photos[index] = previousPhoto;
            this.optionDetailsObj.photos[index - 1] = currentPhoto;
        }
        else if (direction == 'right') {
            let nextPhoto = this.optionDetailsObj.photos[index + 1];
            let currentPhoto = this.optionDetailsObj.photos[index];
            this.optionDetailsObj.photos[index] = nextPhoto;
            this.optionDetailsObj.photos[index + 1] = currentPhoto;
        }
        let url = `package-center/options?_id=${this.optionId}`;
        let data: any = {}
        data.photos = this.optionDetailsObj.photos;
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
            labour_cost: '',
            material_cost: '',
            // cost: '',
            // price: ''
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    updateOption() {

    }

    openEditSpaces(template: TemplateRef<any>) {
        this.formDetails = {
            spaces: [],

        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }
    addSpaces() {

    }

    updateSpaces() {

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

}
