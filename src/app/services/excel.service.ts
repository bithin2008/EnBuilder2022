import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { reject } from 'q';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

    constructor() { }
    importFromFile1(bstr: string): XLSX.AOA2SheetOpts {
        var reader = new FileReader();
        /* read workbook */
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = <XLSX.AOA2SheetOpts>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
        return data;

    }

    importFromFile(file: File) {

        // Always return a Promise
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (event: any) => {
                var bstr = event.target.result;

                /* read workbook */
                const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'array' });

                /* grab first sheet */
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                // const data = <XLSX.AOA2SheetOpts>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
                var jsonArr = XLSX.utils.sheet_to_json(ws, { header: 1 });

                resolve(jsonArr);
            };
            reader.onerror = (event: any) => {
                reject(event);
            }
        });
    }

    public exportToFile(fileName: string, element_id: string) {
        if (!element_id) throw new Error('Element Id does not exists');

        let tbl = document.getElementById(element_id);
        let wb = XLSX.utils.table_to_book(tbl);
        XLSX.writeFile(wb, fileName + '.xlsx');
    }

}
