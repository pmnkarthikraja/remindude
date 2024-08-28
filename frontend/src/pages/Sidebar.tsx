import { IonCol, IonItem, IonAvatar, IonText, IonLabel, IonImg } from "@ionic/react"
import { FunctionComponent, useEffect, useState } from "react"
import React from 'react'
import { User } from "../components/user"
import { chooseAvatar } from "../utils/util"


export interface PageNav {
  isTodayTaskPage: boolean,
  isYesterdayTaskPage: boolean,
  isTomorrowTaskPage: boolean,
  isWeeklyTaskPage: boolean,
  isMonthlyTaskPage: boolean,
  isCalenderRangeTaskPage: boolean,
  isAllTaskPage: boolean,
  isProfile: boolean,
  isSetting: boolean
}

export interface SidebarProps {
  user: User
  signOut: () => void,
  buildPageNav: (page: string) => void,
  pageNav: PageNav
}

const Sidebar: FunctionComponent<SidebarProps> = ({
  user,
  signOut,
  buildPageNav,
  pageNav
}) => {
  const userAvatar = chooseAvatar(user)
  const currentTime = new Date().getHours()
  const greetMsg = currentTime < 12 && 'Good Morning' || currentTime < 18 && 'Good Afternoon' || 'Good Evening'

  return (<IonCol className="sidebar" size="2">
    <IonItem lines="none">
      <img style={{ width: 'auto', height: 'auto' }} src={'/assets/logonew1.png'} alt="avatar" />
    </IonItem>
    <IonItem lines="none">
      <IonCol size="auto">
        <IonAvatar>
          <img style={{ width: '50px', height: '50px' }} src={userAvatar} alt="avatar" />
        </IonAvatar>
      </IonCol>
      <IonCol>
        <IonText >
          <h2>{user.userName}</h2>
          <p>{greetMsg}</p>
        </IonText>
      </IonCol>
    </IonItem>
    <div className={pageNav.isAllTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('all')}>
        <IonLabel>All Tasks</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/allTasks.png" />
      </IonItem>
    </div>
    <div className={pageNav.isTodayTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('today')}>
        <IonLabel>Today Tasks</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/todayTasks.png" />
      </IonItem>
    </div>
    <div className={pageNav.isYesterdayTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('yesterday')}>
        <IonLabel>Yesterday Tasks</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/yesterdayTasks.png" />
      </IonItem>
    </div>
    <div className={pageNav.isTomorrowTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('tomorrow')}>
        <IonLabel>Tomorrow Tasks</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/tomorrowTasks.png" />
      </IonItem>
    </div>
    <div className={pageNav.isWeeklyTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('week')} >
        <IonLabel>This Week</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/thisWeek.png" />
      </IonItem>
    </div>
    <div className={pageNav.isMonthlyTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('month')} >
        <IonLabel>This Month</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/thisMonth.png" />
      </IonItem>
    </div>
    <div className={pageNav.isCalenderRangeTaskPage ? 'sidebar-clicked-item' : ''}>
      <IonItem lines="none" button onClick={() => buildPageNav('calender')} >
        <IonLabel>Calender Range</IonLabel>
        <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/calenderRange.png" />
      </IonItem>
    </div>
    <IonItem lines="none"  button onClick={() => buildPageNav('setting')} >
      <IonLabel>Holidays Upload</IonLabel>
      <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/setting.png" />
    </IonItem>
    <IonItem lines="none" button >
      <IonLabel>Help Center</IonLabel>
      <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/helpCenter.png" />
    </IonItem>
    <IonItem lines="none" button onClick={signOut} className="tile">
      <IonLabel>Logout</IonLabel>
      <IonImg style={{ width: '30px', height: '30px' }} src="/assets/sidebar/logout.png" />
    </IonItem>
  </IonCol>)
}

export default Sidebar

