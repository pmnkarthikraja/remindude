import { IonButton, IonIcon, IonLabel, IonList, IonPopover, IonSelect, IonSelectOption } from '@ionic/react'
import { arrowDown, arrowUp, funnelOutline } from 'ionicons/icons'
import React, { FunctionComponent, useState } from 'react'
import SortOption from './SortOptions'


export interface FilterOptionsProps {
    filters: { [key: string]: string[] }
}

const FilterOptions: FunctionComponent<FilterOptionsProps> = ({
    filters
}) => {

    const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);
    const [filterOptions, setFilterOptions] = useState([
        { name: 'label', isOpen: true },
        { name: 'category', isOpen: true },
        { name: 'priority', isOpen: true },
        { name: 'status', isOpen: true },
    ]);

    const [showOption, setShowOption] = useState<{ name: string, isOpen: boolean } | null>(null)

    const handleButtonClick = (event: MouseEvent,) => {
        setPopoverEvent(event);
        // setPopoverOpen(true);
      };

    return <>
        {Object.entries(filters).map((obj, idx) => <>
            {obj[1].length > 0 && <>
                <IonButton className='sortby-button' fill='clear' color='dark' onClick={(e)=>{
                    handleButtonClick(e);
                    setShowOption({
                        name:obj[0],
                        isOpen:showOption?.isOpen || true
                    })

                }}>
                    <IonLabel>{obj[0]}</IonLabel>
                    <IonIcon style={{ marginLeft: '3px', marginTop: '2px' }} size='small' icon={funnelOutline} />
                </IonButton>

                <IonPopover
        isOpen={showOption?.isOpen}
        onDidDismiss={() => setShowOption({
            name:obj[0],
            isOpen:false
        })}
        event={popoverEvent}
      >
        <IonList>
          {obj[1].map((val, index) => (
            <>{val}</>
          ))}
        </IonList>
      </IonPopover>
            </>}
        </>)}
    </>
}

export default FilterOptions