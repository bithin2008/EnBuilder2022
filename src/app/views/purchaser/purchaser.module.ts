import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaserRoutingModule } from './purchaser-routing.module';
import { PurchaserComponent } from './purchaser.component';
import { ProjectProgressComponent } from './project-progress/project-progress.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SafeHtmlPipe } from '../../safe-html.pipe';
import { BooksComponent } from './books/books.component';
import { CollectionsComponent } from './collections/collections.component';
import { PagesComponent } from './pages/pages.component';
import { PageDetailsComponent } from './page-details/page-details.component';
import { UnitsDealsComponent } from './units-deals/units-deals.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UnitDealsDetailsComponent, CancelNotesComponent } from './unit-deals-details/unit-deals-details.component';
import { PortalAppComponent } from './portal-app/portal-app.component';
import { LayoutCustomizationsComponent } from './layout-customizations/layout-customizations.component';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
    declarations: [
        PurchaserComponent,
        ProjectProgressComponent,
        SafeHtmlPipe,
        BooksComponent,
        CollectionsComponent,
        PagesComponent,
        PageDetailsComponent,
        UnitsDealsComponent,
        UnitDealsDetailsComponent,
        PortalAppComponent,
        CancelNotesComponent,
        LayoutCustomizationsComponent,
    ],
    imports: [
        CommonModule,
        PurchaserRoutingModule,
        TabsModule,
        MultiSelectModule,
        AutoCompleteModule,
        NgMultiSelectDropDownModule.forRoot(),
        NgbModule,
        CarouselModule.forRoot(),
        ModalModule.forRoot(),
        BsDatepickerModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ModalModule.forRoot(),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
    ],
    entryComponents: [CancelNotesComponent]
})
export class PurchaserModule { }
