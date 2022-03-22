import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
    selector: 'app-package-center-settings',
    templateUrl: './package-center-settings.component.html',
    styleUrls: ['./package-center-settings.component.css']
})
export class PackageCenterSettingsComponent implements OnInit {
    private eventsSubscription: Subscription;
    @Input() events: Observable<void>;
    modalRef: BsModalRef;
    formDetails: any = {};
    projectDetials: any = {};
    selectedProject: string = '';
    constructor(private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
    ) { }

    ngOnInit(): void {


        this.eventsSubscription = this.events.subscribe((response: any) => {
            if (response) {
                this.selectedProject = response._id;
                this.getProjectDetails();
            }
            else {
                this.projectDetials.image_disclaimer_text = '';
                this.selectedProject = '';

            }
        });
        this.getSavedFilterdata();
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

    openEditDesclaimerModal(template: TemplateRef<any>) {
        Object.assign(this.formDetails, this.projectDetials);
        this.modalRef = this.modalService.show(template, { class: 'modal-lg', backdrop: 'static' });

    }

    getSavedFilterdata() {
        let projectData: any = localStorage.getItem('packageCenterProjectData');
        if (projectData) {
            projectData = JSON.parse(projectData);
            if (projectData && projectData._id) {
                this.selectedProject = projectData._id;
                this.getProjectDetails();

            }
        }
    }

    getProjectDetails() {
        this.spinnerService.show();
        let url = `package-center/projects?_id=${this.selectedProject}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectDetials = response.result;
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log('error', error);
        });
    }

    updateImageDisclaimer() {
        let data: any = {};
        data.image_disclaimer_text = this.formDetails.image_disclaimer_text ? this.formDetails.image_disclaimer_text : '';
        data._id = this.selectedProject;
        if (this.selectedProject) {
            let url = `package-center/projects`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.getProjectDetails();
                }
                this.modalRef.hide();
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
        else {
            this.toastr.warning('Please select project', 'Warning');
        }
    }
}
