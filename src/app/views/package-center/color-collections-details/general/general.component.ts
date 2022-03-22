import { Component, OnInit, Input, OnChanges, EventEmitter, Output, TemplateRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { WebService } from '../../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-general',
    templateUrl: './general.component.html',
    styleUrls: ['./general.component.css']
})
export class GeneralComponent implements OnInit {
    @Input() collectionDetails: any = {};
    @Output() getDetailsEvent: EventEmitter<any> = new EventEmitter();
    baseUrl = environment.BASE_URL;
    @Input() collectionId: string;
    mediaPhotoList: any[] = [];
    formDetails: any = {};
    modalRef: BsModalRef;
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

    getColorCollectionDetails() {
        this.getDetailsEvent.emit(true);
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

    openEditBasicModal(template: TemplateRef<any>) {
        this.formDetails = {
            name: this.collectionDetails.name,
            is_active: this.collectionDetails.is_active ? true : false,
            description: this.collectionDetails.description,
            // cost: this.collectionDetails.cost,
            // price: this.collectionDetails.price,
            _id: this.collectionDetails._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    async updateColorCollection() {
        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter name', 'Warning');
            return;
        }
        // if (!this.formDetails.cost && this.formDetails.cost != 0) {
        //     this.toastr.warning(`Please enter cost`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.cost < 0) {
        //     this.toastr.warning(`Please enter cost greater than and equal to 0`, 'Warning');
        //     return;
        // }
        // if (!this.formDetails.price && this.formDetails.price != 0) {
        //     this.toastr.warning(`Please enter price`, 'Warning');
        //     return;
        // }
        // if (this.formDetails.price < 0) {
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
        let url = `package-center/color-collections`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
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
                let url = `package-center/color-collections?_id=${this.collectionId}`;
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getColorCollectionDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `package-center/color-collections/${this.collectionId}` } });
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

    //// UPLOAD PHOTOS ///
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
                    formData.append('dataset_id', 'bldr_color_collections');
                    formData.append('_id', this.collectionId);
                    let response: any = await this.asyncImageUploading(formData);
                    if (i == (totalFiles - 1)) {
                        this.spinnerService.hide();
                        this.toastr.success(response.message, 'Success');
                        this.getColorCollectionDetails();
                    }
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

    openPhotoDescription(template: TemplateRef<any>, item) {
        this.formDetails = {
            description: item.description ? item.description : '',
            _id: item._id
        }
        this.modalRef = this.modalService.show(template, { backdrop: 'static' });

    }

    updatePhotoDescription() {
        let data: any = {};
        this.collectionDetails.photos.forEach((element, index) => {
            if (element._id == this.formDetails._id) {
                element.description = this.formDetails.description
            }
        });
        data.photos = this.collectionDetails.photos;
        let url = `package-center/color-collections?_id=${this.collectionId}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
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
                    let url = `package-center/photos?_id=${this.collectionId}&dataset_id=bldr_color_collections&file_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getColorCollectionDetails();
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
            let previousPhoto = this.collectionDetails.photos[index - 1];
            let currentPhoto = this.collectionDetails.photos[index];
            this.collectionDetails.photos[index] = previousPhoto;
            this.collectionDetails.photos[index - 1] = currentPhoto;
        }
        else if (direction == 'right') {
            let nextPhoto = this.collectionDetails.photos[index + 1];
            let currentPhoto = this.collectionDetails.photos[index];
            this.collectionDetails.photos[index] = nextPhoto;
            this.collectionDetails.photos[index + 1] = currentPhoto;
        }
        let url = `package-center/color-collections?_id=${this.collectionId}`;
        let data: any = {}
        data.photos = this.collectionDetails.photos;
        // console.log('data.photoArray', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getColorCollectionDetails();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
}
