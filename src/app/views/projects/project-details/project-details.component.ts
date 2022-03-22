import { Component, OnInit, TemplateRef, Input, DoCheck, NgZone, ɵConsole } from '@angular/core';
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
import { Lightbox } from 'ngx-lightbox';
import FroalaEditor from 'froala-editor';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

@Component({
    selector: 'app-project-details',
    templateUrl: './project-details.component.html',
    styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    phone = new FormGroup({
        contact_phone: new FormControl(undefined, [Validators.required])
    });
    projectId: any;
    projectDetailsObj: any = {};
    baseUrl = environment.BASE_URL;
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    paginationObj: any = {};
    builderList: any = [];
    subdivisionList: any = [];
    legalDocumentList: any = [];
    marketingDocumentList: any = [];
    isEdit: boolean = false;
    modalRef: BsModalRef;
    formDetails: any = {};
    videoDetails: any = {};
    videoArray: any = [];
    docFormDetails: any = {};
    mediaPhotoList: any = [];
    mediaVideoList: any = [];
    photoGallery: any = [];
    public uploadedPhoto: boolean = false;
    projectLogo: any;
    modalEditSection: any;
    documentType: any;
    projectDocument: any;
    defaultActiveTab: any = 'generalTab';
    selectedPhotoPath: any = {};
    selectedVideoPath: any = {};
    selectedDocument: any = {};
    getFeaturesDocument: any[] = [];
    isSubdivisionDisabled: boolean = false;
    protocol: string = '';

    constructor(
        public _activatedRoute: ActivatedRoute,
        private ngZone: NgZone,
        private httpClient: HttpClient,
        private lightbox: Lightbox,
        private FileSaverService: FileSaverService,
        protected sanitizer: DomSanitizer,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
        if (localStorage.getItem('projectDetailsActiveTab')) {
            this.defaultActiveTab = localStorage.getItem('projectDetailsActiveTab');
        }
        FroalaEditor('div#froala-editor-div', {
            enter: FroalaEditor.ENTER_DIV,
            height: 'calc(100vh - 55px)'
        });
        this.checkLogin();
    }


    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {

            if (response.success) {

                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                }
                else {
                    this.projectId = this._activatedRoute.snapshot.paramMap.get("projectId");
                    this.getProjectDetails();
                    if (this.defaultActiveTab == 'documentsTab') {
                        // this.getDocumentList();
                        this.getMarketingDocumentList();
                        this.getLegalDocumentList();
                    }
                    if (this.defaultActiveTab == 'mediaTab') {
                        this.getMediaList();
                    }
                    if (this.defaultActiveTab == 'featureTab') {
                        this.getFeaturesDocumentList();
                    }
                    if (this.defaultActiveTab == 'settingTab') {

                    }
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }

        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    doTabFunctions(event) {
        if (event.nextId == 'generalTab') {
            localStorage.setItem('projectDetailsActiveTab', 'generalTab');
        }
        if (event.nextId == 'featureTab') {
            localStorage.setItem('projectDetailsActiveTab', 'featureTab');
            this.getFeaturesDocumentList();
            // this.formDetails = { ...this.projectDetailsObj };
        }
        if (event.nextId == 'documentsTab') {
            // this.getDocumentList();
            this.getMarketingDocumentList();
            this.getLegalDocumentList();

            localStorage.setItem('projectDetailsActiveTab', 'documentsTab');
        }
        if (event.nextId == 'amenitiesTab') {
            localStorage.setItem('projectDetailsActiveTab', 'amenitiesTab');

        }
        if (event.nextId == 'mediaTab') {
            this.getMediaList();
            localStorage.setItem('projectDetailsActiveTab', 'mediaTab');
        }
        if (event.nextId == 'settingTab') {
            localStorage.setItem('projectDetailsActiveTab', 'settingTab');

        }

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

    public featureNonInlineEdit: Object = {
        attribution: false,
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
    //INLINE EDITOR OPTIONS
    public inlineEdit: Object = {
        toolbarInline: true,
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

    deleteProject() {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete project ${this.projectDetailsObj.name}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/projects?_id=${this.projectDetailsObj._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.router.navigate(['/projects']);
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    ///////////////////////////////////////////////////////
    //////////////// For General Tab///////////////////////
    ///////////////////////////////////////////////////////
    getProjectDetails() {
        let url = `projects/projects?_id=${this.projectId}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectDetailsObj = response.result;
                if (localStorage.getItem('projectDetailsActiveTab') == 'featureTab') {
                    this.formDetails = { ...this.projectDetailsObj };
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openEditBasicModal(template: TemplateRef<any>) {
        this.getBuilderList();
        this.projectLogo = '';
        this.formDetails = Object.assign({}, this.projectDetailsObj);
        this.isSubdivisionDisabled = this.formDetails.subdivision_id ? true : false;
        this.getSubdivisionList(this.formDetails.builder_id);
        if (this.formDetails.contact_phone && this.formDetails.contact_phone.number) {
            this.phone.controls.contact_phone.setValue({
                "number": this.formDetails.contact_phone.number,
            });
        }
        if (this.projectDetailsObj.construction_start_date) {
            this.formDetails.construction_start_date = this.projectDetailsObj.construction_start_date ? moment(this.projectDetailsObj.construction_start_date).format('YYYY-MM-DD') : '';
        }

        if (this.projectDetailsObj.estimated_completion_date) {
            this.formDetails.estimated_completion_date = this.projectDetailsObj.estimated_completion_date ? moment(this.projectDetailsObj.estimated_completion_date).format('YYYY-MM-DD') : '';

        }
        if (this.projectDetailsObj.contact_website) {
            let str = this.projectDetailsObj.contact_website;

            if (str && (str.indexOf("https://") == 0)) {
                this.protocol = 'https://';
            }
            else if (str && (str.indexOf("http://") == 0)) {
                this.protocol = 'http://';
            }
            else {
                this.protocol = 'https://';
            }
            let domain = str.replace("https://", '');
            domain = domain.replace("http://", '');
            this.formDetails.contact_website = domain;
        }
        else {
            this.protocol = 'https://';
        }
        this.formDetails.default_cooling_period = 10;
        this.formDetails.project_address = this.projectDetailsObj.project_address ? Object.assign({}, this.projectDetailsObj.project_address) : {};
        this.formDetails.office_address = this.projectDetailsObj.office_address ? Object.assign({}, this.projectDetailsObj.office_address) : {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    
    getBuilderList() {
        this.spinnerService.show();
        let url = `projects/builders?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.builderList = response.results;
            } else {
                this.builderList = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getSubdivisionList(builder_id) {
        this.spinnerService.show();
        let url = `projects/subdivisions?page=1&pageSize=100&builder_id=${builder_id}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.subdivisionList = response.results;
            } else {
                this.subdivisionList = [];
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    
    editProjectBasic() {
        const pcodeVal = this.formDetails.project_code ? this.formDetails.project_code.toUpperCase() : '';
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        // var urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var projectCodeReg = /^[A-Z0-9-\.]{4,16}$/ // /^[A-Z0-9^\s]{4}$/;
        var websiteReg = /((?:https?\:\/\/)(?:[-a-z0-9]+\.)*[-a-z0-9]+.*)/i;
        // let website = `https://${this.formDetails.contact_website}`;
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
            this.toastr.warning('Please enter project name', 'Warning');
        }
        // else if (!this.formDetails.project_id) {
        //     this.toastr.warning('Please enter project id', 'Warning');
        // }
        // else if (!this.formDetails.project_code) {
        //     this.toastr.warning('Please enter project code', 'Warning');
        // }
        else if (!this.formDetails.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
        }
        else if (pcodeVal && !projectCodeReg.test(pcodeVal)) {
            this.toastr.warning('Please enter valid project code. It can be alphanumeric, should contain  4-16  characters and no spaces, spcial characters, eg.LSD6,JHGS', 'Warning');
        }

        else if (this.formDetails.contact_email && !reg.test(this.formDetails.contact_email)) {
            this.toastr.warning('Please enter valid project contact email', 'Warning');
        }

        else if (this.formDetails.contact_website && !websiteReg.test(website)) {
            this.toastr.warning('Please enter valid project contact website', 'Warning');
        }
        // else if (this.formDetails.default_cooling_period && this.formDetails.default_cooling_period < 0) {
        //     this.toastr.warning('Please enter default cooling period greater than 0 or equal to 0', 'Warning');
        // }
        else {
            var projectObj: any = {};
            if (this.phone.value && this.phone.value.contact_phone) {
                let phoneObj = {
                    number: this.phone.value.contact_phone.e164Number,
                    formatted: this.phone.value.contact_phone.nationalNumber,
                }
                projectObj.contact_phone = phoneObj;
            }
            projectObj.name = this.formDetails.name.trim();
            // projectObj.project_id = this.formDetails.project_id.trim();
            projectObj.project_code = this.formDetails.project_code ? this.formDetails.project_code.trim() :'';
            projectObj.phase = this.formDetails.phase ? this.formDetails.phase.trim() : '';
            projectObj.status = this.formDetails.status ? this.formDetails.status.trim() : '';
            //   this.builderList.forEach(item => {
            //     if (item._id == this.formDetails.builder_id) {
            //       projectObj.builder_id = item._id;
            //       projectObj.builder_name = item.name;
            //     }
            //   });
            this.subdivisionList.forEach(item => {
                if (item._id == this.formDetails.subdivision_id) {
                    projectObj.subdivision_id = item._id;
                    projectObj.subdivision_name = item.name;
                }
            });
            projectObj.contact_name = this.formDetails.contact_name ? this.formDetails.contact_name.trim() : '';
            projectObj.contact_email = this.formDetails.contact_email ? this.formDetails.contact_email.trim().toLowerCase() : '';
            projectObj.contact_website = website ? website.trim() : '';
            projectObj.description = this.formDetails.description || '';
            projectObj.construction_start_date = this.formDetails.construction_start_date ? moment(this.formDetails.construction_start_date).format('YYYY-MM-DD') : '';
            projectObj.estimated_completion_date = this.formDetails.estimated_completion_date ? moment(this.formDetails.estimated_completion_date).format('YYYY-MM-DD') : '';
            // projectObj.default_cooling_period = this.formDetails.default_cooling_period || '';
            // projectObj.address = this.formDetails.address;
            var { city, country, state, street1, street2, zip } = this.formDetails.project_address;
            projectObj.project_address = {
                city: city || '',
                country: country || '',
                state: state || '',
                street1: street1 || '',
                street2: street2 || '',
                zip: zip || ''
            }
            var { city, country, state, street1, street2, zip } = this.formDetails.office_address;
            projectObj.office_address = {
                city: city || '',
                country: country || '',
                state: state || '',
                street1: street1 || '',
                street2: street2 || '',
                zip: zip || ''
            }
            let url = `projects/projects?_id=${this.projectId}`;
            // console.log('data', projectObj);
            this.spinnerService.show();
            this.webService.post(url, projectObj).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getProjectDetails();
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }

    validateProjectCode() {
        const val = this.formDetails.project_code ? this.formDetails.project_code.toUpperCase() : '';
        var projectCodeReg = /^[A-Z0-9-\.]{4,16}$/ // /^[A-Z0-9^\s]{4}$/;
        if (val && projectCodeReg.test(val) == false) {
            this.toastr.warning('Please enter valid project code. It can be alphanumeric, should contain 4-16 characters and no spaces, spcial characters, eg.LSD6,JHGS', 'Warning');
        }
    }

    uploadProjectLogo(e) {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            this.spinnerService.show();
            let validation = this.validatePhoto(selectedFile.name);
            if (validation) {
                var formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('update_type', 'logo');
                let url = `projects/projects?_id=${this.projectId}`;
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.success) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.getProjectDetails();
                            }
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `projects/project/${this.projectId}` } });
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

    openEditDescriptionModal(template: TemplateRef<any>) {
        this.formDetails = { ...this.projectDetailsObj };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updateDescription() {
        let data = {
            _id: this.formDetails._id,
            description: this.formDetails.description
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //// Unit/Lot Information ////
    openEditUniInfoModal(template: TemplateRef<any>) {
        // this.formDetails = { ...this.projectDetailsObj };
        this.formDetails._id = this.projectDetailsObj._id;
        if (this.projectDetailsObj.additional_info) {
            this.formDetails.condominium = {
                "type": "condominium",
                "total_units": this.projectDetailsObj.additional_info[0].total_units ? this.projectDetailsObj.additional_info[0].total_units : 0,
                "total_floors": this.projectDetailsObj.additional_info[0].total_floors ? this.projectDetailsObj.additional_info[0].total_floors : 0
            };
            this.formDetails.townhouse = {
                "type": "townhouse",
                "total_buildings": this.projectDetailsObj.additional_info[1].total_buildings ? this.projectDetailsObj.additional_info[1].total_buildings : 0,
                "total_homes": this.projectDetailsObj.additional_info[1].total_homes ? this.projectDetailsObj.additional_info[1].total_homes : 0
            };
            this.formDetails.semiDetached = {
                "type": "semi-detached",
                "total_units": this.projectDetailsObj.additional_info[2].total_units ? this.projectDetailsObj.additional_info[2].total_units : 0,
                "total_homes": this.projectDetailsObj.additional_info[2].total_homes ? this.projectDetailsObj.additional_info[2].total_homes : 0
            };
            this.formDetails.detached = {
                "type": "detached",
                "total_units": this.projectDetailsObj.additional_info[3].total_units ? this.projectDetailsObj.additional_info[3].total_units : 0,
                "total_floors": this.projectDetailsObj.additional_info[3].total_floors ? this.projectDetailsObj.additional_info[3].total_floors : 0
            };
        } else {
            this.formDetails.condominium = {
                "type": "condominium",
                "total_units": 0,
                "total_floors": 0
            };
            this.formDetails.townhouse = {
                "type": "townhouse",
                "total_buildings": 0,
                "total_homes": 0
            };
            this.formDetails.semiDetached = {
                "type": "semi-detached",
                "total_units": 0,
                "total_homes": 0
            };
            this.formDetails.detached = {
                "type": "detached",
                "total_units": 0,
                "total_floors": 0
            };
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    updateAdditionalInfo() {
        // if (!this.formDetails.condominium.total_units) {
        //     this.toastr.warning('Please enter total number of units/Lots', 'Warning');
        // }
        // else if (this.formDetails.condominium.total_units < 0) {
        //     this.toastr.warning('Total number of units/Lots should be integer', 'Warning');
        // }
        // else if (!this.formDetails.condominium.total_floors) {
        //     this.toastr.warning('Please enter total number of floors', 'Warning');
        // }
        // else if (this.formDetails.condominium.total_floors < 0) {
        //     this.toastr.warning('Total number floors should be integer', 'Warning');
        // }
        // else if (!this.formDetails.townhouse.total_buildings) {
        //     this.toastr.warning('Please enter total number of buildings', 'Warning');
        // }
        // else if (this.formDetails.townhouse.total_buildings < 0) {
        //     this.toastr.warning('Total number of buildings should be integer', 'Warning');
        // }
        // else if (!this.formDetails.townhouse.total_homes) {
        //     this.toastr.warning('Please enter total number of homes', 'Warning');
        // }
        // else if (this.formDetails.townhouse.total_homes < 0) {
        //     this.toastr.warning('Total number homes should be integer', 'Warning');
        // }
        // else if (!this.formDetails.semiDetached.total_units) {
        //     this.toastr.warning('Please enter total number of units/Lots', 'Warning');
        // }
        // else if (this.formDetails.semiDetached.total_units < 0) {
        //     this.toastr.warning('Total number of units/Lots should be integer', 'Warning');
        // }
        // else if (!this.formDetails.semiDetached.total_homes) {
        //     this.toastr.warning('Please enter total number of homes', 'Warning');
        // }
        // else if (this.formDetails.semiDetached.total_homes < 0) {
        //     this.toastr.warning('Total number homes should be integer', 'Warning');
        // }
        // else if (!this.formDetails.detached.total_units) {
        //     this.toastr.warning('Please enter total number of units/Lots', 'Warning');
        // }
        // else if (this.formDetails.detached.total_units < 0) {
        //     this.toastr.warning('Total number of units/Lots should be integer', 'Warning');
        // }
        // else {
        let additionalInfo = [];
        additionalInfo.push(this.formDetails.condominium);
        additionalInfo.push(this.formDetails.townhouse);
        additionalInfo.push(this.formDetails.semiDetached);
        additionalInfo.push(this.formDetails.detached);
        let data = {
            _id: this.formDetails._id,
            additional_info: additionalInfo
        }
        // console.log(data);
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
        // }
    }

    /// Manage Spaces ///
    openEditSpaceModal(template: TemplateRef<any>) {
        this.formDetails = { ...this.projectDetailsObj };
        this.formDetails.spaces = (this.formDetails.spaces && this.formDetails.spaces.length > 0) ? this.formDetails.spaces : [];
        this.formDetails.space = '';
        // if (this.formDetails.spaces) {
        //     let space = '';
        //     this.formDetails.spaces.forEach(element => {
        //         space += `${element}\n`;
        //     });
        //     this.formDetails.spaces = space;
        // }
        this.modalRef = this.modalService.show(template, { class: 'modal-md space-views-list-modal', backdrop: 'static' });
    }

    addSpaces() {
        if (!this.formDetails.space || !this.formDetails.space.trim()) {
            this.toastr.warning('Please enter space', 'Warning');
            return;
        }
        let returnValue = this.checkExistSpacesName();
        if (returnValue) {
            return;
        }
        let existingSpaces = [...this.formDetails.spaces];
        existingSpaces.push(this.formDetails.space.trim())
        let data = {
            _id: this.formDetails._id,
            spaces: existingSpaces
            // spaces: ["space 1", "space 2", "space 3"]

        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.formDetails.space ? this.formDetails.spaces.push(this.formDetails.space.trim()) : true;
                this.formDetails.space = '';
                // this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    deleteSpaces(item, index): void {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete space ${item}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/project-spaces?project_id=${this.projectDetailsObj._id}&name=${item}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.formDetails.spaces.length > 0 ? this.formDetails.spaces.splice(index, 1) : true;
                                this.getProjectDetails();
                                // this.formDetails.views.splice()
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    //ON ENTER KEY EVENT OVER SPACE INPUT
    onSpacesKeyEnter(event) {
        this.addSpaces();
    }

    reArrangeSpaces(direction, index) {
        if (direction == 'up') {
            let previous = this.formDetails.spaces[index - 1];
            let current = this.formDetails.spaces[index];
            this.formDetails.spaces[index] = previous;
            this.formDetails.spaces[index - 1] = current;
            let spaces = [...this.formDetails.spaces];
            this.onSpacesOrderChange(spaces);
        }
        else if (direction == 'down') {
            let next = this.formDetails.spaces[index + 1];
            let current = this.formDetails.spaces[index];
            this.formDetails.spaces[index] = next;
            this.formDetails.spaces[index + 1] = current;
            let spaces = [...this.formDetails.spaces];
            this.onSpacesOrderChange(spaces);
        }
    }

    onSpacesOrderChange(spaces) {
        let data = {
            _id: this.formDetails._id,
            spaces: spaces
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success('Spaces re-arranged successfully', 'Success');
                this.getProjectDetails();
                // this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    
    checkExistSpacesName() {
        let currentSapceName = this.formDetails.space;
        let isDuplicateSpace = this.formDetails.spaces.includes(currentSapceName.trim()) ? true : false;
        if (isDuplicateSpace) {
            this.toastr.warning('Duplicate space name. Please enter another space name', 'Warning');

        }
        return isDuplicateSpace;
    }
    
     /// Manage Views ///
    openEditViewModal(template: TemplateRef<any>) {
        this.formDetails = { ...this.projectDetailsObj };
        this.formDetails.views = (this.formDetails.views && this.formDetails.views.length > 0) ? this.formDetails.views : [];

        this.formDetails.view = '';
        // if (this.formDetails.views) {
        // let views = '';
        // this.formDetails.views.forEach(element => {
        //     views += `${element}\n`;
        // });
        // this.formDetails.views = views;
        // }
        this.modalRef = this.modalService.show(template, { class: 'modal-md space-views-list-modal', backdrop: 'static' });
    }

    addViews() {
        if (!this.formDetails.view || !this.formDetails.view.trim()) {
            this.toastr.warning('Please enter view', 'Warning');
            return;
        }
        let returnValue = this.checkExistViewName();
        if (returnValue) {
            return;
        }
        let existingViews = [...this.formDetails.views];
        existingViews.push(this.formDetails.view.trim());
        let data = {
            _id: this.formDetails._id,
            // views: this.formDetails.views.split('\n')
            views: existingViews
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.formDetails.view ? this.formDetails.views.push(this.formDetails.view.trim()) : true;
                this.formDetails.view = '';
                // this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    deleteViews(item, index): void {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete view ${item}?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/project-views?project_id=${this.projectDetailsObj._id}&name=${item}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.is_valid_session) {
                            if (response.status == 1) {
                                this.toastr.success(response.message, 'Success');
                                this.formDetails.views.length > 0 ? this.formDetails.views.splice(index, 1) : true;
                                this.getProjectDetails();
                                // this.formDetails.views.splice()
                            } else {
                                this.toastr.error(response.message, 'Error');
                            }
                        } else {
                            this.toastr.error('Your Session expired', 'Error');
                            this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    reArrangeViews(direction, index) {
        if (direction == 'up') {
            let previous = this.formDetails.views[index - 1];
            let current = this.formDetails.views[index];
            this.formDetails.views[index] = previous;
            this.formDetails.views[index - 1] = current;

            let views = [...this.formDetails.views];
            this.onViewOrderChange(views);
        }
        else if (direction == 'down') {
            let next = this.formDetails.views[index + 1];
            let current = this.formDetails.views[index];
            this.formDetails.views[index] = next;
            this.formDetails.views[index + 1] = current;

            let views = [...this.formDetails.views];
            this.onViewOrderChange(views);
        }
    }

    onViewOrderChange(views) {
        let data = {
            _id: this.formDetails._id,
            views: views
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success('Views re-arranged successfully', 'Success');
                this.getProjectDetails();
                // this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    //ON ENTER KEY EVENT OVER VIEWS INPUT
    onViewsKeyEnter(event) {
        this.addViews();
    }
    
    checkExistViewName() {
        let currentViewName = this.formDetails.view;
        let isDuplicateView = this.formDetails.views.includes(currentViewName.trim()) ? true : false;
        if (isDuplicateView) {
            this.toastr.warning('Duplicate view name. Please enter another view name', 'Warning');
        }
        return isDuplicateView;
    }

    ///////////////////////////////////////////////////////
    //////////////// For Purchaser portal home logo//////////
    ///////////////////////////////////////////////////////
    uploadPurchaserHomeLogo(e) {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            this.spinnerService.show();
            let validation = this.validatePhoto(selectedFile.name);
            if (validation) {
                var formData = new FormData();
                formData.append('image', selectedFile);
                formData.append('update_type', 'portal_home_logo');
                let url = `projects/projects?_id=${this.projectId}`;
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.success) {
                            this.toastr.success(response.message, 'Success');
                            this.getProjectDetails();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    } else {
                        this.toastr.error(response.message, 'Error');
                        this.router.navigate(['/login'], { queryParams: { return_url: `projects/project/${this.projectId}` } });
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


    ///////////////////////////////////////////////////////
    ////////// For Feature a& finishes Tab/////////////////
    ///////////////////////////////////////////////////////
    openEditFeatureModal(template: TemplateRef<any>) {
        this.formDetails = { ...this.projectDetailsObj };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    uploadDocument(files) {
        if (files.length > 0) {
            let validation = this.validateFeaturesDocumentUpload(files.item(0).name);
            if (validation) {
                let document = files.item(0);
                let url = `projects/project-documents`;
                var formData = new FormData();
                formData.append('file', document);
                formData.append('project_id', this.projectId);
                formData.append('type', 'FEATURES');
                this.spinnerService.show();
                this.webService.fileUpload(url, formData).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.getFeaturesDocumentList();
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                }, (error) => {
                    console.log("error ts: ", error);
                })
            } else {
                this.toastr.error("Please upload only PDF, DOC, DOCX, JPG, JPEG, PNG format", "Error");
            }
        }
    }

    updateFeature() {
        let data = {
            _id: this.formDetails._id,
            features: this.formDetails.features
        }
        let url = `projects/projects`;
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    openFeaturesDocumentModal(template: TemplateRef<any>, document) {
        // console.log('document', document);
        this.selectedDocument = { ...document };
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });

    }

    deleteFeatureDocument(item) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete document?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/project-documents?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getFeaturesDocumentList();
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

    ///////////////////////////////////////////////////////
    //////////////// For Documents Tab/////////////////////
    ///////////////////////////////////////////////////////
    openAddDocumentModal(template: TemplateRef<any>, docType) {
        this.isEdit = false;
        this.documentType = docType;
        this.docFormDetails = {};
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    
    addNewDocument() {
        let url = `projects/project-documents`;
        var formData = new FormData();
        formData.append('file', this.projectDocument);
        formData.append('is_active', this.docFormDetails.is_active ? 'yes' : 'no');
        formData.append('document_for', this.docFormDetails.document_for ?  this.docFormDetails.document_for :'');
        formData.append('witness_required_for_each_purchaser', this.docFormDetails.witness_required_for_each_purchaser ? 'yes' : 'no');
        formData.append('project_id', this.projectId);
        if (this.documentType == 'legal') {
            formData.append('type', 'LEGAL');
        } else {
            formData.append('type', 'MARKETING');
        }
        this.spinnerService.show();
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.modalRef.hide();
                // this.getDocumentList();
                this.projectDocument='';
                if (this.documentType == 'legal') {
                    this.getLegalDocumentList();
                } else {
                    this.getMarketingDocumentList();
                }

            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log("error ts: ", error);
        })
    }
    uploadProjectDocument(documentType, files: FileList) {
        if (files.length > 0) {
            let validation = this.validateProjectDocumentUpload(documentType, files.item(0).name);
            if (validation) {
                this.projectDocument = files.item(0);
            } else {
                this.toastr.error(`Please upload only ${documentType == 'legal' ? `DOC,DOCX` : ` PDF, DOC,DOCX`} format`, "Error");
            }
        }
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
    deleteDocument(item, documentType) {
        this.confirmationDialogService.confirm('Delete', `Do you want to delete document?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/project-documents?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            // this.getDocumentList();
                            if (documentType == 'legal') {
                                this.getLegalDocumentList();
                            } else {
                                this.getMarketingDocumentList();
                            }
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
    validateProjectDocumentUpload(documentType, fileName) {
        var allowed_extensions = documentType == 'legal' ? new Array("doc", "docx") : new Array("pdf", "doc", "docx");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    openEditDocumentModal(template: TemplateRef<any>, docType, document) {
        this.documentType = docType;
        this.selectedDocument = { ...document };
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    onUpdateDocument() {
        let url = `projects/project-documents`;
        var formData = new FormData();
        formData.append('is_active', this.selectedDocument.is_active ? 'yes' : 'no');
        formData.append('document_for', this.selectedDocument.document_for ?  this.selectedDocument.document_for :'');
        formData.append('witness_required_for_each_purchaser', this.selectedDocument.witness_required_for_each_purchaser ? 'yes' : 'no');
        formData.append('_id', this.selectedDocument._id);
        this.spinnerService.show();
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.modalRef.hide();
                // this.getDocumentList();
                if (this.documentType == 'legal') {
                    this.getLegalDocumentList();
                } else {
                    this.getMarketingDocumentList();
                }
                this.selectedDocument = {};
            } else {
                this.toastr.error(response.message, 'Error');
                this.selectedDocument = {};
            }
        }, (error) => {
            this.selectedDocument = {};
            console.log("error ts: ", error);
        })
    }

    openPDFDocumentModal(template: TemplateRef<any>, docType, document) {
        this.documentType = docType;
        this.selectedDocument = { ...document };
        this.modalRef = this.modalService.show(template, { class: 'media-modal modal-xl', backdrop: 'static' });

    }

    
    validateFeaturesDocumentUpload(fileName) {
        var allowed_extensions = new Array("pdf", "doc", "docx", "jpg", "jpeg", "png");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }

    getFeaturesDocumentList() {
        this.spinnerService.show();
        let url = `projects/project-documents?project_id=${this.projectId}&type=FEATURES`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.getFeaturesDocument = [];
                response.results.forEach(async (element) => {
                    if (element.document) {
                        let file_extension = element.document.name.split('.').pop().toLowerCase();
                        element.file_type = file_extension;
                        element.name = element.document.name;
                        element.filesize = await this.formatBytes(element.document.size, 3);
                        element.thumbnailUrl = `${environment.API_ENDPOINT}projects/view-file?dataset=crm_documents&_id=${element._id}&file_type=${element.file_type}`;
                    }

                    this.getFeaturesDocument.push(element)
                });
            } else {
                this.toastr.error(response.message, 'Error');

            }
        }, (error) => {
            console.log('error', error);
        });
    }


    getMarketingDocumentList() {
        this.spinnerService.show();
        let url = `projects/project-documents?project_id=${this.projectId}&type=MARKETING`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.marketingDocumentList = [];
                response.results.forEach(async (element) => {
                    if (element.document) {
                        let file_extension = element.document.name.split('.').pop().toLowerCase();
                        element.file_type = file_extension;
                        element.name = element.document.name;
                        element.filesize = await this.formatBytes(element.document.size, 3);
                        element.thumbnailUrl = `${environment.API_ENDPOINT}projects/view-file?dataset=crm_documents&_id=${element._id}&file_type=${element.file_type}`;
                    }

                    this.marketingDocumentList.push(element)
                });
            } else {
                this.toastr.error(response.message, 'Error');

            }
        }, (error) => {
            console.log('error', error);
        });
    }


    getLegalDocumentList() {
        this.spinnerService.show();
        let url = `projects/project-documents?project_id=${this.projectId}&type=LEGAL`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.legalDocumentList = [];
                response.results.forEach(async (element) => {
                    if (element.document) {
                        let file_extension = element.document.name.split('.').pop().toLowerCase();
                        element.file_type = file_extension;
                        element.name = element.document.name;
                        element.filesize = await this.formatBytes(element.document.size, 3);
                        element.thumbnailUrl = `${environment.API_ENDPOINT}projects/view-file?dataset=crm_documents&_id=${element._id}&file_type=${element.file_type}`;
                    }

                    this.legalDocumentList.push(element)
                });
            } else {
                this.toastr.error(response.message, 'Error');

            }
        }, (error) => {
            console.log('error', error);
        });
    }

    ////////////////////////////////////////////////// /////
    //////////////// For Media Tab/////////////////////////
    ///////////////////////////////////////////////////////
    getMediaList() {
        this.spinnerService.show();
        let url = `projects/photo?project_id=${this.projectId}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.mediaPhotoList = [];
                this.mediaVideoList = [];
                response.results.forEach(element => {
                    if (element.type == 'IMAGE' && element.source == 'MEDIA') {
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
    uploadProjectPhoto(files: FileList) {
        if (files.length > 0) {
            let url = `projects/photo`;
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
                    formData.append('project_id', this.projectId);
                    formData.append('type', 'IMAGE');
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
                        console.log("error ts: ", error);
                    })
                }
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", 'Error');
            }
        }
    }

    openPhotoDescription(template: TemplateRef<any>, item) {
        this.formDetails = {
            description: item.description ? item.description : '',
            _id: item._id
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    updatePhotoDescription() {
        // if (!this.formDetails.description) {
        //     this.toastr.warning('Please enter name', 'Warning');
        //     return;
        // }
        let data: any = {
            _id: this.formDetails._id,
            description: this.formDetails.description?  this.formDetails.description.trim():''
        };

        let url = `projects/photo`;
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

    //DELETE PROJECT PHOTO
    deletePhoto(photo, event) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `projects/photo?_id=${photo._id}`;
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
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }

    openAddVideoModal(template: TemplateRef<any>) {
        this.videoDetails = {
            video_type: '',
            title: '',
            body: ''
        };
        this.formDetails = { ...this.projectDetailsObj };
        this.modalEditSection = 'video';
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }

    addProjectVideos() {
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
        // else if (!this.videoDetails.title) {
        //     this.toastr.warning('Please enter title', 'Warning');
        //     error++;
        // }
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
            data.project_id = this.projectId;
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
                console.log('error', error);
            });
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
    ///////////////////////////////////////////////////////
    //////////////// Common Functions//////////////////////
    ///////////////////////////////////////////////////////
    formatBytes(bytes, decimals) {
        // console.log(bytes)
        return new Promise(resolve => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));
            resolve(parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]);
        });
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

    //FILE UPLAOD TO BASE64 CONVERSION
    getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // console.log(reader.result);
            this.uploadedPhoto = true;
            this.formDetails.logo = reader.result;
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }

    goToProjectList() {
        this.router.navigate(['projects']);
    }


    //////////////////////////////////////////////////////
    //////////////// For Amenities Tab///////////////////////
    ///////////////////////////////////////////////////////
    onUpdateAmenities(event?) {
        this.getProjectDetails();
    }

    ///////////////////////////////////////////////////////
    //////////////// For Settings Tab///////////////////////
    ///////////////////////////////////////////////////////
    openProjectSettingModal(template: TemplateRef<any>) {
        this.formDetails = {};
        if (this.projectDetailsObj) {
            this.formDetails.import_models = this.projectDetailsObj.import_models ? this.projectDetailsObj.import_models : false;
            this.formDetails.import_units = this.projectDetailsObj.import_units ? this.projectDetailsObj.import_units : false;
            this.formDetails.import_overwrite_unit_details = this.projectDetailsObj.import_overwrite_unit_details ? this.projectDetailsObj.import_overwrite_unit_details : false;
            this.formDetails.import_overwrite_model_details = this.projectDetailsObj.import_overwrite_model_details ? this.projectDetailsObj.import_overwrite_model_details : false;
            this.formDetails.import_overwrite_prices = this.projectDetailsObj.import_overwrite_prices ? this.projectDetailsObj.import_overwrite_prices : false;
            this.formDetails.default_cooling_period = this.projectDetailsObj.default_cooling_period;

        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    editProjectSettings() {
        let data: any = {};
        data = { ...this.formDetails };
        let url = `projects/projects?_id=${this.projectId}`;
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.getProjectDetails();
                this.modalRef.hide();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });
    }


}
