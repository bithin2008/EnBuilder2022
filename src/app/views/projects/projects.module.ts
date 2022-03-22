import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { ProjectListModule } from './project-list/project-list.module';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { SubDivisionsComponent } from './sub-divisions/sub-divisions.component';
import { FileSaverModule } from 'ngx-filesaver';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AmenitiesComponent } from './amenities/amenities.component';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
    declarations: [
        ProjectsComponent,
        SubDivisionsComponent,
        ProjectDetailsComponent,
        AmenitiesComponent
    ],
    imports: [
        CommonModule,
        ProjectsRoutingModule,
        FormsModule,
        ColorPickerModule,
        ReactiveFormsModule,
        NgbModule,
        ModalModule.forRoot(),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        TabsModule,
        ModalModule,
        NgxIntlTelInputModule,
        ProjectListModule,
        FileSaverModule,
        PdfViewerModule,
        BsDatepickerModule.forRoot(),

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ProjectsModule { }
