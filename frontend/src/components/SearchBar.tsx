import React, { useState } from 'react';
import {
  IonSearchbar,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonRadioGroup,
  IonRadio,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonContent
} from '@ionic/react';
import { filterOutline, funnelOutline } from 'ionicons/icons';

const labels = [
  'Visa processing',
  'Employee onboarding',
  'PO Dates',
  'Bill payments',
  'Salary processing',
  'GRO follow up',
  'Client follow up',
  'Interview follow up',
  'Personal activity'
];

const categories = ['task', 'meeting', 'event'];

const SearchBar: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [filterPopover, setFilterPopover] = useState(false);
  const [sortPopover, setSortPopover] = useState(false);

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('');

  const [sortOption, setSortOption] = useState<string>('');

  const handleLabelChange = (label: string) => {
    setSelectedLabels(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  return (
    <div>
      <IonSearchbar
        value={searchText}
        onIonChange={e => setSearchText(e.detail.value!)}
      >
        <IonIcon
          icon={filterOutline}
          slot="end"
          onClick={() => setFilterPopover(true)}
        />
        <IonIcon
          icon={funnelOutline}
          slot="end"
          onClick={() => setSortPopover(true)}
        />
      </IonSearchbar>

      <IonPopover
        isOpen={filterPopover}
        onDidDismiss={() => setFilterPopover(false)}
      >
        <IonContent>
        <IonList>
          <IonLabel>Labels</IonLabel>
          {labels.map(label => (
            <IonItem key={label}>
              <IonCheckbox
                checked={selectedLabels.includes(label)}
                onIonChange={() => handleLabelChange(label)}
              />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
          <IonLabel>Category</IonLabel>
          <IonSelect
            value={selectedCategory}
            placeholder="Select Category"
            onIonChange={e => setSelectedCategory(e.detail.value)}
          >
            {categories.map(category => (
              <IonSelectOption key={category} value={category}>
                {category}
              </IonSelectOption>
            ))}
          </IonSelect>
          {selectedCategory === 'meeting' && (
            <IonRadioGroup
              value={meetingType}
              onIonChange={e => setMeetingType(e.detail.value)}
            >
              <IonItem>
                <IonLabel>Online</IonLabel>
                <IonRadio slot="start" value="online" />
              </IonItem>
              <IonItem>
                <IonLabel>Offline</IonLabel>
                <IonRadio slot="start" value="offline" />
              </IonItem>
            </IonRadioGroup>
          )}
        </IonList>
        <IonButton onClick={() => setFilterPopover(false)}>Apply Filters</IonButton>
        </IonContent>

      </IonPopover>

      <IonPopover
        isOpen={sortPopover}
        onDidDismiss={() => setSortPopover(false)}
      >
        <IonList>
          <IonLabel>Sort By</IonLabel>
          <IonRadioGroup
            value={sortOption}
            onIonChange={e => setSortOption(e.detail.value)}
          >
            <IonItem>
              <IonLabel>Time</IonLabel>
              <IonRadio slot="start" value="time" />
            </IonItem>
            <IonItem>
              <IonLabel>Priority Level</IonLabel>
              <IonRadio slot="start" value="priority" />
            </IonItem>
            <IonItem>
              <IonLabel>Labels</IonLabel>
              <IonRadio slot="start" value="labels" />
            </IonItem>
            <IonItem>
              <IonLabel>Category</IonLabel>
              <IonRadio slot="start" value="category" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
        <IonButton onClick={() => setSortPopover(false)}>Apply Sort</IonButton>
      </IonPopover>
    </div>
  );
};

export default SearchBar;
