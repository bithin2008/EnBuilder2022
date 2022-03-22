import { Component, OnInit, TemplateRef, Input, DoCheck, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from "../../../../environments/environment";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import FroalaEditor from 'froala-editor';
@Component({
    selector: 'app-builder-list',
    templateUrl: './builder-list.component.html',
    styleUrls: ['./builder-list.component.css']
})
export class BuilderListComponent implements OnInit {
    @Input() user_id: String;
    @Input() returnUrl: String;
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.Canada];
    phone: FormGroup;
    builders: any = [];
    paginationObj: any = {};
    modalRef: BsModalRef;
    formDetails: any = {};
    filterForm: any = {
        searchText: ''
    };
    sortedtby: any = '_created';
    sortOrder: any = 'DESC';
    page: number = 1;
    pageSizeB: number = 20;
    order: string = '_created';
    reverse: boolean = true;
    isClear: boolean = false;
    builderList: any = [];
    isEdit: boolean = false;
    baseUrl = environment.BASE_URL;
    public uploadedPhoto: boolean = false;
    builderLogo: any;
    constructor(
        private ngZone: NgZone,
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private confirmationDialogService: ConfirmationDialogService,
    ) { }
    ngOnInit(): void {
        this.checkLogin();
        this.getSavedFilterdata();
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
                // console.log('initialized');
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
    checkLogin() {
        let url = 'whoami';
        this.webService.get(url).subscribe((response: any) => {
            if (response.success) {
                if (response.result.isGuest) {
                    this.router.navigate(['/login'], { queryParams: { return_url: `builders` } });
                }
                else {
                    this.getBuilderList();
                }
            }
            else {
                this.router.navigate(['/login'], { queryParams: { return_url: `builders` } });
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    getSavedFilterdata() {
        let filterData: any = localStorage.getItem('buildersFilterData');
        if (filterData) {
            filterData = JSON.parse(filterData);
            if (filterData.page) {
                this.page = filterData.page;
            }
            if (filterData.pageSize) {
                this.pageSizeB = filterData.pageSize;
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
    }

    getBuilderList() {
        this.spinnerService.show();
        this.saveFilter();
        let url = `projects/builders?page=${this.page}&pageSize=${this.pageSizeB}`;
        if (this.sortedtby)
            url = url + `&sortBy=${this.sortedtby}&sortOrder=${this.sortOrder}`;
        if (this.filterForm.searchText)
            url = url + `&searchText=${this.filterForm.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.builderList=[];
            if (response.is_valid_session) {
                if (response.status == 1) {
                    this.builderList = response.results;
                    if(this.page >1 && response.results.length==0 && !response.pagination){
                        this.page = this.page > 1? this.page-1 :1;
                        this.getBuilderList()  
                    } 
    
                    if (response.pagination) {
                        this.paginationObj = response.pagination;
                    } else {
                        this.paginationObj = {
                            total: 0
                        };
                    }
                } else {
                    this.builderList = [];
                    this.paginationObj = {
                        total: 0
                    };
                }
            } else {
                this.toastr.error('Your Session expired', 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: 'builders' } });
            }
        }, (error) => {
            console.log('error', error);
        });
    }

    saveFilter() {
        let data = {
            page: this.page,
            pageSizeB: this.pageSizeB,
            sortby: this.sortedtby,
            sortOrder: this.sortOrder,
            searchText: this.filterForm.searchText
        }
        localStorage.setItem('buildersFilterData', JSON.stringify(data));
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
        this.getBuilderList();
    }

    setPageSize() {
        this.page = 1;
        this.getBuilderList();
    }

    doPaginationWise(page) {
        this.page = page;
        this.getBuilderList();
    }

    doSearch() {
        if (this.filterForm.searchText && this.filterForm.searchText.length > 0) {
            this.isClear = true;
        } else {
            this.isClear = false;
        }
        this.page = 1;
        this.getBuilderList();
    }
    clearSearch() {
        this.page = 1;
        this.isClear = false;
        this.filterForm.searchText = '';
        this.getBuilderList();
    }
    
    clearFilter() {
        this.page = 1;
        this.pageSizeB = 20;
        this.filterForm = {
            searchText: ''
        };
        this.isClear = false;
        this.getBuilderList();
    }


    ///OPEN ADD BUILDER MODAL///
    openAddBuilderMdal(template: TemplateRef<any>) {
        this.builderLogo = '';
        this.formDetails = {
            name: ''
        };
        this.phone = new FormGroup({
            contact_phone: new FormControl('', [Validators.required])
        });
        this.uploadedPhoto = false;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    
    addBuilder() {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        // var urlReg = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var websiteReg = /((?:https?\:\/\/)(?:[-a-z0-9]+\.)*[-a-z0-9]+.*)/i;
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

        if (!this.formDetails.name || (this.formDetails.name  && !this.formDetails.name.trim())) {
            this.toastr.warning('Please enter builder name', 'Warning');
        }

        // else if (!this.formDetails.contact_name) {
        //   this.toastr.warning('Please enter builder contact name', 'Warning');
        // }
        // else if (!this.formDetails.contact_email) {
        //   this.toastr.warning('Please enter builder contact email', 'Warning');
        // }
        else if (this.formDetails.contact_email && reg.test(this.formDetails.contact_email) == false) {
            this.toastr.warning('Please enter valid builder contact email', 'Warning');
        }
        else if (this.phone.value.contact_phone && this.phone.controls['contact_phone'].invalid) {
            this.toastr.warning('Please enter valid phone number', 'Warning');
        }
        // else if (this.formDetails.contact_website && !websiteReg.test(this.formDetails.contact_website)) {
        //     this.toastr.warning('Please enter valid builder contact website', 'Warning');
        // }
        else if (this.formDetails.contact_website && !websiteReg.test(website)) {
            this.toastr.warning('Please enter valid builder contact website', 'Warning');
        }
        else {
            // console.log('website', website);
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
            builderObj.description = this.formDetails.description ? this.formDetails.description.trim() : '';
            let url = `projects/builders`;
            this.spinnerService.show();
            this.webService.post(url, builderObj).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.is_valid_session) {
                    if (response.status == 1) {
                        this.toastr.success(response.message, 'Success');
                        this.filterForm.searchText = '';
                        this.isClear = false;
                        if (this.builderLogo) {
                            this.uploadBuilderLogo(response.result)
                        } else {
                            this.getBuilderList();
                            this.modalRef.hide();
                        }
                        // this.goToBuilderDetails(response.result);
                    } else {
                        this.toastr.error(response.message, 'Error');
                    }
                } else {
                    this.toastr.error('Your Session expired', 'Error');
                    this.router.navigate(['/login'], { queryParams: { return_url: 'builders' } });
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }

    selectBuilderLogo(files: FileList) {
        if (files && files.item(0)) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.builderLogo = files.item(0);
                this.getBase64(files.item(0));
                // this.formDetails.logo.hasImg = true;
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
                return true;
            }
        }
        return false;
    }
    
    uploadBuilderLogo(builder) {
        this.spinnerService.show();
        var formData = new FormData();
        formData.append('image', this.builderLogo);
        formData.append('update_type', 'logo');
        let url = `projects/builders?_id=${builder._id}`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.is_valid_session) {
                if (response.success) {
                    if (response.status == 1) {
                        // this.toastr.success(response.message, 'Success');
                        this.getBuilderList();
                        this.modalRef.hide();
                    }
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            } else {
                this.toastr.error(response.message, 'Error');
                this.router.navigate(['/login'], { queryParams: { return_url: `builders` } });
            }
        }, (error) => {
            console.log('error', error);
        });

    }


    goToBuilderDetails(obj) {
        this.router.navigate(['builders/' + obj._id]);
    }
}
