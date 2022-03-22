import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProjectListComponent } from './project-list.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
@NgModule({
  declarations: [ProjectListComponent],
  imports: [
    CommonModule,  
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    NgbModule,
    ModalModule.forRoot(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    TabsModule,
    ModalModule,
    CommonModule
  ],
  exports: [ProjectListComponent]
})
export class ProjectListModule { }
