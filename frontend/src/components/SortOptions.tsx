import React from 'react';
import { IonItem, IonLabel, IonIcon, IonBadge, IonCol } from '@ionic/react';
import { arrowDown, arrowUp } from 'ionicons/icons';

interface SortOptionProps {
  name: string;
  isDescending: boolean;
  onClick: () => void;
}

// { name: 'Relevance', isDescending: true },
// { name: 'Upcoming', isDescending: true },
// { name: 'Finished', isDescending: true },
// { name: 'Priority', isDescending: true },
// {name: 'Category', isDescending:false},

export function buildIndicator(name: string, isDescending: boolean) {
  switch (name) {
    case "Relevance":
    case "Activities":
    case "Departments":
      return isDescending ? 'A-Z' : 'Z-A'
    case "Upcoming":
      return isDescending ? 'Earliest' : 'Latest'
    case 'Finished':
      return isDescending ? 'Done First' : 'Not Done First'
    case 'LastEdited':
    case 'DateCreated':
      return isDescending ? 'Asc' : 'Dsc'
    default:
      return ''
  }
}

const SortOption: React.FC<SortOptionProps> = ({ name, isDescending, onClick }) => {
  return (
    <IonItem button onClick={onClick}>
      <IonLabel >{name}</IonLabel>

     {name!=='Relevance'&& <> <IonItem style={{ marginRight: '0px', paddingRight: '-10px' }}>
        {<IonBadge color='light' style={{ fontSize: '10px', width: 'auto' }}>{buildIndicator(name, isDescending)} </IonBadge>}
      </IonItem>

      <IonItem style={{ marginLeft: '-20px', paddingLeft: '-10px' }}>
        <IonIcon size='small' icon={isDescending ? arrowDown : arrowUp} />
      </IonItem></>}
    </IonItem>
  );
};

export default SortOption;
