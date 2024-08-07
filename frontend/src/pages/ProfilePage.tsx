import { FilePicker } from '@capawesome/capacitor-file-picker'
import { IonAvatar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonModal, IonPage, IonRow, IonToolbar } from "@ionic/react"
import { arrowForward, cloudUpload, remove } from "ionicons/icons"
import React, { Fragment, FunctionComponent, useState } from "react"
import { userApi } from '../api/userApi'
import { User } from "../components/user"
import { chooseAvatar } from '../utils/util'

export interface ProfilePageProps {
    user: User,
    signOut: () => void
}

const ProfilePage: FunctionComponent<ProfilePageProps> = ({
    signOut,
    user
}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [blobData, setBlobData] = useState<Blob | undefined>()
    const [userData, setUserData] = useState<User>({ ...user })
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')


    const pickFile = async () => {
        try {
            await pickImages()
        } catch (error) {
            console.error('Error picking file:', error);
        }
    };


    const pickImages = async (): Promise<string> => {
        const result = await FilePicker.pickImages({
            readData: true
        })

        const blobData1 = result.files[0].blob
        const img = 'data:image/*;base64,' + result.files[0].data
        setBlobData(blobData1)
        setUserData(data => { return { ...data, profilePicture: img } })
        return img
    }


    const onSubmit = async () => {
        if (newPassword !== confirmNewPassword) {
            throw new Error("both passwords should match!")
        }
        try {
            await userApi.editProfile(userData.email, confirmNewPassword, userData.userName || '', blobData)
            setTimeout(() => {
                window.location.href = '/home'
            }, 1000)
        }
        catch (e) {
            throw new Error("failed to update profile :" + e)
        }
    }
    const userAvatar = chooseAvatar(userData)
    return <Fragment>
        <IonPage>
            {modalIsOpen &&
                <IonModal isOpen={true}
                    onDidDismiss={() => { setModalIsOpen(false) }}>
                    {<IonHeader >
                        <IonToolbar className="mobile-header">
                        </IonToolbar>
                    </IonHeader>}
                    <IonContent>
                        <IonCard>
                            <IonCardHeader>
                                <IonCardTitle color={'medium'}>
                                    Edit User Profile
                                </IonCardTitle>
                                <IonCardSubtitle>
                                    You can change your profile here
                                </IonCardSubtitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonGrid>
                                    <IonRow className="ion-align-items-center">
                                        <IonCol size="auto">
                                            <IonAvatar>
                                                <img
                                                    src={userAvatar} alt="avatar" />
                                            </IonAvatar>
                                        </IonCol>
                                    </IonRow>
                                    <IonRow>

                                        <IonCol size="auto">
                                            <IonButton onClick={async () => {
                                                await pickFile();
                                            }} size="small" fill='outline'>
                                                <IonIcon slot="start" size='small' icon={cloudUpload} />
                                                Upload
                                            </IonButton>
                                        </IonCol>
                                        <IonCol>
                                            <IonButton onClick={() => { setUserData(data => { return { ...data, profilePicture: '', googlePicture: '' } }) }} size="small" fill='outline'>
                                                <IonIcon slot="start" size='small' icon={remove} />
                                                Remove
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>

                                </IonGrid>
                                <IonGrid>
                                    <IonRow>
                                        <IonCol>
                                            <IonItem>
                                                <IonInput type='text' onIonChange={(e) => { setUserData(data => { return { ...data, userName: e.target.value as string } }) }} value={userData?.userName} label="UserName" labelPlacement='floating' placeholder="Edit UserName" />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                    <IonRow>
                                        <IonCol>
                                            <IonItem>
                                                <IonInput type='email' disabled value={userData?.email} label="Email" labelPlacement='stacked' placeholder="Edit Email" />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                    <IonRow>
                                        <IonCol>
                                            <IonItem>
                                                <IonInput type="password" value={newPassword} onIonChange={(e) => { setNewPassword(e.target.value as string) }} label="New Password" labelPlacement='stacked' placeholder="Enter New Password" />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                    <IonRow>
                                        <IonCol>
                                            <IonItem>
                                                <IonInput type="password" value={confirmNewPassword} onIonChange={(e) => { setConfirmNewPassword(e.target.value as string) }} label="Confirm New Password" labelPlacement='stacked' placeholder="Enter Confirm Password" />
                                            </IonItem>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonCardContent>
                            <IonFooter>
                                <IonGrid>
                                    <IonRow >
                                        <IonCol >
                                            <IonButton onClick={onSubmit} color='success'>Save</IonButton>
                                        </IonCol>
                                        <IonCol >
                                        </IonCol>
                                        <IonCol pushXs="1" pushMd="2" pushLg="2" pushXl="2">
                                            <IonButton color='danger' onClick={() => { setModalIsOpen(false) }}>Close</IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonGrid>
                            </IonFooter>
                        </IonCard>
                    </IonContent>
                </IonModal>}

            {<IonHeader >
                <IonToolbar className="mobile-header">
                    <IonAvatar slot="end" style={{ marginTop: '10px', marginRight: '10px' }}>
                        <img style={{ width: '50px', height: '50px' }} src={userAvatar} alt="avatar" />
                    </IonAvatar>
                </IonToolbar>
            </IonHeader>}
            <IonGrid>
                <IonRow >
                    <IonCol size='auto'></IonCol>
                    <IonCol style={{ marginLeft: '-110px' }} sizeXs='28' sizeSm='30' sizeMd='35' sizeLg='35' sizeXl='30' >
                        <IonCard >
                            <IonItem>
                                <IonCardHeader>
                                    <IonCardTitle>Profile</IonCardTitle>
                                    <IonCardSubtitle>{`hello ${user.userName}`}</IonCardSubtitle>
                                </IonCardHeader>
                            </IonItem>

                            <IonCardContent>
                                <IonList >
                                    <div >
                                        <IonRow>
                                            <IonCol>
                                                <IonItem lines='none'>
                                                    <IonImg style={{ width: '30px', height: '30px', marginRight: '5px' }} src="/assets/profile.png" />
                                                    <IonLabel>Edit Profile</IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol>
                                                <IonItem lines='none' >
                                                    <IonButton fill='clear' size='default' onClick={() => setModalIsOpen(true)}>
                                                        <IonIcon icon={arrowForward} size='default' slot='end' />
                                                    </IonButton>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </div>



                                    <div >
                                        <IonRow>
                                            <IonCol>
                                                <IonItem lines='none'>
                                                    <IonImg style={{ width: '30px', height: '30px', marginRight: '5px' }} src="/assets/termsandcondition.png" />
                                                    <IonLabel>Terms & Condition</IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol>
                                                <IonItem lines='none' >
                                                    <IonButton fill='clear' size='default' onClick={() => setModalIsOpen(true)}>
                                                        <IonIcon icon={arrowForward} size='default' slot='end' />
                                                    </IonButton>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </div>




                                    <div >
                                        <IonRow>
                                            <IonCol>
                                                <IonItem lines='none'>
                                                    <IonImg style={{ width: '30px', height: '30px', marginRight: '5px' }} src="/assets/privacypolicy.png" />
                                                    <IonLabel>Privacy Policy</IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol>
                                                <IonItem lines='none' >
                                                    <IonButton fill='clear' size='default' onClick={() => setModalIsOpen(true)}>
                                                        <IonIcon icon={arrowForward} size='default' slot='end' />
                                                    </IonButton>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </div>


                                    <div >
                                        <IonRow>
                                            <IonCol>
                                                <IonItem lines='none'>
                                                    <IonImg style={{ width: '30px', height: '30px', marginRight: '5px' }} src="/assets/faqs.png" />
                                                    <IonLabel>FAQs</IonLabel>
                                                </IonItem>
                                            </IonCol>
                                            <IonCol>
                                                <IonItem lines='none' >
                                                    <IonButton fill='clear' size='default' onClick={() => setModalIsOpen(true)}>
                                                        <IonIcon icon={arrowForward} size='default' slot='end' />
                                                    </IonButton>
                                                </IonItem>
                                            </IonCol>
                                        </IonRow>
                                    </div>
                                </IonList>
                            </IonCardContent>

                        </IonCard>
                    </IonCol>
                    <IonCol size='auto'></IonCol>
                </IonRow>

            </IonGrid>

        </IonPage>
    </Fragment>
}

export default ProfilePage