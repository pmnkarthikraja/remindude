import React, { FunctionComponent, useState } from 'react';
import {  IonItem, IonRow, IonImg } from '@ionic/react';
import '../styles/ToggleWithLabel.css';
import { EventType } from './task';

interface ToggleWithLabelProps {
    labels: EventType[];
    onSelect:(label:EventType)=>void,
    initialLabel:EventType
}

const ToggleWithLabel: FunctionComponent<ToggleWithLabelProps> = ({ labels,onSelect,initialLabel }) => {
    const [selectedLabel, setSelectedLabel] = useState<EventType>(initialLabel);

    const handleLabelClick = (label: EventType) => {
        setSelectedLabel(label)
        onSelect(label)
    };

    return (
        <div className="toggle-container">
            {labels.map((label:EventType) => (
                <IonItem 
                lines='none'
                    key={label} 
                    button 
                    onClick={() => handleLabelClick(label)}
                    className={selectedLabel === label ? 'selected' : ''}

                >
                    {label=='Meeting' &&<span ><IonRow>{label}<IonImg src="/assets/meeting-new.png" style={{ width: '15px', height: 'auto' }} /></IonRow></span>}
                    {label=='Task' &&<span ><IonRow>{label}<IonImg src="/assets/task.png" style={{ width: '15px', height: 'auto' }} /></IonRow></span>}
                    {selectedLabel === label && <span className="tick-mark">✔</span>}
                </IonItem>
                
            ))}
        </div>
    );
};

export default ToggleWithLabel;
