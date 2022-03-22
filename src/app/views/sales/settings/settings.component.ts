import { Component, OnInit } from '@angular/core';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'sales-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SalesSettingsComponent implements OnInit {
    customerName: any = { value: '' };
    customerLogo: any = { value: '', image: '' };

    idUploadText: any = { value: '' };
    submitStatement: any = { value: '' };
    worksheetCustomerName: any = { value: '' };
    worksheetCustomerLogo: any = { value: '', image: '' };
    worksheetChoices: any = { value: '' };
    introMessage: any = { value: '' };
    baseUrl = environment.BASE_URL;
    registrantTitle: any = { value: '' };
    registrantMsg: any = { value: '' };
    dealStageData:any = { deal_stages:[], value: '', _id:'' };
    defaultActiveTab:'generalTab';
    stageList:any=[ 
        {
        value: 'NEW',
        selected:false,
    },
    {
        value: 'RESERVED',
        selected:false,
    },
    {
        value: 'OUT FOR SIGN',
        selected:false,
    },
    {
        value: 'SIGNED',
        selected:false,
    },
    {
        value: 'CONDITIONAL',
        selected:false,
    },
    {
        value: 'FIRM',
        selected:false,
    },
    {
        value: 'DEFAULT',
        selected:false,
    },
    {
        value: 'RECESSION',
        selected:false,
    },
    {
        value: 'UNIT RELEASED',
        selected:false,
    }];

    buttonsList:any=[
        {
            selected:false,
            key:'assign_unit',
            name:"Assign Unit"
        },
        {
            selected:false,
            key:'assign_broker',
            name:"Assign a Broker"
        },
        {
            selected:false,
            key:'assign_sales_agent',
            name:"Assign a Sales Agent"
        },
        {
            selected:false,
            key:'apply_incentive',
            name:"Apply Incentive"
        },{
            selected:false,
            key:'apply_extension',
            name:"Apply Extension"
        },
        {
            selected:false,
            key:'aggrement_out_for_sign',
            name:"Aggrement Out for Sign"
        },
        {
            selected:false,
            key:'aggrement_signed',
            name:"Aggrement Signed"
        },
        {
            selected:false,
            key:'execute_aggrement',
            name:"Execute Aggrement"
        },
        {
            selected:false,
            key:'firm_aggrement',
            name:"Firm Aggrement"
        },
        {
            selected:false,
            key:'default_aggrement',
            name:"Default  Aggrement"
        },
        {
            selected:false,
            key:'deal_withdraw_recession',
            name:"Deal Withdraw - Recession"
        },
        {
            selected:false,
            key:'generate_aggrement',
            name:"Generate  Aggrement"
        },
        {
            selected:false,
            key:'add_purchaser',
            name:"Add purchaser"
        },
        {
            selected:false,
            key:'add_solicitor',
            name:"Add Solicitor"
        },
        {
            selected:false,
            key:'release_unit',
            name:"Realese Unit"
        },
        {
            selected:false,
            key:'third_party',
            name:"Third Party"
        },
        {
            selected:false,
            key:'sales_verify',
            name:"Sales Verify"
        },
        {
            selected:false,
            key:'finance_verify',
            name:"Finance Verify"
        },
        {
            selected:false,
            key:'alllocate_locker',
            name:"Allocate Locker"
        },
        {
            selected:false,
            key:'allocate_bicycle',
            name:"Allocate Bicycle"
        },
        {
            selected:false,
            key:'allocate_parking',
            name:"Allocate Parking"
        }


    ]
    constructor(
        private webService: WebService,
        private toastr: ToastrService,
        private spinnerService: Ng4LoadingSpinnerService,
    ) { }

    ngOnInit(): void {

        this.getDisplayData('CUSTOMER_NAME');
        this.getDisplayData('CUSTOMER_LOGO');

        this.getDisplayData('WORKSHEET_CUSTOMER_NAME');
        this.getDisplayData('WORKSHEET_INTRO_MESSAGE');
        this.getDisplayData('WORKSHEET_SUBMIT_STATEMENT');
        this.getDisplayData('WORKSHEET_ID_UPLOAD_TEXT');
        this.getDisplayData('WORKSHEET_CHOICES');
        this.getDisplayData('WORKSHEET_CUSTOMER_LOGO');
        this.getDisplayData('REGISTRATION_TITLE');
        this.getDisplayData('REGISTRATION_MESSAGE');
        this.getDisplayData('DEAL_WORKFLOW');
    }

    getDisplayData(type) {
        this.spinnerService.show();
        let url = `sales/crm-settings?type=${type}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (type == 'CUSTOMER_NAME') {
                    let { value, _id } =(response.results && response.results.length>0)  ? response.results[0] : { value: '', _id: '' };
                    this.customerName.value = value;
                    this.customerName._id = _id;
                }
                else if (type == 'CUSTOMER_LOGO') {
                    let { value, _id, image } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '', image: '' };
                    this.customerLogo.value = value;
                    this.customerLogo.image = image
                    this.customerLogo._id = _id;
                }
                else if (type == 'WORKSHEET_CUSTOMER_NAME') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.worksheetCustomerName.value = value;
                    this.worksheetCustomerName._id = _id;

                }
                else if (type == 'WORKSHEET_INTRO_MESSAGE') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.introMessage.value = value;
                    this.introMessage._id = _id;
                }
                else if (type == 'WORKSHEET_SUBMIT_STATEMENT') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.submitStatement.value = value;
                    this.submitStatement._id = _id;

                }
                else if (type == 'WORKSHEET_ID_UPLOAD_TEXT') {
                    let { value, _id } =(response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.idUploadText.value = value;
                    this.idUploadText._id = _id;

                }
                else if (type == 'WORKSHEET_CHOICES') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.worksheetChoices.value = value;
                    this.worksheetChoices._id = _id;

                }
                else if (type == 'WORKSHEET_CUSTOMER_LOGO') {
                    let { value, _id, image } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '', image: '' };
                    this.worksheetCustomerLogo.value = value;
                    this.worksheetCustomerLogo.image = image
                    this.worksheetCustomerLogo._id = _id;

                }
                else if (type == 'REGISTRATION_TITLE') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.registrantTitle.value = value;
                    this.registrantTitle._id = _id;

                }
                else if (type == 'REGISTRATION_MESSAGE') {
                    let { value, _id } = (response.results && response.results.length>0) ? response.results[0] : { value: '', _id: '' };
                    this.registrantMsg.value = value;
                    this.registrantMsg._id = _id;
                }
                else if(type=='DEAL_WORKFLOW'){
                    let {deal_stages, value, _id } = (response.results && response.results.length>0) ? response.results[0] : { deal_stages :[],value: '', _id: '' };
                    this.dealStageData.value = value;
                    this.dealStageData.deal_stages=deal_stages;
                    this.dealStageData._id = _id;
                    let featuresKeys={
                        assign_broker: false,
                        assign_unit: false,
                        assign_sales_agent:false,
                        apply_incentive:false,
                        apply_extension:false,
                        aggrement_out_for_sign:false,
                        aggrement_signed:false,
                        execute_aggrement:false,
                        firm_aggrement:false,
                        default_aggrement:false,
                        deal_withdraw_recession:false,
                        generate_aggrement:false,
                        add_purchaser:false,
                        add_solicitor:false,
                        release_unit:false,
                        third_party:false,
                        sales_verify:false,
                        finance_verify:false,
                        alllocate_locker:false,
                        allocate_bicycle:false,
                        allocate_parking:false,  
                    }
                    if(deal_stages.length>0){
                        this.stageList.forEach(element => {
                            let stage= deal_stages.find((stage)=>stage.name==element.value);
                            if(stage && stage.features_enabled){
                                element.features_enabled={};
                               let featuresLength= Object.keys(featuresKeys);
                               featuresLength.forEach((key)=>{
                                if(stage.features_enabled.hasOwnProperty(key)){
                                    element.features_enabled[key]=stage.features_enabled[key];
                                }
                                else{
                                    element.features_enabled[key]=false;
                                }
                               })
                            }
                            else{
                                element.features_enabled=featuresKeys;
                            }
                        });
                    }

                }
            }
            else {
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    //// WORKSHEET_CUSTOMER_LOGO //////
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

    updateLogo(file, type, item) {
        if (file && type && item) {
            let url = `sales/crm-settings`;
            this.spinnerService.show();
            var data = new FormData();
            data.append("image file", file);
            data.append("_id", item._id);
            this.webService.fileUploadPut(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.getDisplayData(type);
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
    }

    updateSettings(type) {
        let url = `sales/crm-settings`;
        this.spinnerService.show();
        let data: any = {};
        if (type == 'CUSTOMER_NAME') {
            data.value = this.customerName.value || '';
            data._id = this.customerName._id
        }
        else if (type == 'CUSTOMER_LOGO') {
            data.value = this.customerLogo.value || '';
            data._id = this.customerLogo._id
        }
        else if (type == 'WORKSHEET_CUSTOMER_NAME') {
            data.value = this.worksheetCustomerName.value || '';
            data._id = this.worksheetCustomerName._id
        }
        else if (type == 'WORKSHEET_INTRO_MESSAGE') {
            data.value = this.introMessage.value || '';
            data._id = this.introMessage._id
        }
        else if (type == 'WORKSHEET_SUBMIT_STATEMENT') {
            data.value = this.submitStatement.value || '';
            data._id = this.submitStatement._id
        }
        else if (type == 'WORKSHEET_ID_UPLOAD_TEXT') {
            data.value = this.idUploadText.value || '';
            data._id = this.idUploadText._id
        }
        else if (type == 'WORKSHEET_CHOICES') {
            data.value = this.worksheetChoices.value || '';
            data._id = this.worksheetChoices._id
        }
        else if (type == 'WORKSHEET_CUSTOMER_LOGO') {
            data.value = this.worksheetCustomerLogo.value || '';
            data._id = this.worksheetCustomerLogo._id
        }
        else if (type == 'REGISTRATION_TITLE') {
            data.value = this.registrantTitle.value || '';
            data._id = this.registrantTitle._id
        }
        else if (type == 'REGISTRATION_MESSAGE') {
            data.value = this.registrantMsg.value || '';
            data._id = this.registrantMsg._id
        }
        else if (type == 'DEAL_WORKFLOW') {
            data.value = this.dealStageData.value || '';
            data._id = this.dealStageData._id;
            data.deal_stages = this.dealStageData.deal_stages;
        }

        
        // console.log('data',data);
        this.webService.post(url, data).subscribe((response: any) => {
            if (response.status == 1) {
                this.toastr.success(response.message, 'Success');
                this.spinnerService.hide();
                this.getDisplayData(type);
            } else {
                this.spinnerService.hide();
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    //// TAB FUNCTIONS ////
    doTabFunctions(event){

    }

    //// DEAL SETTINGS///
    onDealSettingUpdate(){
        let url = `sales/crm-deal-settings`;
        let deal_stages: any = [];
        this.stageList.forEach(element => {
            let object={
                features_enabled:{},
                name:''
            };
            object.name=element.value;
            object.features_enabled=element.features_enabled;
            deal_stages.push(object);
        });
        this.dealStageData.deal_stages=deal_stages;
        // console.log('deal_stages',deal_stages);
        this.updateSettings('DEAL_WORKFLOW');        
    }

    onStageSelection(stage){
      this.stageList.map(element=>element.value==stage.value ? element.selected=true:element.selected=false );
      let selected_stage=this.stageList.find((stage)=>stage.selected==true);
      this.buttonsList.forEach(element => {
          if(selected_stage.features_enabled.hasOwnProperty(element.key)){
            element.selected= selected_stage.features_enabled[element.key];
            
        }
     });
    }

    onFeaturesChange(){
        let selected_stage=this.stageList.find((stage)=>stage.selected==true);
        let features_enabled={};
        this.buttonsList.forEach(element => {
            if(selected_stage.features_enabled.hasOwnProperty(element.key)){
                features_enabled[element.key]=  element.selected;
          }
       });
    //    console.log('features_enabled',features_enabled);
       this.stageList.forEach(element => {
           if(element.selected==true){
            element.features_enabled=features_enabled;
           }
       })
    }
}
