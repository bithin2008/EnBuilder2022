import { Component, OnInit, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../../../services/web.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { environment } from '../../../../environments/environment';
@Component({
    selector: 'app-books',
    templateUrl: './books.component.html',
    styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {
    paginationObj: any = {};
    sortedtby: any = '_updated';
    sortOrder: any = 'DESC';
    page: Number = 1;
    pageSize: Number = 20;
    order: string = '_updated';
    modalRef: BsModalRef;
    baseUrl = environment.BASE_URL;
    formDetails: any = {};
    isEdit: boolean = false;
    isClear: boolean = false;
    searchText = '';
    books = [];
    projectList:any[]=[];
    heroImage: any;
    constructor(
        private router: Router,
        private webService: WebService,
        private toastr: ToastrService,
        private modalService: BsModalService,
        private spinnerService: Ng4LoadingSpinnerService,
        private changeDetect: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService
    ) { }

    ngOnInit(): void {
        this.getBooks();
        this.getProjectList();
    }
    getBooks() {
        this.spinnerService.show();
        let url = `purchaser-portal/books?page=${this.page}&pageSize=${this.pageSize}&searchText=${this.searchText}`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            this.books=[];
            if (response.success && response.results.length > 0) {
                this.books = response.results;
                if(this.page == this.paginationObj.totalPages && response.results.length==0 && !response.pagination){
                    this.page = this.paginationObj.totalPages>1 ? this.paginationObj.totalPages-1 : 1;
                    this.getBooks()  
                } 
                this.paginationObj = response.pagination;
            }
            else {
                this.books = [];
                this.paginationObj = {
                    total: 0
                }
            }
        }, (error) => {
            this.toastr.error(error, 'Error!');
        })
    }

    getProjectList() {
        this.spinnerService.show();
        let url = `purchaser-portal/projects`;
        this.webService.get(url).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.status == 1) {
                this.projectList = response.results;
                this.projectList.forEach((project)=>{
                    project.is_selected=false;
                })
            }
        }, (error) => {
            console.log('error', error);
        });
    }
    doPaginationWise(page) {
        this.page = page;
        this.getBooks();
    }
    setPageSize() {
        this.page = 1;
        this.getBooks();
    }
    doSearch() {
        this.isClear = true;
        this.page = 1;
        this.getBooks();
    }
    clearSearch() {
        this.isClear = false;
        this.searchText = '';
        this.page = 1;
        this.getBooks();
    }
    goToDetails(id) {
        this.router.navigate([`/purchaser-admin/book-details/${id}`]);
    }
    openAddBookModal(template: TemplateRef<any>) {
        this.isEdit = false;
        this.formDetails = {
            is_published: false,
            name: ''
        };
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    openEditBookModal(event, template: TemplateRef<any>, item) {
        event.stopPropagation();
        this.isEdit = true;
        this.formDetails = { ...item };
        this.formDetails.layout = item.photo ? this.baseUrl + item.photo.url : null;
        this.projectList.forEach((element)=>{
            let selectedIds= this.formDetails.projects ?  this.formDetails.projects.map((project)=>project._id) :[];
            if(selectedIds.indexOf(element._id)!=-1){
                element.is_selected=true;
            }
            else{
                element.is_selected=false;
            }
        })
        this.modalRef = this.modalService.show(template, { class: 'modal-md', backdrop: 'static' });
    }
    addOrUpdateBook() {
        if (!this.formDetails.name) {
            this.toastr.warning('Please enter book name', 'Warning');
        }
        else {
            let projects= this.projectList.filter((project)=>project.is_selected);
            let formattedProjects=[];
            if(projects.length>0){
                 formattedProjects= projects.map((element)=>{
                    let Object={
                        _id:element._id,
                        name:element.name
                    }
                    return Object;
                })
            }
            let data: any = {
                name: this.formDetails.name,
                is_published: this.formDetails.is_published,
                projects:formattedProjects
            }
            if (this.isEdit) {
                data._id = this.formDetails._id;
            }
            let url = `purchaser-portal/books`;
            this.spinnerService.show();
            this.webService.post(url, data).subscribe((response: any) => {
                if (response.status == 1) {
                    if (this.heroImage) {
                        this.uploadBookImage(response.result);
                    } else {
                        this.spinnerService.hide();
                        this.getBooks();
                    }
                    this.toastr.success(response.message, 'Success');
                    this.modalRef.hide();
                } else {
                    this.toastr.error(response.message, 'Error');
                    this.spinnerService.hide();
                }
            }, (error) => {
                console.log('error', error);
            });
        }
    }
    deleteBook(event, item) {
        event.stopPropagation();
        this.confirmationDialogService.confirm('Delete', `Do you want to delete the book '${item.name}'?`)
            .then((confirmed) => {
                if (confirmed) {
                    let url = `purchaser-portal/books?_id=${item._id}`;
                    this.spinnerService.show();
                    this.webService.delete(url).subscribe((response: any) => {
                        this.spinnerService.hide();
                        if (response.status == 1) {
                            this.toastr.success(response.message, 'Success');
                            this.getBooks();
                        } else {
                            this.toastr.error(response.message, 'Error');
                        }
                    }, (error) => {
                        console.log('error', error);
                    });
                }
            })
            .catch((error) => { });
    }
    uploadBookImage(bookData) {
        var formData = new FormData();
        formData.append('image', this.heroImage);
        formData.append('update_type', 'photo');
        let url = `purchaser-portal/books?_id=${bookData._id}`;
        this.webService.fileUpload(url, formData).subscribe((response: any) => {
            this.spinnerService.hide();
            if (response.success) {
                if (response.status == 1) {
                    this.heroImage = '';
                    this.getBooks();
                }
            } else {
                this.toastr.error(response.message, 'Error');
            }
        }, (error) => {
            console.log('error', error);
        });

    }
    uploadImage(files) {
        if(files.item(0)){
            let validation = this.validateDocumentUpload(files.item(0).name);
            if (validation) {
                this.heroImage = files.item(0);
                this.getBase64(files.item(0));
            } else {
                this.toastr.error("Please upload only JPG, PNG, GIF format", "Error");
                
            }
        }
    }

    //FILE UPLAOD TO BASE64 CONVERSION
    getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.formDetails.layout = reader.result;
            // console.log('this.formDetails.layout', this.formDetails.layout);
        };
        reader.onerror = function (error) {
            console.log("Error: ", error);
        };
    }

    //FILE UPLOAD VALIDATION
    validateDocumentUpload(fileName) {
        var allowed_extensions = new Array("jpg", "jpeg", "png", "gif");
        var file_extension = fileName.split(".").pop().toLowerCase();
        for (var i = 0; i <= allowed_extensions.length; i++) {
            if (allowed_extensions[i] == file_extension) {
                return true; // valid file extension
            }
        }
        return false;
    }
}
