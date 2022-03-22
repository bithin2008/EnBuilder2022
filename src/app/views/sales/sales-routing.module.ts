import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesComponent } from './sales.component';
import { WorksheetsDetailsComponent } from './worksheets-details/worksheets-details.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ListDetailsComponent } from './list-details/list-details.component';
import { DealDetailsComponent } from './deal-details/deal-details.component';
import { RegistrantsDetailsComponent } from './registrants-details/registrants-details.component';

const routes: Routes = [
    {
        path: '',
        component: SalesComponent,
        data: {
            title: 'Sales'
        }
    },
    {
        path: 'contact/:contactId',
        component: ContactDetailsComponent,
        data: {
            title: 'Contact Details'
        }
    },
    {
        path: 'worksheets/:worksheetId',
        component: WorksheetsDetailsComponent,
        data: {
            title: 'Worksheets Details'
        }
    },
    {
        path: 'registrants/:registrantId',
        component: RegistrantsDetailsComponent,
        data: {
            title: 'Worksheet Details'
        }
    },
    {
        path: 'lists/:Id',
        component: ListDetailsComponent,
        data: {
            title: 'List Details'
        }
    },
    {
        path: 'deals/:dealId',
        component: DealDetailsComponent,
        data: {
            title: 'Deal Details'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SalesRoutingModule { }
