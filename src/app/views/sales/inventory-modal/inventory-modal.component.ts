import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogService } from '../../confirmation-dialog/confirmation-dialog.service';
import { fabric } from "fabric";
import { ConstantPool } from '@angular/compiler';

@Component({
    selector: 'app-inventory-modal',
    templateUrl: './inventory-modal.component.html',
    styleUrls: ['./inventory-modal.component.css']
})
export class InventoryModalComponent implements OnInit {
    @Input() data;
    unitArray = [];
    floorArray = [];
    selectedProject = '';
    isInventoryModalShow: boolean = false;
    selectedView = '';
    selectedBed = '';
    selectedBath = '';
    selectedMinFloor: any = 1;
    selectedMaxFloor: any = '';
    selectedMaxUnit: any = '';
    selectedMinUnit: any = 1;
    suitesArray: any = [];
    suiteArrayToShow: any = [];
    numberOfFloor = null;
    numberOfUnit = null;
    suitObj = {};
    suiteDataReady: boolean = false;
    projectDetails: any = {};
    projectDetail: any = {};
    projectViewList: any = [];
    minFloorOptionsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    maxFloorOptionsArray = [9, 8, 7, 6, 5, 4, 3, 2, 1];
    canvas: any;
    canvasHeight: number = 50;
    displayCanvas: boolean = false;
    measureUnits: any[] = [];
    blockType: any[] = [{
        color: 'yellow',
        type: 'Empty Unit'
    }, {
        color: 'green',
        type: 'Available Unit'
    }, {
        color: 'blue',
        type: 'Status is not assigned'
    }, {
        color: 'red',
        type: 'Unit status is sold or Other'
    }];
    selectedTabType:string='condominium';
    constructor(public activeModal: NgbActiveModal,
        private webService: WebService,
        private spinnerService: Ng4LoadingSpinnerService,
        private toastr: ToastrService,
        private confirmationDialogService: ConfirmationDialogService) { }

    ngOnInit(): void {
        this.measureUnits = localStorage.getItem('measurementUnit') ? JSON.parse(localStorage.getItem('measurementUnit')) : [];

        this.unitArray = [];
        this.floorArray = [];
        if (this.data.project_id) {
            this.getUnitList();

        }
    }

    //TO GET UNITS
    getUnitList() {
        this.spinnerService.show();
        this.selectedView = '';
        this.selectedBed = '';
        this.selectedBath = '';
        this.suitesArray = [];
        this.suiteArrayToShow = [];
        this.suitesArray = this.data.units;
        this.suiteArrayToShow = this.suitesArray;
        this.getProjectDetails();
        setTimeout(() => {
            this.suiteDataReady = true;
        }, 1000);
    }

