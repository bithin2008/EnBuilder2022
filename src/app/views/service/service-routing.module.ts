import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChecklistsDetailsComponent } from './checklists-details/checklists-details.component';
import { ServiceComponent } from './service.component';


const routes: Routes = [
    {
        path: '',
        component: ServiceComponent
    },
    {
        path: 'checklist/:checkListId',
        component: ChecklistsDetailsComponent,
        data: {
            title: 'Checklist details'
        }
    },
    // {
    //     path: 'book-details/:bookId',
    //     component: 
    // },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ServiceRoutingModule { }
