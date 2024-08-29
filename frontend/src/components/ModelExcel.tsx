import React from 'react';
import ExcelJS from 'exceljs';
import { IonButton, IonButtons, IonIcon, IonLabel, IonToolbar, isPlatform } from '@ionic/react';
import { download, downloadSharp } from 'ionicons/icons';
import { Filesystem, Directory, Encoding,  } from '@capacitor/filesystem';


// const createExcelTemplate = async () => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Holiday Template');

//     // Add Headers, including the new "Region" column
//     worksheet.columns = [
//         { header: 'Serial No', key: 'serialNo', width: 15 },
//         { header: 'Date (DD-MM-YYYY)', key: 'date', width: 20 },
//         { header: 'Holiday Name', key: 'holiday', width: 30 },
//         { header: 'Region', key: 'region', width: 20 }, // New column for Region
//     ];

//     // Add an initial empty row for users to start entering data
//     worksheet.addRow({
//         serialNo: null, // Placeholder for formula
//         date: '',
//         holiday: '',
//         region: '', // Empty region
//     });

//     // Set the Date format for the date column
//     worksheet.getColumn('date').numFmt = 'DD-MM-YYYY';

//     // Set the formula for the Serial No column
//     worksheet.getColumn('serialNo').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
//         if (rowNumber > 1) {  // Apply formula from the second row onward
//             cell.value = { formula: `=ROW()-1`, result: rowNumber - 1 };
//         }
//     });

//     // Apply data validation to ensure the Holiday column is not empty
//     worksheet.getColumn('holiday').eachCell({ includeEmpty: true }, (cell) => {
//         cell.dataValidation = {
//             type: 'textLength',
//             operator: 'greaterThan',
//             formulae: ['0'],
//             showErrorMessage: true,
//             errorTitle: 'Invalid Input',
//             error: 'Holiday name cannot be empty. Please enter a valid holiday name.',
//         };
//     });

//     // Apply data validation to the entire Region column (D) for a range of cells
//     const regionColumn = worksheet.getColumn('D');
//     regionColumn.eachCell({ includeEmpty: true }, (cell) => {
//         cell.dataValidation = {
//             type: 'list',
//             allowBlank: true,
//             formulae: ['"India,Saudi Arabia,Both"'],
//             showErrorMessage: true,
//             errorTitle: 'Invalid Input',
//             error: 'Please select a valid region from the list: India, Saudi Arabia, or Both.',
//         };
//     });

//     // Apply data validation to a broader range in column D (e.g., from row 2 to row 1000)
//     for (let i = 2; i <= 1000; i++) {
//         worksheet.getCell(`D${i}`).dataValidation = {
//             type: 'list',
//             allowBlank: true,
//             formulae: ['"India,Saudi Arabia,Both"'],
//             showErrorMessage: true,
//             errorTitle: 'Invalid Input',
//             error: 'Please select a valid region from the list: India, Saudi Arabia, or Both.',
//         };
//     }

//     // Generate Excel file
//     const buffer = await workbook.xlsx.writeBuffer();

//     // Create a Blob from the buffer
//     const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//     // Create a link element
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'HolidayTemplate.xlsx';

//     // Append the link to the body
//     document.body.appendChild(a);

//     a.click();

//     // Clean up and remove the link
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
// };

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}


const createExcelTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Holiday Template');

    // Define the columns, including the new "Region" column
    worksheet.columns = [
        { header: 'Serial No', key: 'serialNo', width: 15 },
        { header: 'Date (DD-MM-YYYY)', key: 'date', width: 20 },
        { header: 'Holiday Name', key: 'holiday', width: 30 },
        { header: 'Region', key: 'region', width: 20 },
    ];

    // Add an initial empty row for users to start entering data
    worksheet.addRow({
        serialNo: null, // Placeholder for formula
        date: '',
        holiday: '',
        region: '', // Empty region
    });

    // Set the date format for the date column
    worksheet.getColumn('date').numFmt = 'DD-MM-YYYY';

    // Set the formula for the Serial No column
    worksheet.getColumn('serialNo').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {
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

    // Apply data validation to the Region column (D)
    worksheet.getColumn('region').eachCell({ includeEmpty: true }, (cell) => {
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

    // Generate the Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const binary = new Uint8Array(buffer);


    if (isPlatform('capacitor')) {
        // Mobile environment (using Capacitor)
        // const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // const base64data = await convertBlobToBase64(blob) as string;

        // const base64String = await Base64.encode(buffer);
        const base64string = arrayBufferToBase64(buffer)

        // Mobile environment: Save the file
        await Filesystem.writeFile({
            path: 'HolidayTemplate.xlsx',
            data: binary.toString(),
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
    } else {
        // Web environment (using Blob)
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HolidayTemplate.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};

// Helper function to convert Blob to Base64
const convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


const createExcelTemplateStandard = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Holiday Template');

    worksheet.columns = [
        { header: 'Serial No', key: 'serialNo', width: 15 },
        { header: 'Date (DD-MM-YYYY)', key: 'date', width: 20 },
        { header: 'Holiday Name', key: 'holiday', width: 30 },
        { header: 'Region', key: 'region', width: 20 }, // New column for Region
    ];

    worksheet.addRow({
        serialNo: null,
        date: '',
        holiday: '',
        region: '',
    });

    worksheet.getColumn('date').numFmt = 'DD-MM-YYYY';

    worksheet.getColumn('serialNo').eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber > 1) {
            cell.value = { formula: `=ROW()-1`, result: rowNumber - 1 };
        }
    });

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

    try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a link element and simulate a click to trigger the download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'HolidayTemplate.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    } catch (error) {
        console.error('Error generating or downloading the Excel file:', error);
    }
};



const DownloadTemplateButton: React.FC = () => {
    return (
        <IonToolbar>
            <IonButtons style={{ cursor: 'pointer' }}>
                <IonButton onClick={createExcelTemplate} style={{textTransform:'capitalize'}} color={'secondary'} strong>Download <p style={{textTransform:'lowercase'}}>(.xlsx)</p>
                <IonIcon icon={downloadSharp}></IonIcon></IonButton>
            </IonButtons>
        </IonToolbar>
    );
};


export default DownloadTemplateButton;
