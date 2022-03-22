import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { Subject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-checklists-details',
  templateUrl: './checklists-details.component.html',
  styleUrls: ['./checklists-details.component.css']
})
export class ChecklistsDetailsComponent implements OnInit {
  checklistId:any='';
  checkListDetailsObj:any={};
  formDetails:any={};
  modalRef: BsModalRef;
  isEdit:boolean=false;
  categoryList:any[]=[];
  checklistCategories:any[]=[];
  private issueChanged: Subject<string> = new Subject<string>();
  private subscription: Subscription;

  constructor( private router: Router,
    private webService: WebService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private spinnerService: Ng4LoadingSpinnerService,
    private confirmationDialogService: ConfirmationDialogService,
    public _activatedRoute: ActivatedRoute) {
      this.checklistId = this._activatedRoute.snapshot.paramMap.get("checkListId");
     }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.checkLogin();
    this.subscription = this.issueChanged
    .pipe(
        map((data: any) => {
            return data;
        })
        , debounceTime(200)
        , distinctUntilChanged()
    ).subscribe((searchValue: string) => {
        if (searchValue) {
            this.onIssueChange(searchValue);
        }
    });
  }

  checkLogin() {
    let url = 'whoami';
    this.webService.get(url).subscribe((response: any) => {
      if (response.success) {
        if (response.result.isGuest) {
            this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
        }
        else {
          this.getChecklistDetails();
          this.getChecklistCatergory();
              
        }
      }
      else{
        this.router.navigate(['/login'], { queryParams: { return_url: 'service' } });
      }
    }, (error) => {
        this.toastr.error(error, 'Error!');
    })
 }

  ngOnDestory(){
    this.subscription.unsubscribe();
  }

  goToCheckList(){
    this.router.navigate(['service']);
  }

  getChecklistDetails() {
    this.spinnerService.show();
    let url = `service/checklists?_id=${this.checklistId}`;
    this.webService.get(url).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.is_valid_session) {
            if (response.status == 1) {
                this.checkListDetailsObj = response.result;

            } else {
                this.toastr.error(response.message, 'Error');
            }
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: `service/${this.checklistId}` } });
        }
    }, (error) => {
        console.log('error', error);
    });
  }

  
  openEditChecklist(template: TemplateRef<any>) {
    this.formDetails = Object.assign({}, this.checkListDetailsObj);
    this.isEdit = true;
    this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

  }

  updateChecklist() {
    if (!this.formDetails.name) {
        this.toastr.warning('Please select name', 'Warning');
        return;
    }
    let url = `service/checklists`;

    let data: any = {
      name: this.formDetails.name,
      type: this.formDetails.type,
      description: this.formDetails.description,
      enabled: this.formDetails.enabled ? true : false,
      _id: this.checklistId
    };
    this.spinnerService.show();
    this.webService.post(url, data).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.status == 1) {
            this.toastr.success(response.message, 'Success');
            this.getChecklistDetails();
            this.modalRef.hide();
        } else {
            this.toastr.error(response.message, 'Error');
        }
    }, (error) => {
        this.spinnerService.hide();
        console.log('error', error);
    });
  }

  deleteCheckItem(){
    this.confirmationDialogService.confirm('Delete', `Do you want to delete this item?`)
    .then((confirmed) => {
        if (confirmed) {
            let url = `service/checklists?_id=${this.checklistId}`;
            this.spinnerService.show();
            this.webService.delete(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    this.router.navigate(['service']);
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
        }
    })
    .catch((error) => { });
  }

  ////CATEGORY SECTION///
  // addCategory(template: TemplateRef<any>){
  //   this.formDetails = Object.assign({}, this.checkListDetailsObj);
  //   this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });

  // }

  addCategory(){
    let newItem= {
      name:'',
      items:[{value:''}]
    }
    this.categoryList.unshift(newItem);
  }
  
  IssueInputChanged(value,categoryIndex,itemIndex) {
    if(!value){
      return ;
    }
    let data={
      value:value,
      index:categoryIndex,
      itemIndex:itemIndex
    }
  this.issueChanged.next(JSON.stringify(data));
  }

  onIssueChange(response){
    let data= JSON.parse(response);
    if(data.value && data.value.trim()){
        if(this.categoryList[data.index].items.length==(data.itemIndex+1)){
          this.categoryList[data.index].items.push({value:''});
        }
    }
    else{
      if(this.categoryList[data.index].items.length>(data.itemIndex+1)){
        if(this.categoryList[data.index].items[data.itemIndex+1] && !this.categoryList[data.index].items[data.itemIndex+1].value){
          this.categoryList[data.index].items.splice(data.itemIndex+1);
        }
      }
    }
  }

  removeIssue(index, catIndex){
    this.confirmationDialogService.confirm('Delete', `Do you want to remove this item?`)
    .then((confirmed) => {
        if (confirmed) {
          this.categoryList[catIndex].items.splice(index,1);
          let items=[];
          this.categoryList[catIndex].items.map((item)=>{
            if(item.value){
              items.push(item.value)
            }
          });
          let data: any = {
            _id: this.categoryList[catIndex]._id,
            items:items,
          };
            this.updateCategoryItem(data);
        }
      }, (error) => {
        console.log('error', error);
    });
  }

  onCategoryChange(index,category){
    // if (!this.categoryList[index].name) {
    //   this.toastr.warning('Please enter cantegory name', 'Warning');
    //   return;
    // }
    // console.log('category',category);
    if(category._id){
        if(this.categoryList[index].name){
          let items=[];
          this.categoryList[index].items.map((item)=>{
            if(item.value){
              items.push(item.value)
            }
          });
          let data: any = {
            name: this.categoryList[index].name,
            items:items,
            // step:1,
            _id: category._id
        }
        this.updateCategoryItem(data);
      }
    }
    else{
        if(this.categoryList[index].name){
        let items=[];
        this.categoryList[index].items.map((item)=>{
          if(item.value){
            items.push(item.value)
          }
        });
        let data: any = {
          name: this.categoryList[index].name,
          items:items,
          order:index+1,
          checklist_id: this.checkListDetailsObj._id
      };
        this.addNewCategory(data,index);
      }
    }
  }

  addNewCategory(data,index){
    let url = `service/checklist-categories`;  
    // console.log('data',data);
    // this.spinnerService.show();
    this.webService.post(url, data).subscribe((response: any) => {
        // this.spinnerService.hide();
        if (response.status == 1) {
            this.categoryList[index]=response.result ? response.result : {};
            if(this.categoryList[index].items && this.categoryList[index].items.length==0){
              this.categoryList[index].items.push({value:''});
          }
          else{
            let existingItems=[];
            this.categoryList[index].items.forEach(element => {
              existingItems.push({value:element})
            });
            existingItems.push({value:''});
            this.categoryList[index].items=existingItems;
          }
            this.toastr.success(response.message, 'Success');
            // this.getChecklistCatergory();
        } else {
            this.toastr.error(response.message, 'Error');
        }
    }, (error) => {
        // this.spinnerService.hide();
        console.log('error', error);
    });
  }

  onCategoryItemChange(value,catIndex){
    if (!this.categoryList[catIndex].name) {
      this.toastr.warning('Please enter cantegory name', 'Warning');
      return;
    }
    else if(!value){
      return;
    }
    let items=[];
    this.categoryList[catIndex].items.map((item)=>{
      if(item.value){
        items.push(item.value)
      }
    });
    let data: any = {
      _id: this.categoryList[catIndex]._id,
      items:items,
    };

    if(data.items.length>0){
      this.updateCategoryItem(data);
    }
  }

  updateCategoryItem(data){
  let url = `service/checklist-categories`;  
  // console.log('data',data);
  this.webService.post(url, data).subscribe((response: any) => {
      if (response.status == 1) {
          // this.toastr.success(response.message, 'Success');
          // this.getChecklistCatergory();
      } else {
          this.toastr.error(response.message, 'Error');
      }
  }, (error) => {
      console.log('error', error);
  });  
  }

  getChecklistCatergory(){
    // this.spinnerService.show();
    let url = `service/checklist-categories?checklist_id=${this.checklistId}`;
    this.webService.get(url).subscribe((response: any) => {
        // this.spinnerService.hide();
        if (response.is_valid_session) {
            if (response.status == 1) {
                this.categoryList = response.results ?response.results :[];
                this.categoryList.forEach((element)=>{
                  if(element.items && element.items.length==0){
                      element.items.push({value:''});
                  }
                  else{
                    let existingItems=[];
                    element.items.forEach(element => {
                      existingItems.push({value:element})
                    });
                    existingItems.push({value:''});
                    element.items=existingItems;
                  }
                })
            } else {
                this.toastr.error(response.message, 'Error');
            }
        } else {
            this.toastr.error('Your Session expired', 'Error');
            this.router.navigate(['/login'], { queryParams: { return_url: `service/${this.checklistId}` } });
        }
    }, (error) => {
        console.log('error', error);
    });
  }

  deleteChecklistItem(item,index){
    this.confirmationDialogService.confirm('Delete', `Do you want to delete this checklist category?`)
    .then((confirmed) => {
        if (confirmed) {
          if(item._id){
            let url = `service/checklist-categories?_id=${item._id}`;
            // console.log(item);
            this.spinnerService.show();
            this.webService.delete(url).subscribe((response: any) => {
                this.spinnerService.hide();
                if (response.status == 1) {
                    this.toastr.success(response.message, 'Success');
                    // this.getChecklistCatergory()
                    this.categoryList.splice(index,1);
                } else {
                    this.toastr.error(response.message, 'Error');
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log('error', error);
            });
          }
          else{
            this.categoryList.splice(index,1);

          }

        }
    })
    .catch((error) => { });
  }

  ///Rearrange category ////
  reArrangeCategoryStep(direction, index) {
    // console.log(index);
    if (direction == 'up') {
        let previous = { ...this.categoryList[index - 1] };
        let current = { ...this.categoryList[index] };
    // console.log(previous,current)

        let payload = {
            data: [
                {
                    _id: previous._id,
                    order: previous.order - 1
                },
                {
                    _id: current._id,
                    order: current.order + 1
                }
            ]
        }
        this.onOrderChange(payload);

    }
    else if (direction == 'down') {
        let next = { ... this.categoryList[index + 1] };
        let current = { ...this.categoryList[index] };
        let payload = {
            data: [
                {
                    _id: next._id,
                    order: next.order + 1
                },
                {
                    _id: current._id,
                    order: current.order - 1
                }
            ]
        }
        this.onOrderChange(payload);
    }
  }

  onOrderChange(data) {
    console.log('data',data);
    this.spinnerService.show();
    let url = `service/checklist-categories-rearrange`;
    this.webService.post(url, data).subscribe((response: any) => {
        this.spinnerService.hide();
        if (response.status == 1) {
            this.toastr.success(response.message, 'Success');
            this.getChecklistCatergory();
        }
        else {
            this.toastr.error(response.message, 'Error');
        }
    }, (error) => {
        console.log('error', error);
    });
  }

    ///Rearrange category item ////
  reArrangeCategoryItemStep(direction,catIndex, index) {
    if (direction == 'up') {
        let previousItem = this.categoryList[catIndex].items[index - 1];
        let currentItem = this.categoryList[catIndex].items[index];
        this.categoryList[catIndex].items[index]= previousItem;
        this.categoryList[catIndex].items[index - 1]= currentItem;
        // this.onStepChange(payload);
        this.onCategoryChange(catIndex,this.categoryList[catIndex]);
    }
    else if (direction == 'down') {
        let nextItem = this.categoryList[catIndex].items[index + 1];
        let currentItem = this.categoryList[catIndex].items[index];
        this.categoryList[catIndex].items[index]= nextItem;
        this.categoryList[catIndex].items[index + 1]= currentItem;

        this.onCategoryChange(catIndex,this.categoryList[catIndex]);
        // this.onStepChange(payload);
    }
  }
}
