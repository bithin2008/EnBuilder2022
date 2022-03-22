import { Component, OnInit, TemplateRef } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';


@Component({
    selector: 'app-portal-app',
    templateUrl: './portal-app.component.html',
    styleUrls: ['./portal-app.component.css']
})
export class PortalAppComponent implements OnInit {
    detailsObj: any = {};
    headerLogoData: any = {};
    homeLogoData: any = {};
    heroImageLogoData: any = {};
    font_family: any = '';
    fontList: any = ['Times', 'Times New Roman', 'Arial', 'Courier'];
    themeColorList: any[] = [];
    baseUrl = environment.BASE_URL;
    Colors: any[] = [
        { name: 'BLACK', code: '#1D222E' },
        { name: 'RED', code: '#891F1E' },
        { name: 'BLUE', code: '#1565c0' },
        { name: 'VIOLET', code: '#673ab7' },
        { name: 'GREY', code: '#424242' },
    ]
    openColorDD: boolean = false;
    themeData = {
        font_family: '',
        theme_color: '',
        color_code: '',
        _id: ''
    };
    modalRef: BsModalRef;
    introScreenDetails: any = {};
    purchaserHelpTextDetails: any = {};
    formDetails: any = {};
    unitAttributes: any = {
        area: false,
        bathroom: false,
        bedroom: false,
        ceiling: false,
        collection: false,
        den: false,
        flex: false,
        media: false,
        model: false,
        outdoor_area: false,
        outdoor_type: false,
        unit_type: false,
    };
    unitDisplayOptions: any = {
        electrical_layout: false,
        floor_layout: false,
        key_map: false,
        photo: false,
        suite_layout: false
    };
    incentivesData: any = {
        display_incentive_on_details: false,
        display_incentive_on_home: false,
        incentive_body: false,
        incentive_title: false,
    };
    unitAttributesSummary: any = {};
    paymentInstructions: any = {};
    designStudioInstructions: any = {};
    layoutCustomizationInstructions:any={};
    termsConditions:any={};
    privacyData:any={};
    constructor(
        private webService: WebService,
        private toastr: ToastrService,
        private spinnerService: Ng4LoadingSpinnerService,
        private modalService: BsModalService,
        private confirmationDialogService: ConfirmationDialogService,

    ) { }
    ngOnInit(): void {
        this.getLogoData('PURCHASER_PORTAL_HEADER_LOGO');
        this.getLogoData('PURCHASER_PORTAL_HOME_LOGO');
        this.getLogoData('PURCHASER_PORTAL_HERO_IMAGE');
        this.getThemeData();
        this.getUnitAttributes();
        this.getUnitDisplayOption();
        this.getInfoScreenData();
        this.getPurchaserHelpTextData()
        this.getIncentives();
        this.getAttributeSummary();
        this.getPaymentInstrcution();
        this.getTermsConditions();
        this.getPrivacy();
        this.getDesignStudioInstructions();
        this.getLayoutCustomizationInstructions();
    }
    //NON INLINE EDITOR OPTIONS
    public nonInlineEdit: Object = {
        attribution: false,
        charCounterCount: false,
        heightMax: 150,
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
        key: "te1C2sB5C7D5G4H5B3jC1QUd1Xd1OZJ1ABVJRDRNGGUE1ITrE1D4A3A11B1B6B5B1F4F3=="
    }
    toggleColorDropDown() {
        this.openColorDD = !this.openColorDD;
    }
    selectColor(color) {
        this.themeData.theme_color = color.name;
        this.openColorDD = false;
        this.onThemeColorChange();
    }
    getLogoData(type) {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=${type}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (type == 'PURCHASER_PORTAL_HEADER_LOGO') {
                    this.headerLogoData = response.results ? response.results[0] : {};
                }
                else if (type == 'PURCHASER_PORTAL_HOME_LOGO') {
                    this.homeLogoData = response.results ? response.results[0] : {};
                }
                else if (type == 'PURCHASER_PORTAL_HERO_IMAGE') {
                    this.heroImageLogoData = response.results ? response.results[0] : {};
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getThemeData() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_THEME_SETTINGS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                let { font_family, theme_color, _id } = response.results ? response.results[0] : {
                    font_family: '',
                    theme_color: '',
                    _id: ''
                };
                this.themeData.theme_color = theme_color;
                this.themeData.font_family = font_family;
                this.themeData._id = _id;
                let selectedColor = this.Colors.find((color) => color.name == theme_color);
                this.themeData.color_code = selectedColor.code;
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    getInfoScreenData() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_INTRO_SETTINGS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                let { image, title, body, _id } = response.results ? response.results[0] : {
                    image: '',
                    title: '',
                    body: '',
                    _id: ''
                };
                this.introScreenDetails.layout = image ? `${this.baseUrl}${image.url}` : '';
                this.introScreenDetails.title = title;
                this.introScreenDetails.body = body;
                this.introScreenDetails._id = _id;
                // console.log(this.introScreenDetails);
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    updateLogo(file, type, item) {
        if (file && type && item) {
            let url = `purchaser-portal/crm-settings`;
            this.spinnerService.show();
            var data = new FormData();
            data.append("image file", file);
            data.append("_id", item._id);
            this.webService.fileUploadPut(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getLogoData(type);
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
    }
    uploadLogo(files: FileList, type, item) {
        if (files && files.item(0).name) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.updateLogo(files.item(0), type, item)
            } else {
                this.toastr.error("Please upload only JPG, PNG ,JPEG format", "Error");
            }
        }
    }
    //FILE UPLOAD VALIDATION
    validateDocumentUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png");
        var file_extension = fileName.split(".").pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }
    onFontChange(value) {
        let data: any = {
            font_family: this.themeData.font_family,
            _id: this.themeData._id
        }
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_THEME_SETTINGS`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.getThemeData();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    uploadBannerImage(files) {
        if (files && files.item(0).name) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.formDetails.image = files.item(0);
                this.getBase64(files.item(0));
            } else {
                this.toastr.error("Please upload only JPG, PNG ,JPEG format", "Error");
            }
        }
    }
    getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.formDetails.layout = reader.result;
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }
    getBase64ForIncentive(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.formDetails.imageData={};
            this.formDetails.image = reader.result;
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }
    onThemeColorChange() {
        let data: any = {
            theme_color: this.themeData.theme_color,
            _id: this.themeData._id
        }
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_THEME_SETTINGS`;
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.getThemeData();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    openSettingsModal(template: TemplateRef<any>) {
        this.formDetails = Object.assign({}, this.introScreenDetails);
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    updateSettings() {
        let url = `purchaser-portal/crm-settings`;
        this.spinnerService.show();
        let data: any = {
            title: this.formDetails.title || '',
            body: this.formDetails.body || '',
            _id: this.formDetails._id
        }
        // console.log(this.formDetails);
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                if (this.formDetails.image) {
                    this.uploadBannerImg();
                }
                else {
                    this.spinnerService.hide();
                    this.modalRef.hide();
                    this.getInfoScreenData();
                }
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }
    uploadBannerImg() {
        let url = `purchaser-portal/crm-settings`;
        var data = new FormData();
        data.append("image", this.formDetails.image || '');
        data.append("_id", this.formDetails._id);
        this.webService.fileUploadPut(url, data).subscribe((response: any) => {
            if (response.status == 1) {
                this.modalRef.hide();
                this.getInfoScreenData();
                this.spinnerService.hide();
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    // Purchaser Portal Help Text 
    getPurchaserHelpTextData() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_HELP_TEXT`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                let {  value, _id } = response.results ? response.results[0] : {
                    value: '',
                    _id: ''
                };
                this.purchaserHelpTextDetails.value = value;
                this.purchaserHelpTextDetails._id = _id;
                // console.log(this.purchaserHelpTextDetails);
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    openPurchaserHelpTextModal(template: TemplateRef<any>){
        if (this.purchaserHelpTextDetails) {
            this.formDetails = {
                value:this.purchaserHelpTextDetails.value
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }

    updatePurchaserHelpText(){
        let url = `purchaser-portal/crm-settings?type=PURCHASER_PORTAL_HELP_TEXT`;
        let data = {
            value: this.formDetails.value ? this.formDetails.value : '',
            _id: this.purchaserHelpTextDetails._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getPurchaserHelpTextData();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    // Display Unit Attributes:start
    openUnitAttributeEdit(template: TemplateRef<any>) {
        if (this.unitAttributes) {
            this.formDetails = {
                area: this.unitAttributes.area ? this.unitAttributes.area : false,
                bathroom: this.unitAttributes.bathroom ? this.unitAttributes.bathroom : false,
                bedroom: this.unitAttributes.bedroom ? this.unitAttributes.bedroom : false,
                ceiling: this.unitAttributes.ceiling ? this.unitAttributes.ceiling : false,
                collection: this.unitAttributes.collection ? this.unitAttributes.collection : false,
                den: this.unitAttributes.den ? this.unitAttributes.den : false,
                flex: this.unitAttributes.flex ? this.unitAttributes.flex : false,
                media: this.unitAttributes.media ? this.unitAttributes.media : false,
                model: this.unitAttributes.model ? this.unitAttributes.model : false,
                outdoor_area: this.unitAttributes.outdoor_area ? this.unitAttributes.outdoor_area : false,
                outdoor_type: this.unitAttributes.outdoor_type ? this.unitAttributes.outdoor_type : false,
                unit_type: this.unitAttributes.unit_type ? this.unitAttributes.unit_type : false,
                // unit_type: this.unitAttributes. ? this.unitAttributes.  :false
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getUnitAttributes() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_ATTRIBUTE`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.unitAttributes = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateUnitAttributes() {
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_ATTRIBUTE`;
        let data = {
            area: this.formDetails.area ? this.formDetails.area : false,
            bathroom: this.formDetails.bathroom ? this.formDetails.bathroom : false,
            bedroom: this.formDetails.bedroom ? this.formDetails.bedroom : false,
            ceiling: this.formDetails.ceiling ? this.formDetails.ceiling : false,
            collection: this.formDetails.collection ? this.formDetails.collection : false,
            den: this.formDetails.den ? this.formDetails.den : false,
            flex: this.formDetails.flex ? this.formDetails.flex : false,
            media: this.formDetails.media ? this.formDetails.media : false,
            model: this.formDetails.model ? this.formDetails.model : false,
            outdoor_area: this.formDetails.outdoor_area ? this.formDetails.outdoor_area : false,
            outdoor_type: this.formDetails.outdoor_type ? this.formDetails.outdoor_type : false,
            unit_type: this.formDetails.unit_type ? this.formDetails.unit_type : false,
            _id: this.unitAttributes._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getUnitAttributes();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    // Display Display Options :start
    openUnitDisplayOptionEdit(template: TemplateRef<any>) {
        if (this.unitDisplayOptions) {
            this.formDetails = {
                electrical_layout: this.unitDisplayOptions.electrical_layout ? this.unitDisplayOptions.electrical_layout : false,
                floor_layout: this.unitDisplayOptions.floor_layout ? this.unitDisplayOptions.floor_layout : false,
                key_map: this.unitDisplayOptions.key_map ? this.unitDisplayOptions.key_map : false,
                photo: this.unitDisplayOptions.photo ? this.unitDisplayOptions.photo : false,
                suite_layout: this.unitDisplayOptions.suite_layout ? this.unitDisplayOptions.suite_layout : false,
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getUnitDisplayOption() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_OPTIONS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.unitDisplayOptions = response.results[0];
                }
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateUnitDisplayOption() {
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_OPTIONS`;
        let data = {
            electrical_layout: this.formDetails.electrical_layout ? this.formDetails.electrical_layout : false,
            floor_layout: this.formDetails.floor_layout ? this.formDetails.floor_layout : false,
            key_map: this.formDetails.key_map ? this.formDetails.key_map : false,
            photo: this.formDetails.photo ? this.formDetails.photo : false,
            suite_layout: this.formDetails.suite_layout ? this.formDetails.suite_layout : false,
            _id: this.unitDisplayOptions._id
        }
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getUnitDisplayOption();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    // Display Incentives :start
    openUnitIncentivesEdit(template: TemplateRef<any>) {
        if (this.incentivesData) {
            this.formDetails = {
                display_incentive_on_details: this.incentivesData.display_incentive_on_details ? this.incentivesData.display_incentive_on_details : false,
                display_incentive_on_home: this.incentivesData.display_incentive_on_home ? this.incentivesData.display_incentive_on_home : false,
                incentive_body: this.incentivesData.incentive_body ? this.incentivesData.incentive_body : false,
                incentive_title: this.incentivesData.incentive_title ? this.incentivesData.incentive_title : false,
                image: this.incentivesData.imageUrl ? this.incentivesData.imageUrl : '',
                imageData :  this.incentivesData.imageData ?  this.incentivesData.imageData : ''

            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getIncentives() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_INCENTIVES`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                // this.incentivesData = response.results ? response.results[0] : {};
                if (response.results && response.results[0]) {
                    this.incentivesData = Object.assign({},response.results[0]);
                    this.incentivesData.imageUrl = response.results[0].image ? `${this.baseUrl}${response.results[0].image.url}` : '';
                    this.incentivesData.imageData = response.results[0].image ? response.results[0].image : '';

                }
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateUnitIncentive() {
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_INCENTIVES`;
        let data = {
            display_incentive_on_details: this.formDetails.display_incentive_on_details ? this.formDetails.display_incentive_on_details : false,
            display_incentive_on_home: this.formDetails.display_incentive_on_home ? this.formDetails.display_incentive_on_home : false,
            incentive_body: this.formDetails.incentive_body ? this.formDetails.incentive_body : false,
            incentive_title: this.formDetails.incentive_title ? this.formDetails.incentive_title : false,
            _id: this.incentivesData._id
        }
        // console.log('data', data);
        this.spinnerService.show();
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (this.formDetails.imageFile) {
                    this.uploadIncentiveImg();
                }
                else {
                    this.modalRef.hide();
                    this.toastr.success(response.message, 'Success');
                    this.getIncentives();
                }
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    uploadIncentiveImage(files) {
        if (files && files.item(0).name) {
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.formDetails.imageFile = files.item(0);
                this.getBase64ForIncentive(files.item(0));
            } else {
                this.toastr.error("Please upload only JPG, PNG ,JPEG format", "Error");
            }
        }
    }
    uploadIncentiveImg() {
        let url = `purchaser-portal/crm-settings`;
        var data = new FormData();
        data.append("image", this.formDetails.imageFile || '');
        data.append("_id", this.incentivesData._id);
        this.webService.fileUploadPut(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.modalRef.hide();
                this.getIncentives();
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    deleteIncentiveImage(image){
        this.confirmationDialogService.confirm('Delete', `Do you want to delete photo?`)
        .then((confirmed) => {
            if (confirmed) {
               console.log(image);
               if(image._id && this.incentivesData._id ){
                let url = `purchaser-portal/crm-settings-image?attribute_name=image&_id=${this.incentivesData._id}&file_id=${image._id}`;
                this.spinnerService.show();
                this.webService.delete(url).subscribe((response: any) => {
                    this.spinnerService.hide();
                    if (response.is_valid_session) {
                        if (response.status == 1) {
                            this.formDetails.image='';
                            this.formDetails.imageData={};
                            this.toastr.success(response.message, 'Success');
                            this.getIncentives();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }
                }, (error) => {
                    this.spinnerService.hide();
                    console.log('error', error);
                });
            }
        }

        })
        .catch((error) => { });
    }

    // Display Unit Attributes in Summary :start
    openUnitAttributeSummaryEdit(template: TemplateRef<any>) {
        if (this.unitAttributesSummary) {
            this.formDetails = {
                area: this.unitAttributesSummary.area ? this.unitAttributesSummary.area : false,
                bathroom: this.unitAttributesSummary.bathroom ? this.unitAttributesSummary.bathroom : false,
                bedroom: this.unitAttributesSummary.bedroom ? this.unitAttributesSummary.bedroom : false,
                ceiling: this.unitAttributesSummary.ceiling ? this.unitAttributesSummary.ceiling : false,
                collection: this.unitAttributesSummary.collection ? this.unitAttributesSummary.collection : false,
                den: this.unitAttributesSummary.den ? this.unitAttributesSummary.den : false,
                flex: this.unitAttributesSummary.flex ? this.unitAttributesSummary.flex : false,
                media: this.unitAttributesSummary.media ? this.unitAttributesSummary.media : false,
                model: this.unitAttributesSummary.model ? this.unitAttributesSummary.model : false,
                outdoor_area: this.unitAttributesSummary.outdoor_area ? this.unitAttributesSummary.outdoor_area : false,
                outdoor_type: this.unitAttributesSummary.outdoor_type ? this.unitAttributesSummary.outdoor_type : false,
                unit_type: this.unitAttributesSummary.unit_type ? this.unitAttributesSummary.unit_type : false,
                views: this.formDetails.views ? this.formDetails.views : false,
                floor_marketing: this.formDetails.floor_marketing ? this.formDetails.floor_marketing : false,
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getAttributeSummary() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_ATTRIBUTE_IN_SUMMARY`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.unitAttributesSummary = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateAttributeSummary() {
        let url = `purchaser-portal/crm-settings?type=DISPLAY_UNIT_ATTRIBUTE_IN_SUMMARY`;
        let data = {
            area: this.formDetails.area ? this.formDetails.area : false,
            bathroom: this.formDetails.bathroom ? this.formDetails.bathroom : false,
            bedroom: this.formDetails.bedroom ? this.formDetails.bedroom : false,
            ceiling: this.formDetails.ceiling ? this.formDetails.ceiling : false,
            collection: this.formDetails.collection ? this.formDetails.collection : false,
            den: this.formDetails.den ? this.formDetails.den : false,
            flex: this.formDetails.flex ? this.formDetails.flex : false,
            media: this.formDetails.media ? this.formDetails.media : false,
            model: this.formDetails.model ? this.formDetails.model : false,
            outdoor_area: this.formDetails.outdoor_area ? this.formDetails.outdoor_area : false,
            outdoor_type: this.formDetails.outdoor_type ? this.formDetails.outdoor_type : false,
            unit_type: this.formDetails.unit_type ? this.formDetails.unit_type : false,
            views: this.formDetails.views ? this.formDetails.views : false,
            floor_marketing: this.formDetails.floor_marketing ? this.formDetails.floor_marketing : false,
            _id: this.unitAttributesSummary._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getAttributeSummary();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    // Display Payment Instructions :start
    openPaymentInstructions(template: TemplateRef<any>) {
        if (this.paymentInstructions) {
            this.formDetails = {
                show_payment_instruction: this.paymentInstructions.show_payment_instruction ? this.paymentInstructions.show_payment_instruction : false,
                instruction: this.paymentInstructions.instruction ? this.paymentInstructions.instruction : '',
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getPaymentInstrcution() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PAYMENT_INSTRUCTIONS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.paymentInstructions = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updatePaymentInstrcution() {
        let url = `purchaser-portal/crm-settings?type=PAYMENT_INSTRUCTIONS`;
        let data = {
            show_payment_instruction: this.formDetails.show_payment_instruction ? this.formDetails.show_payment_instruction : false,
            instruction: this.formDetails.instruction ? this.formDetails.instruction : '',
            _id: this.paymentInstructions._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getPaymentInstrcution();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    // Display Terms and Conditions :start
    openTermsConditions(template: TemplateRef<any>) {
        if (this.termsConditions) {
            this.formDetails = {
                show_terms_and_conditions: this.termsConditions.show_terms_and_conditions ? this.termsConditions.show_terms_and_conditions : false,
                content: this.termsConditions.content ? this.termsConditions.content : '',
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getTermsConditions() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=TERMS_AND_CONDITIONS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.termsConditions = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateTermsConditions() {
        let url = `purchaser-portal/crm-settings?type=TERMS_AND_CONDITIONS`;
        let data = {
            show_terms_and_conditions: this.formDetails.show_terms_and_conditions ? this.formDetails.show_terms_and_conditions : false,
            content: this.formDetails.content ? this.formDetails.content : '',
            _id: this.termsConditions._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getTermsConditions();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    // Display Privacy :start
    openPrivacyModal(template: TemplateRef<any>) {
        if (this.privacyData) {
            this.formDetails = {
                show_privacy: this.privacyData.show_privacy ? this.privacyData.show_privacy : false,
                content: this.privacyData.content ? this.privacyData.content : '',
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getPrivacy() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=PRIVACY`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.privacyData = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updatePrivacy() {
        let url = `purchaser-portal/crm-settings?type=PRIVACY`;
        let data = {
            show_privacy: this.formDetails.show_privacy ? this.formDetails.show_privacy : false,
            content: this.formDetails.content ? this.formDetails.content : '',
            _id: this.privacyData._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getPrivacy();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    // Studio Submit Instructions :start
    openDesignStudioInstructions(template: TemplateRef<any>) {
        if (this.designStudioInstructions) {
            this.formDetails = {
                show_submit_instruction: this.designStudioInstructions.show_submit_instruction ? this.designStudioInstructions.show_submit_instruction : false,
                instruction: this.designStudioInstructions.instruction ? this.designStudioInstructions.instruction : '',
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getDesignStudioInstructions() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=DESIGN_STUDIO_SUBMIT_INSTRUCTIONS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.designStudioInstructions = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateDesignStudioInstructions() {
        let url = `purchaser-portal/crm-settings?type=DESIGN_STUDIO_SUBMIT_INSTRUCTIONS`;
        let data = {
            show_submit_instruction: this.formDetails.show_submit_instruction ? this.formDetails.show_submit_instruction : false,
            instruction: this.formDetails.instruction ? this.formDetails.instruction : '',
            _id: this.designStudioInstructions._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getDesignStudioInstructions();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    // Layout Customization Instructions :start
    openLayoutCustomizationInstructions(template: TemplateRef<any>) {
        if (this.layoutCustomizationInstructions) {
            this.formDetails = {
                show_instruction: this.layoutCustomizationInstructions.show_instruction ? this.layoutCustomizationInstructions.show_instruction : false,
                instruction: this.layoutCustomizationInstructions.instruction ? this.layoutCustomizationInstructions.instruction : '',
            }
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });
    }
    getLayoutCustomizationInstructions() {
        this.spinnerService.show();
        let url = `purchaser-portal/crm-settings?type=LAYOUT_CUSTOMIZATION_INSTRUCTIONS`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.results && response.results[0]) {
                    this.layoutCustomizationInstructions = response.results[0];
                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }
    updateLayoutCustomizationInstructions() {
        let url = `purchaser-portal/crm-settings?type=LAYOUT_CUSTOMIZATION_INSTRUCTIONS`;
        let data = {
            show_instruction: this.formDetails.show_instruction ? this.formDetails.show_instruction : false,
            instruction: this.formDetails.instruction ? this.formDetails.instruction : '',
            _id: this.layoutCustomizationInstructions._id
        }
        // console.log('data', data);
        this.webService.post(url, data).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                this.modalRef.hide();
                this.toastr.success(response.message, 'Success');
                this.getLayoutCustomizationInstructions();
            }
            else {
                this.spinnerService.hide();
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }



}
