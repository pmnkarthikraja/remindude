import { MasterControllerModel } from "../models/MasterControllModels";
import masterControllerRepo from '../repo/masterSwitchRepo'

interface MasterSwitchServiceImplementation {
    Toggle: (masterSwitchData: MasterControllerModel) => Promise<MasterControllerModel>
}

class MasterSwitchService implements MasterSwitchServiceImplementation{
    async Toggle (masterSwitchData: MasterControllerModel): Promise<MasterControllerModel>{
       return await masterControllerRepo.Toggle(masterSwitchData)
    }
}


export default new MasterSwitchService()