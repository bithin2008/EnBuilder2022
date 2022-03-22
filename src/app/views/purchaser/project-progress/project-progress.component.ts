import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-project-progress',
    templateUrl: './project-progress.component.html',
    styleUrls: ['./project-progress.component.css']
})
export class ProjectProgressComponent implements OnInit {
    projectList: any[] = [];
    selectedProject: any = {};
    paginationObj: any = {};
    videoDetails: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    modalRef: BsModalRef;
    videoModalRef: BsModalRef;
    baseUrl = environment.BASE_URL;
    formDetails: any = {};
    projectProgress: any[] = [];
    progressImage: any;
    isEdit: boolean = false;
    photo: any;
    galleryPhotoList: any[] = [];
    galleryVideoList: any[] = [];
    selectedProjectId: string = '';
    selectedTab: any = '';
    allMediaList: any = [];
    selectedFile: any = {};
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private changeDetect: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService,
        private cdk: ChangeDetectorRef,
        protected sanitizer: DomSanitizer,
    ) { }

    ngOnInit(): void {
        this.getProjectList();
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

    getProjectList() {
        this.spinnerService.show();
        let url = `purchaser-portal/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                if (this.projectList.length > 0) {
                    // this.selectedProjectId = this.selectedProject._id;
                    this.getSavedFilterdata();
                    this.getProjectProgressList();
                }
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('ProjectProgressFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.project_id) {
                this.selectedProjectId = filterData.project_id;
                this.selectedProject = this.projectList.find((element) => element._id == filterData.project_id);
            } else {
                this.selectedProject = this.projectList[0];
                this.selectedProjectId = this.projectList[0]._id;
            }
            if (filterData.page) {
                this.page = filterData.page;
            }
            if (filterData.pageSize) {
                this.pageSize = filterData.pageSize;
            }
            if (filterData.sortby) {
                this.sortedtby = filterData.sortby;
            }
            if (filterData.sortOrder) {
                this.sortOrder = filterData.sortOrder;
            }


        }
        else {
            this.selectedProject = this.projectList[0];
            this.selectedProjectId = this.projectList[0]._id;

        }
    }

    getProjectProgressList(updatedRecordId?) {
        this.spinnerService.show();
        this.saveFilter();
        let url = `purchaser-portal/progress-steps?project_id=${this.selectedProjectId}&page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        this.webService.get(url).subscribe((response: any) => {
            // console.log('response', response);
            this.spinnerService.hide();
            this.projectProgress=[];
            if (response.status == 1) {
                this.projectProgress = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                    this.getProjectProgressList()  
                } 
                this.galleryPhotoList = [];
                this.galleryVideoList = [];
                if (updatedRecordId) {
                    this.projectProgress.forEach(element => {
                        if (element._id == updatedRecordId) {
                            if (element.hasOwnProperty('gallery')) {
                                this.galleryPhotoList = element.gallery;
                            }
                            if (element.hasOwnProperty('videos')) {
                                this.galleryVideoList = element.videos;
                            }
                        }
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

    doPaginationWise(page) {
        this.page = page;
        this.getProjectProgressList();
    }

    setPageSize() {
        this.page = 1;
        this.getProjectProgressList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            project_id: this.selectedProjectId,
        }
        localStorage.setItem('ProjectProgressFilterData', JSON.stringify(data));
    }

    reArrangeProgressStep(direction, index) {
        if (direction == 'up') {
            let previous = { ...this.projectProgress[index - 1] };
            let current = { ...this.projectProgress[index] };
            let payload = {
                data: [
                    {
                        _id: previous._id,
                        step: previous.step + 1
                    },
                    {
                        _id: current._id,
                        step: current.step - 1
                    }
                ]
            }
            this.onStepChange(payload);

        }
        else if (direction == 'down') {
            let next = { ... this.projectProgress[index + 1] };
            let current = { ...this.projectProgress[index] };
            let payload = {
                data: [
                    {
                        _id: next._id,
                        step: next.step - 1
                    },
                    {
                        _id: current._id,
                        step: current.step + 1
                    }
                ]
            }
            this.onStepChange(payload);
        }
    }

    onStepChange(data) {
        this.spinnerService.show();
        let url = `purchaser-portal/rearrange-progress`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectProgressList();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openViewModalBox(template, item) {
        // this.selectedVideoPath = {
        //     path: path,
        //     name: 'name'
        // };
        this.allMediaList = [];
        if (item.hasOwnProperty('photo')) {
            this.allMediaList.push(item.photo);
        }
        if (item.hasOwnProperty('gallery')) {
            item.gallery.forEach(img => {
                this.allMediaList.push(img);
            });
        }
        if (item.hasOwnProperty('videos')) {
            item.videos.forEach(video => {
                if (video.video_type == 'VIMEO') {
                    video.url = `https://player.vimeo.com/video/${video.video_id}`;
                }
                if (video.video_type == 'YOUTUBE') {
                    video.url = `https://www.youtube.com/embed/${video.video_id}`;
                }
                video.showing_url = this.sanitizer.bypassSecurityTrustResourceUrl(video.url);
                this.allMediaList.push(video);
            });
        }
        this.selectedFile = this.allMediaList[0];
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });

    }

    //DELETE PROJECT PROGRESS
    deleteProjectProgress(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this project progress step?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/progress-steps?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getProjectProgressList();
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


    openEditProjectProgressModal(template: TemplateRef<any>, item, index) {
        this.isEdit = true;
        this.selectedTab = 'ModelTab';
        this.formDetails = {};
        this.galleryPhotoList = [];
        this.galleryVideoList = [];
        this.formDetails = {
            description: item.description,
            _id: item._id,
            is_published: item.is_published,
            is_completed: item.is_completed,
            status: item.status,
            step: item.step,
            time: item.time
        };

        this.formDetails.layout = item.photo ? this.baseUrl + item.photo.url : null;
        // console.log('item', item);
        if (item.hasOwnProperty('gallery')) {
            this.galleryPhotoList = item.gallery ? item.gallery : [];
        }
        if (item.hasOwnProperty('videos')) {
            this.galleryVideoList = item.videos ? item.videos : [];
            // this.formDetails.videos = item.videos ? item.videos : [];
        }
        // console.log('galleryPhotoList', this.galleryVideoList);
        this.modalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });
    }

    editProgressStep() {
        // if (!this.formDetails.time) {
        //     this.toastr.warning('Please enter progress time', 'Warning');
        // }

        // else {
        var projectObj: any = Object.assign({}, this.formDetails);
        projectObj.is_published = this.formDetails.is_published ? true : false;
        projectObj.is_completed = this.formDetails.is_completed ? true : false;
        projectObj.step = this.formDetails.step;
        projectObj.hasOwnProperty('layout') ? delete projectObj.layout : true;

        let url = `purchaser-portal/progress-steps`;
        this.spinnerService.show();
        this.webService.post(url, projectObj).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.status == 1) {
                    if (this.progressImage) {
                        this.uploadProjectLogo(response.result.row);
                    } else {
                        this.getProjectProgressList();
                    }
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });
        // }
    }

    uploadProjectLogo(project_progress) {
        var formData = new FormData();
        formData.append('image', this.progressImage);
        formData.append('update_type', 'photo');
        let url = `purchaser-portal/progress-steps?_id=${project_progress._id}`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        // this.toastr.success(response.message, 'Success');
                        this.progressImage = '';
                        this.getProjectProgressList(project_progress._id);
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `purchaser-admin` } });
            }
        }, (error) => {
            console.log('error', error);
        });

    }

    openAddProjectProgressModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.selectedTab = 'ModelTab';
        this.formDetails = {};
        this.formDetails = {
            project_id: this.selectedProject._id,
            step: this.projectProgress.length + 1,
            status: '',
            is_published: false,
            is_completed: false,
            time: '',
            description: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });

    }

    addProgressStep() {
        // if (!this.formDetails.time) {
        //     this.toastr.warning('Please enter progress time', 'Warning');
        // }

        // else {
        var projectObj: any = Object.assign({}, this.formDetails);
        let selectedProject = this.projectList.find((project) => project._id == this.formDetails.project_id);
        projectObj.project_name = selectedProject.name;
        projectObj.is_published = this.formDetails.is_published ? true : false;
        projectObj.is_completed = this.formDetails.is_completed ? true : false;
        projectObj.step = this.formDetails.step;
        projectObj.hasOwnProperty('layout') ? delete projectObj.layout : true;
        let url = `purchaser-portal/progress-steps`;
        this.spinnerService.show();
        this.webService.post(url, projectObj).subscribe((response: any) => {
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.isEdit = true;
                    this.formDetails._id = response.result._id;
                    if (this.progressImage) {
                        this.uploadProjectLogo(response.result);
                    } else {
                        this.getProjectProgressList(response.result._id);
                    }
                    this.toastr.success(`${response.message}. Now you can add gallery and videos`, 'Success');
                    // this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.spinnerService.hide();

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.spinnerService.hide();
                this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
            }
        }, (error) => {
            console.log('error', error);
        });
        // }

    }

    doTabFunctions(event) {
        this.selectedTab = event.nextId;
    }
 
    ////// VideoTab ///////
    deleteVideo(item, event, index) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete video?`)
            .then((confirmed) => {
                if (confirmed) {
                    var data: any = {};
                    data.videos = [];
                    data._id = this.formDetails._id;
                    let notSelectedList = [];
                    this.galleryVideoList.forEach(element => {
                        notSelectedList.push(Object.assign({}, element));
                    });
                    notSelectedList.splice(index, 1);
                    data.videos = notSelectedList;
                    let url = `purchaser-portal/progress-steps`;
                    this.spinnerService.show();
                    this.webService.post(url, data).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getProjectProgressList(this.formDetails._id);
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

    openAddVideoModal(template: TemplateRef<any>) {
        this.videoDetails = {
            video_type: '',
            url: '',
            video_id: '',
        };
        this.videoModalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addVideos() {
        let error = 0;
        if (!this.videoDetails.video_type) {
            this.toastr.warning('Please select video type', 'Warning');
            error++;
        }
        else if (!this.videoDetails.url) {
            this.toastr.warning('Please enter video url', 'Warning');
            error++;
        }

        else if (this.videoDetails.video_type == 'YOUTUBE') {
            var yId = this.getYoutubeId(this.videoDetails.url);
            if (yId) {
                this.videoDetails.video_id = yId;
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
            }
            else {
                error++;
                this.toastr.warning("Please enter valid vimeo URL", 'Warning!');
            }
        }

        if (error == 0) {

            var data: any = {};
            data.videos = [];
            if (this.galleryVideoList.length > 0) {
                data.videos = [...this.galleryVideoList];
            }
            data._id = this.formDetails._id;
            if (this.formDetails.hasOwnProperty('videos')) {
                data.videos.push(this.videoDetails);
            } else {
                data.videos.push(this.videoDetails);
            }
            let url = `purchaser-portal/progress-steps`;
            // console.log(data);
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getProjectProgressList(this.formDetails._id);
                    this.videoModalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }

    }

    uploadImage(files) {
        if(files.item(0)){
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.progressImage = files.item(0);
                this.getBase64(files.item(0));
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
            }
        }
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

    changeSelectedFile(item) {
        this.selectedFile = item;
        this.cdk.detectChanges();
    }

    ///// Gallery Tab ////
    async uploadProjectProgressPhoto(files: FileList, id) {
        if (files.length > 0) {
            // let url = `purchaser-portal/project-progress-photos`;
            const totalFiles = files.length;
            let validation = false;
            for (let i = 0; i < totalFiles; i++) {
                let projectPhoto = files[i];;
                validation = this.validateDocumentUpload(projectPhoto.name);
            }

            if (validation) {
                this.spinnerService.show();
                for (let i = 0; i < totalFiles; i++) {
                    let projectPhoto = files[i];
                    let formData = new FormData();
                    formData.append('file', projectPhoto);
                    formData.append('_id', id);
                    let response: any = await this.asyncImageUploading(formData);
                    if (i == (totalFiles - 1)) {
                        this.spinnerService.hide();
                        this.toastr.success(response.message, 'Success');
                        this.getProjectProgressList(id);
                    }
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }
        }
    }

    asyncImageUploading(formData) {
        let url = `purchaser-portal/project-progress-photos`;
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
                console.log("error ts: ", error);
            })
        });
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

    //DELETE GALLERY PHOTO
    deleteGalleryPhoto(photo, event, recordId) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/project-progress-photos?row_id=${recordId}&file_id=${photo._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getProjectProgressList(recordId);
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


    ////SETTINGS////
    openProjectProgressSettingModal(template: TemplateRef<any>) {
        this.formDetails = {};
        this.formDetails = {
            is_progress_enabled: this.selectedProject.is_progress_enabled ? this.selectedProject.is_progress_enabled : false,
            progress_label_text: this.selectedProject.progress_label_text ? this.selectedProject.progress_label_text : ''
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-md ', backdrop: 'static' });
    }

    updateSettingProgress() {
        if (!this.formDetails.progress_label_text) {
            this.toastr.warning('Please enter progress label text', 'Warning');
        }
        else {
            if (this.selectedProject._id) {
                let url = `purchaser-portal/project-settings?_id=${this.selectedProject._id}`;
                this.spinnerService.show();
                this.webService.post(url, this.formDetails).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.getProjectList();
                            this.toastr.success(response.message, 'Success');
                            this.modalRef.hide();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error('Your Session expired', 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: 'purchaser-admin' } });
                    }
                }, (error) => {
                    console.log('error', error);
                });
            }
            else {
                this.toastr.warning('Please select project', 'Warning');

            }
        }


    }

    onProjectChange(event) {
        this.page = 1;
        if (event.target.value) {
            let project = this.projectList.filter((element) => element._id == event.target.value);
            if (project && project.length > 0) {
                this.selectedProject = project[0];
                this.selectedProjectId = this.selectedProject._id;
                this.changeDetect.detectChanges();
            }
            this.getProjectProgressList();
            //    this.projectList.forEach(element => {
            //         if (element._id == event.target.value) {
            //             this.selectedProject = element;

            //         }
            //     })
        }
    }
}
