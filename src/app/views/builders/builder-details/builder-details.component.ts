import { Component, OnInit, TemplateRef, Input, DoCheck, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import * as moment from 'moment';
import { Lightbox } from 'ngx-lightbox';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import FroalaEditor from 'froala-editor';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-builder-details',
    templateUrl: './builder-details.component.html',
    styleUrls: ['./builder-details.component.css']
})
export class BuilderDetailsComponent implements OnInit {
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    builderId: any;
    builderDetailsObj: any = {};
    baseUrl = environment.BASE_URL;
    modalRef: BsModalRef;
    formDetails: any = {};
    isEdit: boolean = false;
    public uploadedPhoto: boolean = false;
    builderLogo: any;
    photoGallery: any = [];
    phone = new FormGroup({
        contact_phone: new FormControl(undefined, [Validators.required])
    });
    selectedPhoto: any = {};
    protocol: string = '';
    videoDetails: any = {};
    videoArray: any = [];
    mediaVideoList: any = [];
    selectedVideoPath: any = {};

    constructor(
        private ngZone: NgZone,
        public _activatedRoute: ActivatedRoute,
        private router: Router,
        private lightbox: Lightbox,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
        protected sanitizer: DomSanitizer
    ) {
        this.builderId = this._activatedRoute.snapshot.paramMap.get("builderId");
    }
    //NON INLINE EDITOR OPTIONS
    public nonInlineEdit: Object = {
        attribution: false,
        heightMax: 200,
        charCounterCount: true,
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
        events: {
            "initialized": () => {
            },
            "contentChanged": () => {
                this.ngZone.run(() => {
                    // setTimeout(() => {
                    //   console.log('articleBlocksArray', this.articleBlocksArray)
                    //   this.updateBlock(this.activeBlockId, '');
                    // }, 500);
                });
            }
        }
    }
    // public titleOptions: Object = {
    //     placeholderText: 'Edit Your Content Here!',
    //     charCounterCount: false,
    //     // toolbarInline: true,
    //     key: "te1C2sB5C7D5G4H5B3jC1QUd1Xd1OZJ1ABVJRDRNGGUE1ITrE1D4A3A11B1B6B5B1F4F3==",
    //     toolbarButtons: [['undo', 'redo' , 'bold','insertTable'], ['alert', 'clear', 'insert']],
    //     events: {
    //       "initialized": (e, item) => {

    //       },
    //       "contentChanged": (e) => {
    //         setTimeout(() => {
    //           console.log("item hange")
    //         //   this.updateTile();
    //         }, 1000);


