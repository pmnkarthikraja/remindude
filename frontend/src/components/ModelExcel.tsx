import { Directory, Filesystem } from '@capacitor/filesystem';
import { IonButton, IonButtons, IonIcon, IonToast, IonToolbar, isPlatform } from '@ionic/react';
import ExcelJS from 'exceljs';
import { downloadSharp } from 'ionicons/icons';
import React, { Fragment, FunctionComponent, useState } from 'react';

const DownloadTemplateButton: FunctionComponent = () => {
    const [showToast, setShowToast] = useState<undefined|string>(undefined);

    const createExcelTemplate= async () => {
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
    
    
        if (isPlatform('capacitor')) {
            // Mobile environment (using Capacitor)
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const base64Data = await convertBlobToBase64(blob);
    
            // Mobile environment: Save the file
           const result = await Filesystem.writeFile({
                path: '/HolidayTemplate.xlsx',
                data: base64Data,
                directory: Directory.Documents,
            });
            console.log('File saved successfully:', result.uri);

            setShowToast(`File Saved in ${result.uri}`); 
            return result.uri;
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
            setShowToast('File Download Successfully!'); 
        }
    };
    
    const convertBlobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };
    return (
        <Fragment>
        <IonToast
                color={'success'}
                isOpen={!!showToast && showToast!=''}
                onDidDismiss={() => setShowToast(undefined)}
                message={showToast}
                duration={2000}
                position="top"
            />
        <IonToolbar>
            <IonButtons style={{ cursor: 'pointer' }}>
                <IonButton onClick={createExcelTemplate} style={{textTransform:'capitalize'}} color={'secondary'} strong>Download <p style={{textTransform:'lowercase'}}>(.xlsx)</p>
                <IonIcon icon={downloadSharp}></IonIcon></IonButton>
            </IonButtons>
        </IonToolbar>
        </Fragment>
    );
};

export default DownloadTemplateButton;
