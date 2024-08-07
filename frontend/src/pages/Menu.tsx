// src/components/Menu.tsx
import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Menu: React.FC = () => {
  const history = useHistory();

  return (
  
        <IonList>
          <IonItem button onClick={() => history.push('/home')}>
            <IonLabel>Home</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/settings')}>
            <IonLabel>Settings</IonLabel>
          </IonItem>
          <IonItem button onClick={() => history.push('/about')}>
            <IonLabel>About</IonLabel>
          </IonItem>
        </IonList>
  );
};

export default Menu;
