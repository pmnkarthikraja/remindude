import { IonCheckbox, IonGrid, IonItem, IonLabel } from '@ionic/react';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

export interface FilterComponentProps {
    filters: (filters: { [key: string]: string[] }) => void
    currentFilters: { [key: string]: string[] };
}

const FilterComponent: FunctionComponent<FilterComponentProps> = ({
    filters,
    currentFilters
}) => {
    const categories = ['Meeting', 'Task']
    const priorities = ['Urgent', 'Moderate', 'Normal']
    const statuses = ['Completed', 'Upcoming']
    const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>(currentFilters);
    const filtersRef = useRef(filters);

    const departmentalActivities = [
        { Department: 'Recruitment', Activities: ['Bill Payments', 'Salary Processing', 'GRO Follow Up'] },
        { Department: 'Client', Activities: ['Client Follow Up'] },
        { Department: 'Internal', Activities: ['Interview Follow Up', 'Personal Activity'] },
        { Department: 'HR', Activities: ['Visa Processing', 'Employee Onboarding', 'PO Dates'] }
    ];

    useEffect(() => {
        filtersRef.current = filters;
        setSelectedOptions(currentFilters)
    }, [filters]);

    useEffect(() => {
        filtersRef.current(selectedOptions);
    }, [selectedOptions]);

    const handleCheckboxChange = (key: string, option: string) => {
        setSelectedOptions((prevSelectedOptions) => {
            const updatedOptions = prevSelectedOptions[key].includes(option)
                ? prevSelectedOptions[key].filter((item) => item !== option)
                : [...prevSelectedOptions[key], option];

            return {
                ...prevSelectedOptions,
                [key]: updatedOptions
            };
        });
    };


    const handleDepartmentChange = (activities: string[]) => {
        setSelectedOptions((prevSelectedOptions) => {
            const allSelected = activities.every(activity => prevSelectedOptions['label'].includes(activity));

            const updatedLabels = allSelected
                ? prevSelectedOptions['label'].filter(activity => !activities.includes(activity))
                : [...new Set([...prevSelectedOptions['label'], ...activities])];

            return {
                ...prevSelectedOptions,
                'label': updatedLabels
            };
        });
    };

    const isDepartmentChecked = (activities: string[]) => {
        return activities.every(activity => selectedOptions['label'].includes(activity));
    };


    return (
        <React.Fragment>
            <IonItem>
                <IonLabel color='warning'><b>Departmental Activities:</b></IonLabel>
            </IonItem>
            {departmentalActivities.map((depAct, idx) => (
                <IonItem lines="none" key={idx}>
                    <IonGrid>
                        <IonItem lines='none'>
                            <IonCheckbox
                                checked={isDepartmentChecked(depAct.Activities)}
                                onIonChange={() => handleDepartmentChange(depAct.Activities)}
                            >
                                <IonLabel class='ion-text-wrap'><b>{depAct.Department}</b></IonLabel>
                            </IonCheckbox>
                        </IonItem>
                        <IonGrid>
                            {depAct.Activities.map((label, index) => (
                                <IonItem key={index} lines='none'>
                                    <IonCheckbox
                                        checked={selectedOptions['label'].includes(label)}
                                        onIonChange={() => handleCheckboxChange('label', label)}
                                    >
                                        <IonLabel class='ion-text-wrap'>{label}</IonLabel>
                                    </IonCheckbox>
                                </IonItem>
                            ))}
                        </IonGrid>
                    </IonGrid>
                </IonItem>
            ))}


            <IonItem>
                <IonLabel color='warning' ><b>Categories:</b></IonLabel>
            </IonItem>

            <IonItem lines="none">
                <IonGrid>
                    {categories.map((category, index) => (
                        <IonItem lines="none" key={index}>
                            <IonCheckbox
                                checked={selectedOptions['category'].includes(category)}
                                onIonChange={() => handleCheckboxChange("category", category)}
                            >
                                <IonLabel class='ion-text-wrap'>{category}</IonLabel>
                            </IonCheckbox>
                        </IonItem>
                    ))}
                </IonGrid>
            </IonItem>


            <IonItem>
                <IonLabel color='warning' ><b>Priorities:</b></IonLabel>
            </IonItem>

            <IonItem lines="none">
                <IonGrid>
                    {priorities.map((priority, index) => (
                        <IonItem lines="none" key={index}>
                            <IonCheckbox
                                checked={selectedOptions['priority'].includes(priority)}
                                onIonChange={() => handleCheckboxChange("priority", priority)}
                            >
                                <IonLabel class='ion-text-wrap'>{priority}</IonLabel>
                            </IonCheckbox>
                        </IonItem>
                    ))}
                </IonGrid>
            </IonItem>


            <IonItem>
                <IonLabel color='warning' ><b>Status:</b></IonLabel>
            </IonItem>

            <IonItem>
                <IonGrid>
                    {statuses.map((status, index) => (
                        <IonItem lines="none" key={index}>
                            <IonCheckbox
                                checked={selectedOptions['status'].includes(status)}
                                onIonChange={() => handleCheckboxChange("status", status)}
                            >
                                <IonLabel class='ion-text-wrap'>{status}</IonLabel>
                            </IonCheckbox>
                        </IonItem>
                    ))}
                </IonGrid>
            </IonItem>
        </React.Fragment>
    );
};

export default FilterComponent;
