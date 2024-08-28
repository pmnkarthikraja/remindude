import React, { Fragment, FunctionComponent, useState } from 'react';
import * as XLSX from 'xlsx';
import { checkmark } from 'ionicons/icons';
import { IonAlert, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonLabel, IonLoading, IonModal, IonNote, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import DownloadTemplateButton from './ModelExcel';
import { holidayApi, LocalHolidayData } from '../api/calenderApi';
import { useDeleteLocalHoliday, useGetLocalHolidays } from '../hooks/calenderHooks';
import HolidayModal from './LocalHolidaysModal';

type Region = 'India' | 'Saudi Arabia' | 'Both'

interface ExcelParsedData {
    serial:string,
    date:string,
    holiday:string,
    region:Region
}

const UploadCalendar = () => {
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [fileInputKey, setFileInputKey] = useState<string>(Date.now().toString());
    const [err, setErr] = useState<string | null>(null)
    const { data: localHolidaysData, isLoading: isGetLocalHolidaysLoading } = useGetLocalHolidays()
    const {status:deleteHolidayStatus, isLoading: isDeleteLoading, isError: isDeleteErr, error: deleteErr, mutateAsync: deleteLocalHoliday } = useDeleteLocalHoliday()


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParsedData([])
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                //initial check if sheet consists holiday data or not
                const headers: any = jsonData[0];
                const serialIndex = headers.indexOf('Serial No');
                const dateIndex = headers.indexOf('Date (DD-MM-YYYY)');
                const holidayIndex = headers.indexOf('Holiday Name');
                const regionIndex = headers.indexOf('Region')

                if (dateIndex !== -1 && holidayIndex !== -1) {
                    // Process the parsed data
                    const parsedData:(ExcelParsedData | undefined)[] = jsonData.slice(1).map((row: any) => {
                        if (row[serialIndex]) {
                            return ({
                                serial: row[serialIndex] as string,
                                date: XLSX.SSF.format("yyyy-mm-dd", row[dateIndex]) as string, // converting the date from Excel serial number
                                holiday: row[holidayIndex] as string,
                                region: row[regionIndex] as Region
                            })
                        }
                    }).filter(e => e);
                    const validatedData = validateData(parsedData);
                    setParsedData(validatedData);
                } else {
                    setErr('Headers "Serial No" and "Date (DD-MM-YYYY)" or "Holiday Name" not found in the sheet')
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleDelete = async (id: string | undefined) => {
        if (id) {
            console.log("delete id: ", localHolidaysData?.find(d => d._id == id))
            try {
                await deleteLocalHoliday(id)
            } catch (e) {
                console.log("delete local holiday failed", e)
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxHeight: '100vh', overflowY: 'auto' }}>

            <HolidayModal holidays={localHolidaysData} onDelete={handleDelete} />
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                Apply Local Calendar Holiday Data
            </p>

            <div style={{ alignItems: 'center', display: 'flex', paddingTop: '20px',marginBottom:'10px' }}>
                <IonNote>  Click to see the list of local holidays.</IonNote>
                <IonButton className='animate__animated animate__bounceIn' fill='solid' id="trigger-local-holidays" size="small" color="light" style={{ color: '#000' }}>
                    Local Holidays
                </IonButton>
                <IonButton className='animate__animated animate__bounceIn' fill='solid' id="trigger-bank-holidays" size="small" color="light" style={{ color: '#000' }}>
                    Bank Holidays
                </IonButton>
            </div>

            <IonNote><b style={{color:'red'}}>Step 1</b></IonNote>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <IonNote><b>Note:</b> click to download the template excel file to fill up the data.</IonNote>
                <DownloadTemplateButton />
            </div>
            
            <IonNote><b style={{color:'red'}}>Step 2</b></IonNote>
            <br/>
            <IonNote>Click '<b>Choose File</b>' to import .xslx or xlx file.</IonNote>
            <div style={{ height: '10px' }}></div>
            <div style={{ alignItems: 'center', marginBottom: '20px' }}>
                <input
                    key={fileInputKey}
                    type="file"
                    id="file-inp"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    style={{ marginRight: '15px' }}
                />
                <IonButton
                    fill='clear'
                    size="small"
                    onClick={() => {
                        setParsedData([]);
                        setFileInputKey(Date.now().toString());
                    }}
                    style={{ color: '#000', backgroundColor: '#f0f0f0' }}
                >
                    Clear File
                </IonButton>
            </div>

            {parsedData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <ResultsTable data={parsedData} reset={()=>{
                        setParsedData([])
                        setFileInputKey(Date.now().toString())
                    }} />
                </div>
            )}

            {(err != null || isDeleteErr) && (
                <IonToast
                    color="danger"
                    onDidDismiss={()=>{
                        setErr(null);
                        setParsedData([]);
                        setFileInputKey(Date.now().toString());
                    }}
                    buttons={[
                        {
                            text: 'Ok',
                            role: 'cancel',
                            handler: () => {
                                setErr(null);
                                setParsedData([]);
                                setFileInputKey(Date.now().toString());
                            }
                        }
                    ]}
                    isOpen={err != null || isDeleteErr}
                    message={err || deleteErr?.message}
                    position="top"
                    duration={3000}
                />
            )}
            <IonLoading isOpen={isGetLocalHolidaysLoading || isDeleteLoading} message={isGetLocalHolidaysLoading ? 'Loading Local Holidays..' : 'Deleting Holiday..'} />
        </div>
    );
};

export default UploadCalendar;




const validateData = (jsonData: (ExcelParsedData | undefined)[]): any[] => {
    const validatedData = jsonData && jsonData.map((data, index) => {
        let row: string[] = []

        if (data){
            row[0] = data.serial
            row[1] = data.date
            row[2] = data.holiday
            row[3] = data.region
        }
       

        if (row[1] && row[1] !== '') {
            row[1] = XLSX.SSF.format("yyyy-mm-dd", row[1])
        }

        // on empty row
        if (!row[0] || !row[1] || row[0] == '' || row[1] == '' || row[2] == '' || !row[2] || row[3] == '' || !row[3]) {
            return {
                type: 'Invalid',
                row: row,
                actions: null,
                status: 'Failed',
                reason: 'Missing required columns',
            };
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;  // Regular expression for yyyy-mm-dd format

        if (row[1] && row[1] !== '') {
            // format the date with excel
            try {
                row[1] = XLSX.SSF.format("yyyy-mm-dd", row[1]);
            } catch (error) {
                return {
                    type: 'Invalid',
                    row: row,
                    actions: null,
                    status: 'Failed',
                    reason: 'Date formatting failed',
                };
            }
        }

        // Check if the date is in the correct format
        if (!row[1] || !datePattern.test(row[1])) {
            return {
                type: 'Invalid',
                row: row,
                actions: null,
                status: 'Failed',
                reason: 'Invalid date format',
            };
        }


        //check for duplicate rows
        const isDuplicate = jsonData.some((r, i) => i !== index && r?.date === row[1]);
        if (isDuplicate) {
            return {
                type: 'Duplicated',
                row: row,
                actions: ['Ok', 'Cancel'],
                status: 'Pending',
                reason: 'Present more than once in Excel',
            };
        }

        return {
            type: 'New',
            row: row,
            actions: ['Ok', 'Cancel'],
            status: 'Pending',
        };
    });

    return validatedData;
};

interface ResultsTableProps{
    data:any[]
    reset:()=>void
}

const ResultsTable:FunctionComponent<ResultsTableProps> = ({
    data,
    reset
}) => {
    const [items, setItems] = useState<string[]>([]);
    const [status, setStatus] = useState<Map<string, string>>(new Map());
    const [success,setSuccess]=useState<{
        message:string,
        success:boolean
    }|undefined>(undefined)
    const [isLoading,setIsLoading]=useState(false)

    const handleAction = (row: any, action: string) => {
        const newRowWithSerialAndDate = row.row[0] + ', ' + row.row[1]
        const rowKey = newRowWithSerialAndDate
        if (action === 'Ok') {
            // Add to items list
            if (status.get(rowKey) != 'Success') {
                setItems((prevItems) => [...prevItems, row.row.join(', ')]);
            }
            
            // Update status to 'Success'
            setStatus((prevStatus) => new Map(prevStatus).set(rowKey, 'Success'));
        }
        if (action === 'Cancel') {
            // Remove from items list
            setItems((prevItems) => prevItems.filter((item) => item !== row.row.join(', ')));

            // Update status to 'Pending'
            setStatus((prevStatus) => new Map(prevStatus).set(rowKey, 'Pending'));
        }
    };

    const hasSuccess = Array.from(status.values()).some(value => value === 'Success');

    let dbItems: LocalHolidayData[] = []
    const applyLocalHolidays = async () => {
        items.map(item => item.split(', ')).map(arr => {
            const dbItem: LocalHolidayData = {
                iso_date: arr[1],
                holidayName: arr[2],
                region:arr[3] as Region,
            }
            dbItems.push(dbItem)
        })

        try {
            setIsLoading(true)
            const res = await holidayApi.upsertLocalHolidays(dbItems)
            setIsLoading(false)
            setSuccess(res)
        } catch (e) {
            setIsLoading(false)
            setSuccess({
                message:e.message,
                success:false
            })
            console.log("failed to update local holidays:",e)
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            {success && <IonAlert
                isOpen={true}
                header={success.success ? "Applied Successfully !":"Applied Failed"}
                message={success.success ? success.message: 'Failed to update local holidays!'}
                className="custom-alert"
                onDidDismiss={() => {  setSuccess(undefined); reset();}}
                buttons={[
                    {
                        text: 'Ok',
                        cssClass: 'alert-button-cancel',
                        handler: () => {
                            setSuccess(undefined)
                            reset()
                        }
                    },
                ]}
            >
            </IonAlert>}

            <IonLoading isOpen={isLoading} message={'Applying..'} />

            {<IonButton size='small' disabled={!hasSuccess} slot='end' color={'secondary'} onClick={() => { applyLocalHolidays() }}>Apply Holidays</IonButton>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Type</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Row</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Status</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
                        const invalidColor = (row.type === 'Invalid' && '#ffc0cb') || (row.type == 'New' && '#BFF6C3') || '#f1f8e8';
                        // #FFEEA9
                        // const rowKey = row.row.join(', ');
                        const rowKey = row.row[0] + ', ' + row.row[1]

                        return (
                            <Fragment key={index}>
                                <tr>
                                    <td style={{ border: '1px solid black', backgroundColor: invalidColor, padding: '8px' }}>
                                        {row.type}
                                    </td>
                                    <td style={{ border: '1px solid black', backgroundColor: invalidColor, padding: '8px' }}>
                                        {row.row.join(', ')}
                                    </td>
                                    <td style={{ border: '1px solid black', backgroundColor: invalidColor, padding: '8px' }}>
                                        {row.actions ? (
                                            row.actions.map((action: string) => {
                                                const buttonName = (action == 'Ok' && (status.get(rowKey) == 'Success' ? 'Added' : 'Ok') || (action == 'Cancel' && 'Cancel'))
                                                return (
                                                    <>
                                                        <IonButton
                                                            onClick={() => handleAction(row, action)}
                                                            color={action === 'Cancel' ? 'warning' : 'success'}
                                                            key={action}
                                                            size="small"
                                                        // disabled={status.get(rowKey)=='Success' && action=='Ok'}
                                                        >
                                                            {buttonName}
                                                            {status.get(rowKey) == 'Success' && action == 'Ok' && <IonIcon slot='end' icon={checkmark}></IonIcon>}
                                                        </IonButton></>

                                                )
                                            })
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td style={{ border: '1px solid black', backgroundColor: invalidColor, padding: '8px' }}>
                                        {(status.get(rowKey) == 'Pending' && (row.type === 'Invalid' && 'Failed' || row.type == 'New' && 'Pending' || row.type == 'Duplicated' && 'Pending')) || (status.get(rowKey) == 'Success' && status.get(rowKey)) || (row.type == 'Invalid' ? 'Failed' : 'Pending')}
                                    </td>
                                    <td style={{ border: '1px solid black', backgroundColor: invalidColor, padding: '8px' }}>
                                        {row.reason || '-'}
                                    </td>
                                </tr>
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>

            {items.length > 0 && (
                <ul>
                    {items.map((e, index) => (
                        <li key={index}>{e}</li>
                    ))}
                </ul>
            )}

        </div>
    );
};

