// src/components/CategoryDropdown.tsx
import React, { FunctionComponent, useState } from 'react';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { TaskCategoryName, TaskCategory, categoryLabels } from './task';

export interface CategoryDropDownProps{
    onSave:(taskCategory:TaskCategory)=>void
    initialValue:TaskCategory
}

const CategoryDropdown: FunctionComponent<CategoryDropDownProps> = ({
    onSave,
    initialValue
}) => {
    const [selectedCategory, setSelectedCategory] = useState<TaskCategoryName | undefined>(initialValue.name);
    const [selectedLabel, setSelectedLabel] = useState<string | undefined>(initialValue.label);

    const handleCategoryChange = (category: TaskCategoryName) => {
        setSelectedCategory(category);
        setSelectedLabel(undefined); 
    };

    const handleLabelChange = (label: string) => {
        setSelectedLabel(label);
        if (selectedCategory) {
            onSave({
                name:selectedCategory,
                label
            } as TaskCategory)
        }
    };
    return (
        <>
            <IonItem>
                <IonLabel>Category</IonLabel>
                <IonSelect
                    style={{marginLeft:'-30px'}}
                    class='ion-text-wrap'
                    value={selectedCategory}
                    placeholder="Select Category"
                    onIonChange={e => handleCategoryChange(e.detail.value as TaskCategoryName)}
                >
                    {Object.keys(categoryLabels).map(category => (
                        <IonSelectOption key={category} value={category}>
                            {category}
                        </IonSelectOption>
                    ))}
                </IonSelect>

                {selectedCategory && (
                    <>
                        <IonSelect
                         class='ion-text-wrap'
                            value={selectedLabel}
                            placeholder="Select Flag"
                            onIonChange={e => handleLabelChange(e.detail.value as string)}
                        >
                            {categoryLabels[selectedCategory].map(label => (
                                <IonSelectOption key={label} value={label}>
                                    {label}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </>
                )}
            </IonItem>
        </>
    );
};

export default CategoryDropdown;

