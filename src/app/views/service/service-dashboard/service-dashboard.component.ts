import { Component, ElementRef, Input, OnInit, ViewChild ,EventEmitter,Output} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { WebService } from '../../../services/web.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import * as Chart from 'chart.js';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
@Component({
  selector: 'app-service-dashboard',
  templateUrl: './service-dashboard.component.html',
  styleUrls: ['./service-dashboard.component.css']
})
export class ServiceDashboardComponent implements OnInit {
  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  filterForm: any = {
    project_id: ''
  }
  graphData: any = {
    inspection_wise_data: [],
    status_wise_data: [],
    total_due_next_week: 0,
    total_due_this_week: 0,
    total_over_due: 0,
    trade_wise_data: []
  }
  // For bar chart
  public barChartOptions: ChartOptions = {
    responsive: true,
    spanGaps: true
  };
  public statusBarChartLabels: Label[] = [];
  public inspectionBarChartLabels: Label[] = [];
  public tradewiseBarChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public statusBarChartData: ChartDataSets[] = [
    {
      //barThickness: 16,
      categoryPercentage: 0.8,
      backgroundColor: "rgba(255, 99, 132, 0.4)",
      borderColor: 'rgba(255,99,132,1)',
      data: [],
      label: 'DEFICIENCIES/STATUS',
      borderWidth: 1
    }
  ];
  public inspectionBarChartData: ChartDataSets[] = [
    {
      //barThickness: 16,
      categoryPercentage: 0.8,
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: 'rgba(54, 162, 235, 1)',
      hoverBackgroundColor: "rgba(54, 162, 235, 0.7)",
      hoverBorderColor: 'rgba(54, 162, 235, 1)',
      data: [],
      label: 'DEFICIENCIES/INSPECTION TYPE',
      borderWidth: 1
    }
  ];
  public tradewiseBarChartData: ChartDataSets[] = [
    {
      //barThickness: 16,
      categoryPercentage: 0.8,
      backgroundColor: "rgba(45, 220, 30, 0.2)",
      borderColor: 'rgba(45, 220, 30, 1)',
      hoverBackgroundColor: "rgba(45, 220, 30, 0.7)",
      hoverBorderColor: 'rgba(45, 220, 30, 1)',
      data: [],
      label: 'TRADE WISE DATA',
      borderWidth: 1
    }
  ];
  // Pie chart settings
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'INSPECTION COMPLETED'
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartLabels: Label[] = [];
  public pieChartData: number[] = [];
  public pieChartColors = [
    {
      backgroundColor: [],
    },
  ];
  //Reported by graph
  public reportedByBarChartData: ChartDataSets[] = [
    {
      //barThickness: 16,
      categoryPercentage: 0.8,
      backgroundColor: "rgba(45, 220, 30, 0.2)",
      borderColor: 'rgba(45, 220, 30, 1)',
      hoverBackgroundColor: "rgba(45, 220, 30, 0.7)",
      hoverBorderColor: 'rgba(45, 220, 30, 1)',
      data: [],
      label: 'REPORTED BY',
      borderWidth: 1
    }
  ];
  public reportedByBarChartLabels: Label[] = [];

  //line chart graph
  lineChartLabels: Label[] = [];
  lineChartOptions = {
    responsive: true,
    tooltips: {
      mode: 'x',
      intersect: false
    }
  };
  lineChartColors: Color[] = [];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';
  // for membership
  linechartGraphArray: ChartDataSets[] = [
    { data: [], label: 'DEFICIENCY PER DAY', fill: false }
  ];

  unitDefData:any[]=[{
    data:[]
  }]

  defPerSatffData:any[]=[{
    data:[]
  }]
  @Output() serviceDashboardProjectChanged: EventEmitter<any> = new EventEmitter();

