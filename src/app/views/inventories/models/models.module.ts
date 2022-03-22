import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModelsComponent } from './models.component';
import { ModelDetailsComponent } from '../model-details/model-details.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
    declarations: [ModelsComponent, ModelDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        NgbModule,
        PdfViewerModule,
        NgMultiSelectDropDownModule.forRoot(),
        ReactiveFormsModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
        BsDatepickerModule.forRoot(),

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    exports: [ModelsComponent]
})
export class ModelsModule { }