    openTab(type){
        this.selectedTabType=type;
        setTimeout(()=>{
            this.canvas = new fabric.Canvas("view-plan-designer");
            this.canvas.on({
                'object:moving': ((event) => {
                    event.target.lockMovementX = true;
                    event.target.lockMovementY = true;
                })
            });
        },500)
            
        setTimeout(()=>{
            //To disable the movement of units on canvas
            let additionalInfo=this.projectDetail.additional_info;
            let condominiumUnits= this.suiteArrayToShow.filter((item)=>item.building_type=='condominium');
            let townhouseUnits= this.suiteArrayToShow.filter((item)=>item.building_type=='townhouse');
            let semiDetachedUnits= this.suiteArrayToShow.filter((item)=>item.building_type=='semi-detached');
            let detachedUnits= this.suiteArrayToShow.filter((item)=>item.building_type=='detached');
            this.numberOfFloor=0;
            this.numberOfUnit=0;
            this.selectedMaxFloor=0;
            this.selectedMaxUnit=0;
            this.floorArray = [];
            this.showsuite = [];
            //condominium
            if(this.selectedTabType=='condominium'){
                if(additionalInfo && additionalInfo[0].type=='condominium'){
                    let  no_of_floors= additionalInfo[0].total_floors;
                    let  no_of_lots= additionalInfo[0].total_units;
                    this.numberOfFloor = no_of_floors ? no_of_floors : 0;
                    this.numberOfUnit = no_of_lots ? no_of_lots : 0;
                    this.selectedMaxFloor = no_of_floors ? no_of_floors : 0;
                    this.selectedMaxUnit = no_of_lots ? no_of_lots : 0;
                    for (var i = 1; i <= parseInt(this.numberOfFloor); i++) { //creating floors count
                        this.floorArray.push(i);
                    }
                    this.displayCanvas = true;
                    this.floorArray.reverse();//to display floor bottom to top(DESC) order
                    this.canvasHeight =10;
                    this.canvasHeight = this.canvasHeight + this.floorArray.length * 150;
                    this.canvas.setDimensions({ height: this.canvasHeight });
                    let floorWidthArray = [];
                    let blockHeight = 150;
                    let currentTopVal = 0;
                    this.floorArray.forEach((floor, findex) => {
                        let updatedUnitsArray = [{
                            status: 'initial',
                            isUnitPresent: false
                        }];
                        let unitsOfFloor = condominiumUnits.filter(x => x.building_view ? x.building_view.floor == floor : x); //filtering units for floor
                        let unitPositions: any[] = unitsOfFloor.map((element) => element.building_view ? element.building_view.unit : -1); //finding position of units

                        let maxUnits = unitPositions.length > 0 ? Math.max(...unitPositions) : 0; //finding max units from position
                        this.unitArray = [];
                        for (var j = 0; j <= maxUnits; j++) {//creating units positions
                            this.unitArray.push(j);
                            let existingUnit = unitsOfFloor.find(element => element.building_view ? element.building_view.unit == j : element);
                            if (existingUnit) {
                                existingUnit.isUnitPresent = true;
                                updatedUnitsArray.push(existingUnit);
                            }
                            else {
                                let emptyUnit: any = {
                                    isUnitPresent: false
                                };
                                updatedUnitsArray.push(emptyUnit);
                            }
                        }
                        console.log('updatedUnitsArray', updatedUnitsArray, 'findex', findex, 'unitArray', this.unitArray);
                        let floorWidth = this.unitArray.length > 1 ? this.unitArray.length * 110 : 110 * 2; //calculating width of floor
                        let rect = new fabric.Rect({ //creating floor block
                            left: 10,
                            top: currentTopVal,
                            fill: 'yellow',
                            width: floorWidth,
                            height: blockHeight,
                            objectCaching: false,
                            selectable: false,
                            stroke: 'lightgray',
                            strokeWidth: 1,
                            hasControls: false,
                            hasBorders: false
                        });
                        this.canvas.add(rect);
                        let leftFromPrevUnit = 7;//12
                        updatedUnitsArray.forEach((unit: any, index) => {
                            // console.log('updatedUnitsArray', updatedUnitsArray);
                            if (index == 0 && unit.status == 'initial') {
                                let unitBlock = new fabric.Rect({ //creating unit block
                                    fill: 'white',
                                    width: 110,
                                    height: 150,
                                    objectCaching: false,
                                    selectable: false,
                                    stroke: 'lightgray',
                                    strokeWidth: 1,
                                    hasControls: false,
                                    hasBorders: false,
                                    originX: 'center',
                                    originY: 'center'
                                });
                            
                                let value = `${floor}\nUnit\nModel\nBed\nBath\nArea(${this.measureUnits[0] ? (this.measureUnits[0].area || '-') : '-'})\nCeiling(${this.measureUnits[0] ? (this.measureUnits[0].length || '-') : '-'})\nPrice`;
                                let text = new fabric.Text(value, {//creating text block
                                    objectCaching: false,
                                    selectable: false,
                                    hasControls: false,
                                    hasBorders: false,
                                    fontSize: 14,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                    left: leftFromPrevUnit,
                                    top: currentTopVal,
                                    selectable: true,
                                    hasControls: false
                                });
                                this.canvas.add(group);

                            }
                            else if (unit.building_view && unit.building_view.unit && unit.isUnitPresent) { //if unit exist for floor then creating it 
                                let unitBlock = new fabric.Rect({ //creating unit block
                                    fill: this.getUnitColor(unit.status),
                                    width: (unit.building_view && unit.building_view.width) ? unit.building_view.width : 110,
                                    height: (unit.building_view && unit.building_view.height) ? unit.building_view.height : 150,
                                    objectCaching: false,
                                    selectable: false,
                                    stroke: 'lightgray',
                                    strokeWidth: 1,
                                    hasControls: false,
                                    hasBorders: false,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let value = `\n${unit.unit_no}\n${unit.model_name ? unit.model_name : '-'}\n${unit.bed ? unit.bed : '-'}\n${unit.bath ? unit.bath : '-'}\n${unit.area ? unit.area : '-'}\n${unit.ceiling ? unit.ceiling : '-'}\n$${unit.price ? unit.price : '-'}`;
                                let text = new fabric.Text(value, {//creating text block
                                    objectCaching: false,
                                    selectable: false,
                                    hasControls: false,
                                    hasBorders: false,
                                    fontSize: 14,
                                    fill: 'white',
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                    left: leftFromPrevUnit,
                                    top: currentTopVal,
                                    selectable: true,
                                    hasControls: false
                                });
                                this.canvas.add(group);
                                group.on('selected', (e) => {
                                    this.reserveUnit(unit);//calling confimation over the selection
                                });
                                // leftFromPrevUnit = leftFromPrevUnit + unit.building_view.width;
                                leftFromPrevUnit = leftFromPrevUnit + ((unit.building_view && unit.building_view.width) ? unit.building_view.width : 110);

                            }
                            else if (unit.status == 'initial' || !unit.isUnitPresent) {
                                leftFromPrevUnit = leftFromPrevUnit + 110
                            }
                        })
                        if (floorWidthArray.length == 0) {
                            floorWidthArray.push(leftFromPrevUnit);
                        }
                        if (floorWidthArray[0] && (floorWidthArray[0] < leftFromPrevUnit && (floorWidthArray[0] != leftFromPrevUnit))) {
                            floorWidthArray[0] = leftFromPrevUnit;
                        }

                        //ABOVE CODE ADD EXTRA BLOCK AFTER UNITS
                        currentTopVal = currentTopVal + blockHeight;
                    })
                    const canvasWidth = floorWidthArray[0] + 120;
                    this.canvas.setDimensions({ width: canvasWidth, height: this.canvasHeight });
                }   

            }
        
            //townhouse
            if(this.selectedTabType=='townhouse'){
                if(additionalInfo && additionalInfo[1].type=='townhouse'){
                    let  total_buildings= additionalInfo[1].total_buildings;
                    let  total_homes= additionalInfo[1].total_homes;
                    // this.numberOfFloor = no_of_floors ? no_of_floors : 0;
                    this.numberOfFloor = 1;
                    this.numberOfUnit = total_homes ? total_homes : 0;
                    this.selectedMaxFloor = 1;
                    // this.selectedMaxFloor = no_of_floors ? no_of_floors : 0;
                    this.selectedMaxUnit = total_homes ? total_homes : 0;
                    for (var i = 1; i <= parseInt(this.numberOfFloor); i++) { //creating floors count
                        this.floorArray.push(i);
                    }
                    this.displayCanvas = true;
                    this.floorArray.reverse();//to display floor bottom to top(DESC) order
                    this.canvasHeight =10;
                    this.canvasHeight = this.canvasHeight + this.floorArray.length * 150;
                    this.canvas.setDimensions({ height: this.canvasHeight });
                    let floorWidthArray = [];
                    let blockHeight = 150;
                    let currentTopVal = 0;
                    this.floorArray.forEach((floor, findex) => {
                        let updatedUnitsArray = [{
                            status: 'initial',
                            isUnitPresent: false
                        }];
                        // let unitsOfFloor = townhouseUnits.filter(x => x.building_view ? x.building_view.floor == floor : x); //filtering units for floor
                        let unitPositions: any[] = townhouseUnits.map((element) => element.building_view ? element.building_view.unit : -1); //finding position of units
                        townhouseUnits.forEach(element => {
                            element.isUnitPresent=true;
                            updatedUnitsArray.push(element);
                        });
                    
                        let floorWidth = updatedUnitsArray.length > 1 ? updatedUnitsArray.length * 110 : 110 * 2; //calculating width of floor
                        let rect = new fabric.Rect({ //creating floor block
                            left: 10,
                            top: currentTopVal,
                            fill: 'yellow',
                            width: floorWidth,
                            height: blockHeight,
                            objectCaching: false,
                            selectable: false,
                            stroke: 'lightgray',
                            strokeWidth: 1,
                            hasControls: false,
                            hasBorders: false
                        });
                        this.canvas.add(rect);
                        let leftFromPrevUnit = 7;//12
                        updatedUnitsArray.forEach((unit: any, index) => {
                            if (index == 0 && unit.status == 'initial') {
                                let unitBlock = new fabric.Rect({ //creating unit block
                                    fill: 'white',
                                    width: 110,
                                    height: 150,
                                    objectCaching: false,
                                    selectable: false,
                                    stroke: 'lightgray',
                                    strokeWidth: 1,
                                    hasControls: false,
                                    hasBorders: false,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let value = `${floor}\nUnit\nModel\nBed\nBath\nArea(${this.measureUnits[0] ? (this.measureUnits[0].area || '-') : '-'})\nCeiling(${this.measureUnits[0] ? (this.measureUnits[0].length || '-') : '-'})\nPrice`;
                                let text = new fabric.Text(value, {//creating text block
                                    objectCaching: false,
                                    selectable: false,
                                    hasControls: false,
                                    hasBorders: false,
                                    fontSize: 14,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                    left: leftFromPrevUnit,
                                    top: currentTopVal,
                                    selectable: true,
                                    hasControls: false
                                });
                                this.canvas.add(group);
                            }
                            else if (unit.building_view && unit.building_view.unit && unit.isUnitPresent) { //if unit exist for floor then creating it 
                                let unitBlock = new fabric.Rect({ //creating unit block
                                    fill: this.getUnitColor(unit.status),
                                    width: (unit.building_view && unit.building_view.width) ? unit.building_view.width : 110,
                                    height: (unit.building_view && unit.building_view.height) ? unit.building_view.height : 150,
                                    objectCaching: false,
                                    selectable: false,
                                    stroke: 'lightgray',
                                    strokeWidth: 1,
                                    hasControls: false,
                                    hasBorders: false,
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let value = `\n${unit.unit_no}\n${unit.model_name ? unit.model_name : '-'}\n${unit.bed ? unit.bed : '-'}\n${unit.bath ? unit.bath : '-'}\n${unit.area ? unit.area : '-'}\n${unit.ceiling ? unit.ceiling : '-'}\n$${unit.price ? unit.price : '-'}`;
                                let text = new fabric.Text(value, {//creating text block
                                    objectCaching: false,
                                    selectable: false,
                                    hasControls: false,
                                    hasBorders: false,
                                    fontSize: 14,
                                    fill: 'white',
                                    originX: 'center',
                                    originY: 'center'
                                });
                                let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                    left: leftFromPrevUnit,
                                    top: currentTopVal,
                                    selectable: true,
                                    hasControls: false
                                });
                                this.canvas.add(group);
                                group.on('selected', (e) => {
                                    this.reserveUnit(unit);//calling confimation over the selection
                                });
                                // leftFromPrevUnit = leftFromPrevUnit + unit.building_view.width;
                                leftFromPrevUnit = leftFromPrevUnit + ((unit.building_view && unit.building_view.width) ? unit.building_view.width : 110);
        
                            }
                            if (unit.status == 'initial' || !unit.isUnitPresent) {
                                leftFromPrevUnit = leftFromPrevUnit + 110
                            }
                        })
                        if (floorWidthArray.length == 0) {
                            floorWidthArray.push(leftFromPrevUnit);
                        }
                        currentTopVal = currentTopVal + blockHeight;
                    })
                    const canvasWidth = floorWidthArray[0] + 120;
                    // console.log('canvasWidth',canvasWidth, this.canvasHeight,floorWidthArray);
                    this.canvas.setDimensions({ width: canvasWidth, height: this.canvasHeight });
                }
            }
    
            //semi-detached
            if(this.selectedTabType=='semi-detached'){
                if(additionalInfo && additionalInfo[2].type=='semi-detached'){
                    if(additionalInfo && additionalInfo[2].type=='semi-detached'){
                        let  total_buildings= additionalInfo[2].total_buildings;
                        let  total_homes= additionalInfo[2].total_homes;
                        // this.numberOfFloor = no_of_floors ? no_of_floors : 0;
                        this.numberOfFloor = 1;
                        this.numberOfUnit = total_homes ? total_homes : 0;
                        this.selectedMaxFloor = 1;
                        // this.selectedMaxFloor = no_of_floors ? no_of_floors : 0;
                        this.selectedMaxUnit = total_homes ? total_homes : 0;
                        for (var i = 1; i <= parseInt(this.numberOfFloor); i++) { //creating floors count
                            this.floorArray.push(i);
                        }
                        this.displayCanvas = true;
                        this.floorArray.reverse();//to display floor bottom to top(DESC) order
                        this.canvasHeight =10;
                        this.canvasHeight = this.canvasHeight + this.floorArray.length * 150;
                        this.canvas.setDimensions({ height: this.canvasHeight });
                        let floorWidthArray = [];
                        let blockHeight = 150;
                        let currentTopVal = 0;
                        this.floorArray.forEach((floor, findex) => {
                            let updatedUnitsArray = [{
                                status: 'initial',
                                isUnitPresent: false
                            }];
                            // let unitsOfFloor = semiDetachedUnits.filter(x => x.building_view ? x.building_view.floor == floor : x); //filtering units for floor
                            let unitPositions: any[] = semiDetachedUnits.map((element) => element.building_view ? element.building_view.unit : -1); //finding position of units
                            semiDetachedUnits.forEach(element => {
                                element.isUnitPresent=true;
                                updatedUnitsArray.push(element);
                            });
                        
                            let floorWidth = updatedUnitsArray.length > 1 ? updatedUnitsArray.length * 110 : 110 * 2; //calculating width of floor
                            let rect = new fabric.Rect({ //creating floor block
                                left: 10,
                                top: currentTopVal,
                                fill: 'yellow',
                                width: floorWidth,
                                height: blockHeight,
                                objectCaching: false,
                                selectable: false,
                                stroke: 'lightgray',
                                strokeWidth: 1,
                                hasControls: false,
                                hasBorders: false
                            });
                            this.canvas.add(rect);
                            let leftFromPrevUnit = 7;//12
                            updatedUnitsArray.forEach((unit: any, index) => {
                                if (index == 0 && unit.status == 'initial') {
                                    let unitBlock = new fabric.Rect({ //creating unit block
                                        fill: 'white',
                                        width: 110,
                                        height: 150,
                                        objectCaching: false,
                                        selectable: false,
                                        stroke: 'lightgray',
                                        strokeWidth: 1,
                                        hasControls: false,
                                        hasBorders: false,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let value = `${floor}\nUnit\nModel\nBed\nBath\nArea(${this.measureUnits[0] ? (this.measureUnits[0].area || '-') : '-'})\nCeiling(${this.measureUnits[0] ? (this.measureUnits[0].length || '-') : '-'})\nPrice`;
                                    let text = new fabric.Text(value, {//creating text block
                                        objectCaching: false,
                                        selectable: false,
                                        hasControls: false,
                                        hasBorders: false,
                                        fontSize: 14,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                        left: leftFromPrevUnit,
                                        top: currentTopVal,
                                        selectable: true,
                                        hasControls: false
                                    });
                                    this.canvas.add(group);
                                }
                                else if (unit.building_view && unit.building_view.unit && unit.isUnitPresent) { //if unit exist for floor then creating it 
                                    let unitBlock = new fabric.Rect({ //creating unit block
                                        fill: this.getUnitColor(unit.status),
                                        width: (unit.building_view && unit.building_view.width) ? unit.building_view.width : 110,
                                        height: (unit.building_view && unit.building_view.height) ? unit.building_view.height : 150,
                                        objectCaching: false,
                                        selectable: false,
                                        stroke: 'lightgray',
                                        strokeWidth: 1,
                                        hasControls: false,
                                        hasBorders: false,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let value = `\n${unit.unit_no}\n${unit.model_name ? unit.model_name : '-'}\n${unit.bed ? unit.bed : '-'}\n${unit.bath ? unit.bath : '-'}\n${unit.area ? unit.area : '-'}\n${unit.ceiling ? unit.ceiling : '-'}\n$${unit.price ? unit.price : '-'}`;
                                    let text = new fabric.Text(value, {//creating text block
                                        objectCaching: false,
                                        selectable: false,
                                        hasControls: false,
                                        hasBorders: false,
                                        fontSize: 14,
                                        fill: 'white',
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                        left: leftFromPrevUnit,
                                        top: currentTopVal,
                                        selectable: true,
                                        hasControls: false
                                    });
                                    this.canvas.add(group);
                                    group.on('selected', (e) => {
                                        this.reserveUnit(unit);//calling confimation over the selection
                                    });
                                    // leftFromPrevUnit = leftFromPrevUnit + unit.building_view.width;
                                    leftFromPrevUnit = leftFromPrevUnit + ((unit.building_view && unit.building_view.width) ? unit.building_view.width : 110);
            
                                }
                                if (unit.status == 'initial' || !unit.isUnitPresent) {
                                    leftFromPrevUnit = leftFromPrevUnit + 110
                                }
                            })
                            if (floorWidthArray.length == 0) {
                                floorWidthArray.push(leftFromPrevUnit);
                            }
                            currentTopVal = currentTopVal + blockHeight;
                        })
                        const canvasWidth = floorWidthArray[0] + 120;
                        // console.log('canvasWidth',canvasWidth, this.canvasHeight,floorWidthArray);
                        this.canvas.setDimensions({ width: canvasWidth, height: this.canvasHeight });
                    }
                } 
            }

            //detached
            if(this.selectedTabType=='detached'){
                if(additionalInfo && additionalInfo[3].type=='detached' ){
                    if(additionalInfo && additionalInfo[3].type=='detached'){
                        let  total_buildings= additionalInfo[3].total_buildings;
                        let  total_units= additionalInfo[3].total_units;
                        // this.numberOfFloor = no_of_floors ? no_of_floors : 0;
                        this.numberOfFloor = 1;
                        this.numberOfUnit = total_units ? total_units : 0;
                        this.selectedMaxFloor = 1;
                        // this.selectedMaxFloor = no_of_floors ? no_of_floors : 0;
                        this.selectedMaxUnit = total_units ? total_units : 0;
                        for (var i = 1; i <= parseInt(this.numberOfFloor); i++) { //creating floors count
                            this.floorArray.push(i);
                        }
                        this.displayCanvas = true;
                        this.floorArray.reverse();//to display floor bottom to top(DESC) order
                        this.canvasHeight =10;
                        this.canvasHeight = this.canvasHeight + this.floorArray.length * 150;
                        this.canvas.setDimensions({ height: this.canvasHeight });
                        let floorWidthArray = [];
                        let blockHeight = 150;
                        let currentTopVal = 0;
                        this.floorArray.forEach((floor, findex) => {
                            let updatedUnitsArray = [{
                                status: 'initial',
                                isUnitPresent: false
                            }];
                            // let unitsOfFloor = detachedUnits.filter(x => x.building_view ? x.building_view.floor == floor : x); //filtering units for floor
                            let unitPositions: any[] = detachedUnits.map((element) => element.building_view ? element.building_view.unit : -1); //finding position of units
                            detachedUnits.forEach(element => {
                                element.isUnitPresent=true;
                                updatedUnitsArray.push(element);
                            });
                        
                            console.log('updatedUnitsArray', updatedUnitsArray, 'findex', findex);
                            let floorWidth = updatedUnitsArray.length > 1 ? updatedUnitsArray.length * 110 : 110 * 2; //calculating width of floor
                            let rect = new fabric.Rect({ //creating floor block
                                left: 10,
                                top: currentTopVal,
                                fill: 'yellow',
                                width: floorWidth,
                                height: blockHeight,
                                objectCaching: false,
                                selectable: false,
                                stroke: 'lightgray',
                                strokeWidth: 1,
                                hasControls: false,
                                hasBorders: false
                            });
                            this.canvas.add(rect);
                            let leftFromPrevUnit = 7;//12
                            updatedUnitsArray.forEach((unit: any, index) => {
                                if (index == 0 && unit.status == 'initial') {
                                    let unitBlock = new fabric.Rect({ //creating unit block
                                        fill: 'white',
                                        width: 110,
                                        height: 150,
                                        objectCaching: false,
                                        selectable: false,
                                        stroke: 'lightgray',
                                        strokeWidth: 1,
                                        hasControls: false,
                                        hasBorders: true,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let value = `${floor}\nUnit\nModel\nBed\nBath\nArea(${this.measureUnits[0] ? (this.measureUnits[0].area || '-') : '-'})\nCeiling(${this.measureUnits[0] ? (this.measureUnits[0].length || '-') : '-'})\nPrice`;
                                    let text = new fabric.Text(value, {//creating text block
                                        objectCaching: false,
                                        selectable: false,
                                        hasControls: false,
                                        hasBorders: false,
                                        fontSize: 14,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                        left: leftFromPrevUnit,
                                        top: currentTopVal,
                                        selectable: true,
                                        hasControls: false
                                    });
                                    this.canvas.add(group);
                                }
                                else if (unit.building_view && unit.building_view.unit && unit.isUnitPresent) { //if unit exist for floor then creating it 
                                    let unitBlock = new fabric.Rect({ //creating unit block
                                        fill: this.getUnitColor(unit.status),
                                        width: (unit.building_view && unit.building_view.width) ? unit.building_view.width : 110,
                                        height: (unit.building_view && unit.building_view.height) ? unit.building_view.height : 150,
                                        objectCaching: false,
                                        selectable: false,
                                        stroke: 'lightgray',
                                        strokeWidth: 1,
                                        hasControls: false,
                                        hasBorders: false,
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let value = `\n${unit.unit_no}\n${unit.model_name ? unit.model_name : '-'}\n${unit.bed ? unit.bed : '-'}\n${unit.bath ? unit.bath : '-'}\n${unit.area ? unit.area : '-'}\n${unit.ceiling ? unit.ceiling : '-'}\n$${unit.price ? unit.price : '-'}`;
                                    let text = new fabric.Text(value, {//creating text block
                                        objectCaching: false,
                                        selectable: false,
                                        hasControls: false,
                                        hasBorders: false,
                                        fontSize: 14,
                                        fill: 'white',
                                        originX: 'center',
                                        originY: 'center'
                                    });
                                    let group = new fabric.Group([unitBlock, text], { //combining unit with text block
                                        left: leftFromPrevUnit,
                                        top: currentTopVal,
                                        selectable: true,
                                        hasControls: false
                                    });
                                    this.canvas.add(group);
                                    group.on('selected', (e) => {
                                        this.reserveUnit(unit);//calling confimation over the selection
                                    });
                                    // leftFromPrevUnit = leftFromPrevUnit + unit.building_view.width;
                                    leftFromPrevUnit = leftFromPrevUnit + ((unit.building_view && unit.building_view.width) ? unit.building_view.width : 110);
            
                                }
                                if (unit.status == 'initial' || !unit.isUnitPresent) {
                                    leftFromPrevUnit = leftFromPrevUnit + 110
                                }
                            })
                            if (floorWidthArray.length == 0) {
                                floorWidthArray.push(leftFromPrevUnit);
                            }
                            currentTopVal = currentTopVal + blockHeight;
                        })
                        const canvasWidth = floorWidthArray[0] + 120;
                        // console.log('canvasWidth',canvasWidth, this.canvasHeight,floorWidthArray);
                        this.canvas.setDimensions({ width: canvasWidth, height: this.canvasHeight });
                    }
                }
            }
        },1000)

    }

    showsuite: any = [];
    //TO GET PROJECT DETAIILS
    getProjectDetails() {
        var url = `sales/projects?_id=${this.data.project_id}`;
        this.spinnerService.show();
        this.webService.get(url).subscribe((response) => {
            this.spinnerService.hide();
            if (response.success == true) {
                this.projectDetail = response.result;
                this.projectViewList = response.result.views;
                // this.openTab('townhouse');
                this.openTab('condominium');
            } else {
                this.toastr.error('Error!', response.errors[0]);
            }
        }, (error) => {
            this.spinnerService.hide();
            console.log("error ts: ", error);
        })
    }

    onClose(data) {
        this.activeModal.close(data);
    }

    //TO RESERVE UNIT
    reserveUnit(item) {
        if (item.status == 'AVAILABLE' && item.sales_price) {
            this.confirmationDialogService.confirm('Allocate Unit', `Do you want to reserve unit ${item.unit_no} to the deal?`)
                .then((confirmed) => {
                    if (confirmed) {
                        // this.unitAllocated.suite = item.unit_no
                        // this.isInventoryModalShow = false;
                        this.checkUnitAvalability(item._id);
                    }
                })
                .catch(()=>{})
        }
        else if (!item.sales_price) {
            this.toastr.error(`Please add sales price for this unit ${item.unit_no}`, 'Error!');
        }
        else if (!item.status || item.status == '') {
            this.toastr.error('Suite - ' + item.unit_no + " status is not Allocated", 'Error!');
        }
        else if (item.status == 'RESERVED') {
            this.toastr.error('Suite - ' + item.unit_no + " already Allocated", 'Error!');
        }
        else if (item.status == 'SOLD') {
            this.toastr.error('Suite - ' + item.unit_no + " already Sold", 'Error!');
        }
        else if (item == undefined) {
            this.toastr.error('Suite is not available', 'Error!');

        }

    }

    //PICK COLOR FOR CARD
    getUnitColor(unitStatus) {
        if (unitStatus && unitStatus == 'AVAILABLE') {
            return 'green';
        }
        else if (!unitStatus || unitStatus == '') {
            return 'blue';
        }
        else {
            return 'red';
        }
    }

    //CHECK UNIT AVAILABILITY
    checkUnitAvalability(unitNo) {
        if (unitNo != undefined) {
            let url = `sales/units?project_id=${this.data.project_id}&_id=${unitNo}`;
            this.spinnerService.show();
            this.webService.get(url).subscribe((response) => {
                if (response.success == true) {
                    if (response.result != null && (response.result.status == 'AVAILABLE')) {
                        let data = {
                            unit_no: response.result.unit_no,
                            unit_id: response.result._id,
                            model_id: response.result.model_id,
                            model_name: response.result.model_name,
                            bath: response.result.bath,
                            bed: response.result.bed,
                            floor_legal: response.result.floor_legal,
                            // floor_marketing: response.result.floor_marketing,
                            // status: response.result.status,
                            unit_no_legal: response.result.unit_no_legal,
                            // unit_no_marketing: response.result.unit_no_marketing,
                        }
                        if (response.result.is_bicycle_eligible) {
                            data['max_bicycle'] = response.result.max_bicycle
                        }
                        if (response.result.is_locker_eligible) {
                            data['max_lockers'] = response.result.max_lockers
                        }
                        if (response.result.is_parking_eligible) {
                            data['max_parking'] = response.result.max_parking
                        }
                        this.onClose(data);
                    }

                    else {
                        this.toastr.error('Suite is not available');
                        let data = null;
                        this.onClose(data);
                    }
                    this.spinnerService.hide();

                } else {
                    this.toastr.error('Error!', response.errors[0]);
                }
            }, (error) => {
                this.spinnerService.hide();
                console.log("error ts: ", error);
            });
        }
    }

}
