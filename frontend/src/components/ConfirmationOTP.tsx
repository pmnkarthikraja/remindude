import { IonApp, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Platform } from '../utils/useGetPlatform';


const ConfirmationOTP: FunctionComponent = () => {
    function getPlatform():Platform {
        const userAgent = navigator.userAgent
    
        if (/windows/i.test(userAgent)) {
            return "Windows";
        }
    
        if (/android/i.test(userAgent)) {
            return "Android";
        }
    
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return "IOS";
        }

        if (/Mac|Macintosh/.test(userAgent)){
            return 'Mac'
        }
    
        return 'Unknown';
    }

return <>
       
    </>
}

export default ConfirmationOTP


const DialPad: React.FC = () => {
    const [inputs, setInputs] = useState('');

    const appendChar = (char: string) => {
        setInputs(prevInputs => prevInputs + char);
    };

    const removeChar = () => {
        setInputs(prevInputs => prevInputs.slice(0, -1));
    };

    return (
        <>
            <IonCol>
                <IonInput value={inputs} fill='outline' style={{ border: '1px groove brown' }} placeholder="Enter OTP"></IonInput>
            </IonCol>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonButton 
                        onKeyUp={e=>{if (e){
                            e.preventDefault()
                            appendChar('1')
                        }}} fill="clear" onClick={() => appendChar("1")}>1</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("2")}>2</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("3")}>3</IonButton>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("4")}>4</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("5")}>5</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("6")}>6</IonButton>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("7")}>7</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("8")}>8</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("9")}>9</IonButton>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("*")}>*</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("0")}>0</IonButton>
                    </IonCol>
                    <IonCol>
                        <IonButton fill="clear" onClick={() => appendChar("#")}>#</IonButton>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol></IonCol>
                    <IonCol>
                        <IonButton onKeyDown={e=>{if (e.key=='backspace'){
                            e.preventDefault()
                            removeChar()
                        }}} fill="clear" onClick={removeChar}>--</IonButton>
                    </IonCol>
                    <IonCol></IonCol>
                </IonRow>
            </IonGrid>
        </>
    );
};


