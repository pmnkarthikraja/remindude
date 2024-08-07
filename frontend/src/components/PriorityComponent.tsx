import { IonBadge, IonImg, IonIcon } from '@ionic/react'
import { checkmark } from 'ionicons/icons'
import React, { Fragment, FunctionComponent } from 'react'

export interface PriorityComponentProps{
    addPriorityFilter:(key:string,value:string)=>void
    chooseColor:(key:string,value:string)=>boolean
}

const PriorityComponent:FunctionComponent<PriorityComponentProps> = ({
    addPriorityFilter,
    chooseColor
}) => {
return <Fragment>
  <div  onClick={()=>{ addPriorityFilter('priority', 'Urgent')}} style={{boxShadow:chooseColor('priority','Urgent') ? 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px':'',display:'flex',cursor:'pointer'}}>
                      <IonBadge style={{ color: '#089C82', background: 'inherit',cursor:'pointer' }}>Urgent</IonBadge>
                      <IonImg style={{ width: '20px', height: '20px' }} src="/assets/highPriority.png" />
                      {chooseColor('priority', 'Urgent') && <div style={{color:'#089C82'}}> <IonIcon size='small' icon={checkmark} /></div>}
                      </div>

                      <div onClick={()=>{addPriorityFilter('priority', 'Moderate')}} style={{boxShadow:chooseColor('priority','Moderate') ? 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px':'',display:'flex', cursor:'pointer'}}>
                      <IonBadge  style={{ color: '#089C82', background: 'inherit', cursor:'pointer' }} >Moderate</IonBadge>
                      <IonImg style={{ width: '18px', height: '18px' }} src="/assets/mediumPriority.png" />
                      {chooseColor('priority', 'Moderate') &&<div style={{color:'#089C82'}}> <IonIcon size="small" icon={checkmark} /></div>}
                      </div>

                      <div onClick={()=>{addPriorityFilter('priority', 'Normal') }} style={{boxShadow:chooseColor('priority','Normal') ? 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px':'',display:'flex', cursor:'pointer'}}>
                      <IonBadge style={{ color: '#089C82', background: 'inherit', cursor:'pointer' }} >Normal</IonBadge>
                      <IonImg style={{ width: '20px', height: '20px' }} src="/assets/lowPriority.png" />
                      {chooseColor('priority', 'Normal') && <div style={{color:'#089C82'}}> <IonIcon size="small" icon={checkmark} /></div>}
                      </div>
</Fragment>
}
export default PriorityComponent