import { Component, Input, OnInit, TemplateRef, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
    selector: 'app-amenities',
    templateUrl: './amenities.component.html',
    styleUrls: ['./amenities.component.css']
})
export class AmenitiesComponent implements OnInit {
    @Input() projectData: any = {};
    @Output() updateProjectEvent: EventEmitter<any> = new EventEmitter();
    step: string = 'step1';
    // projectList: any[] = [];
    overlayVlaues: any[] = ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '90'];
    paginationObj: any = {};
    videoDetails: any = {};
    sortedtby: any = 'order';
    sortOrder: any = 'ASC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = 'order';
    modalRef: BsModalRef;
    videoModalRef: BsModalRef;
    sectionModalRef: BsModalRef;
    baseUrl = environment.BASE_URL;
    formDetails: any = {};
    projectAmenities: any[] = [];
    backgroundImage: any = '';
    isEdit: boolean = false;
    photo: any;
    galleryPhotoList: any[] = [];
    galleryVideoList: any[] = [];
    selectedTab: any = '';
    allMediaList: any = [];
    selectedFile: any = {};
    state: string = '#333';
    galleryImages: any[] = [];
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private changeDetect: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService,
        protected sanitizer: DomSanitizer,
    ) { }
    ngOnInit(): void {
    }
    ngOnChanges() {
        this.getSavedFilterdata();
        this.getProjectAmenitiesList();
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
    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('ProjectAmenitiesFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
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
    }
    //AMENITES LIST
    getProjectAmenitiesList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `projects/amenities-sections?project_id=${this.projectData._id}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        this.webService.get(url).subscribe((response: any) => {
            // console.log('response', response);
            this.spinnerService.hide();
            this.projectAmenities=[];
            if (response.status == 1) {
                this.projectAmenities = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages >1? this.paginationObj.totalPages-1 :1;
                    this.getProjectAmenitiesList()  
                } 
                //   this.projectAmenities.forEach((ele,index)=>{
                //       ele.order=index;
                //   })            
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
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    doPaginationWise(page) {
        this.page = page;
        this.getProjectAmenitiesList();
    }
    setPageSize() {
        this.page = 1;
        this.getProjectAmenitiesList();
    }
    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
        }
        localStorage.setItem('ProjectAmenitiesFilterData', JSON.stringify(data));
    }

    reArrangeAmenities(direction, index) {
        if (direction == 'up') {
            let previous = { ...this.projectAmenities[index - 1] };
            let current = { ...this.projectAmenities[index] };
            let payload = {
                data: [
                    {
                        _id: previous._id,
                        order: previous.order + 1
                    },
                    {
                        _id: current._id,
                        order: current.order - 1
                    }
                ]
            }
            this.onStepChange(payload);
        }
        else if (direction == 'down') {
            let next = { ... this.projectAmenities[index + 1] };
            let current = { ...this.projectAmenities[index] };
            let payload = {
                data: [
                    {
                        _id: next._id,
                        order: next.order - 1
                    },
                    {
                        _id: current._id,
                        order: current.order + 1
                    }
                ]
            }
            this.onStepChange(payload);
        }
    }
    onStepChange(data) {
        console.log(data);
        this.spinnerService.show();
        let url = `projects/amenities-sections-rearrange`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectAmenitiesList();
            }
            else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //ADD AMENITIES
    addAmenities() {
        if (this.formDetails.section_type == 'INTRO_SECTION_1' || this.formDetails.section_type == 'INTRO_SECTION_2') {
            if(!this.formDetails.title && !this.formDetails.sub_title && !this.formDetails.body){
                this.toastr.warning('Please enter title or subtitle or body', 'Warning');
                return false;
            }
        }
        if (this.formDetails.section_type == 'IMAGE_GALLERY' || this.formDetails.section_type == 'SLIDER') {
            if(!this.formDetails.title){
                this.toastr.warning('Please enter title', 'Warning');
                return false;
            }
        }
        var amenityObj: any = {};
        amenityObj.order = this.projectAmenities.length;
        // let selectedProject = this.projectList.find((project) => project._id == this.projectData._id);
        amenityObj.project_name = this.projectData.name || '';
        if (this.formDetails.section_type == 'INTRO_SECTION_1') {
            amenityObj.background_type = this.formDetails.background_type || '';
            amenityObj.body = this.formDetails.body || '';
            amenityObj.content_alignment = this.formDetails.content_alignment || '';
            amenityObj.overlay = this.formDetails.overlay || false;
            if (amenityObj.overlay) {
                amenityObj.overlay_capacity = this.formDetails.overlay_capacity || '';
                amenityObj.overlay_color = this.formDetails.overlay_color || '';
            }
            amenityObj.parallex = this.formDetails.parallex || false;
            amenityObj.project_id = this.formDetails.project_id || ''
            amenityObj.section_type = this.formDetails.section_type || ''
            amenityObj.show_body = this.formDetails.show_body || false;
            amenityObj.show_subtitle = this.formDetails.show_subtitle || false;
            amenityObj.show_title = this.formDetails.show_title || false;
            amenityObj.sub_title = this.formDetails.sub_title || '';
            amenityObj.text_color = this.formDetails.text_color || '';
            amenityObj.title = this.formDetails.title || '';
            if (this.formDetails.background_type == 'BACKGROUND_VIDEO') {
                amenityObj.background_video = this.videoDetails ? this.videoDetails : {}
            }
            if (this.formDetails.background_type == 'BACKGROUND_COLOR') {
                amenityObj.background_color = this.formDetails ? this.formDetails.background_color : '';
            }
            if (!this.formDetails.overlay) {
                amenityObj.overlay_oapacity ? delete amenityObj.overlay_oapacity : true;
                amenityObj.overlay_color ? delete amenityObj.overlay_color : true;
            }
        }
        if (this.formDetails.section_type == 'INTRO_SECTION_2') {
            amenityObj.body = this.formDetails.body || '';
            amenityObj.show_body = this.formDetails.show_body || false;
            amenityObj.content_alignment = this.formDetails.content_alignment || '';
            amenityObj.project_id = this.formDetails.project_id || ''
            amenityObj.section_type = this.formDetails.section_type || ''
            amenityObj.show_title = this.formDetails.show_title || false;
            // amenityObj.show_subtitle=  this.formDetails.show_subtitle || false;
            // amenityObj.sub_title=  this.formDetails.sub_title || '';
            amenityObj.text_color = this.formDetails.text_color || '';
            // amenityObj.button_text = this.formDetails.button_text || '';
            amenityObj.show_button = this.formDetails.show_button || false;
            amenityObj.title = this.formDetails.title || '';
        }
        if (this.formDetails.section_type == 'IMAGE_GALLERY') {
            amenityObj.project_id = this.formDetails.project_id || ''
            amenityObj.section_type = this.formDetails.section_type || '';
            amenityObj.show_title = this.formDetails.show_title || false;
            // amenityObj.text_color= this.formDetails.text_color || '';
            amenityObj.title = this.formDetails.title || '';
        }
        if (this.formDetails.section_type == 'SLIDER') {
            amenityObj.project_id = this.formDetails.project_id || ''
            amenityObj.section_type = this.formDetails.section_type || ''
            amenityObj.title = this.formDetails.title || '';
            amenityObj.show_title = this.formDetails.show_title || false;
        }
        // console.log('amenityObj', amenityObj);
        // console.log('galleryImages', this.galleryImages);
        let url = `projects/amenities-sections`;
        this.spinnerService.show();
        this.webService.post(url, amenityObj).subscribe((response: any) => {
            if (response.is_valid_session) {
                this.spinnerService.hide();
                if (response.status == 1) {
                    if ((this.backgroundImage || this.galleryImages) && response.result) {
                        if (this.formDetails.section_type == 'INTRO_SECTION_1') {
                            var formData = new FormData();
                            formData.append('_id', response.result._id);
                            formData.append('file', this.backgroundImage);
                            formData.append('update_type', 'image');
                            formData.append('attribute_name', 'background_image');
                            this.uploadBackgroundImage(formData);
                        }
                        if (this.formDetails.section_type == 'INTRO_SECTION_2') {
                            var formData = new FormData();
                            formData.append('_id', response.result._id);
                            formData.append('file', this.backgroundImage);
                            formData.append('update_type', 'image');
                            formData.append('attribute_name', 'grid_image');
                            this.uploadBackgroundImage(formData);
                        }
                        if (this.formDetails.section_type == 'IMAGE_GALLERY') {
                            if (this.galleryImages && this.galleryImages.length > 0) {
                                this.uploadGalleryImages(response.result._id);
                            }
                        }
                        if (this.formDetails.section_type == 'SLIDER') {
                            if (this.galleryImages && this.galleryImages.length > 0) {
                                this.uploadGalleryImages(response.result._id);
                            }
                        }
                    } else {
                        this.getProjectAmenitiesList();
                        this.toastr.success(response.message, 'Success');
                        this.sectionModalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.spinnerService.hide();
                    this.sectionModalRef.hide();
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.spinnerService.hide();
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            this.sectionModalRef.hide();
            console.log('error', error);
        });
    }
    //UPDATE AMENITIES
    openEditAmenitiesModal(template: TemplateRef<any>, item, index) {
        this.step = 'step2';
        this.formDetails = Object.assign({}, item);
        this.formDetails.index = index;
        this.isEdit = true;
        this.backgroundImage = '';
        this.galleryImages = [];
        // console.log('item', item);
        if (this.formDetails.background_type == 'BACKGROUND_VIDEO') {
            this.videoDetails = this.formDetails.background_video ? this.formDetails.background_video : {};
        }
        if (this.formDetails.overlay) {
            this.formDetails.overlay_oapacity = item.overlay_oapacity;
            this.formDetails.overlay_color = item.overlay_color;
        }
        else {
            this.formDetails.overlay_oapacity = '';
            this.formDetails.overlay_color = '';
        }
        if (this.formDetails.section_type == 'INTRO_SECTION_1') {
            if (this.formDetails.background_image) {
                this.formDetails.layout = '';
            }
        }
        if (this.formDetails.section_type == 'INTRO_SECTION_2') {
            if (this.formDetails.grid_image) {
                this.formDetails.layout = '';
            }
        }
        if (this.formDetails.section_type == 'IMAGE_GALLERY') {
            if (this.formDetails.gallery) {
                this.formDetails.layouts = this.formDetails.gallery;
            }
        }
        if (this.formDetails.section_type == 'SLIDER') {
            if (this.formDetails.gallery) {
                this.formDetails.layouts = this.formDetails.gallery;
            }
        }
        this.sectionModalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });
    }

    updateAmenities() {
        if (this.formDetails.section_type == 'INTRO_SECTION_1' || this.formDetails.section_type == 'INTRO_SECTION_2') {
            if(!this.formDetails.title && !this.formDetails.sub_title && !this.formDetails.body){
                this.toastr.warning('Please enter title or subtitle or body', 'Warning');
                return false;
            }
        }
        if (this.formDetails.section_type == 'IMAGE_GALLERY' || this.formDetails.section_type == 'SLIDER') {
            if(!this.formDetails.title){
                this.toastr.warning('Please enter title', 'Warning');
                return false;
            }
        }
        var amenityObj: any = {};
        amenityObj._id = this.formDetails._id;
        if (this.formDetails.section_type == 'INTRO_SECTION_1') {
            amenityObj.background_type = this.formDetails.background_type || '';
            amenityObj.body = this.formDetails.body || '';
            amenityObj.content_alignment = this.formDetails.content_alignment || '';
            amenityObj.overlay = this.formDetails.overlay || false;
            if (amenityObj.overlay) {
                amenityObj.overlay_capacity = this.formDetails.overlay_capacity || '';
                amenityObj.overlay_color = this.formDetails.overlay_color || '';
            }
            amenityObj.parallex = this.formDetails.parallex || false;
            amenityObj.show_body = this.formDetails.show_body || false;
            amenityObj.show_subtitle = this.formDetails.show_subtitle || false;
            amenityObj.show_title = this.formDetails.show_title || false;
            amenityObj.sub_title = this.formDetails.sub_title || '';
            amenityObj.text_color = this.formDetails.text_color || '';
            amenityObj.title = this.formDetails.title || '';
            if (this.formDetails.background_type == 'BACKGROUND_VIDEO') {
                amenityObj.background_video = this.videoDetails ? this.videoDetails : {}
            }
            if (this.formDetails.background_type == 'BACKGROUND_COLOR') {
                amenityObj.background_color = this.formDetails ? this.formDetails.background_color : '';
            }
            if (!this.formDetails.overlay) {
                amenityObj.overlay_oapacity ? delete amenityObj.overlay_oapacity : true;
                amenityObj.overlay_color ? delete amenityObj.overlay_color : true;
            }
        }
        if (this.formDetails.section_type == 'INTRO_SECTION_2') {
            amenityObj.body = this.formDetails.body || '';
            amenityObj.show_body = this.formDetails.show_body || false;
            amenityObj.content_alignment = this.formDetails.content_alignment || '';
            amenityObj.show_title = this.formDetails.show_title || false;
            amenityObj.text_color = this.formDetails.text_color || '';
            // amenityObj.button_text = this.formDetails.button_text || '';
            amenityObj.show_button = this.formDetails.show_button || false;
            amenityObj.title = this.formDetails.title || '';
        }
        if (this.formDetails.section_type == 'IMAGE_GALLERY') {
            amenityObj.title = this.formDetails.title || '';
            amenityObj.show_title = this.formDetails.show_title || false;
        }
        if (this.formDetails.section_type == 'SLIDER') {
            amenityObj.title = this.formDetails.title || '';
            amenityObj.show_title = this.formDetails.show_title || false;
        }
        console.log('amenityObj', amenityObj);
        console.log('galleryImages', this.galleryImages);
        let url = `projects/amenities-sections`;
        this.spinnerService.show();
        this.webService.post(url, amenityObj).subscribe((response: any) => {
            if (response.is_valid_session) {
                this.spinnerService.hide();
                if (response.status == 1) {
                    if ((this.backgroundImage || this.galleryImages.length > 0) && response.result) {
                        if (this.formDetails.section_type == 'INTRO_SECTION_1' && this.backgroundImage) {
                            var formData = new FormData();
                            formData.append('_id', this.formDetails._id);
                            formData.append('file', this.backgroundImage);
                            formData.append('update_type', 'image');
                            formData.append('attribute_name', 'background_image');
                            this.uploadBackgroundImage(formData);
                        }
                        if (this.formDetails.section_type == 'INTRO_SECTION_2' && this.backgroundImage) {
                            var formData = new FormData();
                            formData.append('_id', this.formDetails._id);
                            formData.append('file', this.backgroundImage);
                            formData.append('update_type', 'image');
                            formData.append('attribute_name', 'grid_image');
                            this.uploadBackgroundImage(formData);
                        }
                        if (this.formDetails.section_type == 'IMAGE_GALLERY') {
                            if (this.galleryImages && this.galleryImages.length > 0) {
                                this.uploadGalleryImages(this.formDetails._id);
                            }
                        }
                        if (this.formDetails.section_type == 'SLIDER') {
                            if (this.galleryImages && this.galleryImages.length > 0) {
                                this.uploadGalleryImages(this.formDetails._id);
                            }
                        }
                    } else {
                        this.getProjectAmenitiesList();
                        this.toastr.success(response.message, 'Success');
                        this.sectionModalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.spinnerService.hide();
                    this.sectionModalRef.hide();
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.spinnerService.hide();
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            this.sectionModalRef.hide();
            console.log('error', error);
        });
    }

    //DELETE PROJECT AMENITES
    deleteprojectAmenities(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete this amenities?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/amenities-sections?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getProjectAmenitiesList();
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


    //CHANGE STATUS
    updateProjectAmenitiesStatus() {
        let url = `projects/projects?_id=${this.projectData._id}`;
        let data: any = {};
        data.amenities_enabled = this.projectData.amenities_enabled ? true : false;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.show();
            console.log('error', error);
        });
    }
    getProjectDetails() {
        this.updateProjectEvent.emit();
    }


    //// ADD SECTION ////
    openAddSectionModal(template: TemplateRef<any>) {
        this.step = 'step1';
        this.isEdit = false;
        this.formDetails = {
            project_id: this.projectData._id,
            section_type: '',
            text_color: '',
            background_color: '',
            overlay_color: '',
            content_alignment:'center'

        };
        this.videoDetails = {};
        this.galleryImages = []
        this.sectionModalRef = this.modalService.show(template, { class: 'modal-lg ', backdrop: 'static' });
    }
    addSection() {
        this.step = 'step2';
    }
    addSectionBack() {
        this.step = 'step1';
    }
    
    onSectionSelection(type) {
        this.formDetails = {
            project_id: this.projectData._id,
            section_type: '',
            text_color: '',
            background_color: '',
            overlay_color: '',
            layout: '',
            layouts: [],
            content_alignment:'center'
        };
        this.videoDetails = {};
        this.galleryImages = []
        this.formDetails.section_type = type;
    }
    changeComplete(data: any): void {
        this.formDetails.background_color = data || '';
    }
    changeTextComplete(data: any): void {
        this.formDetails.text_color =data || '';
    }
    changeOverlayComplete(data: any): void {
        this.formDetails.overlay_color =data || '';
    }
    onEventLog(data: any): void {
        this.formDetails.text_color = data || '';
    }


    //ADD VIDEO
    openAddVideoModal(template: TemplateRef<any>) {
        this.videoDetails = {
            video_type: '',
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
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
        else if (this.videoDetails.video_type == 'MP4' && !this.validateMP4(this.videoDetails.url)) {
            error++;
            this.toastr.warning("Please enter valid mp4 URL", 'Warning!');
        }
        if (error == 0) {
            this.formDetails.background_video = this.videoDetails;
            this.modalRef.hide();
        }
    }
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
    //UPLOAD BACKGROUND IMAGE
    uploadImage(files) {
        if (files.item(0)) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.backgroundImage = files.item(0);
                this.getBase64(files.item(0));
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
    uploadBackgroundImage(formData) {
        let url = `projects/amenities-sections`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.backgroundImage = '';
                        this.sectionModalRef.hide();
                        this.getProjectAmenitiesList();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `projects` } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //DELETE GALLERY PHOTO
    deleteGalleryPhoto(photo, event, recordId) {
        event.stopPropagation();
        // this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
        //     .then((confirmed) => {
        //         if (confirmed) {
        //             let url = `purchaser-portal/project-progress-photos?row_id=${recordId}&file_id=${photo._id}`;
        //             this.spinnerService.show();
        //             this.webService.delete(url).subscribe((response: any) => {
        //                 this.spinnerService.hide();
        //                 if (response.status == 1) {
        //                     this.toastr.success(response.message, 'Success');
        //                     this.getProjectProgressList(recordId);
        //                 } else {
        //                     this.toastr.error(response.message, 'Error');
        //                 }
        //             }, (error) => {
        //                 console.log('error', error);
        //             });
        //         }
        //     })
        //     .catch((error) => { });
    }

    openViewModalBox(template, item) {
        this.allMediaList = [];
        if (item.hasOwnProperty('background_image')) {
            this.allMediaList.push(item.background_image);
        }
        //   if (item.hasOwnProperty('gallery')) {
        //       item.gallery.forEach(img => {
        //           this.allMediaList.push(img);
        //       });
        //   }
        //   if (item.hasOwnProperty('videos')) {
        //       item.videos.forEach(video => {
        //           if (video.video_type == 'VIMEO') {
        //               video.url = `https://player.vimeo.com/video/${video.video_id}`;
        //           }
        //           if (video.video_type == 'YOUTUBE') {
        //               video.url = `https://www.youtube.com/embed/${video.video_id}`;
        //           }
        //           video.showing_url = this.sanitizer.bypassSecurityTrustResourceUrl(video.url);
        //           this.allMediaList.push(video);
        //       });
        //   }
        this.selectedFile = this.allMediaList[0];
        console.log(this.selectedFile);
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });
    }
    changeSelectedFile(item) {
        this.selectedFile = item;
        this.changeDetect.detectChanges();
    }

    //  SECTION 2 FUNCTIONALITY
    uploadGridImage(files) {
        if (files.item(0)) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.backgroundImage = files.item(0);
                this.getBase64(files.item(0));
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
            }
        }
    }
    deleteImage(image, index) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete image?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/amenities-sections-image?attribute_name=gallery&file_id=${image._id}&_id=${this.formDetails._id}`;
                    console.log(url);
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.formDetails.layouts.splice(index, 1);
                            this.getProjectAmenitiesList();
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
    //  SECTION 3 -GALLERY FUNCTIONALITY
    uploadGalleryImage(files: FileList) {
        if (files.length > 0) {
            // let validation = this.validateDocumentUpload(files.item(0).name);
            const totalFiles = files.length;
            let validation = false;
            for (let i = 0; i < totalFiles; i++) {
                let image = files[i];
                validation = this.validateDocumentUpload(image.name);
                if (validation) {
                    this.galleryImages.push(image);
                    this.getGalleryBase64(image);
                } else {
                    this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
                }
            }
        }
    }
    //FILE UPLAOD TO BASE64 CONVERSION
    getGalleryBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (this.formDetails.layouts && this.formDetails.layouts.length > 0) {
                this.formDetails.layouts.push(reader.result);
            }
            else {
                this.formDetails.layouts = [];
                this.formDetails.layouts.push(reader.result);
            }
            // console.log('this.formDetails.layout', this.formDetails.layout);
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }
    async uploadGalleryImages(_id) {
        let totalFiles = this.galleryImages.length;
        for (let i = 0; i < totalFiles; i++) {
            let image = this.galleryImages[i];
            let formData = new FormData();
            formData.append('_id', _id);
            formData.append('file', image);
            formData.append('update_type', 'image');
            formData.append('attribute_name', 'gallery');
            this.spinnerService.show();
            let response: any = await this.asyncImageUploading(formData);
            if (i == (totalFiles - 1)) {
                this.spinnerService.hide();
                this.toastr.success(response.message, 'Success');
                this.galleryImages = [];
                this.formDetails.layouts = [];
                this.sectionModalRef.hide();
                this.getProjectAmenitiesList();
            }
        }
    }
    asyncImageUploading(formData) {
        let url = `projects/amenities-sections`;
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
        })
    }
    //REMOVE IMAGE
    removeImage(index) {
        this.formDetails.layouts.splice(index, 1);
        this.galleryImages.splice(index, 1);
    }
}
