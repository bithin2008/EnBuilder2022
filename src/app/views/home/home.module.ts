import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MasterSearchComponent } from './master-search/master-search.component';
import { FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HighlightPipe } from '../../hightlight.pipe';


@NgModule({
    declarations: [HomeComponent, MasterSearchComponent, HighlightPipe],
    imports: [
        CommonModule,
        HomeRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        ModalModule.forRoot(),
        TabsModule,
        ModalModule
    ]
})
export class HomeModule { }
