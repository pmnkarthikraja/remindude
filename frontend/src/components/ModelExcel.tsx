import React from 'react';
import ExcelJS from 'exceljs';
import { IonButton, IonButtons, IonIcon, IonLabel, IonToolbar } from '@ionic/react';
import { download, downloadSharp } from 'ionicons/icons';


const createExcelTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Holiday Template');

    // Add Headers, including the new "Region" column
    worksheet.columns = [
        { header: 'Serial No', key: 'serialNo', width: 15 },
        { header: 'Date (DD-MM-YYYY)', key: 'date', width: 20 },
        { header: 'Holiday Name', key: 'holiday', width: 30 },
        { header: 'Region', key: 'region', width: 20 }, // New column for Region
    ];

    // Add an initial empty row for users to start entering data
    worksheet.addRow({
        serialNo: null, // Placeholder for formula
        date: '',
        holiday: '',
        region: '', // Empty region
    });

    // Set the Date format for the date column
    worksheet.getColumn('date').numFmt = 'DD-MM-YYYY';

    // Set the formula for the Serial No column
    worksheet.getColumn('serialNo').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {  // Apply formula from the second row onward
            cell.value = { formula: `=ROW()-1`, result: rowNumber - 1 };
        }
    });

    // Apply data validation to ensure the Holiday column is not empty
    worksheet.getColumn('holiday').eachCell({ includeEmpty: true }, (cell) => {
        cell.dataValidation = {
            type: 'textLength',
            operator: 'greaterThan',
            formulae: ['0'],
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Holiday name cannot be empty. Please enter a valid holiday name.',
        };
    });

    // Apply data validation to the entire Region column (D) for a range of cells
    const regionColumn = worksheet.getColumn('D');
    regionColumn.eachCell({ includeEmpty: true }, (cell) => {
        cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"India,Saudi Arabia,Both"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please select a valid region from the list: India, Saudi Arabia, or Both.',
        };
    });

    // Apply data validation to a broader range in column D (e.g., from row 2 to row 1000)
    for (let i = 2; i <= 1000; i++) {
        worksheet.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"India,Saudi Arabia,Both"'],
            showErrorMessage: true,
            errorTitle: 'Invalid Input',
            error: 'Please select a valid region from the list: India, Saudi Arabia, or Both.',
        };
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create a link element
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HolidayTemplate.xlsx';

    // Append the link to the body
    document.body.appendChild(a);

    a.click();

    // Clean up and remove the link
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};


const DownloadTemplateButton: React.FC = () => {
    return (
        <IonToolbar>
            <IonButtons onClick={createExcelTemplate} style={{ cursor: 'pointer' }}>
                Download Template (.xlsx)
                <IonIcon icon={downloadSharp}></IonIcon>
            </IonButtons>
        </IonToolbar>
    );
};


export default DownloadTemplateButton;
