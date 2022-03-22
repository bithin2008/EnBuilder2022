import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebService } from './services/web.service';
import { SideMenuService } from './services/side-menu.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true
};
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
// Import containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
import { LoginComponent } from './views/login/login.component';
const APP_CONTAINERS = [
    DefaultLayoutComponent
];
import {
    AppAsideModule,
    AppBreadcrumbModule,
    AppHeaderModule,
    AppFooterModule,
    AppSidebarModule,
} from '@coreui/angular';
// Import routing module
import { AppRoutingModule } from './app.routing';
import { ReactiveFormsModule } from '@angular/forms';
// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { ConfirmationDialogComponent } from './views/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from './views/confirmation-dialog/confirmation-dialog.service';
import { NgIdleService } from './services/ng-idle.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
// import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LightboxModule } from 'ngx-lightbox';
import { ContactModalComponent } from './views/sales/contact-modal/contact-modal.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { HomeComponent } from './views/home/home.component';



@NgModule({
    declarations: [
        AppComponent,
        ...APP_CONTAINERS,
        P404Component,
        P500Component,
        LoginComponent,
        ConfirmationDialogComponent,
        ContactModalComponent
    ],
    imports: [
        FormsModule,
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        AppAsideModule,
        AppBreadcrumbModule.forRoot(),
        AppFooterModule,
        AppHeaderModule,
        AppSidebarModule,
        PerfectScrollbarModule,
        ReactiveFormsModule,
        BsDropdownModule.forRoot(),
        TabsModule.forRoot(),
        NgbModule,
        ModalModule,
        LightboxModule,
        Ng4LoadingSpinnerModule.forRoot(),
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            easing: 'ease-in',
            timeOut: 4000,
            preventDuplicates: true,
        }),
        NgxIntlTelInputModule,
        AutoCompleteModule,

        // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],

    providers: [
        WebService,
        NgIdleService,
        SideMenuService,
        ConfirmationDialogService,
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        }
    ],
    entryComponents: [ConfirmationDialogComponent, ContactModalComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }
