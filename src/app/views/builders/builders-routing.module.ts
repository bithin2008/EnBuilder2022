import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuilderDetailsComponent } from './builder-details/builder-details.component';
import { BuilderListComponent } from './builder-list/builder-list.component';

const routes: Routes = [
  {
    path: '',
    component: BuilderListComponent,
    data: {
      title: 'Builder Lists'
    }
  },
  {
    path: ':builderId',
    component: BuilderDetailsComponent,
    data: {
      title: 'Builder Details'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildersRoutingModule { }
