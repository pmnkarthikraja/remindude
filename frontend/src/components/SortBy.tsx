import { IonButton, IonIcon, IonLabel, IonList, IonMenuToggle, IonPopover } from '@ionic/react';
import { arrowDown, arrowUp, funnelOutline } from 'ionicons/icons';
import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import '../styles/SortBy.css';
import SortOption from './SortOptions';

export interface SortyByProps {
  onSorting: (sortBy: { name: string, isDescending: boolean } | null) => void
}

const SortBy: FunctionComponent<SortyByProps> = ({
  onSorting
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);
  const [sortOptions, setSortOptions] = useState([
    { name: 'Relevance', isDescending: true },
    { name: 'Upcoming', isDescending: true },
    { name: 'Finished', isDescending: true },
    { name: 'Departments', isDescending: true },
    { name: 'Activities', isDescending: true },
    { name: 'DateCreated', isDescending: true },
  ]);
  const [showOption, setShowOption] = useState<{ name: string, isDescending: boolean } | null>(null)



  useEffect(() => {
    onSorting(showOption)
  }, [sortOptions, showOption])

  const toggleSortOrder = (index: number) => {
    const newSortOptions = [...sortOptions];
    newSortOptions[index].isDescending = !newSortOptions[index].isDescending;
    setSortOptions(newSortOptions);
  };

  const handleButtonClick = (event: MouseEvent) => {
    setPopoverEvent(event);
    setPopoverOpen(true);
  };

  return (
    <>
    <IonMenuToggle menu='filter-menu-2' autoHide={false}>
      <IonButton fill='clear' shape='round' color='medium' size='small' style={{whiteSpace:'nowrap'}} onClick={handleButtonClick}>
        Sort By
        {showOption !== null && <IonLabel style={{ marginLeft: '13px' }}>{showOption.name}
          {showOption.name !== 'Relevance' && <> <IonIcon style={{ position: 'relative', top: '2px' }} icon={showOption.isDescending ? arrowDown : arrowUp} />            
            </>}
        </IonLabel>}
        <IonIcon style={{ marginLeft: '3px', marginTop: '2px' }} size='small' slot='end' icon={funnelOutline} />
      </IonButton>
      </IonMenuToggle>
      <IonPopover
        isOpen={popoverOpen}
        onDidDismiss={() => setPopoverOpen(false)}
        event={popoverEvent}
      >
        <IonList>
          {sortOptions.map((option, index) => (
            <SortOption
              key={option.name}
              name={option.name}
              isDescending={option.isDescending}
              onClick={() => {
                toggleSortOrder(index);
                setShowOption(option)
                setPopoverOpen(false);
              }}
            />
          ))}
        </IonList>
      </IonPopover>
    </>
  );
};

export default SortBy;
