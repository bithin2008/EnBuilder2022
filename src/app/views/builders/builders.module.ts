import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BuilderDetailsComponent } from './builder-details/builder-details.component';
import { BuilderListComponent } from './builder-list/builder-list.component';
import { FileSaverModule } from 'ngx-filesaver';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { BuildersRoutingModule } from './builders-routing.module';
@NgModule({
  declarations: [
    BuilderDetailsComponent,
    BuilderListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ModalModule.forRoot(),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    TabsModule,
    ModalModule,
    NgxIntlTelInputModule,
    FileSaverModule,
    PdfViewerModule,
    BuildersRoutingModule
  ]
})
export class BuildersModule { }
