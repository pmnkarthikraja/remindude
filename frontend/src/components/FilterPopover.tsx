import React from 'react';
import { IonItem, IonLabel, IonButton, IonIcon, IonPopover, IonList, IonListHeader, IonRow } from '@ionic/react';
import { arrowDown, removeCircleSharp } from 'ionicons/icons';

interface FilterPopoverProps {
  filtersWithValues: [string, string[]][];
  openPopover: (e: MouseEvent, filterKey: string) => void;
  showPopover: boolean;
  popoverEvent: MouseEvent | null;
  currentFilterKey: string | null;
  filters: { [key: string]: string[] };
  clearFilter: (key: string, value: string) => void;
  setShowPopover: (show: boolean) => void;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  filtersWithValues,
  openPopover,
  showPopover,
  popoverEvent,
  currentFilterKey,
  filters,
  clearFilter,
  setShowPopover
}) => {
  return (
    <>
      <IonRow>
        {filtersWithValues.map(([filterKey, filterValues], idx) => (
          <>
            {filterKey !== 'priority' && (
              <IonItem
                lines="none"
                button
                onClick={(e) => openPopover(e.nativeEvent, filterKey)}
                key={idx}
              >
                {filterKey}
                <IonLabel key={idx} style={{ marginTop: '-5px', fontSize: '13px' }}>
                  {`+${filterValues.length}`}
                </IonLabel>
                <IonButton
                key={idx}
                  fill="clear"
                  color="dark"
                  onClick={(e) => openPopover(e.nativeEvent, filterKey)}
                >
                  <IonIcon key={idx} icon={arrowDown} />
                </IonButton>
              </IonItem>
            )}
          </>
        ))}
      </IonRow>

      <IonPopover
        isOpen={showPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowPopover(false)}
      >
        <IonList>
          <IonListHeader>
            {currentFilterKey && (
              <IonLabel style={{ textTransform: 'capitalize' }}>
                {currentFilterKey} Filters
              </IonLabel>
            )}
          </IonListHeader>
          {currentFilterKey &&
            filters[currentFilterKey].map((filterValue, idx) => (
              <IonItem
                lines="none"
                key={idx}
                button
                onClick={() => clearFilter(currentFilterKey, filterValue)}
              >
                <IonLabel>{filterValue}</IonLabel>
                <IonIcon icon={removeCircleSharp} />
              </IonItem>
            ))}
        </IonList>
      </IonPopover>
    </>
  );
};

export default FilterPopover;
