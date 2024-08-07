import { IonButton, IonCol, IonContent, IonGrid, IonImg, IonPage, IonRow, IonText, IonTitle } from "@ionic/react"
import { FunctionComponent, useRef, useState } from "react"
import { Swiper as SwiperReact, SwiperRef, SwiperSlide } from 'swiper/react'
import 'swiper/swiper-bundle.css'

import { Navigation, Pagination, Scrollbar, EffectCards } from 'swiper/modules'

import '../styles/Welcome.css'
import React from "react"

const Welcome: FunctionComponent = () => {
  const swiperRef = useRef<SwiperRef>(null);
  const [showButton, setShowButton] = useState<boolean>(false)

  const data = [
    {
      title: "Set up timely reminder",
      subtitle: "A timely reminder can turn chaos into calm, ensuring no task is left behind.",
      image: "/assets/project_illustration2.png"
    },
    {
      title: "Get notified through emails",
      subtitle: "Stay on top of your responsibilities by getting notified through emails, ensuring you never miss an important update",
      image: "/assets/project_illustration3.png"
    },
    {
      title: "Control reminder via emails",
      subtitle: "Take control of your schedule with email reminders that keep you informed and in charge.",
      image: "/assets/project_illustration5.png"
    },
  ];




  if (swiperRef.current?.swiper.isEnd){
    setTimeout(()=>{
      swiperRef.current?.swiper.slideToLoop(0,2500,false)
    },2000)
  }


  return <IonPage>
    <IonContent >
      <SwiperReact ref={swiperRef}
      className="swiper-container"
        spaceBetween={25}
        modules={[Navigation, Pagination, Scrollbar]}
        slidesPerView={1}
        // navigation={true}
        onSlideChange={(slide) => {
          if (slide.isEnd) {
            setShowButton(true)
            return
          }
          setShowButton(false)
        }}
      >
        {data.map((slide, index) => {
          return (<>
            <SwiperSlide key={`slide_${index}`}>
              
              <div className="container">
              <div className="skip-button">
                <IonButton size='small' onClick={() => { window.location.href = '/login' }}>{showButton ? 'Get Started':'Skip'}</IonButton>
              </div>
                <IonText color='light'>
                  <h2>{slide.title}</h2>
                </IonText>
                <p className="subtitle">{slide.subtitle}</p>
                <div className="illustration">
                  <IonImg src={slide.image} alt="Illustration" />
                </div>
              </div>
            </SwiperSlide></>)
        })}
      </SwiperReact>
    </IonContent>
  </IonPage>
}

export default Welcome