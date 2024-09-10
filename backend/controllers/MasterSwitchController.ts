import { Request, Response } from 'express';
import MasterSwitchService from "../services/masterSwitchService";
import { MasterControllerModel } from '../models/MasterControllModels';
import masterSwitchRepo from '../repo/masterSwitchRepo';


class MasterSwitchController {
    public async toggle(req: Request, res: Response): Promise<void> {
      const { email, masterEmailNotificationEnabled, masterPushNotificationEnabled } = req.body;
      console.log("toggle: ",email, masterEmailNotificationEnabled, masterPushNotificationEnabled)
      
      try {
        const masterSwitchData = { email,masterEmailNotificationEnabled,masterPushNotificationEnabled } as MasterControllerModel
        const data = await MasterSwitchService.Toggle(masterSwitchData)
        res.status(200).json({message:'successfully master switch data upserted',success:true,masterSwitchData:data})

      } catch (err:any) {
          res.status(500).json({ message: err, success: false });
      }
    }

    public async getMasterSwitchData(req: Request, res: Response): Promise<void> {
        const { email } = req.params;
        console.log("get master switch data called",email)
        
        try {
          const data = await masterSwitchRepo.GetMasterSwitchData(email)
          if (data){
            res.status(200).json({message:'successfully master switch data retrieved',success:true,masterSwitchData:data})
            return
          }
          res.status(404).json({message:'could not retreive master switch data',success:false})
  
        } catch (err:any) {
            res.status(500).json({ message: err, success: false });
        }
      }
}

export default new MasterSwitchController();