    //       }
    //     }
    //   }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        this.checkLogin();
        // FroalaEditor('div#froala-editor-div', {
        //     enter: FroalaEditor.ENTER_DIV,
        //     height: 'calc(100vh - 55px)'
        // });
    }

    checkLogin() {
      let url = 'whoami';
      this.webService.get(url).subscribe((response: any) => {

          if (response.success) {

              if (response.result.isGuest) {
                  this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
              }
              else {
                this.getBuilderDetails();
              }
          }
          else {
              this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
          }

      }, (error) => {
          this.toastr.error(error, 'Error!');
      })
    }

    getBuilderDetails() {
        this.spinnerService.show();
        let url = `projects/builders?_id=${this.builderId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderDetailsObj = response.result;
                    this.getMediaList();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    goToBuilderList() {
        this.router.navigate(['builders']);
    }

    deleteBuilder() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete ${this.builderDetailsObj.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/builders?_id=${this.builderDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.router.navigate(['builders']);
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    ///EDIT BUUILDER ///
    openEditBuilderModal(template: TemplateRef<any>) {
        this.isEdit = true;
        this.formDetails = Object.assign({}, this.builderDetailsObj);
        this.formDetails['address'] = this.builderDetailsObj.address ? Object.assign({}, this.builderDetailsObj.address) : {};
        if (this.formDetails.contact_phone) {
            this.phone.controls.contact_phone.setValue({
                "number": this.formDetails.contact_phone.number,
            });
        }
        if (this.builderDetailsObj.contact_website) {
            let str = this.builderDetailsObj.contact_website;

            if (str && (str.indexOf("https://") == 0)) {
                this.protocol = 'https://';
            }
            else if (str && (str.indexOf("http://") == 0)) {
                this.protocol = 'http://';
            }
            else {
                this.protocol = 'https://';
            }
            // console.log(' this.protocol', this.protocol);
            let domain = str.replace("https://", '');
            domain = domain.replace("http://", '');
            this.formDetails.contact_website = domain;
        }
        else {
            this.protocol = 'https://';
        }
        // this.formDetails.address = this.builderDetailsObj.address ? this.builderDetailsObj.address : {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editBuilder() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        var websiteReg = /((?:https?\:\/\/)(?:[-a-z0-9]+\.)*[-a-z0-9]+.*)/i;

        // var urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        let website = '';
        if (this.formDetails.contact_website && this.formDetails.contact_website.trim()) {
            let webaddress = this.formDetails.contact_website.toLowerCase();
            if (webaddress && (webaddress.indexOf("https://") == 0)) {
                website = webaddress.trim();
            }
            else if (webaddress && (webaddress.indexOf("http://") == 0)) {
                website = webaddress.trim();
            }
            else {
                website = `${this.protocol}${webaddress.trim()}`; //DON'T REMOVE ${this.protocol} it is for dynamic protocol
            }
        }

        if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter builder name', 'Warning');
        }
        // else if (!this.formDetails.contact_name) {
        //     this.toastr.warning('Please enter builder contact name', 'Warning');
        // }
        // else if (!this.formDetails.contact_email) {
        //     this.toastr.warning('Please enter builder contact email', 'Warning');
        // }
        else if (this.formDetails.contact_email && !reg.test(this.formDetails.contact_email)) {
            this.toastr.warning('Please enter valid builder contact email', 'Warning');
        }
        else if (this.phone.value.contact_phone && this.phone.controls['contact_phone'].invalid) {
            this.toastr.warning('Please enter valid phone number', 'Warning');
        }
        else if (this.formDetails.contact_website && !websiteReg.test(website)) {
            this.toastr.warning('Please enter valid builder contact website', 'Warning');
        }
        else {
            var builderObj: any = {};
            if (this.phone.value && this.phone.value.contact_phone) {
                let phoneObj = {
                    number: this.phone.value.contact_phone.e164Number,
                    formatted: this.phone.value.contact_phone.nationalNumber,
                }
                builderObj.contact_phone = phoneObj;
            } else {
                builderObj.contact_phone = '';
            }
            builderObj.name = this.formDetails.name ? this.formDetails.name.trim() : '';
            builderObj.contact_name = this.formDetails.contact_name ? this.formDetails.contact_name.trim() : '';
            builderObj.contact_email = this.formDetails.contact_email ? this.formDetails.contact_email.trim().toLowerCase() : '';
            builderObj.contact_website = website ? website.trim() : '';
            let { city, country, state, street1, street2, zip } = this.formDetails.address;
            builderObj.address = {
                city: city || '',
                country: country || '',
                state: state || '',
                street1: street1 || '',
                street2: street2 || '',
                zip: zip || ''
            }
            let url = `projects/builders?_id=${this.formDetails._id}`;
            this.spinnerService.show();
            this.webService.fileUpload(url, builderObj).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getBuilderDetails();
                        this.modalRef.hide();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }

    ///MANAGE BUILDER LOGO ///
    deleteBuilderLogo() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete builder logo?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/builder-photos?builder_id=${this.builderDetailsObj._id}&photo_id=${this.builderDetailsObj.logo._id}&field_name=logo`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getBuilderDetails();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    uploadBuilderLogo(e) {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            this.spinnerService.show();
            let validation = this.validateDocumentUpload(selectedFile.name);
            if (validation) {
                var formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('update_type', 'logo');
                let url = `projects/builders?_id=${this.builderId}`;
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getBuilderDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                    }
                }, (error) => {
                    console.log('error', error);
                });
            }
            else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }
        }
    }


    //// MANAGE PHOTOS GALLERY ////
    openPhotoBox(template, item): void {
        this.selectedPhoto = {
            path: this.baseUrl + item.url,
            name: item.name
        };
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }

    uploadBuilderPhoto(files: FileList) {
        if (files.length>0) {
        let url = `projects/builder-photos`;
        const totalFiles = files.length;
        let validation = false;
        for (let i = 0; i < totalFiles; i++) {
            let builderPhoto = files[i];
            validation = this.validateDocumentUpload(builderPhoto.name);
        }
        if (validation) {
            this.spinnerService.show();
            for (let i = 0; i < totalFiles; i++) {
                let builderPhoto = files[i];
                let formData = new FormData();
                formData.append('file', builderPhoto);
                formData.append('builder_id', this.builderId);
                formData.append('field_name', 'photos');
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    if (response.is_valid_session) {
                        if (i == (totalFiles - 1)) {
                            this.spinnerService.hide();
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getBuilderDetails();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        }

                    } else {
                        this.toastr.error('Your Session expired', 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                    }
                }, (error) => {
                    console.log("error ts: ", error);
                })
            }
        } else {
            this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
        }
    }
    }

    //FILE UPLOAD VALIDATION
    validateDocumentUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "gif");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    //DELETE  PHOTO
    deletePhoto(photo) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/builder-photos?builder_id=${this.builderId}&field_name=photos&photo_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getBuilderDetails();
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: `builders/${this.builderId}` } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }


    //// MANAGE DESCRIPTION ////
    openEditDescriptionModal(template: TemplateRef<any>) {
        this.formDetails = { ...this.builderDetailsObj };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateDescription() {
        let data = {
            _id: this.formDetails._id,
            description: this.formDetails.description
        }
        let url = `projects/builders`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getBuilderDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    close(): void {
        this.lightbox.close();
    }


    //// MANAGE VIDEOS ////
    getMediaList() {
        this.spinnerService.show();
        let url = `projects/photo?builder_id=${this.builderId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.mediaVideoList = [];
                response.results.forEach(element => {
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

            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    openAddVideoModal(template: TemplateRef<any>) {
        this.videoDetails = {
            video_type: '',
            title: '',
            body: ''
        };
        this.formDetails = { ...this.builderDetailsObj };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addBuilderVideos() {
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
            // data.project_id = this.projectId;
            data.builder_id = this.builderId;
            data.type = 'VIDEO';
            data.source = 'MEDIA';
            let url = `projects/videos`;
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

    openVideoViewer(template, item) {
        this.selectedVideoPath = {
            path: item.showing_url,
            name: item.title,
            body: item.body
        };
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }

    deleteVideo(item, event) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete video?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/videos?_id=${item._id}`;
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


}
