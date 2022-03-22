import { Component, OnInit, TemplateRef, Input, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {
    @Input() user_id: String;
    @Input() returnUrl: String;
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    phone: FormGroup;
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        searchText: '',
        builder_id: '',
        subdivision_id: '',
    };
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSize: number = 20;
    order: string = '_updated';
    reverse: boolean = true;
    isClear: boolean = false;
    projectList: any = [];
    builderList: any = [];
    subdivisionList: any = [];
    baseUrl = environment.BASE_URL;
    public uploadedPhoto: boolean = false;
    projectLogo: any;
    defaultViews: any[] = [];
    defaultSpaces: any[] = [];
    occupancyDates: any[] = [
        {
            "label": "Tentative 1 Occupancy",
            "id": "tentative1_occupancy",
            "type": "Tentative Occupancy"
        },
        {
            "label": "Tentative 2 Occupancy",
            "id": "tentative2_occupancy",
            "type": "Tentative Occupancy"
        },
        {
            "label": "Tentative 3 Occupancy",
            "id": "tentative3_occupancy",
            "type": "Tentative Occupancy"
        },
        {
            "label": "Tentative 4 Occupancy",
            "id": "tentative4_occupancy",
            "type": "Tentative Occupancy"
        },
        {
            "label": "Tentative 5 Occupancy",
            "id": "tentative5_occupancy",
            "type": "Tentative Occupancy"
        },
        {
            "label": "Last Penalty Date",
            "id": "last_penalty_date",
            "type": "Penalty Date"
        },
        {
            "label": "Final Occupancy",
            "id": "final_occupancy",
            "type": "Final Occupancy"
        },
        {
            "label": "Firm Occupancy",
            "id": "firm_occupancy",
            "type": "Firm Occupancy"
        },
        {
            "label": "Outside Occupancy",
            "id": "outside_occupancy",
            "type": ""
        }
    ]
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.getSavedFilterdata();
        this.getProjectList();
        this.getDefaultViews();
        this.getDefaultSpaces();
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
        let filterData: any = localStorage.getItem('projectsFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.builder_id) {
                this.filterForm.builder_id = filterData.builder_id;
                setTimeout(() => {
                    this.getSubdivisionList(filterData.builder_id);
                }, 1000);
            }
            // else {
            //     this.getSubdivisionList('');
            // }
            if (filterData.subdivision_id) {
                this.filterForm.subdivision_id = filterData.subdivision_id;
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
            if (filterData.searchText) {
                this.filterForm.searchText = filterData.searchText;
                this.isClear = true;
            }
            this.order = this.sortedtby;
            if (this.sortOrder == 'DESC') {
                this.reverse = true;
            } else {
                this.reverse = false;
            }
        }
        this.getBuilderList();

    }

    getProjectList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `projects/projects?page=${this.page}&pageSize=${this.pageSize}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.builder_id)
            url = url + `&builder_id=${this.filterForm.builder_id}`;
        if (this.filterForm.subdivision_id)
            url = url + `&subdivision_id=${this.filterForm.subdivision_id}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.projectList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.projectList = response.results;
                    if(this.page >1 && response.results.length==0 && !response.pagination){
                        this.page = this.page > 1? this.page-1 :1;
                        this.getProjectList()  
                    } 
                    if (response.pagination)
                        this.paginationObj = response.pagination;
                    else
                        this.paginationObj = {
                            total: 0
                        };
                } else {
                    this.projectList = [];
                    this.paginationObj = {
                        total: 0
                    };
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    getDefaultViews() {
        let url = `projects/crm-settings?type=DEFAULT-VIEWS`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.defaultViews = response.results;
                } else {
                    this.defaultViews = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    
    getDefaultSpaces() {
        let url = `projects/crm-settings?type=DEFAULT-SPACES`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.defaultSpaces = response.results;
                } else {
                    this.defaultSpaces = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    getBuilderList() {
        this.spinnerService.show();
        let url = `projects/builders?page=1&pageSize=100`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderList = response.results;
                    if (this.builderList.length == 1) {
                        this.getSubdivisionList(this.builderList._id);
                    }
                } else {
                    this.builderList = [];

                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
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
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.subdivisionList = response.results;
                } else {
                    this.subdivisionList = [];
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'projects' } });
            }
        }, (error) => {
            console.log('error', error);
        });
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
        this.getProjectList();
    }
    doPaginationWise(page) {
        this.page = page;
        this.getProjectList();
    }
    doSearch() {
        if (this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getProjectList();
    }
    clearSearch() {
        this.page = 1;
        this.filterForm.searchText = '';
        this.isClear = false;
        this.getProjectList();
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSize: this.pageSize,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText,
            builder_id: this.filterForm.builder_id,
            subdivision_id: this.filterForm.subdivision_id
        }
        localStorage.setItem('projectsFilterData', JSON.stringify(data));
    }

    setPageSize() {
        this.page = 1;
        this.getProjectList();
    }
    clearFilter() {
        this.page = 1;
        this.pageSize = 20;
        this.filterForm = {
            searchText: '',
            builder_id: '',
            subdivision_id: '',
        };
        this.isClear = false;
        this.getProjectList();
    }

    selectProjectLogo(files: FileList) {
        let validation = this.validateDocumentUpload(files.item(0).name);
        if (validation) {
            this.projectLogo = files.item(0);
            this.getBase64(files.item(0));
            // this.formDetails.logo.hasImg = true;
        } else {
            this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
        }
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


    ///OPEN ADD PROJECT MODAL///
    openAddProjectModal(template: TemplateRef<any>) {
        this.projectLogo = '';
        this.formDetails = {
            subdivision_id: '',
            builder_id: '',
            name: '',
            project_id: '',
            project_code: '',
        };
        this.uploadedPhoto = false;
        this.phone = new FormGroup({
            contact_phone: new FormControl('', [Validators.required])
        });
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    validateProjectCode() {
        const val = this.formDetails.project_code ? this.formDetails.project_code.toUpperCase() : '';
        var projectCodeReg = /^[A-Z0-9-\.]{4,16}$/  ///[a-zA-Z0-9-]/; 
        // console.log('projectCodeReg.test', val, projectCodeReg.test(val));
        if (val && projectCodeReg.test(val) == false) {
            this.toastr.warning('Please enter valid project code. It can be alphanumeric, should contain 4-16 characters and no spaces, spcial characters, eg.LSD6,JHGS', 'Warning');
        }
    }
    addProject() {
        const pcodeVal = this.formDetails.project_code ? this.formDetails.project_code.toUpperCase() : '';
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        // var urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var projectCodeReg = /^[A-Z0-9-\.]{4,16}$/  ///[a-zA-Z0-9-]/; //^[A-Z0-9-\.]$/;
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
                website = `https://${webaddress.trim()}`;
            }
        }

        if (!this.formDetails.builder_id) {
            this.toastr.warning('Please select builder', 'Warning');
        }
        // else if (!this.formDetails.subdivision_id) {
        //   this.toastr.warning('Please select subdivision', 'Warning');
        // }
        else if (!this.formDetails.name || !this.formDetails.name.trim()) {
            this.toastr.warning('Please enter project name', 'Warning');
        }
        // else if (!this.formDetails.project_id.trim()) {
        //   this.toastr.warning('Please enter project id', 'Warning');
        // }
        // else if (!this.formDetails.project_code.trim()) {
        //     this.toastr.warning('Please enter project code', 'Warning');
        // }
        else if (pcodeVal && !projectCodeReg.test(pcodeVal)) {
            this.toastr.warning('Please enter valid project code. It can be alphanumeric, should contain 4-16 characters and no spaces, spcial characters, eg.LSD6,JHGS', 'Warning');
        }
        // else if (!this.formDetails.contact_name) {
        //   this.toastr.warning('Please enter project contact name', 'Warning');
        // }
        // else if (!this.formDetails.contact_email) {
        //   this.toastr.warning('Please enter project contact email', 'Warning');
        // }
        else if (this.formDetails.contact_email && !reg.test(this.formDetails.contact_email)) {
            this.toastr.warning('Please enter valid project contact email', 'Warning');
        }
        else if (this.phone.controls['contact_phone'].value && this.phone.controls['contact_phone'].value.contact_phone && this.phone.controls['contact_phone'].invalid) {
            this.toastr.warning('Please enter valid phone number', 'Warning');
        }
        else if (this.formDetails.contact_website && !websiteReg.test(website)) {
            this.toastr.warning('Please enter valid project contact website', 'Warning');
        }
        else {
            var projectObj: any = {};
            if (this.phone.value && this.phone.value.contact_phone) {
                let phoneObj = {
                    number: this.phone.value.contact_phone.e164Number,
                    formatted: this.phone.value.contact_phone.nationalNumber,
                }
                projectObj.contact_phone = phoneObj;
            }
            projectObj.name = this.formDetails.name ? this.formDetails.name.trim() : '';
            // projectObj.project_id = this.formDetails.project_id.trim();
            projectObj.project_code = this.formDetails.project_code ? this.formDetails.project_code.trim() : '';
            projectObj.phase = this.formDetails.phase ? this.formDetails.phase.trim() : '';
            projectObj.status = this.formDetails.phase ? this.formDetails.phase.trim() : '';
            this.builderList.forEach(item => {
                if (item._id == this.formDetails.builder_id) {
                    projectObj.builder_id = item._id;
                    projectObj.builder_name = item.name;
                }
            });
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
            if (this.defaultViews.length > 0) {
                projectObj.views = this.defaultViews.map((ele) => ele.value);
            }
            if (this.defaultSpaces.length > 0) {
                projectObj.spaces = this.defaultSpaces.map((ele) => ele.value);
            }
            projectObj.occupancy_dates = this.occupancyDates;
            // console.log('projectObj', projectObj);
            let url = `projects/projects`;
            this.spinnerService.show();
            this.webService.post(url, projectObj).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.filterForm.searchText = '';
                        this.isClear = false;
                        if (this.projectLogo) {
                            this.uploadProjectLogo(response.result);
                        } else {
                            this.getProjectList();
                        }
                        this.toastr.success(response.message, 'Success');
                        this.modalRef.hide();
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
    }
    uploadProjectLogo(project) {
        this.spinnerService.show();
        var formData = new FormData();
        formData.append('image', this.projectLogo);
        formData.append('update_type', 'logo');
        let url = `projects/projects?_id=${project._id}`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        // this.toastr.success(response.message, 'Success');
                        this.getProjectList();
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
    
    goToProjectDetails(item) {
        this.router.navigate(['projects/' + item._id]);
    }
}