  constructor(
    private webService: WebService,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }
  ngOnInit(): void {
    this.getSavedFilterdata();
    this.eventsSubscription = this.events.subscribe((response: any) => {
      if (response) {
        this.filterForm.project_id = response._id;
        this.getDashboardData();
        this.getDashboardAnalyticsData();
      }
      else {
        this.filterForm.project_id = '';
        this.getDashboardData();
        this.getDashboardAnalyticsData();
      }
    });
  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
  getSavedFilterdata() {
    let projectFilterData: any = localStorage.getItem('serviceDashboardProjectData');
    if (projectFilterData) {
      projectFilterData = JSON.parse(projectFilterData);
      if (projectFilterData._id) {
        this.filterForm.project_id = projectFilterData._id;
        let data={
          project_id:null
        } 
        this.serviceDashboardProjectChanged.emit(data);
      }
    }
    else{
      let data={
        project_id:null
      } 
      this.serviceDashboardProjectChanged.emit(data);
    }
    this.getDashboardData();
    this.getDashboardAnalyticsData();
  }
  getDashboardData() {
    this.inspectionBarChartData[0].data = [];
    this.statusBarChartData[0].data = [];
    this.tradewiseBarChartData[0].data = [];
    this.statusBarChartLabels = [];
    this.inspectionBarChartLabels = [];
    this.tradewiseBarChartLabels = [];
    this.spinnerService.show();
    let url = `service/dashboard-data`;
    if (this.filterForm.project_id) {
      url = url + `?project_id=${this.filterForm.project_id}`;
    }
    this.webService.get(url).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.status == 1) {
        if (response.results) {
          this.graphData = response.results;
          this.createStatusGraph((this.graphData.hasOwnProperty('status_wise_data') && this.graphData.status_wise_data) ? this.graphData.status_wise_data :[]);
          this.createInspectionWiseGraph((this.graphData.hasOwnProperty('inspection_wise_data') && this.graphData.inspection_wise_data) ? this.graphData.inspection_wise_data :[]);
          this.createTradeWiseGraph((this.graphData.hasOwnProperty('trade_wise_data') && this.graphData.trade_wise_data) ? this.graphData.trade_wise_data :[]);
          this.createPieChartGraph((this.graphData.hasOwnProperty('inspection_complete_data') && this.graphData.inspection_complete_data) ? this.graphData.inspection_complete_data :[]);
        }
      }
    }, (error) => {
      this.spinnerService.hide();
      console.log('error', error);
    });
  }
  
  createStatusGraph(status_wise_data) {
    let statusDataArray = [];
    status_wise_data.forEach((element, index) => {
      if (element._id) {
        this.statusBarChartLabels.push(element._id);
        statusDataArray.push(element.total_count)
      }
    });
    this.statusBarChartData[0].data = statusDataArray;
    // let names = status_wise_data.map((ele) => ele._id);
    // let values = status_wise_data.map((ele) => ele.total_count);
    // var canvas = <HTMLCanvasElement>document.getElementById('myChart');
    // const ctx = canvas.getContext('2d');
    // var myChart = new Chart(ctx, {
    //   type: 'bar',
    //   data: {
    //     labels: names,
    //     datasets: [{
    //       label: 'DEFICIENCIES/STATUS',
    //       data: values,
    //       backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //       borderColor: 'rgba(255, 99, 132, 1)',
    //       borderWidth: 1
    //     }]
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [
    //         {
    //           ticks: {
    //             beginAtZero: true,
    //             stepSize: 5
    //           }
    //         }
    //       ]
    //     }
    //   }
    // });
  }
  createInspectionWiseGraph(inspection_data) {
    let inspectionDataArray = [];
    inspection_data.forEach((element, index) => {
      if (element._id) {
        this.inspectionBarChartLabels.push(element._id);
        inspectionDataArray.push(element.total_count)
      }
    });
    this.inspectionBarChartData[0].data = inspectionDataArray;
    // let names = inspection_data.map((ele) => ele._id);
    // let values = inspection_data.map((ele) => ele.total_count);
    // var canvas = <HTMLCanvasElement>document.getElementById('inspectionChart');
    // const ctx = canvas.getContext('2d');
    // var myChart = new Chart(ctx, {
    //   type: 'bar',
    //   data: {
    //     labels: names,
    //     datasets: [{
    //       label: 'DEFICIENCIES/INSPECTION TYPE',
    //       data: values,
    //       backgroundColor: 'rgba(54, 162, 235, 0.2)',
    //       borderColor: 'rgba(54, 162, 235, 1)',
    //       borderWidth: 1
    //     }]
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [
    //         {
    //           ticks: {
    //             beginAtZero: true,
    //             stepSize: 5
    //           }
    //         }
    //       ]
    //     }
    //   }
    // });
  }
  createTradeWiseGraph(trade_data) {
    let tradewiseDataArray = [];
    trade_data.forEach((element, index) => {
      if (element._id) {
        this.tradewiseBarChartLabels.push(element._id);
        tradewiseDataArray.push(element.total_count)
      }
    });
    this.tradewiseBarChartData[0].data = tradewiseDataArray;
    // let names = trade_data.map((ele) => ele._id);
    // let values = trade_data.map((ele) => ele.total_count);
    // var canvas = <HTMLCanvasElement>document.getElementById('tradeChart');
    // const ctx = canvas.getContext('2d');
    // var myChart = new Chart(ctx, {
    //   type: 'bar',
    //   data: {
    //     labels: names,
    //     datasets: [{
    //       label: 'TRADE WISE DATA',
    //       data: values,
    //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //       borderColor: 'rgba(75, 192, 192, 1)',
    //       borderWidth: 1
    //     }]
    //   },
    //   options: {
    //     scales: {
    //       yAxes: [
    //         {
    //           ticks: {
    //             beginAtZero: true,
    //             stepSize: 5
    //           }
    //         }
    //       ]
    //     }
    //   }
    // });
  }

  createPieChartGraph(pie_data) {
    this.pieChartLabels=[];
    this.pieChartData=[];
    this.pieChartColors[0].backgroundColor=[];
    pie_data.forEach((element, index) => {
      if (element._id) {
        this.pieChartLabels.push(element._id);
        this.pieChartData.push(element.total_count);
        this.pieChartColors[0].backgroundColor.push(this.generateRandomColor());
      }
    });
  }

  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }



  /// Analytics data /////
  getDashboardAnalyticsData() {
    this.spinnerService.show();
    let url = `service/dashboard-analytics`;
    if (this.filterForm.project_id) {
      url = url + `?project_id=${this.filterForm.project_id}`;
    }
    this.webService.get(url).subscribe((response: any) => {
      this.spinnerService.hide();
      if (response.success && response.results) {
          let graphData = response.results;
          this.createReportedByGraph((graphData.hasOwnProperty('reported_by_data') && graphData.reported_by_data) ? graphData.reported_by_data :[]);
          this.createLineChart((graphData.hasOwnProperty('deficiencies_per_day') && graphData.deficiencies_per_day) ? graphData.deficiencies_per_day :[]);
          this.createUnitDefTable((graphData.hasOwnProperty('units_deficiency_counts')  && graphData.deficiencies_per_day) ? graphData.units_deficiency_counts:[]);
          this.createPerStaffDefTable((graphData.hasOwnProperty('staffwise_deficiencies_per_day')  && graphData.deficiencies_per_day) ? graphData.staffwise_deficiencies_per_day:[]);
      
        }
      else{
        this.createLineChart([]);
        this.createUnitDefTable([]);
        this.createPerStaffDefTable([]);

      }
    }, (error) => {
      this.spinnerService.hide();
      console.log('error', error);
    });
  }

  createReportedByGraph(data) {
    let reportedWiseDataArray = [];
    this.reportedByBarChartLabels=[];
    data.forEach((element, index) => {
      if (element._id ) {
        this.reportedByBarChartLabels.push(element._id);
        reportedWiseDataArray.push(element.total_count)
      }
    });
    this.reportedByBarChartData[0].data = reportedWiseDataArray;
  }

  createLineChart(data){
    let records = [];
    this.lineChartLabels=[];
    data.forEach((element, index) => {
      if (element._id) {
        this.lineChartLabels.push(element._id);
        records.push(element.total_count)
      }
    });
    this.linechartGraphArray[0].data = records;
  }

  createUnitDefTable(data){
    let records = [];
    data.forEach((element) => {
      if (element.unit_no && element.project_name && element.total_count) {
        records.push(element)
      }
    });
    this.unitDefData[0].data = records;
  }

  createPerStaffDefTable(data){
    let records = [];
    data.forEach((element) => {
      if (element.date &&element.opened_by && element.total_count ) {
        records.push(element)
      }
    });
    this.defPerSatffData[0].data = records;
  }
}
