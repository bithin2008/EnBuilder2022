import { Component, OnInit, TemplateRef, Input, DoCheck, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import * as moment from 'moment';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
@Component({
    selector: 'app-model-details',
    templateUrl: './model-details.component.html',
    styleUrls: ['./model-details.component.css']
})
export class ModelDetailsComponent implements OnInit {
    modelId: any;
    isEdit: boolean = false;
    modalRef: BsModalRef;
    docFormDetails: any = {};
    modelDetailsObj: any = {};
    modelDocument: any;
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    paginationObj: any = {};
    documentList: any = [];
    photoGallery: any = [];
    floorLayoutList: any = [];
    electricalLayoutList: any = [];
    suiteLayoutList: any = [];
    projectList: any = [];
    viewsArray: any = [];
    formDetails: any = {};
    defaultActiveTab: any;
    viewName: any;
    spaceName: any;
    baseUrl = environment.BASE_URL;
    currentModalData: any = {};
    selectedProject: any[] = [];
    spaceBlock: HTMLElement;
    measureUnits: any[] = [];
    noteList: any = [];
    customAttributes: any[] = [];
    videoDetails: any = {};
    videoArray: any = [];
    mediaPhotoList: any = [];
    mediaVideoList: any = [];
    globalPhotoGallery: any = [];
    // public uploadedPhoto: boolean = false;
    selectedPhotoPath: any = {};
    selectedVideoPath: any = {};

    constructor(
        public _activatedRoute: ActivatedRoute,
        private httpClient: HttpClient,
        private FileSaverService: FileSaverService,
        protected sanitizer: DomSanitizer,
        private router: Router,
        private webService: WebService,
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
        // this.spaceBlock = document.getElementById('space-block');
        this.checkLogin();
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];

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
                    this.modelId = this._activatedRoute.snapshot.paramMap.get("modelId");
                    this.getProjectList();
                    this.getModelDetails();
                    this.getCustomAttributes();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });

            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    goToInventory() {
        this.router.navigate(['inventories']);
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `inventories/projects?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectList = response.results;
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    ///MODEL LIST///
    getMediaList() {
        this.spinnerService.show();
        let url = `inventories/photo?model_id=${this.modelId}`;
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
        let url = `inventories/models?_id=${this.modelId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.modelDetailsObj = response.result;
                    this.getMediaList();
                    this.getDocumentList();
                    this.getFloorPlanList();
                    this.getElectricalLayouts();
                    this.getSuiteLayouts();
                    this.getNotesList();
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
        this.confirmationDialogService.confirm('Delete', `Do you want to delete model ${this.modelDetailsObj.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
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

    //FILE/DOCUMENT UPLOAD VALIDATION///
    uploadModelDocument(files: FileList) {
        let validation = this.validateModelDocumentUpload(files.item(0).name);
        if (validation) {
            this.modelDocument = files.item(0);
            let url = `inventories/model-documents`;
            var formData = new FormData();
            formData.append('file', this.modelDocument);
            formData.append('model_id', this.modelId);
            formData.append('type', 'MODEL');
            this.spinnerService.show();
            this.webService.fileUpload(url, formData).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getDocumentList();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
                }
            }, (error) => {
                console.log("error ts: ", error);
            })
        } else {
            this.toastr.error("Please upload only PDF, DOC,DOCX format", "Error");
        }
    }

    validateModelDocumentUpload(fileName) {
        var allowed_extensions = new Array("pdf", "doc", "docx");
        var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    getDocumentList() {
        this.spinnerService.show();
        let url = `inventories/model-documents?model_id=${this.modelId}&page=${this.page}&pageSize=${this.pageSize}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.documentList = [];
                    response.results.forEach(element => {
                        this.documentList.push(element)
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
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'inventories' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    downloadDocument(obj) {
        const fileName = obj.document.name;
        this.httpClient.get(this.baseUrl + obj.document.url, {
            observe: 'response',
            responseType: 'blob'
        }).subscribe(res => {
            this.FileSaverService.save(res.body, fileName);
        });
        return;
    }

    deleteDocument(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete document?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `inventories/model-documents?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getDocumentList();
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

    /// Floor Layout///
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
                    formData.append('model_id', this.modelId);
                    formData.append('type', 'FLOOR-LAYOUT');
                    formData.append('source', 'MODEL');
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
                        console.log("error ts: ", error);
                    })
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF,PDF format", 'Error');
            }
        }
    }

    getFloorPlanList() {
        this.spinnerService.show();
        let url = `inventories/photo?type=FLOOR-LAYOUT&model_id=${this.modelId}&page=1&pageSize=20`;
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
                        // console.log(this.floorLayoutList);
                        this.floorLayoutList.push(element)
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
                    formData.append('model_id', this.modelId);
                    formData.append('type', 'ELECTRICAL-LAYOUT');
                    formData.append('source', 'MODEL');
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
        let url = `inventories/photo?type=ELECTRICAL-LAYOUT&model_id=${this.modelId}&page=1&pageSize=20`;
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
                    formData.append('model_id', this.modelId);
                    formData.append('type', 'SUITE-LAYOUT');
                    formData.append('source', 'MODEL');
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
        let url = `inventories/photo?type=SUITE-LAYOUT&model_id=${this.modelId}&page=1&pageSize=20`;
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
                        console.log(this.floorLayoutList);
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

    openImageTileModal(template: TemplateRef<any>, item) {
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
        console.log(data);
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

    openImageViewerBox(type, path: string, template: TemplateRef<any>, fileType) {
        this.currentModalData['name'] = type;
        this.currentModalData['path'] = path;
        this.currentModalData['file_type'] = fileType;
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }

    //FILE UPLOAD VALIDATION
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

    ///OPEN EDIT MODEL MODAL///
    openEditModelModal(template: TemplateRef<any>, tab) {
        this.isEdit = true;
        this.formDetails = Object.assign({}, this.modelDetailsObj);
        this.formDetails.views = [];
        this.formDetails.spaces = []
        if (tab == 'modelTab') {
            this.formDetails.building_type = this.modelDetailsObj.building_type ? this.modelDetailsObj.building_type.toLowerCase() : 'condominium';
        }
        if (tab == 'viewsTab') {
            this.selectedProject = this.projectList.filter((element) => element._id == this.modelDetailsObj.project_id);
            let views = this.selectedProject[0].views ? this.selectedProject[0].views.length > 0 ? this.selectedProject[0].views : [] : [];
            let modelViews = this.modelDetailsObj.views ? this.modelDetailsObj.views.length > 0 ? this.modelDetailsObj.views : [] : [];
            views.forEach((view) => {
                this.formDetails.views.push({ name: view, is_enable: false });
            })
            this.formDetails.views.forEach((view) => {
                modelViews.forEach((element) => {
                    if (element == view.name) {
                        view.is_enable = true;
                    }
                })
            })
            // console.log('this.formDetails', this.formDetails);

        }
        if (tab == 'spacesTab') {
            // this.formDetails.spaces = this.modelDetailsObj.spaces ? this.modelDetailsObj.spaces.length > 0 ? this.modelDetailsObj.spaces : [] : [];
            // this.formDetails.spaces.map((element, index) => {
            //     element.is_enable = false;
            // })
            this.selectedProject = this.projectList.filter((element) => element._id == this.modelDetailsObj.project_id);
            let spaces = this.selectedProject[0].spaces ? this.selectedProject[0].spaces.length > 0 ? this.selectedProject[0].spaces : [] : [];
            let modelSpaces = this.modelDetailsObj.spaces ? this.modelDetailsObj.spaces.length > 0 ? this.modelDetailsObj.spaces : [] : [];
            spaces.forEach((space) => {
                this.formDetails.spaces.push({ name: space, is_enable: false, size: '' });
            })
            this.formDetails.spaces.forEach((space) => {
                modelSpaces.forEach((element) => {
                    if (element.name == space.name) {
                        space.is_enable = true;
                        space.size = element.size;
                    }
                })
            })
        }
        // console.log('formDetails', this.formDetails);
        this.defaultActiveTab = tab;
        const className= (tab=='spacesTab' || tab=='viewsTab') ? 'modal-lg space-views-list-modal' : 'modal-lg';
        this.modalRef = this.modalService.show(template, { class: className, backdrop: 'static' });
    }

    editModel() {
        if (this.defaultActiveTab == 'modelTab') {
            if (!this.formDetails.name) {
                this.toastr.warning('Please enter model name', 'Warning');
                return;
            }
            if (!this.formDetails.bed) {
                this.toastr.warning('Please enter number of bedrooms', 'Warning');
                return;
            }
            if (!this.formDetails.bath) {
                this.toastr.warning('Please enter number of bathrooms', 'Warning');
                return;
            }
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
        }
        var data: any = {};
        if (this.defaultActiveTab == 'modelTab') {
            // data.name = this.formDetails.name;
            // data.project_name = selectedProject[0].name;
            data.bed = this.formDetails.bed;
            data.bath = this.formDetails.bath;
            data.den = this.formDetails.den;
            data.flex = this.formDetails.flex;
            data.area = this.formDetails.area;
            data.media = this.formDetails.media;
            data.ceiling = this.formDetails.ceiling;
            data.outdoor_type = this.formDetails.outdoor_type;
            data.type = this.formDetails.type ? this.formDetails.type.trim() :'';
            data.collection = this.formDetails.collection ? this.formDetails.collection.trim() :'';
            data.outdoor_area = this.formDetails.outdoor_area;
            data.is_parking_eligible = this.formDetails.is_parking_eligible;
            data.is_locker_eligible = this.formDetails.is_locker_eligible;
            data.is_bicycle_eligible = this.formDetails.is_bicycle_eligible;
            data.building_type = this.formDetails.building_type || '';
            data.notes = this.formDetails.notes;
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
        }

        let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modelDetailsObj = response.result && response.result.row ? response.result.row : {};
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

    ///EDIT VIEWS///
    addViews() {
        if (!this.viewName || !this.viewName.trim()) {
            this.toastr.warning('Please enter view', 'Warning');
            return;
        }
        let returnValue = this.checkExistViewName();
        if (returnValue) {
            return;
        }
        let existingViews = this.formDetails.views.map((element) => element.name); //extracting name only
        existingViews.push(this.viewName.trim());
        let data = {
            _id: this.formDetails.project_id,
            views: existingViews
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getModelDetails();
                this.getProjectList();
                this.viewName ? this.formDetails.views.push({ name: this.viewName, is_enable: true }) : true;
                this.viewName = '';

            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    editModelViews() {
        var data: any = {};
        let selectedViews = [];
        this.formDetails.views.forEach(element => {
            if (element.is_enable) {
                selectedViews.push(element.name);
            }
        })
        data.views = selectedViews;
        let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modelDetailsObj = response.result && response.result.row ? response.result.row : {};
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

    checkExistViewName() {
        let currentViewName = this.viewName.trim();
        let entries = this.formDetails.views.map((element) => element.name.trim() == currentViewName);
        let isDuplicateView = entries.includes(true) ? true : false;
        if (isDuplicateView) {
            this.toastr.warning('Duplicate view name. Please enter another view name', 'Warning');
        }
        return isDuplicateView;
    }

    ///EDIT SPACES///
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
                this.getModelDetails();
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
        let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modelDetailsObj = response.result && response.result.row ? response.result.row : {};
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

    checkExistSpacesName() {
        let currentSapceName = this.spaceName.trim();
        let entries = this.formDetails.spaces.map((element) => element.name.trim() == currentSapceName);
        let isDuplicateSpace = entries.includes(true) ? true : false;
        if (isDuplicateSpace) {
            this.toastr.warning('Duplicate space name. Please enter another space name', 'Warning');

        }
        return isDuplicateSpace;
    }

    ///Custom Attributes///
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

            element.value = this.modelDetailsObj[element.attribute_id] ? this.modelDetailsObj[element.attribute_id] : '';
        });

        this.modalRef = this.modalService.show(template, { backdrop: 'static' });
    }

    updateCustomAttributes() {
        let object: any = {};
        let invalidRecord = this.formDetails.atrributes.find((attribute) => attribute.required && !attribute.value)
        if (invalidRecord) {
            this.toastr.warning(`Please enter value for ${invalidRecord.attribute_name} `, 'Warning');
            return;
        }
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
        let url = `inventories/models?_id=${this.modelDetailsObj._id}`;
        this.spinnerService.show();
        this.webService.post(url, object).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.modelDetailsObj = response.result && response.result.row ? response.result.row : {};
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

    ///NOTES///
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
            model_id: this.modelId,
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
            model_id: this.modelId,
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
        let url = `inventories/notes?model_id=${this.modelId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.noteList = response.results && response.results.rows ? response.results.rows : [];
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
                    formData.append('model_id', this.modelId);
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
            description: this.formDetails.description? this.formDetails.description.trim() :''
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
        this.formDetails = { ...this.modelDetailsObj };
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
            data.model_id = this.modelId;
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
}
